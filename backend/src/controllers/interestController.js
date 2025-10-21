const Interest = require('../models/Interest')
const UserPreferences = require('../models/UserPreferences')

// Get all available interests
const getAllInterests = async (req, res) => {
  try {
    const interests = await Interest.getAll()

    res.status(200).json({
      success: true,
      data: { interests }
    })
  } catch (error) {
    console.error('Get all interests error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get interests'
    })
  }
}

// Get user's interests
const getUserInterests = async (req, res) => {
  try {
    const userId = req.user.id
    const interests = await Interest.getUserInterests(userId)

    res.status(200).json({
      success: true,
      data: { interests }
    })
  } catch (error) {
    console.error('Get user interests error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user interests'
    })
  }
}

// Set user interests (for onboarding)
const setUserInterests = async (req, res) => {
  try {
    const userId = req.user.id
    const { interestIds } = req.body

    if (!Array.isArray(interestIds)) {
      return res.status(400).json({
        success: false,
        message: 'Interest IDs must be an array'
      })
    }

    await Interest.setUserInterests(userId, interestIds)

    // Mark onboarding as completed
    await UserPreferences.completeOnboarding(userId)

    res.status(200).json({
      success: true,
      message: 'Interests saved successfully'
    })
  } catch (error) {
    console.error('Set user interests error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to set interests'
    })
  }
}

// Get user preferences
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id
    const preferences = await UserPreferences.getPreferences(userId)

    res.status(200).json({
      success: true,
      data: { preferences }
    })
  } catch (error) {
    console.error('Get user preferences error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences'
    })
  }
}

// Update user preferences
const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id
    const preferences = req.body

    const updated = await UserPreferences.updatePreferences(userId, preferences)

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: updated }
    })
  } catch (error) {
    console.error('Update user preferences error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    })
  }
}

// Complete onboarding
const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id
    await UserPreferences.completeOnboarding(userId)

    res.status(200).json({
      success: true,
      message: 'Onboarding completed'
    })
  } catch (error) {
    console.error('Complete onboarding error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding'
    })
  }
}

module.exports = {
  getAllInterests,
  getUserInterests,
  setUserInterests,
  getUserPreferences,
  updateUserPreferences,
  completeOnboarding
}
