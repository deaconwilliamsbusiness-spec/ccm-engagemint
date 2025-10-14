const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'

// In-memory session storage
let sessions = []

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  )
}

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Create session in memory
const createSession = async (userId, token) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  sessions.push({
    user_id: userId,
    token,
    expires_at: expiresAt,
    is_active: true
  })
}

// Validate session from memory
const validateSession = async (token) => {
  const session = sessions.find(s => s.token === token && new Date(s.expires_at) > new Date())
  if (!session) return null

  return {
    user_id: session.user_id,
    username: 'user',
    email: 'user@example.com',
    is_active: true
  }
}

// Delete session (logout)
const deleteSession = async (token) => {
  sessions = sessions.filter(s => s.token !== token)
}

module.exports = {
  generateToken,
  verifyToken,
  createSession,
  validateSession,
  deleteSession,
  cleanupExpiredSessions: async () => {}
}
