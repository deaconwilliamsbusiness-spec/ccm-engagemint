const { query } = require('../config/database')

class Community {
  // Create a new community
  static async create({ creatorId, tokenId, name, description, minimumTokens }) {
    try {
      const result = await query(
        `INSERT INTO communities (creator_id, token_id, name, description, minimum_tokens, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING *`,
        [creatorId, tokenId, name, description, minimumTokens]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get community by ID
  static async getById(communityId) {
    try {
      const result = await query(
        `SELECT c.*,
                u.username as creator_username,
                t.token_symbol, t.token_name
         FROM communities c
         JOIN users u ON c.creator_id = u.id
         LEFT JOIN tokens t ON c.token_id = t.id
         WHERE c.id = $1`,
        [communityId]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get community by token ID
  static async getByTokenId(tokenId) {
    try {
      const result = await query(
        `SELECT c.*,
                u.username as creator_username,
                t.token_symbol, t.token_name
         FROM communities c
         JOIN users u ON c.creator_id = u.id
         JOIN tokens t ON c.token_id = t.id
         WHERE c.token_id = $1 AND c.is_active = true`,
        [tokenId]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get all communities by creator
  static async getByCreator(creatorId, limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT c.*,
                u.username as creator_username,
                t.token_symbol, t.token_name
         FROM communities c
         JOIN users u ON c.creator_id = u.id
         LEFT JOIN tokens t ON c.token_id = t.id
         WHERE c.creator_id = $1 AND c.is_active = true
         ORDER BY c.created_at DESC
         LIMIT $2 OFFSET $3`,
        [creatorId, limit, offset]
      )

      return result.rows
    } catch (error) {
      throw error
    }
  }

  // Get all active communities
  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT c.*,
                u.username as creator_username,
                t.token_symbol, t.token_name
         FROM communities c
         JOIN users u ON c.creator_id = u.id
         LEFT JOIN tokens t ON c.token_id = t.id
         WHERE c.is_active = true
         ORDER BY c.members_count DESC, c.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      )

      return result.rows
    } catch (error) {
      throw error
    }
  }

  // Update members count
  static async updateMembersCount(communityId) {
    try {
      await query(
        `UPDATE communities
         SET members_count = (
           SELECT COUNT(*) FROM community_members
           WHERE community_id = $1 AND is_active = true
         )
         WHERE id = $1`,
        [communityId]
      )
    } catch (error) {
      throw error
    }
  }

  // Delete community (soft delete)
  static async delete(communityId, creatorId) {
    try {
      const result = await query(
        'UPDATE communities SET is_active = false WHERE id = $1 AND creator_id = $2 RETURNING *',
        [communityId, creatorId]
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }
}

module.exports = Community
