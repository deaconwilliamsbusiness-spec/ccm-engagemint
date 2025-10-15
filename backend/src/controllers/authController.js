// Use PostgreSQL database storage
const User = require('../models/User')
const { generateToken, createSession, deleteSession } = require('../utils/jwt')

// Sign up controller
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      })
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters'
      })
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      })
    }

    // Check if email already exists
    const emailExists = await User.emailExists(email)
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      })
    }

    // Check if username already exists
    const usernameExists = await User.usernameExists(username)
    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      })
    }

    // Create user
    const user = await User.create({ username, email, password })

    // Generate JWT token
    const token = generateToken(user.id)

    // Create session in database
    await createSession(user.id, token)

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at
        },
        token
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Find user by email
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      })
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = generateToken(user.id)

    // Create session in database
    await createSession(user.id, token)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          profileImage: user.profile_image_url
        },
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Logout controller
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      await deleteSession(token)
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    })
  }
}

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          bio: user.bio,
          profileImage: user.profile_image_url,
          walletAddress: user.wallet_address,
          isVerified: user.is_verified,
          createdAt: user.created_at
        }
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    })
  }
}

module.exports = {
  signup,
  login,
  logout,
  getProfile
}
