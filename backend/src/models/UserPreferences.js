const { query } = require('../config/database')

class UserPreferences {
  // Get user preferences
  static async getPreferences(userId) {
    try {
      const result = await query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      )

      // If no preferences exist, create default ones
      if (result.rows.length === 0) {
        return await this.createDefaultPreferences(userId)
      }

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Create default preferences
  static async createDefaultPreferences(userId) {
    try {
      const result = await query(
        `INSERT INTO user_preferences (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Update preferences
  static async updatePreferences(userId, preferences) {
    try {
      const fields = []
      const values = []
      let paramCount = 1

      // Build dynamic update query
      Object.keys(preferences).forEach(key => {
        if (preferences[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`)
          values.push(preferences[key])
          paramCount++
        }
      })

      if (fields.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(userId)
      const updateQuery = `
        UPDATE user_preferences
        SET ${fields.join(', ')}
        WHERE user_id = $${paramCount}
        RETURNING *
      `

      const result = await query(updateQuery, values)

      // If no rows affected, create new preferences
      if (result.rows.length === 0) {
        return await this.createDefaultPreferences(userId)
      }

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Mark onboarding as completed
  static async completeOnboarding(userId) {
    try {
      const result = await query(
        `INSERT INTO user_preferences (user_id, onboarding_completed)
         VALUES ($1, true)
         ON CONFLICT (user_id)
         DO UPDATE SET onboarding_completed = true, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Check if onboarding is completed
  static async isOnboardingCompleted(userId) {
    try {
      const result = await query(
        'SELECT onboarding_completed FROM user_preferences WHERE user_id = $1',
        [userId]
      )

      if (result.rows.length === 0) {
        return false
      }

      return result.rows[0].onboarding_completed
    } catch (error) {
      throw error
    }
  }
}

module.exports = UserPreferences
