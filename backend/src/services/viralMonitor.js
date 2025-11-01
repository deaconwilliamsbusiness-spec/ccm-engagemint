/**
 * Viral Monitor Service
 *
 * PATH B Implementation: Free Upload → Viral Auto-Launch
 *
 * Monitors videos uploaded via "POST VIDEO" (free path)
 * When a video hits 10,000 likes, automatically:
 * 1. Creates token on Solana (backend wallet pays)
 * 2. Initializes bonding curve
 * 3. Updates database
 * 4. Notifies creator
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { createMint, mintTo, getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');
const bs58 = require('bs58');
const pool = require('../config/database');

// Configuration
const VIRAL_THRESHOLD = parseInt(process.env.VIRAL_THRESHOLD) || 10000;
const CHECK_INTERVAL = parseInt(process.env.VIRAL_CHECK_INTERVAL_MS) || 60000; // 1 minute
const AUTO_LAUNCH_ENABLED = process.env.AUTO_LAUNCH_ENABLED !== 'false';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

class ViralMonitor {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.backendWallet = null;
    this.launchQueue = [];
  }

  /**
   * Start the viral monitoring service
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Viral monitor already running');
      return;
    }

    if (!AUTO_LAUNCH_ENABLED) {
      console.log('⚠️  Auto-launch disabled (AUTO_LAUNCH_ENABLED=false)');
      return;
    }

    // Load backend wallet keypair
    const privateKeyBase58 = process.env.SOLANA_BACKEND_WALLET_PRIVATE_KEY;
    if (!privateKeyBase58) {
      console.error('❌ SOLANA_BACKEND_WALLET_PRIVATE_KEY not set');
      console.error('   Viral auto-launch DISABLED');
      console.error('   Generate keypair: solana-keygen new --outfile backend-wallet.json');
      return;
    }

    try {
      const privateKeyBytes = bs58.decode(privateKeyBase58);
      this.backendWallet = Keypair.fromSecretKey(privateKeyBytes);

      console.log('🔑 Backend wallet loaded successfully');
      console.log(`   Address: ${this.backendWallet.publicKey.toString()}`);

      // Check wallet balance
      const balance = await connection.getBalance(this.backendWallet.publicKey);
      const solBalance = balance / 1e9;
      console.log(`   Balance: ${solBalance.toFixed(4)} SOL`);

      if (solBalance < 0.1) {
        console.warn(`⚠️  Low balance! Need at least 0.1 SOL for auto-launches`);
        console.warn(`   Airdrop on devnet: solana airdrop 1 ${this.backendWallet.publicKey.toString()}`);
      }

    } catch (error) {
      console.error('❌ Failed to load backend wallet:', error);
      return;
    }

    this.isRunning = true;
    console.log('🔥 Viral Monitor Started');
    console.log(`   Threshold: ${VIRAL_THRESHOLD.toLocaleString()} likes`);
    console.log(`   Check interval: ${CHECK_INTERVAL / 1000}s`);

    // Initial check
    await this.checkViralVideos();

    // Schedule recurring checks
    this.intervalId = setInterval(() => {
      this.checkViralVideos();
    }, CHECK_INTERVAL);
  }

  /**
   * Check for videos that reached viral threshold
   */
  async checkViralVideos() {
    try {
      // Query videos ready for auto-launch
      const result = await pool.query(`
        SELECT
          v.id,
          v.title,
          v.description,
          v.creator_id,
          v.likes_count,
          v.viral_score,
          v.views_count,
          v.comments_count,
          u.username,
          u.wallet_address
        FROM videos v
        JOIN users u ON v.creator_id = u.id
        WHERE v.upload_path = 'viral'
          AND v.is_token_launched = false
          AND v.likes_count >= $1
        ORDER BY v.likes_count DESC
        LIMIT 10
      `, [VIRAL_THRESHOLD]);

      if (result.rows.length === 0) {
        return; // No viral videos yet
      }

      console.log(`\n🎯 Found ${result.rows.length} video(s) ready for auto-launch:`);
      result.rows.forEach(v => {
        console.log(`   - "${v.title}" by @${v.username} (${v.likes_count.toLocaleString()} likes)`);
      });

      // Launch tokens for each video
      for (const video of result.rows) {
        await this.autoLaunchToken(video);
      }

    } catch (error) {
      console.error('Error checking viral videos:', error);
    }
  }

  /**
   * Auto-launch token for a viral video
   */
  async autoLaunchToken(video) {
    console.log(`\n🚀 AUTO-LAUNCHING TOKEN:`);
    console.log(`   Video: "${video.title}"`);
    console.log(`   Creator: @${video.username}`);
    console.log(`   Likes: ${video.likes_count.toLocaleString()}`);
    console.log(`   Viral Score: ${video.viral_score || 'N/A'}`);

    const startTime = Date.now();

    try {
      // Generate token details
      const tokenSymbol = this.generateSymbol(video.title);
      const tokenName = video.title.substring(0, 32);
      const initialSupply = 1_000_000; // 1M tokens

      console.log(`   Token: ${tokenName} ($${tokenSymbol})`);
      console.log(`   Supply: ${initialSupply.toLocaleString()}`);

      // Create token on Solana
      const result = await this.createTokenOnSolana({
        videoId: video.id,
        tokenName,
        tokenSymbol,
        initialSupply,
        creatorWallet: video.wallet_address,
      });

      const { mintAddress, bondingCurveAddress, signature, solSpent } = result;

      // Update database - mark as launched
      await pool.query(`
        UPDATE videos
        SET is_token_launched = true,
            token_mint_address = $1,
            bonding_curve_address = $2,
            launch_signature = $3,
            launched_by = 'backend',
            launch_timestamp = NOW()
        WHERE id = $4
      `, [mintAddress, bondingCurveAddress, signature, video.id]);

      // Record backend launch
      await pool.query(`
        INSERT INTO backend_token_launches (
          video_id,
          mint_address,
          bonding_curve_address,
          launch_signature,
          sol_spent,
          likes_at_launch,
          viral_score_at_launch
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        video.id,
        mintAddress,
        bondingCurveAddress,
        signature,
        solSpent,
        video.likes_count,
        video.viral_score || 0
      ]);

      // Also update tokens table if exists
      await pool.query(`
        UPDATE tokens
        SET mint_address = $1,
            bonding_curve_address = $2
        WHERE creator_id = (SELECT creator_id FROM videos WHERE id = $3)
          AND mint_address IS NULL
        LIMIT 1
      `, [mintAddress, bondingCurveAddress, video.id]);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n✅ TOKEN LAUNCHED SUCCESSFULLY!`);
      console.log(`   Mint Address: ${mintAddress}`);
      console.log(`   Bonding Curve: ${bondingCurveAddress}`);
      console.log(`   Signature: ${signature}`);
      console.log(`   SOL Spent: ${solSpent} SOL`);
      console.log(`   Duration: ${duration}s`);

      // TODO: Send push notification to creator
      // TODO: Emit Socket.io event for real-time UI update
      // TODO: Send email notification

      return true;

    } catch (error) {
      console.error(`\n❌ AUTO-LAUNCH FAILED for video ${video.id}:`, error);

      // Log error to database for debugging
      await pool.query(`
        INSERT INTO error_logs (
          error_type,
          error_message,
          context
        ) VALUES ('viral_auto_launch', $1, $2)
      `, [error.message, JSON.stringify({ videoId: video.id, video: video.title })]);

      return false;
    }
  }

  /**
   * Create token on Solana blockchain
   */
  async createTokenOnSolana({ videoId, tokenName, tokenSymbol, initialSupply, creatorWallet }) {
    console.log(`   Creating token on Solana...`);

    const startBalance = await connection.getBalance(this.backendWallet.publicKey);

    try {
      // Step 1: Create mint
      console.log(`   Step 1: Creating mint account...`);

      const mint = await createMint(
        connection,
        this.backendWallet, // Payer
        this.backendWallet.publicKey, // Mint authority
        this.backendWallet.publicKey, // Freeze authority
        9 // Decimals
      );

      console.log(`   ✓ Mint created: ${mint.toString()}`);

      // Step 2: Create token account for bonding curve
      console.log(`   Step 2: Creating bonding curve vault...`);

      const bondingCurveVault = await getOrCreateAssociatedTokenAccount(
        connection,
        this.backendWallet,
        mint,
        this.backendWallet.publicKey
      );

      console.log(`   ✓ Vault created: ${bondingCurveVault.address.toString()}`);

      // Step 3: Mint initial supply to bonding curve
      console.log(`   Step 3: Minting ${initialSupply.toLocaleString()} tokens...`);

      const mintSignature = await mintTo(
        connection,
        this.backendWallet,
        mint,
        bondingCurveVault.address,
        this.backendWallet,
        initialSupply * 1e9 // Convert to lamports (9 decimals)
      );

      console.log(`   ✓ Tokens minted: ${mintSignature}`);

      // Step 4: Calculate SOL spent
      const endBalance = await connection.getBalance(this.backendWallet.publicKey);
      const solSpent = (startBalance - endBalance) / 1e9;

      // For now, bonding curve address is same as vault
      // In production, this would be a separate bonding curve program PDA
      const bondingCurveAddress = bondingCurveVault.address.toString();

      return {
        mintAddress: mint.toString(),
        bondingCurveAddress: bondingCurveAddress,
        signature: mintSignature,
        solSpent: solSpent,
      };

    } catch (error) {
      console.error(`   ❌ Solana transaction failed:`, error);
      throw error;
    }
  }

  /**
   * Generate token symbol from video title
   */
  generateSymbol(title) {
    // Clean title: remove special chars, uppercase
    const cleaned = title.toUpperCase().replace(/[^A-Z0-9\s]/g, '');

    // Try acronym from first letters
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 1) {
      const acronym = words.map(w => w[0]).join('').substring(0, 6);
      if (acronym.length >= 3) return acronym;
    }

    // Otherwise take first 6 chars
    const simple = cleaned.replace(/\s/g, '').substring(0, 6);
    if (simple.length >= 3) return simple;

    // Fallback
    return 'VIRAL' + Math.random().toString(36).substring(2, 5).toUpperCase();
  }

  /**
   * Get current viral status for a video
   */
  async getViralStatus(videoId) {
    try {
      const result = await pool.query(`
        SELECT
          upload_path,
          is_token_launched,
          likes_count,
          viral_launch_threshold,
          token_mint_address,
          bonding_curve_address,
          launch_timestamp
        FROM videos
        WHERE id = $1
      `, [videoId]);

      if (result.rows.length === 0) {
        throw new Error('Video not found');
      }

      const video = result.rows[0];
      const threshold = video.viral_launch_threshold || VIRAL_THRESHOLD;

      return {
        isLaunched: video.is_token_launched,
        currentLikes: video.likes_count,
        threshold: threshold,
        progress: Math.min(100, (video.likes_count / threshold) * 100),
        mintAddress: video.token_mint_address,
        bondingCurveAddress: video.bonding_curve_address,
        launchTimestamp: video.launch_timestamp,
      };
    } catch (error) {
      console.error('Failed to get viral status:', error);
      throw error;
    }
  }

  /**
   * Stop the viral monitor
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Viral monitor stopped');
  }

  /**
   * Get stats about viral launches
   */
  async getStats() {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_launches,
          SUM(sol_spent) as total_sol_spent,
          AVG(likes_at_launch) as avg_likes_at_launch,
          MAX(likes_at_launch) as max_likes_at_launch
        FROM backend_token_launches
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }
}

module.exports = new ViralMonitor();
