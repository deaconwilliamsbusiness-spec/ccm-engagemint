const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const rateLimit = require('express-rate-limit')
const http = require('http')
const { Server } = require('socket.io')

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
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
  max: 10000, // Limit each IP to 10000 requests per windowMs (high limit for development)
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
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
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
console.log('📁 Serving uploads from:', uploadsPath)

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

app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api', commentRoutes)
app.use('/api/social', followRoutes)
app.use('/api', interestRoutes)

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

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`⚡ Socket.io enabled`)
})

module.exports = { app, io }
