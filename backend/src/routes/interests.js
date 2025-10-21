const express = require('express')
const router = express.Router()
const {
  getAllInterests,
  getUserInterests,
  setUserInterests,
  getUserPreferences,
  updateUserPreferences,
  completeOnboarding
} = require('../controllers/interestController')
const { authenticate, optionalAuth } = require('../middleware/auth')

// Public routes
router.get('/interests', optionalAuth, getAllInterests)

// Protected routes (require authentication)
router.use(authenticate)

// Interest endpoints
router.get('/user/interests', getUserInterests)
router.post('/user/interests', setUserInterests)

// Preferences endpoints
router.get('/user/preferences', getUserPreferences)
router.put('/user/preferences', updateUserPreferences)

// Onboarding
router.post('/user/onboarding/complete', completeOnboarding)

module.exports = router
