const { query } = require('../config/database')

class Follow {
  // Follow a user
  static async followUser(followerId, followingId) {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself')
      }

      const result = await query(
        `INSERT INTO user_follows (follower_id, following_id)
         VALUES ($1, $2)
         ON CONFLICT (follower_id, following_id) DO NOTHING
         RETURNING id, created_at`,
        [followerId, followingId]
      )

      // Log activity
      if (result.rows.length > 0) {
        await query(
          `INSERT INTO user_activity (user_id, activity_type, target_id, target_type)
           VALUES ($1, 'follow', $2, 'user')`,
          [followerId, followingId]
        )
      }

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Unfollow a user
  static async unfollowUser(followerId, followingId) {
    try {
      const result = await query(
        `DELETE FROM user_follows
         WHERE follower_id = $1 AND following_id = $2
         RETURNING id`,
        [followerId, followingId]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Check if user A follows user B
  static async isFollowing(followerId, followingId) {
    try {
      const result = await query(
        `SELECT is_following($1, $2) as is_following`,
        [followerId, followingId]
      )

      return result.rows[0].is_following
    } catch (error) {
      throw error
    }
  }

  // Get followers of a user
  static async getFollowers(userId, limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT u.id, u.username, u.display_name, u.profile_image_url,
                get_follower_count(u.id) as follower_count,
                get_following_count(u.id) as following_count
         FROM users u
         INNER JOIN user_follows uf ON u.id = uf.follower_id
         WHERE uf.following_id = $1
         ORDER BY uf.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      )

      const countResult = await query(
        `SELECT get_follower_count($1) as total`,
        [userId]
      )

      return {
        followers: result.rows,
        total: countResult.rows[0].total
      }
    } catch (error) {
      throw error
    }
  }

  // Get users that a user is following
  static async getFollowing(userId, limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT u.id, u.username, u.display_name, u.profile_image_url,
                get_follower_count(u.id) as follower_count,
                get_following_count(u.id) as following_count
         FROM users u
         INNER JOIN user_follows uf ON u.id = uf.following_id
         WHERE uf.follower_id = $1
         ORDER BY uf.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      )

      const countResult = await query(
        `SELECT get_following_count($1) as total`,
        [userId]
      )

      return {
        following: result.rows,
        total: countResult.rows[0].total
      }
    } catch (error) {
      throw error
    }
  }

  // Get follower/following counts
  static async getCounts(userId) {
    try {
      const result = await query(
        `SELECT get_follower_count($1) as followers_count,
                get_following_count($1) as following_count`,
        [userId]
      )

      return result.rows[0]
    } catch (error) {
      throw error
    }
  }

  // Get suggested users to follow (users with similar interests or popular users)
  static async getSuggestedUsers(userId, limit = 20) {
    try {
      const result = await query(
        `SELECT DISTINCT u.id, u.username, u.display_name, u.profile_image_url, u.bio,
                get_follower_count(u.id) as follower_count
         FROM users u
         LEFT JOIN user_interests ui ON u.id = ui.user_id
         WHERE u.id != $1
           AND u.is_active = true
           AND NOT EXISTS (
             SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_id = u.id
           )
           AND ui.interest_id IN (
             SELECT interest_id FROM user_interests WHERE user_id = $1
           )
         ORDER BY get_follower_count(u.id) DESC
         LIMIT $2`,
        [userId, limit]
      )

      // If not enough results, get popular users
      if (result.rows.length < limit) {
        const popularResult = await query(
          `SELECT u.id, u.username, u.display_name, u.profile_image_url, u.bio,
                  get_follower_count(u.id) as follower_count
           FROM users u
           WHERE u.id != $1
             AND u.is_active = true
             AND NOT EXISTS (
               SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_id = u.id
             )
           ORDER BY get_follower_count(u.id) DESC
           LIMIT $2`,
          [userId, limit - result.rows.length]
        )

        result.rows.push(...popularResult.rows)
      }

      return result.rows
    } catch (error) {
      throw error
    }
  }
}

module.exports = Follow
