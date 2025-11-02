/**
 * Token API Routes
 *
 * Handles all token-related operations:
 * - Token creation (instant mint & viral auto-launch)
 * - Buy/sell transactions
 * - Token info queries
 * - Bonding curve state
 * - Raydium migration
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { query } = require('../config/database');
const solanaService = require('../services/solanaService');
const metaplexService = require('../services/metaplexService');
const logger = require('../utils/logger');

// ============================================================================
// TOKEN CREATION
// ============================================================================

/**
 * POST /api/tokens/create
 * Create new token with bonding curve
 *
 * Body:
 * - tokenName: string
 * - tokenSymbol: string
 * - description: string
 * - videoId: string
 * - imagePath: string (optional)
 * - externalLinks: object (optional)
 * - path: 'instant' | 'viral'
 */
router.post('/create', auth, async (req, res) => {
  try {
    const {
      tokenName,
      tokenSymbol,
      description,
      videoId,
      imagePath,
      externalLinks = {},
      path = 'instant',
    } = req.body;

    logger.info(`Creating token: ${tokenName} (${tokenSymbol})`);

    // Validate inputs
    if (!tokenName || !tokenSymbol || !videoId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenName, tokenSymbol, videoId',
      });
    }

    // Get user's wallet address
    const userResult = await query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (!userResult.rows[0]?.wallet_address) {
      return res.status(400).json({
        success: false,
        message: 'Please connect your Solana wallet first',
      });
    }

    const creatorWallet = userResult.rows[0].wallet_address;

    // Step 1: Create token metadata with Metaplex
    logger.info('Creating token metadata...');

    const metadataUri = await metaplexService.createTokenMetadataFromVideo({
      videoId,
      videoPath: null,
      thumbnailPath: imagePath,
      name: tokenName,
      symbol: tokenSymbol,
      description,
      externalLinks,
    });

    logger.info(`Metadata created: ${metadataUri}`);

    // Step 2: Create token with bonding curve
    logger.info('Creating token on-chain...');

    const tokenData = await solanaService.createTokenWithBondingCurve({
      tokenName,
      tokenSymbol,
      tokenUri: metadataUri,
      videoId,
      creatorPublicKey: creatorWallet,
      path,
    });

    logger.info(`Token created: ${tokenData.mintAddress}`);

    // Step 3: Save to database
    await query(
      `INSERT INTO tokens (
        id,
        mint_address,
        bonding_curve_address,
        token_name,
        token_symbol,
        token_uri,
        video_id,
        creator_id,
        launch_path,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        tokenData.mintAddress,
        tokenData.mintAddress,
        tokenData.bondingCurveAddress,
        tokenName,
        tokenSymbol,
        metadataUri,
        videoId,
        req.user.userId,
        path,
      ]
    );

    // Update video with token
    await query(
      'UPDATE videos SET token_mint_address = $1, is_minted = true WHERE id = $2',
      [tokenData.mintAddress, videoId]
    );

    res.json({
      success: true,
      message: 'Token created successfully',
      data: {
        ...tokenData,
        metadataUri,
      },
    });
  } catch (error) {
    logger.error('Token creation failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Token creation failed',
    });
  }
});

// ============================================================================
// TRADING OPERATIONS
// ============================================================================

/**
 * POST /api/tokens/:mintAddress/buy
 * Buy tokens from bonding curve
 */
router.post('/:mintAddress/buy', auth, async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const { solAmount, slippage = 1 } = req.body;

    if (!solAmount || solAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid SOL amount',
      });
    }

    // Get user wallet
    const userResult = await query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [req.user.userId]
    );

    const buyerWallet = userResult.rows[0]?.wallet_address;

    if (!buyerWallet) {
      return res.status(400).json({
        success: false,
        message: 'Wallet not connected',
      });
    }

    // Execute buy
    const result = await solanaService.buyTokens({
      mintAddress,
      buyerPublicKey: buyerWallet,
      solAmount,
      slippage,
    });

    // Record transaction
    await query(
      `INSERT INTO token_trades (
        token_mint_address,
        user_id,
        trade_type,
        sol_amount,
        token_amount,
        price_per_token,
        signature,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        mintAddress,
        req.user.userId,
        'buy',
        result.solSpent,
        result.tokensReceived,
        result.pricePerToken,
        result.signature,
      ]
    );

    res.json({
      success: true,
      message: 'Buy successful',
      data: result,
    });
  } catch (error) {
    logger.error('Buy failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Buy transaction failed',
    });
  }
});

/**
 * POST /api/tokens/:mintAddress/sell
 * Sell tokens to bonding curve
 */
router.post('/:mintAddress/sell', auth, async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const { tokenAmount, slippage = 1 } = req.body;

    if (!tokenAmount || tokenAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token amount',
      });
    }

    // Get user wallet
    const userResult = await query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [req.user.userId]
    );

    const sellerWallet = userResult.rows[0]?.wallet_address;

    if (!sellerWallet) {
      return res.status(400).json({
        success: false,
        message: 'Wallet not connected',
      });
    }

    // Execute sell
    const result = await solanaService.sellTokens({
      mintAddress,
      sellerPublicKey: sellerWallet,
      tokenAmount,
      slippage,
    });

    // Record transaction
    await query(
      `INSERT INTO token_trades (
        token_mint_address,
        user_id,
        trade_type,
        sol_amount,
        token_amount,
        price_per_token,
        signature,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        mintAddress,
        req.user.userId,
        'sell',
        result.solReceived,
        result.tokensSold,
        result.pricePerToken,
        result.signature,
      ]
    );

    res.json({
      success: true,
      message: 'Sell successful',
      data: result,
    });
  } catch (error) {
    logger.error('Sell failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Sell transaction failed',
    });
  }
});

// ============================================================================
// TOKEN INFO QUERIES
// ============================================================================

/**
 * GET /api/tokens/:mintAddress
 * Get token information
 */
router.get('/:mintAddress', async (req, res) => {
  try {
    const { mintAddress } = req.params;

    // Get from database
    const result = await query(
      `SELECT
        t.*,
        u.username as creator_username,
        v.title as video_title
      FROM tokens t
      LEFT JOIN users u ON t.creator_id = u.id
      LEFT JOIN videos v ON t.video_id = v.id
      WHERE t.mint_address = $1`,
      [mintAddress]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    const tokenData = result.rows[0];

    // Get live data from blockchain
    const price = await solanaService.getTokenPrice(mintAddress);
    const marketCap = await solanaService.getMarketCap(mintAddress);

    res.json({
      success: true,
      data: {
        ...tokenData,
        currentPrice: price,
        marketCap,
      },
    });
  } catch (error) {
    logger.error('Failed to get token info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch token info',
    });
  }
});

/**
 * GET /api/tokens/:mintAddress/curve-state
 * Get bonding curve state
 */
router.get('/:mintAddress/curve-state', async (req, res) => {
  try {
    const { mintAddress } = req.params;

    const curveState = await solanaService.getBondingCurveState(mintAddress);

    // Calculate progress to Raydium
    const progressPercent =
      (curveState.realSolReserves / curveState.raydiumMigrationThreshold) * 100;

    res.json({
      success: true,
      curveState: {
        ...curveState,
        progressPercent,
      },
    });
  } catch (error) {
    logger.error('Failed to get curve state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch curve state',
    });
  }
});

/**
 * GET /api/tokens/:mintAddress/trades
 * Get trade history for a token
 */
router.get('/:mintAddress/trades', async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT
        tt.*,
        u.username
      FROM token_trades tt
      LEFT JOIN users u ON tt.user_id = u.id
      WHERE tt.token_mint_address = $1
      ORDER BY tt.created_at DESC
      LIMIT $2 OFFSET $3`,
      [mintAddress, limit, offset]
    );

    res.json({
      success: true,
      data: {
        trades: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get trade history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trade history',
    });
  }
});

/**
 * GET /api/tokens
 * Get all tokens (with filters)
 */
router.get('/', async (req, res) => {
  try {
    const {
      sortBy = 'created_at',
      order = 'DESC',
      limit = 50,
      offset = 0,
    } = req.query;

    const result = await query(
      `SELECT
        t.*,
        u.username as creator_username,
        COUNT(tt.id) as trade_count,
        SUM(CASE WHEN tt.trade_type = 'buy' THEN tt.sol_amount ELSE 0 END) as volume
      FROM tokens t
      LEFT JOIN users u ON t.creator_id = u.id
      LEFT JOIN token_trades tt ON t.mint_address = tt.token_mint_address
      GROUP BY t.id, u.username
      ORDER BY ${sortBy} ${order}
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: {
        tokens: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tokens',
    });
  }
});

// ============================================================================
// RAYDIUM MIGRATION
// ============================================================================

/**
 * POST /api/tokens/:mintAddress/migrate
 * Migrate bonding curve to Raydium
 * (Admin/automated only)
 */
router.post('/:mintAddress/migrate', auth, async (req, res) => {
  try {
    const { mintAddress } = req.params;

    // Check if user is creator or admin
    const tokenResult = await query(
      'SELECT creator_id FROM tokens WHERE mint_address = $1',
      [mintAddress]
    );

    if (!tokenResult.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    // TODO: Add admin check
    if (tokenResult.rows[0].creator_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only token creator can trigger migration',
      });
    }

    // Execute migration
    const result = await solanaService.migrateToRaydium(mintAddress);

    // Update database
    await query(
      `UPDATE tokens
       SET is_graduated = true,
           raydium_pool_address = $1,
           graduated_at = NOW()
       WHERE mint_address = $2`,
      [result.raydiumPoolAddress, mintAddress]
    );

    res.json({
      success: true,
      message: 'Successfully migrated to Raydium',
      data: result,
    });
  } catch (error) {
    logger.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Migration failed',
    });
  }
});

module.exports = router;
