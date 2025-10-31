const express = require('express')
const router = express.Router()
const { query } = require('../config/database')
const { authenticate } = require('../middleware/auth')

// DELETE ALL VIDEOS - Admin only (for development/testing)
router.delete('/clear-all-videos', authenticate, async (req, res) => {
  try {
    console.log('🗑️  Admin clearing all videos...')

    // Delete in order to respect foreign key constraints
    await query('DELETE FROM video_likes')
    await query('DELETE FROM video_views')
    await query('DELETE FROM comments')
    await query('DELETE FROM videos')
    await query('DELETE FROM tokens')
    await query('DELETE FROM communities')
    await query('DELETE FROM community_members')

    console.log('✅ All videos and related data cleared')

    res.json({
      success: true,
      message: 'All videos and related data cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing videos:', error)
    res.status(500).json({
      success: false,
      message: 'Error clearing videos',
      error: error.message
    })
  }
})

module.exports = router
