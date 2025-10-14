const express = require('express')
const router = express.Router()
const { authenticate, optionalAuth } = require('../middleware/auth')

// In-memory comments storage
let comments = []
let commentIdCounter = 1

// Get comments for a video
router.get('/videos/:videoId/comments', optionalAuth, async (req, res) => {
  try {
    const videoComments = comments
      .filter(c => c.video_id === req.params.videoId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    res.json({
      success: true,
      data: { comments: videoComments }
    })
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to load comments'
    })
  }
})

// Post a comment
router.post('/videos/:videoId/comments', optionalAuth, async (req, res) => {
  try {
    const { content } = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      })
    }

    // Allow anonymous comments
    const userId = req.user ? req.user.id : `anon-${Math.random().toString(36).substring(7)}`
    const username = req.user ? req.user.username : 'Anonymous'

    const comment = {
      id: String(commentIdCounter++),
      video_id: req.params.videoId,
      user_id: userId,
      username: username,
      content: content.trim(),
      likes_count: 0,
      created_at: new Date().toISOString()
    }

    comments.push(comment)

    // Update video comment count
    const Video = require('../models/VideoMemory')
    const video = await Video.getById(req.params.videoId)
    if (video) {
      video.comments_count = (video.comments_count || 0) + 1
    }

    res.status(201).json({
      success: true,
      data: { comment }
    })
  } catch (error) {
    console.error('Post comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to post comment'
    })
  }
})

// Delete a comment
router.delete('/comments/:commentId', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null
    const commentIndex = comments.findIndex(
      c => c.id === req.params.commentId && (userId ? c.user_id === userId : true)
    )

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or unauthorized'
      })
    }

    const deletedComment = comments.splice(commentIndex, 1)[0]

    // Update video comment count
    const Video = require('../models/VideoMemory')
    const video = await Video.getById(deletedComment.video_id)
    if (video) {
      video.comments_count = Math.max(0, (video.comments_count || 0) - 1)
    }

    res.json({
      success: true,
      message: 'Comment deleted'
    })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    })
  }
})

module.exports = router
