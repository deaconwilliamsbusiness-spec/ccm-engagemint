const { query } = require('../config/database')
const bcrypt = require('bcrypt')

class User {
  // Create a new user
  static async create({ username, email, password }) {
    try {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10
      const passwordHash = await bcrypt.hash(password, saltRounds)

      const result = await query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, created_at, is_verified, is_active`,
        [username, email, passwordHash]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await query(
        `SELECT id, username, email, display_name, bio, profile_image_url,
                wallet_address, created_at, is_verified, is_active, is_admin
         FROM users WHERE id = $1`,
        [id]
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
      throw error
    }
  }

  // Update user profile
  static async update(id, updateData) {
    try {
      const fields = []
      const values = []
      let paramCount = 1

      // Build dynamic update query
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`)
          values.push(updateData[key])
          paramCount++
        }
      })

      if (fields.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(id)
      const updateQuery = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, username, email, display_name, bio, profile_image_url,
                  wallet_address, updated_at, is_verified, is_active
      `

      const result = await query(updateQuery, values)
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Delete user
  static async delete(id) {
    try {
      await query('DELETE FROM users WHERE id = $1', [id])
      return { success: true }
    } catch (error) {
      throw error
    }
  }

  // Check if email exists
  static async emailExists(email) {
    try {
      const result = await query(
        'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
        [email]
      )
      return result.rows[0].exists
    } catch (error) {
      throw error
    }
  }

  // Check if username exists
  static async usernameExists(username) {
    try {
      const result = await query(
        'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)',
        [username]
      )
      return result.rows[0].exists
    } catch (error) {
      throw error
    }
  }
}

module.exports = User
