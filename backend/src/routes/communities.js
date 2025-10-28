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

module.exports = router
