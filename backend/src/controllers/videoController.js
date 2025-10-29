// Use PostgreSQL database storage
const Video = require('../models/Video')
const path = require('path')

// Upload a new video
const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, duration, community_name, community_description, minimum_tokens, community_id } = req.body
    const userId = req.user.id

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      })
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({
        success: false,
        message: 'Video file is required'
      })
    }

    const videoFile = req.files.video[0]
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null

    // Create video URL paths (relative to uploads directory)
    const videoUrl = `/uploads/videos/${videoFile.filename}`
    const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null

    // If category (token ticker) is provided, create or get token
    let tokenId = null
    if (category && category !== 'general' && category.trim() !== '') {
      const { query } = require('../config/database')

      // Check if token already exists
      const existingToken = await query(
        'SELECT id FROM tokens WHERE token_symbol = $1',
        [category.toUpperCase()]
      )

      if (existingToken.rows.length > 0) {
        tokenId = existingToken.rows[0].id
      } else {
        // Create new token
        const tokenResult = await query(
          `INSERT INTO tokens (creator_id, token_symbol, token_name, description, total_supply)
           VALUES ($1, $2, $3, $4, 1000000)
           RETURNING id`,
          [userId, category.toUpperCase(), title, description || '']
        )
        tokenId = tokenResult.rows[0].id
      }
    }

    // Determine which community to link (existing or create new)
    let finalCommunityId = community_id || null
    let community = null

    // If community_name is provided and we have tokenId, create NEW community
    if (community_name && tokenId) {
      const Community = require('../models/Community')

      try {
        community = await Community.create({
          creatorId: userId,
          tokenId: tokenId,
          name: community_name,
          description: community_description || '',
          minimumTokens: parseInt(minimum_tokens) || 10
        })
        finalCommunityId = community.id
      } catch (communityError) {
        console.error('Community creation error:', communityError)
        // Don't fail the whole upload if community creation fails
      }
    }

    // Create video record in database with community link
    const video = await Video.create({
      creatorId: userId,
      title,
      description: description || '',
      videoUrl,
      thumbnailUrl,
      duration: duration ? parseInt(duration) : null,
      category: category || 'general',
      communityId: finalCommunityId
    })

    // Get full video data with user info
    const fullVideo = await Video.getById(video.id)

    // Emit real-time event via Socket.io
    const io = req.app.get('io')
    if (io) {
      io.emit('new-video', { video: fullVideo })
    }

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        video: fullVideo,
        token_id: tokenId,
        community: community
      }
    })
  } catch (error) {
    console.error('Upload video error:', error)
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Get all videos (feed) - now routes to Discover feed
const getAllVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0
    const feedType = req.query.feedType || 'discover'

    let videos
    if (feedType === 'newMints') {
      videos = await Video.getNewMints(limit, offset)
    } else {
      videos = await Video.getDiscoverFeed(limit, offset)
    }

    res.status(200).json({
      success: true,
      data: {
        videos,
        count: videos.length,
        feedType
      }
    })
  } catch (error) {
    console.error('Get videos error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching videos'
    })
  }
}

// Get New Mints feed (chronological)
const getNewMintsFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

    const videos = await Video.getNewMints(limit, offset)

    res.status(200).json({
      success: true,
      data: {
        videos,
        count: videos.length
      }
    })
  } catch (error) {
    console.error('Get New Mints error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching New Mints feed'
    })
  }
}

// Get Discover feed (70% recent, 30% viral)
const getDiscoverFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0

    const videos = await Video.getDiscoverFeed(limit, offset)

    res.status(200).json({
      success: true,
      data: {
        videos,
        count: videos.length
      }
    })
  } catch (error) {
    console.error('Get Discover feed error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching Discover feed'
    })
  }
}

// Get videos by creator
const getCreatorVideos = async (req, res) => {
  try {
    const creatorId = req.params.creatorId || req.user.id
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const videos = await Video.getByCreator(creatorId, limit, offset)

    res.status(200).json({
      success: true,
      data: {
        videos,
        count: videos.length
      }
    })
  } catch (error) {
    console.error('Get creator videos error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching creator videos'
    })
  }
}

// Get single video
const getVideo = async (req, res) => {
  try {
    const videoId = req.params.id
    const video = await Video.getById(videoId)

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      })
    }

    // Increment view count (pass userId if authenticated, null for guests)
    const userId = req.user ? req.user.id : null
    await Video.incrementViews(videoId, userId)

    // Update viral score
    await Video.updateViralScore(videoId)

    res.status(200).json({
      success: true,
      data: { video }
    })
  } catch (error) {
    console.error('Get video error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching video'
    })
  }
}

// Like/unlike video
const likeVideo = async (req, res) => {
  try {
    const videoId = req.params.id
    // Allow anonymous likes - use IP or generate a temporary ID if no user
    const userId = req.user ? req.user.id : `anon-${req.ip || Math.random().toString(36).substring(7)}`

    const result = await Video.like(videoId, userId)

    // Update viral score
    await Video.updateViralScore(videoId)

    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Like video error:', error)
    res.status(500).json({
      success: false,
      message: 'Error liking video'
    })
  }
}

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const videoId = req.params.id
    const userId = req.user.id

    const video = await Video.delete(videoId, userId)

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found or unauthorized'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    })
  } catch (error) {
    console.error('Delete video error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting video'
    })
  }
}

// Get my videos
const getMyVideos = async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const videos = await Video.getByCreator(userId, limit, offset)

    res.status(200).json({
      success: true,
      data: {
        videos,
        count: videos.length
      }
    })
  } catch (error) {
    console.error('Get my videos error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching your videos'
    })
  }
}

// Record video view (called on scroll or completion)
const recordView = async (req, res) => {
  try {
    const videoId = req.params.id
    const userId = req.user ? req.user.id : null

    // Always increment view count (tracks every view, not just unique)
    await Video.incrementViews(videoId, userId)
    await Video.updateViralScore(videoId)

    // Get updated view count
    const video = await Video.getById(videoId)

    res.status(200).json({
      success: true,
      data: {
        views_count: video.views_count
      }
    })
  } catch (error) {
    console.error('Record view error:', error)
    res.status(500).json({
      success: false,
      message: 'Error recording view'
    })
  }
}

module.exports = {
  uploadVideo,
  getAllVideos,
  getNewMintsFeed,
  getDiscoverFeed,
  getCreatorVideos,
  getVideo,
  likeVideo,
  deleteVideo,
  getMyVideos,
  recordView
}
