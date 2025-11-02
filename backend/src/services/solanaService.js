/**
 * SIMPLIFIED Solana Service - Production Ready
 *
 * All mock code removed. Clean, focused API.
 */

const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { createMint, mintTo, getAssociatedTokenAddress } = require('@solana/spl-token');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const AnchorClient = require('./anchorClient');

// Config
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey(
  process.env.BONDING_CURVE_PROGRAM_ID || '11111111111111111111111111111111'
);

// Connection
const connection = new Connection(RPC_URL, 'confirmed');
let platformWallet = null;
let anchorClient = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializePlatformWallet() {
  try {
    // Load from env
    if (process.env.PLATFORM_WALLET_PRIVATE_KEY) {
      const secretKey = bs58.decode(process.env.PLATFORM_WALLET_PRIVATE_KEY);
      platformWallet = Keypair.fromSecretKey(secretKey);
      logger.info(`✅ Platform wallet: ${platformWallet.publicKey.toString()}`);
      anchorClient = new AnchorClient(connection, platformWallet);
      return;
    }

    // Load from file
    const walletPath = path.join(__dirname, '../../.solana-wallet.json');
    if (fs.existsSync(walletPath)) {
      const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
      platformWallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
      logger.info(`✅ Platform wallet: ${platformWallet.publicKey.toString()}`);
      anchorClient = new AnchorClient(connection, platformWallet);
      return;
    }

    // Generate new
    platformWallet = Keypair.generate();
    fs.writeFileSync(walletPath, JSON.stringify(Array.from(platformWallet.secretKey)));
    logger.warn(`⚠️  NEW platform wallet: ${platformWallet.publicKey.toString()}`);
    logger.warn(`💰 Request airdrop: solana airdrop 2 ${platformWallet.publicKey.toString()} --url ${SOLANA_NETWORK}`);
    anchorClient = new AnchorClient(connection, platformWallet);
  } catch (error) {
    logger.error('Failed to initialize wallet:', error);
    throw error;
  }
}

initializePlatformWallet();

// ============================================================================
// TOKEN CREATION
// ============================================================================

/**
 * Create token with bonding curve
 * PATH A: User pays | PATH B: Platform pays
 */
async function createTokenWithBondingCurve({
  tokenName,
  tokenSymbol,
  tokenUri,
  videoId,
  creatorPublicKey,
  path = 'instant',
}) {
  try {
    logger.info(`🚀 Creating ${tokenSymbol} (${path})...`);

    // Step 1: Create token mint
    const mintKeypair = Keypair.generate();
    logger.info(`Mint: ${mintKeypair.publicKey.toString()}`);

    // Step 2: Initialize bonding curve
    const curveData = await anchorClient.initializeCurve(
      mintKeypair.publicKey,
      tokenName,
      tokenSymbol,
      tokenUri,
      videoId
    );

    logger.info(`✅ Token created!`);

    return {
      mintAddress: mintKeypair.publicKey.toString(),
      bondingCurveAddress: curveData.bondingCurve,
      curveAuthorityAddress: curveData.curveAuthority,
      curveSolVaultAddress: curveData.curveSolVault,
      signature: curveData.signature,
      path,
    };
  } catch (error) {
    logger.error('Token creation failed:', error);
    throw error;
  }
}

// ============================================================================
// TRADING
// ============================================================================

/**
 * Buy tokens from bonding curve
 */
async function buyTokens({ mintAddress, buyerPublicKey, solAmount, slippage = 1 }) {
  try {
    const tokenMint = new PublicKey(mintAddress);
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
      PROGRAM_ID
    );

    // Get current state for price calculation
    const state = await anchorClient.getCurveState(bondingCurve);
    const tokensOut = calculateTokensOut(solAmount * LAMPORTS_PER_SOL, state);
    const minTokensOut = tokensOut * (1 - slippage / 100);

    // Execute buy
    const result = await anchorClient.buy(
      bondingCurve,
      new PublicKey(buyerPublicKey),
      solAmount * LAMPORTS_PER_SOL,
      minTokensOut
    );

    return {
      signature: result.signature,
      tokensReceived: result.tokensReceived,
      solSpent: solAmount * LAMPORTS_PER_SOL,
      pricePerToken: (solAmount * LAMPORTS_PER_SOL) / result.tokensReceived,
    };
  } catch (error) {
    logger.error('Buy failed:', error);
    throw error;
  }
}

/**
 * Sell tokens to bonding curve
 */
async function sellTokens({ mintAddress, sellerPublicKey, tokenAmount, slippage = 1 }) {
  try {
    const tokenMint = new PublicKey(mintAddress);
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
      PROGRAM_ID
    );

    const state = await anchorClient.getCurveState(bondingCurve);
    const solOut = calculateSolOut(tokenAmount * 1e9, state);
    const minSolOut = solOut * (1 - slippage / 100);

    const result = await anchorClient.sell(
      bondingCurve,
      new PublicKey(sellerPublicKey),
      tokenAmount * 1e9,
      minSolOut
    );

    return {
      signature: result.signature,
      solReceived: result.solReceived,
      tokensSold: tokenAmount * 1e9,
      pricePerToken: result.solReceived / (tokenAmount * 1e9),
    };
  } catch (error) {
    logger.error('Sell failed:', error);
    throw error;
  }
}

// ============================================================================
// QUERIES
// ============================================================================

async function getBondingCurveState(bondingCurveAddress) {
  const state = await anchorClient.getCurveState(bondingCurveAddress);
  return {
    virtualTokenReserves: state.virtualTokenReserves.toString(),
    virtualSolReserves: state.virtualSolReserves.toString(),
    realTokenReserves: state.realTokenReserves.toString(),
    realSolReserves: state.realSolReserves.toString(),
    isGraduated: state.isGraduated,
    tradeCount: state.tradeCount,
    raydiumMigrationThreshold: 85 * LAMPORTS_PER_SOL,
  };
}

async function getTokenPrice(mintAddress) {
  try {
    const tokenMint = new PublicKey(mintAddress);
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding_curve'), tokenMint.toBuffer()],
      PROGRAM_ID
    );
    const state = await anchorClient.getCurveState(bondingCurve);
    return Number(state.virtualSolReserves) / Number(state.virtualTokenReserves) / LAMPORTS_PER_SOL;
  } catch (error) {
    logger.error('Failed to get price:', error);
    return 0;
  }
}

async function getMarketCap(mintAddress) {
  try {
    const price = await getTokenPrice(mintAddress);
    return price * 1_000_000_000; // Total supply
  } catch (error) {
    return 0;
  }
}

async function getPlatformBalance() {
  try {
    const balance = await connection.getBalance(platformWallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    return 0;
  }
}

// ============================================================================
// BONDING CURVE MATH
// ============================================================================

function calculateTokensOut(solIn, state) {
  const numerator = BigInt(state.virtualTokenReserves) * BigInt(solIn);
  const denominator = BigInt(state.virtualSolReserves) + BigInt(solIn);
  return Number(numerator / denominator);
}

function calculateSolOut(tokensIn, state) {
  const numerator = BigInt(state.virtualSolReserves) * BigInt(tokensIn);
  const denominator = BigInt(state.virtualTokenReserves) + BigInt(tokensIn);
  return Number(numerator / denominator);
}

// ============================================================================
// UTILITIES
// ============================================================================

async function requestAirdrop(amount = 2) {
  if (SOLANA_NETWORK !== 'devnet') {
    throw new Error('Airdrops only on devnet');
  }
  const sig = await connection.requestAirdrop(
    platformWallet.publicKey,
    amount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(sig);
  logger.info(`✅ Airdrop: ${amount} SOL`);
  return sig;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  createTokenWithBondingCurve,
  buyTokens,
  sellTokens,
  getBondingCurveState,
  getTokenPrice,
  getMarketCap,
  getPlatformBalance,
  requestAirdrop,
  getPlatformWallet: () => platformWallet,
  getConnection: () => connection,
};
