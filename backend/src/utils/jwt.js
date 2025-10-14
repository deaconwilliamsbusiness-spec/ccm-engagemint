const jwt = require('jsonwebtoken')
const { query } = require('../config/database')

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'

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

// Create session in database
const createSession = async (userId, token) => {
  try {
    // Calculate expiry date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    )
  } catch (error) {
    throw error
  }
}

// Validate session from database
const validateSession = async (token) => {
  try {
    const result = await query(
      `SELECT s.*, u.id as user_id, u.username, u.email, u.is_active
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    )

    return result.rows[0]
  } catch (error) {
    throw error
  }
}

// Delete session (logout)
const deleteSession = async (token) => {
  try {
    await query('DELETE FROM sessions WHERE token = $1', [token])
  } catch (error) {
    throw error
  }
}

// Clean up expired sessions
const cleanupExpiredSessions = async () => {
  try {
    await query('DELETE FROM sessions WHERE expires_at < NOW()')
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
  }
}

module.exports = {
  generateToken,
  verifyToken,
  createSession,
  validateSession,
  deleteSession,
  cleanupExpiredSessions
}
