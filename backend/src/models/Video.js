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

  // NEW MINTS FEED: Chronological, newest first, paginated
  static async getNewMints(limit = 20, offset = 0) {
    try {
      const result = await query(
        `SELECT v.*,
                u.username, u.profile_image_url as creator_profile_image,
                t.token_symbol as creator_token,
                v.viral_score
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

  // DISCOVER FEED: 70% recent, 30% viral (if viral posts exist)
  static async getDiscoverFeed(limit = 20, offset = 0) {
    try {
      // Check if viral posts exist (viral_score > 100)
      const viralCheck = await query(
        `SELECT COUNT(*) as count FROM videos
         WHERE is_published = true AND viral_score > 100
         AND created_at > NOW() - INTERVAL '24 hours'`
      )

      const hasViralPosts = parseInt(viralCheck.rows[0].count) > 0

      if (!hasViralPosts) {
        // No viral posts yet, return all chronologically
        return await this.getNewMints(limit, offset)
      }

      // Calculate split: 70% recent, 30% viral
      const recentCount = Math.ceil(limit * 0.7)
      const viralCount = limit - recentCount

      // Get recent posts (last 24 hours, not viral yet)
      const recentPosts = await query(
        `SELECT v.*,
                u.username, u.profile_image_url as creator_profile_image,
                t.token_symbol as creator_token,
                v.viral_score,
                RANDOM() as random_order
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.creator_id = u.id
         WHERE v.is_published = true
         AND v.created_at > NOW() - INTERVAL '24 hours'
         AND v.viral_score <= 100
         ORDER BY v.created_at DESC
         LIMIT $1`,
        [recentCount]
      )

      // Get viral posts (viral_score > 100, last 24 hours)
      const viralPosts = await query(
        `SELECT v.*,
                u.username, u.profile_image_url as creator_profile_image,
                t.token_symbol as creator_token,
                v.viral_score,
                RANDOM() as random_order
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.creator_id = u.id
         WHERE v.is_published = true
         AND v.viral_score > 100
         AND v.created_at > NOW() - INTERVAL '24 hours'
         ORDER BY v.viral_score DESC
         LIMIT $1`,
        [viralCount]
      )

      // Combine and scatter randomly
      const combined = [...recentPosts.rows, ...viralPosts.rows]

      // Shuffle array for random scattering
      for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]]
      }

      return combined
    } catch (error) {
      throw error
    }
  }

  // Update viral score for a video
  static async updateViralScore(videoId) {
    try {
      await query(
        `UPDATE videos
         SET viral_score = (likes_count * 10 + views_count)
         WHERE id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
        [videoId]
      )
    } catch (error) {
      throw error
    }
  }
}

module.exports = Video
