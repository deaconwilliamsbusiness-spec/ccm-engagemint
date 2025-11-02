const { query } = require('../config/database')

class Video {
  // Create a new video
  static async create({
    creatorId,
    title,
    description,
    videoUrl,
    thumbnailUrl,
    duration,
    category,
    communityId,
    // Solana dual-path fields
    uploadPath,
    tokenMintAddress,
    bondingCurveAddress,
    isTokenLaunched,
    launchSignature,
    launchedBy,
    launchTimestamp,
    solPaidByUser
  }) {
    try {
      const result = await query(
        `INSERT INTO videos (
          creator_id, title, description, video_url, thumbnail_url, duration, category, community_id, is_published,
          upload_path, token_mint_address, bonding_curve_address, is_token_launched,
          launch_signature, launched_by, launch_timestamp, sol_paid_by_user
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          creatorId, title, description, videoUrl, thumbnailUrl, duration, category, communityId || null,
          uploadPath || 'viral', tokenMintAddress, bondingCurveAddress, isTokenLaunched || false,
          launchSignature, launchedBy, launchTimestamp, solPaidByUser
        ]
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
                t.token_symbol as creator_token,
                c.id as community_id,
                c.name as community_name,
                c.description as community_description,
                c.logo_url as community_logo,
                c.members_count as community_members,
                c.minimum_tokens as community_minimum_tokens
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.creator_id = u.id
         LEFT JOIN communities c ON v.community_id = c.id
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
                t.token_symbol as creator_token,
                c.id as community_id,
                c.name as community_name,
                c.description as community_description,
                c.logo_url as community_logo,
                c.members_count as community_members,
                c.minimum_tokens as community_minimum_tokens
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.creator_id = u.id
         LEFT JOIN communities c ON v.community_id = c.id
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
                t.token_symbol as creator_token,
                c.id as community_id,
                c.name as community_name,
                c.description as community_description,
                c.logo_url as community_logo,
                c.members_count as community_members,
                c.minimum_tokens as community_minimum_tokens
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.creator_id = u.id
         LEFT JOIN communities c ON v.community_id = c.id
         WHERE v.id = $1`,
        [videoId]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Track video view with duration (1 view = full watch, max 10 per user)
  static async incrementViews(videoId, userId = null, watchDuration = 0, videoDuration = 0) {
    try {
      // Get video info if duration not provided
      if (!videoDuration) {
        const videoResult = await query(
          'SELECT duration FROM videos WHERE id = $1',
          [videoId]
        )
        if (videoResult.rows.length === 0) {
          throw new Error('Video not found')
        }
        videoDuration = videoResult.rows[0].duration || 0
      }

      // Check if user has reached view limit (10 views max)
      if (userId) {
        const canViewResult = await query(
          'SELECT can_user_view($1, $2) as can_view',
          [videoId, userId]
        )

        if (!canViewResult.rows[0].can_view) {
          return {
            success: false,
            message: 'Maximum views reached (10 views per video)',
            remaining: 0
          }
        }
      }

      // Record view event (completed if watched >= 1 second)
      const completed = watchDuration >= 1 // Just need 1 second!
      await query(
        `INSERT INTO video_view_events (video_id, user_id, watch_duration, video_duration, completed)
         VALUES ($1, $2, $3, $4, $5)`,
        [videoId, userId, watchDuration, videoDuration, completed]
      )

      // The trigger will auto-update videos.views_count
      // Get updated counts
      const result = await query(
        'SELECT views_count FROM videos WHERE id = $1',
        [videoId]
      )

      // Get remaining views for this user
      let remaining = 10
      if (userId) {
        const remainingResult = await query(
          'SELECT get_remaining_views($1, $2) as remaining',
          [videoId, userId]
        )
        remaining = remainingResult.rows[0].remaining
      }

      return {
        success: true,
        views_count: result.rows[0].views_count,
        remaining,
        completed
      }
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
                v.viral_score,
                c.id as community_id,
                c.name as community_name,
                c.description as community_description,
                c.logo_url as community_logo,
                c.members_count as community_members,
                c.minimum_tokens as community_minimum_tokens
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.token_symbol = v.category
         LEFT JOIN communities c ON v.community_id = c.id
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

  // DISCOVER FEED: All minted videos with smart ranking
  // ✅ UPDATED: Shows ALL newly minted videos + viral content mixed together
  static async getDiscoverFeed(limit = 20, offset = 0) {
    try {
      // Get all videos, prioritizing viral content but including everything
      const result = await query(
        `SELECT v.*,
                u.username, u.profile_image_url as creator_profile_image,
                t.token_symbol as creator_token,
                v.viral_score,
                c.id as community_id,
                c.name as community_name,
                c.description as community_description,
                c.logo_url as community_logo,
                c.members_count as community_members,
                c.minimum_tokens as community_minimum_tokens
         FROM videos v
         JOIN users u ON v.creator_id = u.id
         LEFT JOIN tokens t ON t.token_symbol = v.category
         LEFT JOIN communities c ON v.community_id = c.id
         WHERE v.is_published = true
         ORDER BY
           -- Prioritize viral content (score > 100) but include all
           CASE WHEN v.viral_score > 100 THEN v.viral_score ELSE 0 END DESC,
           -- Then by recency
           v.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      )

      return result.rows
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
