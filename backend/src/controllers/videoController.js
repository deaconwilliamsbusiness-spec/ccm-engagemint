// Use PostgreSQL database storage
const Video = require('../models/Video')
const path = require('path')

// Upload a new video
const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, duration } = req.body
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

    // Create video record in database
    const video = await Video.create({
      creatorId: userId,
      title,
      description: description || '',
      videoUrl,
      thumbnailUrl,
      duration: duration ? parseInt(duration) : null,
      category: category || 'general'
    })

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: { video }
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

// Get all videos (feed)
const getAllVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const videos = await Video.getAll(limit, offset)

    res.status(200).json({
      success: true,
      data: {
        videos,
        count: videos.length
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

    // Increment view count
    await Video.incrementViews(videoId)

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

module.exports = {
  uploadVideo,
  getAllVideos,
  getCreatorVideos,
  getVideo,
  likeVideo,
  deleteVideo,
  getMyVideos
}
