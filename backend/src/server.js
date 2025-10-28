const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const rateLimit = require('express-rate-limit')
const http = require('http')
const { Server } = require('socket.io')
const logger = require('./utils/logger')

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// Trust Railway proxy for rate limiting
app.set('trust proxy', 1)

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://localhost:3007',
      'http://localhost:3008',
      'https://frontend-5h2yaviwd-deac4236-8073s-projects.vercel.app',
      'https://frontend-1gwkbufun-deac4236-8073s-projects.vercel.app',
      'https://frontend-mocj73nhz-deac4236-8073s-projects.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Make io accessible to route handlers
app.set('io', io)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // Limit each IP to 100000 requests per windowMs (very high limit for development/testing)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit auth endpoints to 10 requests per 15 minutes (increased from 5)
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
})

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit uploads to 10 per hour per IP
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

const commentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit comments to 100 per minute per IP (increased for development)
  message: 'Too many comments, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://localhost:3008',
    'https://frontend-5h2yaviwd-deac4236-8073s-projects.vercel.app',
    'https://frontend-1gwkbufun-deac4236-8073s-projects.vercel.app',
    'https://frontend-mocj73nhz-deac4236-8073s-projects.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(limiter) // Apply rate limiting to all requests

// Serve static files (uploaded videos and thumbnails)
const uploadsPath = path.resolve(__dirname, '..', 'uploads')
app.use('/uploads', express.static(uploadsPath))
logger.info('📁 Serving uploads from:', uploadsPath)

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CCM ENGAGEMINT API is running' })
})

// Import routes
const authRoutes = require('./routes/auth')
const videoRoutes = require('./routes/videos')
const commentRoutes = require('./routes/comments')
const followRoutes = require('./routes/follow')
const interestRoutes = require('./routes/interests')

// Apply rate limiters to specific routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api', commentLimiter, commentRoutes)
app.use('/api/social', followRoutes)
app.use('/api', interestRoutes)

// Export limiters for use in individual route files
app.set('uploadLimiter', uploadLimiter)

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack)
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

// Socket.io event handlers
io.on('connection', (socket) => {
  logger.info(`✅ Client connected: ${socket.id}`)

  socket.on('disconnect', () => {
    logger.info(`❌ Client disconnected: ${socket.id}`)
  })
})

// Start server
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server is running on port ${PORT}`)
  logger.info(`📡 API endpoint: http://localhost:${PORT}/api`)
  logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  logger.info(`⚡ Socket.io enabled`)
  logger.info(`📊 Real-time engagement tracking enabled`)
})

module.exports = { app, io }
