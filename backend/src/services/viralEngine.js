/**
 * Viral Engagement Engine
 * Simulates organic growth of views, likes, and comments
 */

const { query } = require('../config/database')

class ViralEngine {
  constructor() {
    this.isRunning = false
    this.interval = null
  }

  /**
   * Calculate engagement growth rate based on current metrics
   * Videos with more engagement grow faster (viral effect)
   */
  calculateGrowthRate(video) {
    const baseViewRate = 5 // Base views per tick
    const baseLikeRate = 1 // Base likes per tick
    const baseCommentRate = 0.2 // Base comments per tick

    // Viral multiplier based on existing engagement
    const viralMultiplier = 1 + (video.viral_score || 0) / 100

    // Time-based multiplier (newer videos grow faster)
    const ageInHours = (Date.now() - new Date(video.created_at).getTime()) / (1000 * 60 * 60)
    const freshnessMultiplier = Math.max(0.5, 2 - (ageInHours / 24)) // Peaks in first 24h

    // Engagement ratio (likes/views) affects growth
    const engagementRatio = video.likes_count / Math.max(1, video.views_count)
    const qualityMultiplier = 1 + (engagementRatio * 10)

    return {
      views: Math.round(baseViewRate * viralMultiplier * freshnessMultiplier),
      likes: Math.round(baseLikeRate * viralMultiplier * qualityMultiplier),
      comments: Math.random() < (baseCommentRate * viralMultiplier) ? 1 : 0
    }
  }

  /**
   * Update viral score based on engagement metrics
   */
  calculateViralScore(views, likes, comments) {
    // Viral score = weighted sum of engagement
    return (views * 0.1) + (likes * 2) + (comments * 5)
  }

  /**
   * Process engagement growth for all active videos
   */
  async processEngagementGrowth() {
    try {
      // Get all videos from last 7 days (active growth window)
      const result = await query(
        `SELECT id, views_count, likes_count, comments_count, viral_score, created_at
         FROM videos
         WHERE created_at > NOW() - INTERVAL '7 days'
         ORDER BY created_at DESC`
      )

      for (const video of result.rows) {
        const growth = this.calculateGrowthRate(video)

        // Update video metrics
        const newViews = video.views_count + growth.views
        const newLikes = video.likes_count + growth.likes
        const newComments = video.comments_count + growth.comments

        // Calculate new viral score
        const newViralScore = this.calculateViralScore(newViews, newLikes, newComments)

        await query(
          `UPDATE videos
           SET views_count = $1,
               likes_count = $2,
               comments_count = $3,
               viral_score = $4
           WHERE id = $5`,
          [newViews, newLikes, newComments, newViralScore, video.id]
        )
      }

      console.log(`✅ Processed engagement growth for ${result.rows.length} videos`)
    } catch (error) {
      console.error('❌ Viral engine error:', error)
    }
  }

  /**
   * Start the viral engine (runs every 5 seconds)
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Viral engine already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Viral Engine started - Processing engagement every 5 seconds')

    // Run immediately
    this.processEngagementGrowth()

    // Then run every 5 seconds
    this.interval = setInterval(() => {
      this.processEngagementGrowth()
    }, 5000) // 5 seconds
  }

  /**
   * Stop the viral engine
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isRunning = false
    console.log('🛑 Viral Engine stopped')
  }
}

// Export singleton instance
module.exports = new ViralEngine()
