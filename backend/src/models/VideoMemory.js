// Temporary in-memory storage for videos (no database required)
// This allows testing without PostgreSQL setup

let videos = []
let videoIdCounter = 1

// Initialize with demo content
const initDemoContent = () => {
  videos.push({
    id: String(videoIdCounter++),
    creator_id: 'demo-creator',
    title: 'When you finally understand bonding curves 🚀',
    description: 'That moment when it all clicks and you realize how revolutionary tokenized social media really is! $PUMP to the moon!',
    video_url: 'https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.mp4',
    thumbnail_url: null,
    duration: 3,
    category: 'PUMP',
    views_count: 1420,
    likes_count: 89,
    comments_count: 12,
    is_published: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    username: 'pumpmaster',
    creator_token: 'PUMP',
    profile_image_url: null
  })
}

// Initialize demo content on module load
initDemoContent()

class VideoMemory {
  // Create a new video
  static async create({ creatorId, title, description, videoUrl, thumbnailUrl, duration, category }) {
    const video = {
      id: String(videoIdCounter++),
      creator_id: creatorId,
      title,
      description: description || '',
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration,
      category: category || 'general',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Mock creator info
      username: 'user' + creatorId.substring(0, 4),
      creator_token: category.toUpperCase(),
      profile_image_url: null
    }

    videos.push(video)
    return video
  }

  // Get all videos (for feed)
  static async getAll(limit = 50, offset = 0) {
    const sorted = [...videos].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return sorted.slice(offset, offset + limit)
  }

  // Get videos by creator
  static async getByCreator(creatorId, limit = 50, offset = 0) {
    const filtered = videos.filter(v => v.creator_id === creatorId)
    const sorted = filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return sorted.slice(offset, offset + limit)
  }

  // Get video by ID
  static async getById(videoId) {
    return videos.find(v => v.id === videoId)
  }

  // Increment view count
  static async incrementViews(videoId) {
    const video = videos.find(v => v.id === videoId)
    if (video) {
      video.views_count++
    }
  }

  // Like a video
  static async like(videoId, userId) {
    const video = videos.find(v => v.id === videoId)
    if (!video) return { liked: false }

    // Simple toggle for demo
    video.likes_count++
    return { liked: true }
  }

  // Delete video
  static async delete(videoId, userId) {
    const index = videos.findIndex(v => v.id === videoId && v.creator_id === userId)
    if (index !== -1) {
      const deleted = videos.splice(index, 1)[0]
      return deleted
    }
    return null
  }
}

module.exports = VideoMemory
