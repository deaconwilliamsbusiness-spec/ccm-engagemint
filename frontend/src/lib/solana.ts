/**
 * EngageMint Solana Integration Library
 *
 * Handles:
 * - PATH A: Instant token minting (user pays SOL)
 * - PATH B: Viral auto-launch (backend pays)
 * - Bonding curve trading
 * - Token balance queries
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  MINT_SIZE,
  createMint,
  mintTo,
  getMint,
} from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

// ==========================
// CONFIGURATION
// ==========================

export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Program IDs (will be updated after deployment)
export const TOKEN_FACTORY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_TOKEN_PROGRAM_ID || '11111111111111111111111111111111'
);

export const BONDING_CURVE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID || '11111111111111111111111111111111'
);

// Costs
export const INSTANT_MINT_COST_SOL = parseFloat(process.env.NEXT_PUBLIC_INSTANT_MINT_COST_SOL || '0.01');

// ==========================
// TYPE DEFINITIONS
// ==========================

export interface InstantMintParams {
  wallet: WalletContextState;
  tokenName: string;
  tokenSymbol: string;
  videoId: string;
  initialSupply?: number; // default 1M
}

export interface InstantMintResult {
  mintAddress: string;
  bondingCurveAddress: string;
  signature: string;
  solPaid: number;
}

export interface BuyTokenParams {
  wallet: WalletContextState;
  tokenMint: PublicKey;
  solAmount: number;
  slippage?: number; // percentage (default 1%)
}

export interface SellTokenParams {
  wallet: WalletContextState;
  tokenMint: PublicKey;
  tokenAmount: number;
  slippage?: number;
}

export interface TokenInfo {
  mintAddress: string;
  name: string;
  symbol: string;
  supply: number;
  decimals: number;
  currentPrice: number;
  marketCap: number;
}

// ==========================
// PATH A: INSTANT MINT
// ==========================

/**
 * Create token instantly (user pays SOL upfront)
 *
 * Steps:
 * 1. Create new SPL token mint
 * 2. Mint initial supply to bonding curve
 * 3. Initialize bonding curve pool
 * 4. Transfer SOL to platform fee account
 */
export async function instantMintToken({
  wallet,
  tokenName,
  tokenSymbol,
  videoId,
  initialSupply = 1_000_000,
}: InstantMintParams): Promise<InstantMintResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  console.log('🚀 Starting instant mint...');
  console.log(`Token: ${tokenName} (${tokenSymbol})`);
  console.log(`Video ID: ${videoId}`);
  console.log(`Initial Supply: ${initialSupply.toLocaleString()}`);

  try {
    // Step 1: Create mint account
    console.log('Creating mint account...');
    const mintKeypair = Keypair.generate();

    const mint = await createMint(
      connection,
      wallet as any, // Adapter works as signer
      wallet.publicKey, // Mint authority
      wallet.publicKey, // Freeze authority
      9, // Decimals
      mintKeypair
    );

    console.log(`✅ Mint created: ${mint.toString()}`);

    // Step 2: Create bonding curve pool (simplified for now)
    // In production, this would call the actual Anchor program
    const bondingCurveAddress = 'BONDING_CURVE_' + mint.toString().substring(0, 20);

    // Step 3: Get user's associated token account
    const userTokenAccount = await getAssociatedTokenAddress(
      mint,
      wallet.publicKey
    );

    // Step 4: Create ATA if needed
    try {
      await getAccount(connection, userTokenAccount);
    } catch {
      const createAtaIx = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        userTokenAccount,
        wallet.publicKey,
        mint
      );

      const tx = new Transaction().add(createAtaIx);
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await wallet.signTransaction(tx);
      await connection.sendRawTransaction(signed.serialize());
      console.log('✅ ATA created');
    }

    // Step 5: Mint initial supply to bonding curve
    // For now, we'll mint to user (in production, mint to curve vault)
    console.log(`Minting ${initialSupply.toLocaleString()} tokens...`);

    const mintSignature = await mintTo(
      connection,
      wallet as any,
      mint,
      userTokenAccount,
      wallet.publicKey,
      initialSupply * 10 ** 9 // Convert to lamports
    );

    console.log(`✅ Minted tokens: ${mintSignature}`);

    // Step 6: Payment transaction (simplified)
    // In production, this would transfer SOL to platform wallet
    const paymentAmount = INSTANT_MINT_COST_SOL * LAMPORTS_PER_SOL;
    console.log(`Processing payment: ${INSTANT_MINT_COST_SOL} SOL`);

    // Mock payment for now
    const signature = mintSignature;

    console.log('🎉 Instant mint completed successfully!');

    return {
      mintAddress: mint.toString(),
      bondingCurveAddress: bondingCurveAddress,
      signature: signature,
      solPaid: INSTANT_MINT_COST_SOL,
    };

  } catch (error: any) {
    console.error('Instant mint failed:', error);
    throw new Error(`Mint failed: ${error.message}`);
  }
}

// ==========================
// PATH B: VIRAL AUTO-LAUNCH
// ==========================

/**
 * Check if video is ready for viral auto-launch
 * (Called by frontend to display progress)
 */
export async function checkViralStatus(videoId: string): Promise<{
  isLaunched: boolean;
  currentLikes: number;
  threshold: number;
  progress: number;
  mintAddress?: string;
}> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/viral-status`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch viral status');
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to check viral status:', error);
    throw error;
  }
}

// ==========================
// BONDING CURVE TRADING
// ==========================

/**
 * Buy tokens from bonding curve with SOL
 */
export async function buyTokens({
  wallet,
  tokenMint,
  solAmount,
  slippage = 1,
}: BuyTokenParams): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  console.log(`💰 Buying tokens with ${solAmount} SOL (${slippage}% slippage)`);

  try {
    // Get current price and calculate expected tokens
    const currentPrice = await getTokenPrice(tokenMint);
    const expectedTokens = solAmount / currentPrice;
    const minTokens = expectedTokens * (1 - slippage / 100);

    console.log(`Expected: ${expectedTokens.toFixed(2)} tokens`);
    console.log(`Minimum: ${minTokens.toFixed(2)} tokens`);

    // In production, this would call the bonding curve program
    // For now, simulate transaction
    const signature = await simulateBuyTransaction(wallet, tokenMint, solAmount);

    console.log(`✅ Buy completed: ${signature}`);
    return signature;

  } catch (error: any) {
    console.error('Buy failed:', error);
    throw new Error(`Buy failed: ${error.message}`);
  }
}

/**
 * Sell tokens to bonding curve for SOL
 */
export async function sellTokens({
  wallet,
  tokenMint,
  tokenAmount,
  slippage = 1,
}: SellTokenParams): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  console.log(`💸 Selling ${tokenAmount} tokens (${slippage}% slippage)`);

  try {
    // Get current price and calculate expected SOL
    const currentPrice = await getTokenPrice(tokenMint);
    const expectedSOL = tokenAmount * currentPrice;
    const minSOL = expectedSOL * (1 - slippage / 100);

    console.log(`Expected: ${expectedSOL.toFixed(4)} SOL`);
    console.log(`Minimum: ${minSOL.toFixed(4)} SOL`);

    // In production, call bonding curve program
    const signature = await simulateSellTransaction(wallet, tokenMint, tokenAmount);

    console.log(`✅ Sell completed: ${signature}`);
    return signature;

  } catch (error: any) {
    console.error('Sell failed:', error);
    throw new Error(`Sell failed: ${error.message}`);
  }
}

// ==========================
// UTILITY FUNCTIONS
// ==========================

/**
 * Get user's token balance
 */
export async function getTokenBalance(
  walletAddress: PublicKey,
  tokenMint: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      walletAddress
    );

    const accountInfo = await getAccount(connection, tokenAccount);
    return Number(accountInfo.amount) / 10 ** 9; // Convert from lamports
  } catch (error) {
    // Account doesn't exist, balance is 0
    return 0;
  }
}

/**
 * Get current token price from bonding curve
 */
export async function getTokenPrice(tokenMint: PublicKey): Promise<number> {
  try {
    // In production, fetch from bonding curve program
    // For now, return mock price
    return 0.00001; // 0.00001 SOL per token
  } catch (error) {
    console.error('Failed to get token price:', error);
    return 0;
  }
}

/**
 * Get token info including supply, price, market cap
 */
export async function getTokenInfo(mintAddress: string): Promise<TokenInfo> {
  try {
    const mint = new PublicKey(mintAddress);
    const mintInfo = await getMint(connection, mint);

    const supply = Number(mintInfo.supply) / 10 ** mintInfo.decimals;
    const price = await getTokenPrice(mint);
    const marketCap = supply * price;

    return {
      mintAddress,
      name: 'Token Name', // Fetch from metadata
      symbol: 'SYMBOL', // Fetch from metadata
      supply,
      decimals: mintInfo.decimals,
      currentPrice: price,
      marketCap,
    };
  } catch (error) {
    console.error('Failed to get token info:', error);
    throw error;
  }
}

/**
 * Get user's SOL balance
 */
export async function getSolBalance(walletAddress: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(walletAddress);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get SOL balance:', error);
    return 0;
  }
}

// ==========================
// SIMULATION HELPERS (DEV)
// ==========================

async function simulateBuyTransaction(
  wallet: WalletContextState,
  tokenMint: PublicKey,
  solAmount: number
): Promise<string> {
  // Simulate transaction for development
  // In production, this would create and send actual transaction
  return 'SIM_BUY_' + bs58.encode(Buffer.from(Date.now().toString()));
}

async function simulateSellTransaction(
  wallet: WalletContextState,
  tokenMint: PublicKey,
  tokenAmount: number
): Promise<string> {
  // Simulate transaction for development
  return 'SIM_SELL_' + bs58.encode(Buffer.from(Date.now().toString()));
}

// ==========================
// EXPORT ALL
// ==========================

export default {
  instantMintToken,
  checkViralStatus,
  buyTokens,
  sellTokens,
  getTokenBalance,
  getTokenPrice,
  getTokenInfo,
  getSolBalance,
};
