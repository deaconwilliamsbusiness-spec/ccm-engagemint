const express = require('express')
const router = express.Router()
const { signup, login, logout, getProfile } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

// Public routes
router.post('/signup', signup)
router.post('/login', login)

// Protected routes (require authentication)
router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, getProfile)

module.exports = router
