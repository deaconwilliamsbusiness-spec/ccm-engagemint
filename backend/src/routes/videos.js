const express = require('express')
const router = express.Router()
const upload = require('../config/upload')
const { authenticate, optionalAuth } = require('../middleware/auth')
const {
  uploadVideo,
  getAllVideos,
  getCreatorVideos,
  getVideo,
  likeVideo,
  deleteVideo,
  getMyVideos
} = require('../controllers/videoController')

// Public routes
router.get('/', optionalAuth, getAllVideos)
router.get('/:id', optionalAuth, getVideo)
router.get('/creator/:creatorId', optionalAuth, getCreatorVideos)

// Protected routes (require authentication)
router.post(
  '/upload',
  authenticate,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  uploadVideo
)

router.get('/me/videos', authenticate, getMyVideos)
router.post('/:id/like', authenticate, likeVideo)
router.delete('/:id', authenticate, deleteVideo)

module.exports = router
