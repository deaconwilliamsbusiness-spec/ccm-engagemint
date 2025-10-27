const { query } = require('../config/database')

class Comment {
  // Create a new comment
  static async create({ videoId, userId, content }) {
    try {
      const result = await query(
        `INSERT INTO video_comments (video_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, video_id, user_id, content, likes_count, created_at, updated_at`,
        [videoId, userId, content]
      )

      // Fetch with user details
      const commentWithUser = await query(
        `SELECT c.*, u.username, u.profile_image_url
         FROM video_comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = $1`,
        [result.rows[0].id]
      )

      return commentWithUser.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get all comments for a video
  static async findByVideoId(videoId) {
    try {
      const result = await query(
        `SELECT c.*, u.username, u.profile_image_url
         FROM video_comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.video_id = $1
         ORDER BY c.created_at DESC`,
        [videoId]
      )
      return result.rows
    } catch (error) {
      throw error
    }
  }

  // Get comment by ID
  static async findById(commentId) {
    try {
      const result = await query(
        `SELECT c.*, u.username, u.profile_image_url
         FROM video_comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = $1`,
        [commentId]
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Delete a comment
  static async delete(commentId, userId) {
    try {
      const result = await query(
        `DELETE FROM video_comments
         WHERE id = $1 AND (user_id = $2 OR $2 IN (SELECT id FROM users WHERE is_admin = true))
         RETURNING id, video_id`,
        [commentId, userId]
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get comment count for a video
  static async getCountByVideoId(videoId) {
    try {
      const result = await query(
        `SELECT COUNT(*) as count FROM video_comments WHERE video_id = $1`,
        [videoId]
      )
      return parseInt(result.rows[0].count)
    } catch (error) {
      throw error
    }
  }

  // Update comment likes count
  static async updateLikesCount(commentId, increment = true) {
    try {
      const operation = increment ? '+' : '-'
      const result = await query(
        `UPDATE video_comments
         SET likes_count = likes_count ${operation} 1
         WHERE id = $1
         RETURNING id, likes_count`,
        [commentId]
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get recent comments by user
  static async findByUserId(userId, limit = 20) {
    try {
      const result = await query(
        `SELECT c.*, v.title as video_title
         FROM video_comments c
         LEFT JOIN videos v ON c.video_id = v.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC
         LIMIT $2`,
        [userId, limit]
      )
      return result.rows
    } catch (error) {
      throw error
    }
  }
}

module.exports = Comment
