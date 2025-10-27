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
  getMyVideos
} = require('../controllers/videoController')

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
router.post('/:id/like', optionalAuth, likeVideo)
router.delete('/:id', authenticate, deleteVideo)

module.exports = router
