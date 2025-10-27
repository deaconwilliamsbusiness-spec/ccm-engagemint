const express = require('express')
const router = express.Router()
const { authenticate, optionalAuth } = require('../middleware/auth')
const { validateComment } = require('../middleware/validation')
const Comment = require('../models/Comment')

// Get comments for a video
router.get('/videos/:videoId/comments', optionalAuth, async (req, res) => {
  try {
    const comments = await Comment.findByVideoId(req.params.videoId)

    res.json({
      success: true,
      data: { comments }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load comments'
    })
  }
})

// Post a comment
router.post('/videos/:videoId/comments', authenticate, validateComment, async (req, res) => {
  try {
    const { content } = req.body

    const comment = await Comment.create({
      videoId: req.params.videoId,
      userId: req.user.id,
      content: content.trim()
    })

    res.status(201).json({
      success: true,
      data: { comment }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to post comment'
    })
  }
})

// Delete a comment
router.delete('/comments/:commentId', authenticate, async (req, res) => {
  try {
    const deletedComment = await Comment.delete(req.params.commentId, req.user.id)

    if (!deletedComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or unauthorized'
      })
    }

    res.json({
      success: true,
      message: 'Comment deleted'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    })
  }
})

module.exports = router
