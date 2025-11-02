const express = require('express')
const router = express.Router()
const upload = require('../config/upload')
const rateLimit = require('express-rate-limit')
const { authenticate, optionalAuth } = require('../middleware/auth')
const {
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
} = require('../controllers/videoController')
const engagementTracker = require('../services/engagementTracker')
const viralMonitor = require('../services/viralMonitor')

// Rate limiter for video uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit uploads to 10 per hour per IP
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Public routes
router.get('/', optionalAuth, getAllVideos) // Supports ?feedType=discover or ?feedType=newMints
router.get('/feed/new-mints', optionalAuth, getNewMintsFeed) // Dedicated New Mints endpoint
router.get('/feed/discover', optionalAuth, getDiscoverFeed) // Dedicated Discover endpoint
router.get('/creator/:creatorId', optionalAuth, getCreatorVideos)

// Specific routes BEFORE generic /:id route
router.post('/:id/view', optionalAuth, recordView) // Track video view
router.post('/:id/like', optionalAuth, likeVideo)
router.get('/:id/engagement-history', optionalAuth, async (req, res) => {
  try {
    const videoId = req.params.id
    const limit = parseInt(req.query.limit) || 12

    const history = await engagementTracker.getVideoEngagementLastN(videoId, limit)

    res.json({
      success: true,
      data: history
    })
  } catch (error) {
    console.error('Get engagement history error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch engagement history'
    })
  }
})

// Get viral launch status for a video (PATH B tracking)
router.get('/:id/viral-status', async (req, res) => {
  try {
    const { id } = req.params
    const status = await viralMonitor.getViralStatus(id)
    res.json(status)
  } catch (error) {
    console.error('Get viral status error:', error)
    res.status(500).json({
      error: error.message || 'Failed to get viral status'
    })
  }
})

// Generic /:id route LAST
router.get('/:id', optionalAuth, getVideo)

// Protected routes (require authentication)
router.post(
  '/upload',
  uploadLimiter,
  authenticate,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  uploadVideo
)

router.get('/me/videos', authenticate, getMyVideos)
router.delete('/:id', authenticate, deleteVideo)

// Report video
router.post('/:id/report', optionalAuth, async (req, res) => {
  try {
    const videoId = req.params.id
    const { reason } = req.body
    const userId = req.user?.id || null

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      })
    }

    const { query } = require('../config/database')

    // Insert report
    await query(
      `INSERT INTO video_reports (video_id, user_id, reason, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [videoId, userId, reason]
    )

    // Check if >= 5 reports
    const countResult = await query(
      `SELECT COUNT(*) as count FROM video_reports WHERE video_id = $1`,
      [videoId]
    )

    const reportCount = parseInt(countResult.rows[0].count)

    // Auto-hide if 5+ reports
    if (reportCount >= 5) {
      await query(
        `UPDATE videos SET is_published = FALSE WHERE id = $1`,
        [videoId]
      )
    }

    res.json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        reportCount
      }
    })
  } catch (error) {
    console.error('Report failed:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    })
  }
})

module.exports = router
