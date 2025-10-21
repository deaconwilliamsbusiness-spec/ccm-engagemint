const Follow = require('../models/Follow')

// Follow a user
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    const result = await Follow.followUser(followerId, userId)

    if (!result) {
      return res.status(200).json({
        success: true,
        message: 'Already following this user'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Successfully followed user',
      data: result
    })
  } catch (error) {
    console.error('Follow user error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to follow user'
    })
  }
}

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    await Follow.unfollowUser(followerId, userId)

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user'
    })
  } catch (error) {
    console.error('Unfollow user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user'
    })
  }
}

// Check if following a user
const checkFollowing = async (req, res) => {
  try {
    const followerId = req.user.id
    const { userId } = req.params

    const isFollowing = await Follow.isFollowing(followerId, userId)

    res.status(200).json({
      success: true,
      data: { isFollowing }
    })
  } catch (error) {
    console.error('Check following error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to check following status'
    })
  }
}

// Get user's followers
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const result = await Follow.getFollowers(userId, limit, offset)

    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get followers'
    })
  }
}

// Get users that a user is following
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const result = await Follow.getFollowing(userId, limit, offset)

    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Get following error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get following'
    })
  }
}

// Get follower/following counts
const getCounts = async (req, res) => {
  try {
    const { userId } = req.params

    const counts = await Follow.getCounts(userId)

    res.status(200).json({
      success: true,
      data: counts
    })
  } catch (error) {
    console.error('Get counts error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get counts'
    })
  }
}

// Get suggested users to follow
const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 20

    const users = await Follow.getSuggestedUsers(userId, limit)

    res.status(200).json({
      success: true,
      data: { users }
    })
  } catch (error) {
    console.error('Get suggested users error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get suggested users'
    })
  }
}

module.exports = {
  followUser,
  unfollowUser,
  checkFollowing,
  getFollowers,
  getFollowing,
  getCounts,
  getSuggestedUsers
}
