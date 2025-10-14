// Use memory-based storage (no database required for testing)
const { verifyToken, validateSession } = require('../utils/jwtMemory')

// Middleware to verify authentication
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = verifyToken(token)

    // Validate session in database
    const session = await validateSession(token)

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      })
    }

    if (!session.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      })
    }

    // Attach user info to request
    req.user = {
      id: session.user_id,
      username: session.username,
      email: session.email
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    })
  }
}

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      const session = await validateSession(token)

      if (session && session.is_active) {
        req.user = {
          id: session.user_id,
          username: session.username,
          email: session.email
        }
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

module.exports = {
  authenticate,
  optionalAuth
}
