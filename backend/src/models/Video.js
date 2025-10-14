const { query } = require('../config/database')

class Video {
  // Create a new video
  static async create({ creatorId, title, description, videoUrl, thumbnailUrl, duration, category }) {
    try {
      const result = await query(
        `INSERT INTO videos (creator_id, title, description, video_url, thumbnail_url, duration, category, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [creatorId, title, description, videoUrl, thumbnailUrl, duration, category]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get all videos (for feed)
  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT v.*,
                u.username, u.profile_image_url as creator_profile_image,
                t.token_symbol as creator_token
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.creator_id = u.id
         WHERE v.is_published = true
         ORDER BY v.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      )

      return result.rows
    } catch (error) {
      throw error
    }
  }

  // Get videos by creator
  static async getByCreator(creatorId, limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT v.*,
                u.username, u.profile_image_url as creator_profile_image,
                t.token_symbol as creator_token
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.creator_id = u.id
         WHERE v.creator_id = $1 AND v.is_published = true
         ORDER BY v.created_at DESC
         LIMIT $2 OFFSET $3`,
        [creatorId, limit, offset]
      )

      return result.rows
    } catch (error) {
      throw error
    }
  }

  // Get video by ID
  static async getById(videoId) {
    try {
      const result = await query(
        `SELECT v.*,
                u.username, u.profile_image_url as creator_profile_image,
                t.token_symbol as creator_token
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.creator_id = u.id
         WHERE v.id = $1`,
        [videoId]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Increment view count
  static async incrementViews(videoId) {
    try {
      await query(
        'UPDATE videos SET views_count = views_count + 1 WHERE id = $1',
        [videoId]
      )
    } catch (error) {
      throw error
    }
  }

  // Like a video
  static async like(videoId, userId) {
    try {
      // Check if already liked
      const existingLike = await query(
        'SELECT id FROM video_likes WHERE video_id = $1 AND user_id = $2',
        [videoId, userId]
      )

      if (existingLike.rows.length > 0) {
        // Unlike
        await query(
          'DELETE FROM video_likes WHERE video_id = $1 AND user_id = $2',
          [videoId, userId]
        )
        await query(
          'UPDATE videos SET likes_count = likes_count - 1 WHERE id = $1',
          [videoId]
        )
        return { liked: false }
      } else {
        // Like
        await query(
          'INSERT INTO video_likes (video_id, user_id) VALUES ($1, $2)',
          [videoId, userId]
        )
        await query(
          'UPDATE videos SET likes_count = likes_count + 1 WHERE id = $1',
          [videoId]
        )
        return { liked: true }
      }
    } catch (error) {
      throw error
    }
  }

  // Check if user has liked a video
  static async isLikedByUser(videoId, userId) {
    try {
      const result = await query(
        'SELECT EXISTS(SELECT 1 FROM video_likes WHERE video_id = $1 AND user_id = $2)',
        [videoId, userId]
      )
      return result.rows[0].exists
    } catch (error) {
      throw error
    }
  }

  // Delete video
  static async delete(videoId, userId) {
    try {
      const result = await query(
        'DELETE FROM videos WHERE id = $1 AND creator_id = $2 RETURNING *',
        [videoId, userId]
      )
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Update video
  static async update(videoId, userId, updateData) {
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

      values.push(videoId, userId)
      const updateQuery = `
        UPDATE videos
        SET ${fields.join(', ')}
        WHERE id = $${paramCount} AND creator_id = $${paramCount + 1}
        RETURNING *
      `

      const result = await query(updateQuery, values)
      return result.rows[0]
    } catch (error) {
      throw error
    }
  }
}

module.exports = Video
