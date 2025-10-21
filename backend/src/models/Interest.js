const { query } = require('../config/database')

class Interest {
  // Get all interests
  static async getAll() {
    try {
      const result = await query(
        `SELECT id, name, display_name, icon, description
         FROM interests
         WHERE is_active = true
         ORDER BY display_name ASC`
      )

      return result.rows
    } catch (error) {
      throw error
    }
  }

  // Get user's interests
  static async getUserInterests(userId) {
    try {
      const result = await query(
        `SELECT i.id, i.name, i.display_name, i.icon, i.description, ui.weight
         FROM interests i
         INNER JOIN user_interests ui ON i.id = ui.interest_id
         WHERE ui.user_id = $1
         ORDER BY ui.weight DESC, i.display_name ASC`,
        [userId]
      )

      return result.rows
    } catch (error) {
      throw error
    }
  }

  // Set user interests (for onboarding)
  static async setUserInterests(userId, interestIds) {
    try {
      // Clear existing interests
      await query('DELETE FROM user_interests WHERE user_id = $1', [userId])

      // Insert new interests
      if (interestIds && interestIds.length > 0) {
        const values = interestIds.map((interestId, index) => {
          const offset = index * 2
          return `($${offset + 1}, $${offset + 2}, 1.0)`
        }).join(', ')

        const params = interestIds.flatMap(interestId => [userId, interestId])

        await query(
          `INSERT INTO user_interests (user_id, interest_id, weight)
           VALUES ${values}`,
          params
        )
      }

      return { success: true }
    } catch (error) {
      throw error
    }
  }

  // Update interest weight (for personalization)
  static async updateInterestWeight(userId, interestId, weight) {
    try {
      const result = await query(
        `INSERT INTO user_interests (user_id, interest_id, weight)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, interest_id)
         DO UPDATE SET weight = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, interestId, weight]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get interest by name
  static async getByName(name) {
    try {
      const result = await query(
        'SELECT * FROM interests WHERE name = $1',
        [name]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }
}

module.exports = Interest
