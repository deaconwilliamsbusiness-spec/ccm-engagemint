const multer = require('multer')
const path = require('path')

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Main content (video or image) goes to videos folder
    // Only actual thumbnails go to thumbnails folder
    if (file.fieldname === 'video') {
      cb(null, 'uploads/videos')
    } else if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails')
    } else {
      cb(new Error('Invalid field name'), null)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only video and image files are allowed'), false)
  }
}

// Upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
})

module.exports = upload
