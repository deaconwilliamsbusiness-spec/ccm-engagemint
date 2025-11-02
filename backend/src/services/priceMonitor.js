/**
 * SIMPLIFIED Price Monitor - Production Ready
 *
 * Core: Monitor prices, broadcast updates, detect graduation
 */

const { query } = require('../config/database');
const solanaService = require('./solanaService');
const logger = require('../utils/logger');

class PriceMonitor {
  constructor(io) {
    this.io = io;
    this.isRunning = false;
    this.interval = null;
    this.updateInterval = 10000; // 10 seconds (simplified from 5)
    this.activeTokens = new Map();
  }

  async start() {
    if (this.isRunning) return;

    logger.info('🔄 Starting price monitor...');
    this.isRunning = true;

    await this.loadActiveTokens();

    // Monitor loop
    this.interval = setInterval(() => {
      this.monitorPrices().catch((err) =>
        logger.error('Price monitoring error:', err)
      );
    }, this.updateInterval);

    // Reload tokens every minute
    setInterval(() => {
      this.loadActiveTokens().catch((err) =>
        logger.error('Token reload error:', err)
      );
    }, 60000);

    logger.info('✅ Price monitor started');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    logger.info('⏹️  Price monitor stopped');
  }

  async loadActiveTokens() {
    try {
      const result = await query(
        `SELECT mint_address, token_name, token_symbol, bonding_curve_address
         FROM tokens
         WHERE is_graduated = FALSE
         ORDER BY created_at DESC
         LIMIT 50`
      );

      this.activeTokens.clear();
      for (const token of result.rows) {
        this.activeTokens.set(token.mint_address, token);
      }

      logger.info(`📊 Monitoring ${this.activeTokens.size} tokens`);
    } catch (error) {
      logger.error('Failed to load tokens:', error);
    }
  }

  async monitorPrices() {
    const updates = [];

    for (const [mintAddress, token] of this.activeTokens.entries()) {
      try {
        const price = await solanaService.getTokenPrice(mintAddress);
        const marketCap = await solanaService.getMarketCap(mintAddress);
        const state = await solanaService.getBondingCurveState(
          token.bonding_curve_address
        );

        const priceData = {
          mintAddress,
          tokenSymbol: token.token_symbol,
          price,
          marketCap,
          realSolReserves: state.realSolReserves,
          progressPercent:
            (Number(state.realSolReserves) / Number(state.raydiumMigrationThreshold)) * 100,
          isGraduated: state.isGraduated,
          timestamp: Date.now(),
        };

        updates.push(priceData);

        // Update DB cache
        await query(
          'UPDATE tokens SET current_price = $1, market_cap = $2 WHERE mint_address = $3',
          [price, marketCap, mintAddress]
        );

        // Check graduation
        if (state.isGraduated) {
          logger.info(`🎉 ${token.token_symbol} graduated!`);
          await this.handleGraduation(mintAddress);
          this.activeTokens.delete(mintAddress);
        }
      } catch (error) {
        logger.error(`Price update failed for ${mintAddress}:`, error);
      }
    }

    // Broadcast updates
    if (updates.length > 0) {
      this.io.emit('price_updates', updates);
    }
  }

  async handleGraduation(mintAddress) {
    try {
      await query(
        'UPDATE tokens SET is_graduated = TRUE, graduated_at = NOW() WHERE mint_address = $1',
        [mintAddress]
      );

      this.io.emit('token_graduated', { mintAddress, timestamp: Date.now() });
      logger.info(`Graduation event broadcasted for ${mintAddress}`);
    } catch (error) {
      logger.error('Graduation handling failed:', error);
    }
  }
}

module.exports = PriceMonitor;
