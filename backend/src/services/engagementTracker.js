const { query } = require('../config/database')
const logger = require('../utils/logger')

class EngagementTracker {
  constructor() {
    this.interval = null
    this.trackingIntervalMs = 60000 // 1 minute
  }

  // Start tracking engagement for all videos
  start() {
    if (this.interval) {
      logger.info('⚠️  Engagement tracker already running')
      return
    }

    logger.info('📊 Starting engagement tracker (1 minute intervals)')

    // Record immediately on start
    this.recordAllEngagement()

    // Then record every minute
    this.interval = setInterval(() => {
      this.recordAllEngagement()
    }, this.trackingIntervalMs)
  }

  // Stop tracking
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      logger.info('📊 Engagement tracker stopped')
    }
  }

  // Record current engagement for all videos
  async recordAllEngagement() {
    try {
      const result = await query(`
        INSERT INTO video_engagement_history (video_id, views_count, likes_count, comments_count, recorded_at)
        SELECT
          id,
          views_count,
          likes_count,
          comments_count,
          DATE_TRUNC('minute', NOW()) -- Round to nearest minute
        FROM videos
        WHERE is_published = true
        ON CONFLICT (video_id, recorded_at) DO UPDATE
        SET
          views_count = EXCLUDED.views_count,
          likes_count = EXCLUDED.likes_count,
          comments_count = EXCLUDED.comments_count
      `)

      logger.info(`📊 Recorded engagement for ${result.rowCount} videos`)
    } catch (error) {
      logger.error('Engagement tracking error:', error)
    }
  }

  // Get engagement history for a specific video
  async getVideoEngagementHistory(videoId, minutesBack = 60) {
    try {
      const result = await query(`
        SELECT
          recorded_at,
          views_count,
          likes_count,
          comments_count
        FROM video_engagement_history
        WHERE video_id = $1
          AND recorded_at >= NOW() - INTERVAL '${minutesBack} minutes'
        ORDER BY recorded_at ASC
      `, [videoId])

      return result.rows
    } catch (error) {
      logger.error('Get engagement history error:', error)
      throw error
    }
  }

  // Get last N data points for a video
  async getVideoEngagementLastN(videoId, limit = 12) {
    try {
      const result = await query(`
        SELECT
          recorded_at,
          views_count,
          likes_count,
          comments_count
        FROM video_engagement_history
        WHERE video_id = $1
        ORDER BY recorded_at DESC
        LIMIT $2
      `, [videoId, limit])

      // Reverse to get chronological order
      return result.rows.reverse()
    } catch (error) {
      logger.error('Get engagement history error:', error)
      throw error
    }
  }
}

// Singleton instance
const engagementTracker = new EngagementTracker()

module.exports = engagementTracker
