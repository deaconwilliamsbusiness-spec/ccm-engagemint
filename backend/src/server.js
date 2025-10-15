const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const rateLimit = require('express-rate-limit')

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth endpoints to 5 requests per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
})

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(limiter) // Apply rate limiting to all requests

// Serve static files (uploaded videos and thumbnails)
const uploadsPath = path.resolve(__dirname, '..', 'uploads')
app.use('/uploads', express.static(uploadsPath))
console.log('📁 Serving uploads from:', uploadsPath)

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CCM ENGAGEMINT API is running' })
})

// Import routes
const authRoutes = require('./routes/auth')
const videoRoutes = require('./routes/videos')
const commentRoutes = require('./routes/comments')

app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api', commentRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})

module.exports = app
