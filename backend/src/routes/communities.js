const express = require('express')
const router = express.Router()
const Community = require('../models/Community')
const { authenticate, optionalAuth } = require('../middleware/auth')

// Get all communities (public)
router.get('/communities', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const communities = await Community.getAll(limit, offset)

    res.json({
      success: true,
      data: communities
    })
  } catch (error) {
    console.error('Get communities error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communities',
      error: error.message
    })
  }
})

// Get single community by ID (public)
router.get('/communities/:id', optionalAuth, async (req, res) => {
  try {
    const community = await Community.getById(req.params.id)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      })
    }

    res.json({
      success: true,
      data: community
    })
  } catch (error) {
    console.error('Get community error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community',
      error: error.message
    })
  }
})

// Get communities by creator (requires auth)
router.get('/communities/creator/:creatorId', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const communities = await Community.getByCreator(req.params.creatorId, limit, offset)

    res.json({
      success: true,
      data: communities
    })
  } catch (error) {
    console.error('Get creator communities error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch creator communities',
      error: error.message
    })
  }
})

// Get community by token ID (public)
router.get('/communities/token/:tokenId', optionalAuth, async (req, res) => {
  try {
    const community = await Community.getByTokenId(req.params.tokenId)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found for this token'
      })
    }

    res.json({
      success: true,
      data: community
    })
  } catch (error) {
    console.error('Get community by token error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community',
      error: error.message
    })
  }
})

// Get community posts
router.get('/communities/:id/posts', optionalAuth, async (req, res) => {
  try {
    const { query } = require('../config/database')
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

    const result = await query(
      `SELECT
        cp.*,
        u.username,
        u.profile_image_url
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.community_id = $1
      ORDER BY cp.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.params.id, limit, offset]
    )

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Get community posts error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    })
  }
})

// Create community post
router.post('/communities/:id/posts', authenticate, async (req, res) => {
  try {
    const { query } = require('../config/database')
    const { content } = req.body
    const userId = req.user.id
    const communityId = req.params.id

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      })
    }

    // Check if user has access to community (has enough tokens)
    const community = await Community.getById(communityId)
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      })
    }

    // Insert post
    const result = await query(
      `INSERT INTO community_posts (community_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [communityId, userId, content.trim()]
    )

    // Get post with user info
    const postResult = await query(
      `SELECT
        cp.*,
        u.username,
        u.profile_image_url
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1`,
      [result.rows[0].id]
    )

    res.status(201).json({
      success: true,
      data: postResult.rows[0],
      message: 'Post created successfully'
    })
  } catch (error) {
    console.error('Create community post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    })
  }
})

// Get community members
router.get('/communities/:id/members', optionalAuth, async (req, res) => {
  try {
    const { query } = require('../config/database')
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

    const result = await query(
      `SELECT
        cm.*,
        u.username,
        u.profile_image_url,
        utb.balance as token_balance
      FROM community_members cm
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN user_token_balances utb ON utb.user_id = u.id
      WHERE cm.community_id = $1
      ORDER BY cm.joined_at DESC
      LIMIT $2 OFFSET $3`,
      [req.params.id, limit, offset]
    )

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Get community members error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    })
  }
})

module.exports = router
