const express = require('express')
const router = express.Router()
const {
  followUser,
  unfollowUser,
  checkFollowing,
  getFollowers,
  getFollowing,
  getCounts,
  getSuggestedUsers
} = require('../controllers/followController')
const { authenticate } = require('../middleware/auth')

// All routes require authentication
router.use(authenticate)

// Follow/unfollow endpoints
router.post('/users/:userId/follow', followUser)
router.delete('/users/:userId/follow', unfollowUser)
router.get('/users/:userId/is-following', checkFollowing)

// Get followers/following
router.get('/users/:userId/followers', getFollowers)
router.get('/users/:userId/following', getFollowing)
router.get('/users/:userId/counts', getCounts)

// Get suggested users to follow
router.get('/suggested-users', getSuggestedUsers)

module.exports = router
