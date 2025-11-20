/**
 * Blockchain Sync Service
 *
 * Syncs on-chain bonding curve state to database
 * Runs every 10 seconds to keep prices, reserves, and graduation status up-to-date
 */

const { query } = require('../config/database');
const solanaService = require('./solanaService');
const logger = require('../utils/logger');

class BlockchainSync {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.syncInterval = parseInt(process.env.BLOCKCHAIN_SYNC_INTERVAL_MS) || 10000; // 10 seconds
  }

  /**
   * Start the blockchain sync service
   */
  async start() {
    if (this.isRunning) {
      logger.warn('⚠️  Blockchain sync already running');
      return;
    }

    this.isRunning = true;
    logger.info('🔄 Blockchain Sync Service Started');
    logger.info(`   Sync interval: ${this.syncInterval / 1000}s`);

    // Run initial sync
    await this.syncActiveTokens();

    // Schedule recurring sync
    this.intervalId = setInterval(() => {
      this.syncActiveTokens().catch(err => {
        logger.error('Sync iteration error:', err);
      });
    }, this.syncInterval);
  }

  /**
   * Sync active (non-graduated) tokens from blockchain
   */
  async syncActiveTokens() {
    try {
      // Get all tokens with mint addresses that aren't graduated yet
      // Order by last_synced_at to prioritize stale data
      const result = await query(`
        SELECT
          mint_address,
          bonding_curve_address,
          token_name,
          token_symbol,
          is_graduated,
          last_synced_at
        FROM tokens
        WHERE mint_address IS NOT NULL
          AND is_graduated = false
        ORDER BY last_synced_at ASC NULLS FIRST
        LIMIT 20
      `);

      if (result.rows.length === 0) {
        return; // No active tokens to sync
      }

      logger.debug(`Syncing ${result.rows.length} active tokens...`);

      // Sync each token
      for (const token of result.rows) {
        await this.syncToken(token.mint_address, token.token_name);
      }

    } catch (error) {
      logger.error('Failed to sync active tokens:', error);
    }
  }

  /**
   * Sync a single token from blockchain to database
   */
  async syncToken(mintAddress, tokenName = 'Unknown') {
    try {
      // Fetch on-chain bonding curve state
      const curveState = await solanaService.getBondingCurveState(mintAddress);

      // Calculate current price and market cap
      const price = await solanaService.getTokenPrice(mintAddress);
      const marketCap = await solanaService.getMarketCap(mintAddress);

      // Update database with current on-chain state
      await query(`
        UPDATE tokens
        SET
          current_price = $1,
          market_cap = $2,
          is_graduated = $3,
          real_sol_reserves = $4,
          real_token_reserves = $5,
          virtual_sol_reserves = $6,
          virtual_token_reserves = $7,
          trade_count = $8,
          last_synced_at = NOW(),
          updated_at = NOW()
        WHERE mint_address = $9
      `, [
        price,
        marketCap,
        curveState.isGraduated,
        curveState.realSolReserves,
        curveState.realTokenReserves,
        curveState.virtualSolReserves,
        curveState.virtualTokenReserves,
        curveState.tradeCount,
        mintAddress
      ]);

      // Record price history snapshot (for charts)
      await this.recordPriceHistory(mintAddress, price, marketCap, curveState);

      // Check if just graduated
      if (curveState.isGraduated) {
        logger.info(`🎉 Token ${tokenName} ($${mintAddress.substring(0, 8)}...) just graduated!`);
        // TODO: Trigger Raydium migration
        // TODO: Notify creator
        // TODO: Emit Socket.io event
      }

      logger.debug(`✓ Synced ${tokenName}: $${price.toFixed(8)} SOL, ${curveState.isGraduated ? 'Graduated' : 'Active'}`);

    } catch (error) {
      // Don't throw - continue syncing other tokens
      logger.error(`Failed to sync token ${mintAddress}:`, error.message);
    }
  }

  /**
   * Record price snapshot for historical charts
   */
  async recordPriceHistory(mintAddress, price, marketCap, curveState) {
    try {
      // Only record if price has changed significantly (>0.1%) or every 5 minutes
      const lastSnapshot = await query(`
        SELECT price, recorded_at
        FROM token_price_history
        WHERE mint_address = $1
        ORDER BY recorded_at DESC
        LIMIT 1
      `, [mintAddress]);

      let shouldRecord = true;

      if (lastSnapshot.rows.length > 0) {
        const lastPrice = parseFloat(lastSnapshot.rows[0].price);
        const priceChange = Math.abs((price - lastPrice) / lastPrice);
        const timeSince = Date.now() - new Date(lastSnapshot.rows[0].recorded_at).getTime();

        // Only record if >0.1% price change OR >5 minutes elapsed
        shouldRecord = priceChange > 0.001 || timeSince > 300000;
      }

      if (shouldRecord) {
        await query(`
          INSERT INTO token_price_history (
            mint_address,
            price,
            market_cap,
            real_sol_reserves,
            real_token_reserves,
            recorded_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())
        `, [
          mintAddress,
          price,
          marketCap,
          curveState.realSolReserves,
          curveState.realTokenReserves
        ]);
      }

    } catch (error) {
      logger.error(`Failed to record price history for ${mintAddress}:`, error);
    }
  }

  /**
   * Sync a specific token immediately (called after user trades)
   */
  async syncTokenImmediately(mintAddress) {
    logger.debug(`Immediate sync requested for ${mintAddress}`);
    await this.syncToken(mintAddress);
  }

  /**
   * Get sync stats
   */
  async getStats() {
    try {
      const result = await query(`
        SELECT
          COUNT(*) FILTER (WHERE mint_address IS NOT NULL) as total_tokens,
          COUNT(*) FILTER (WHERE is_graduated = true) as graduated_tokens,
          COUNT(*) FILTER (WHERE is_graduated = false AND mint_address IS NOT NULL) as active_tokens,
          MAX(last_synced_at) as latest_sync,
          MIN(last_synced_at) as oldest_sync
        FROM tokens
      `);

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get sync stats:', error);
      return null;
    }
  }

  /**
   * Stop the blockchain sync service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('🛑 Blockchain sync service stopped');
  }
}

// Export singleton instance
module.exports = new BlockchainSync();
