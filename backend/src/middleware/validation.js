/**
 * Input validation middleware
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username)
}

const validatePassword = (password) => {
  return password && password.length >= 6
}

/**
 * Validation middleware for user registration
 */
exports.validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body

  const errors = []

  if (!username || !validateUsername(username)) {
    errors.push('Username must be 3-30 characters and contain only letters, numbers, and underscores')
  }

  if (!email || !validateEmail(email)) {
    errors.push('Invalid email address')
  }

  if (!password || !validatePassword(password)) {
    errors.push('Password must be at least 6 characters')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  next()
}

/**
 * Validation middleware for login
 */
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body

  const errors = []

  if (!email || !validateEmail(email)) {
    errors.push('Invalid email address')
  }

  if (!password) {
    errors.push('Password is required')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  next()
}

/**
 * Validation middleware for video upload
 */
exports.validateVideoUpload = (req, res, next) => {
  const { title } = req.body
  const errors = []

  if (!title || title.trim().length === 0) {
    errors.push('Video title is required')
  }

  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  if (req.body.description && req.body.description.length > 1000) {
    errors.push('Description must be less than 1000 characters')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  next()
}

/**
 * Validation middleware for comments
 */
exports.validateComment = (req, res, next) => {
  const { content } = req.body
  const errors = []

  if (!content || content.trim().length === 0) {
    errors.push('Comment content is required')
  }

  if (content && content.length > 1000) {
    errors.push('Comment must be less than 1000 characters')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    })
  }

  next()
}

/**
 * Sanitize input to prevent XSS
 */
exports.sanitizeInput = (req, res, next) => {
  const sanitize = (str) => {
    if (typeof str !== 'string') return str
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key])
      }
    })
  }

  next()
}
