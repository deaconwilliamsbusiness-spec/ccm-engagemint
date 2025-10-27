const express = require('express')
const router = express.Router()
const { signup, login, logout, getProfile } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')
const { validateRegistration, validateLogin } = require('../middleware/validation')
const User = require('../models/User')

// Public routes
router.post('/signup', validateRegistration, signup)
router.post('/login', validateLogin, login)

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

// Update creator settings (bio, giveback percentage)
router.put('/settings', authenticate, async (req, res) => {
  try {
    const { bio, giveback_percentage } = req.body

    // Validate giveback_percentage if provided
    if (giveback_percentage !== undefined) {
      if (typeof giveback_percentage !== 'number' || giveback_percentage < 0 || giveback_percentage > 50) {
        return res.status(400).json({
          success: false,
          message: 'Invalid giveback percentage. Must be between 0 and 50.'
        })
      }
    }

    // Validate bio length if provided
    if (bio !== undefined && bio.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Bio must be 200 characters or less'
      })
    }

    await User.updateSettings(req.user.id, { bio, giveback_percentage })
    const user = await User.findById(req.user.id)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          bio: user.bio,
          giveback_percentage: user.giveback_percentage,
          total_earnings: user.total_earnings
        },
        message: 'Settings updated successfully'
      }
    })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    })
  }
})

module.exports = router
