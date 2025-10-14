const express = require('express')
const router = express.Router()
const { signup, login, logout, getProfile } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')
const User = require('../models/UserMemory')

// Public routes
router.post('/signup', signup)
router.post('/login', login)

// Protected routes (require authentication)
router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, getProfile)

// Update followers count (for testing/demo purposes)
router.post('/update-followers', authenticate, async (req, res) => {
  try {
    const { count } = req.body

    if (typeof count !== 'number' || count < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid followers count'
      })
    }

    await User.updateFollowersCount(req.user.id, count)
    const user = await User.findById(req.user.id)

    res.json({
      success: true,
      data: {
        followers_count: user.followers_count,
        message: 'Followers count updated'
      }
    })
  } catch (error) {
    console.error('Update followers error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update followers count'
    })
  }
})

module.exports = router
