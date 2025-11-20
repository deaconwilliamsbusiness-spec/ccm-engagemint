/**
 * Production Anchor Client - REAL IMPLEMENTATION
 *
 * This replaces the mock anchorClient.js
 * Uses actual Anchor Program to interact with deployed smart contract
 */

const { Program, AnchorProvider, BN, web3 } = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Load IDL - generated from anchor build
let IDL;
try {
  const idlPath = path.join(__dirname, '../../../target/idl/engagemint_bonding_curve.json');
  if (fs.existsSync(idlPath)) {
    IDL = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
    logger.info('✅ IDL loaded successfully');
  } else {
    logger.warn('⚠️  IDL not found - run "anchor build" first');
    IDL = null;
  }
} catch (error) {
  logger.error('Failed to load IDL:', error);
  IDL = null;
}

const PROGRAM_ID = new PublicKey(
  process.env.BONDING_CURVE_PROGRAM_ID || '11111111111111111111111111111111'
);

class AnchorClient {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.program = null;

    if (IDL && process.env.BONDING_CURVE_PROGRAM_ID) {
      try {
        // Create provider
        const provider = new AnchorProvider(
          connection,
          wallet,
          { commitment: 'confirmed', preflightCommitment: 'confirmed' }
        );

        // Create program instance
        this.program = new Program(IDL, PROGRAM_ID, provider);
        logger.info('✅ Anchor program initialized');
      } catch (error) {
        logger.error('Failed to initialize Anchor program:', error);
      }
    }
  }

  /**
   * Initialize bonding curve for a new token
   */
  async initializeCurve(tokenMint, tokenName, tokenSymbol, tokenUri, videoId) {
    if (!this.program) {
      throw new Error('Anchor program not initialized - deploy contract first');
    }

    try {
      logger.info(`Initializing curve for ${tokenSymbol}...`);

      // Derive PDAs
      const [bondingCurve, bondingCurveBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
        this.program.programId
      );

      const [curveAuthority, authorityBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('curve_authority'), tokenMint.toBuffer()],
        this.program.programId
      );

      const [curveSolVault, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('curve_sol_vault'), tokenMint.toBuffer()],
        this.program.programId
      );

      // Get curve token vault (ATA of curve authority)
      const curveTokenVault = await getAssociatedTokenAddress(
        tokenMint,
        curveAuthority,
        true // allowOwnerOffCurve
      );

      logger.info('PDAs derived:');
      logger.info(`  Bonding Curve: ${bondingCurve.toString()}`);
      logger.info(`  Authority: ${curveAuthority.toString()}`);
      logger.info(`  SOL Vault: ${curveSolVault.toString()}`);
      logger.info(`  Token Vault: ${curveTokenVault.toString()}`);

      // Call initialize_curve instruction
      const tx = await this.program.methods
        .initializeCurve(tokenName, tokenSymbol, tokenUri, videoId)
        .accounts({
          creator: this.wallet.publicKey,
          tokenMint: tokenMint,
          bondingCurve: bondingCurve,
          curveAuthority: curveAuthority,
          curveTokenVault: curveTokenVault,
          curveSolVault: curveSolVault,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      logger.info(`✅ Curve initialized: ${tx}`);

      return {
        bondingCurve: bondingCurve.toString(),
        curveAuthority: curveAuthority.toString(),
        curveSolVault: curveSolVault.toString(),
        curveTokenVault: curveTokenVault.toString(),
        signature: tx,
      };
    } catch (error) {
      logger.error('Failed to initialize curve:', error);
      throw error;
    }
  }

  /**
   * Execute buy transaction
   */
  async buy(bondingCurveAddress, buyerPublicKey, solAmount, minTokensOut) {
    if (!this.program) {
      throw new Error('Anchor program not initialized');
    }

    try {
      const bondingCurve = new PublicKey(bondingCurveAddress);
      const buyer = new PublicKey(buyerPublicKey);

      // Fetch curve state to get token mint
      const curveState = await this.program.account.bondingCurve.fetch(bondingCurve);
      const tokenMint = curveState.tokenMint;

      // Derive PDAs
      const [curveAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('curve_authority'), tokenMint.toBuffer()],
        this.program.programId
      );

      const [curveSolVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('curve_sol_vault'), tokenMint.toBuffer()],
        this.program.programId
      );

      // Get token accounts
      const curveTokenVault = await getAssociatedTokenAddress(
        tokenMint,
        curveAuthority,
        true
      );

      const buyerTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        buyer
      );

      // Platform fee account (your wallet)
      const platformFeeAccount = this.wallet.publicKey;

      logger.info(`Executing buy: ${solAmount} lamports for ${buyer.toString()}`);

      // Execute buy instruction
      const tx = await this.program.methods
        .buy(new BN(solAmount), new BN(minTokensOut))
        .accounts({
          buyer: buyer,
          bondingCurve: bondingCurve,
          curveAuthority: curveAuthority,
          curveTokenVault: curveTokenVault,
          curveSolVault: curveSolVault,
          buyerTokenAccount: buyerTokenAccount,
          platformFeeAccount: platformFeeAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      logger.info(`✅ Buy executed: ${tx}`);

      // Get actual tokens received by fetching account balance
      const accountInfo = await this.connection.getTokenAccountBalance(buyerTokenAccount);
      const tokensReceived = accountInfo.value.amount;

      return {
        signature: tx,
        tokensReceived: Number(tokensReceived),
      };
    } catch (error) {
      logger.error('Buy transaction failed:', error);
      throw error;
    }
  }

  /**
   * Execute sell transaction
   */
  async sell(bondingCurveAddress, sellerPublicKey, tokenAmount, minSolOut) {
    if (!this.program) {
      throw new Error('Anchor program not initialized');
    }

    try {
      const bondingCurve = new PublicKey(bondingCurveAddress);
      const seller = new PublicKey(sellerPublicKey);

      // Fetch curve state
      const curveState = await this.program.account.bondingCurve.fetch(bondingCurve);
      const tokenMint = curveState.tokenMint;

      // Derive PDAs
      const [curveAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('curve_authority'), tokenMint.toBuffer()],
        this.program.programId
      );

      const [curveSolVault] = PublicKey.findProgramAddressSync(
        [Buffer.from('curve_sol_vault'), tokenMint.toBuffer()],
        this.program.programId
      );

      const curveTokenVault = await getAssociatedTokenAddress(
        tokenMint,
        curveAuthority,
        true
      );

      const sellerTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        seller
      );

      const platformFeeAccount = this.wallet.publicKey;

      logger.info(`Executing sell: ${tokenAmount} tokens for ${seller.toString()}`);

      // Execute sell instruction
      const tx = await this.program.methods
        .sell(new BN(tokenAmount), new BN(minSolOut))
        .accounts({
          seller: seller,
          bondingCurve: bondingCurve,
          curveTokenVault: curveTokenVault,
          curveSolVault: curveSolVault,
          sellerTokenAccount: sellerTokenAccount,
          platformFeeAccount: platformFeeAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      logger.info(`✅ Sell executed: ${tx}`);

      return {
        signature: tx,
        solReceived: minSolOut, // Actual will be >= this
      };
    } catch (error) {
      logger.error('Sell transaction failed:', error);
      throw error;
    }
  }

  /**
   * Get bonding curve state from blockchain
   */
  async getCurveState(bondingCurveAddress) {
    if (!this.program) {
      // Return mock data if program not initialized (for development)
      logger.warn('Using mock curve state - program not initialized');
      return {
        virtualTokenReserves: new BN('1073000000000000'),
        virtualSolReserves: new BN('30000000000'),
        realTokenReserves: new BN('793100000000'),
        realSolReserves: new BN('0'),
        totalSupply: new BN('1000000000000'),
        isGraduated: false,
        tradeCount: 0,
      };
    }

    try {
      const bondingCurve = new PublicKey(bondingCurveAddress);

      // Fetch on-chain account data using Anchor
      const curveState = await this.program.account.bondingCurve.fetch(bondingCurve);

      return {
        creator: curveState.creator,
        tokenMint: curveState.tokenMint,
        curveAuthority: curveState.curveAuthority,
        tokenName: curveState.tokenName,
        tokenSymbol: curveState.tokenSymbol,
        tokenUri: curveState.tokenUri,
        videoId: curveState.videoId,
        virtualTokenReserves: curveState.virtualTokenReserves,
        virtualSolReserves: curveState.virtualSolReserves,
        realTokenReserves: curveState.realTokenReserves,
        realSolReserves: curveState.realSolReserves,
        totalSupply: curveState.totalSupply,
        targetSolAmount: curveState.targetSolAmount,
        raydiumMigrationThreshold: curveState.raydiumMigrationThreshold,
        feeBasisPoints: curveState.feeBasisPoints,
        isGraduated: curveState.isGraduated,
        tradeCount: curveState.tradeCount.toNumber(),
        accumulatedFees: curveState.accumulatedFees,
        createdAt: curveState.createdAt.toNumber(),
      };
    } catch (error) {
      logger.error('Failed to get curve state:', error);
      throw error;
    }
  }

  /**
   * Check if program is initialized
   */
  isInitialized() {
    return this.program !== null;
  }
}

module.exports = AnchorClient;
