// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    // Clear invalid demo tokens
    if (token === 'demo_skip_token') {
      localStorage.removeItem('auth_token')
      return null
    }
    return token
  }
  return null
}

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}

// Authentication API calls
export const authAPI = {
  signup: async (username: string, email: string, password: string) => {
    const response = await apiRequest<{
      success: boolean
      message: string
      data: {
        user: {
          id: string
          username: string
          email: string
          createdAt: string
        }
        token: string
      }
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })

    // Save token
    if (response.data.token) {
      setAuthToken(response.data.token)
    }

    return response
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      success: boolean
      message: string
      data: {
        user: {
          id: string
          username: string
          email: string
          displayName?: string
          profileImage?: string
        }
        token: string
      }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    // Save token
    if (response.data.token) {
      setAuthToken(response.data.token)
    }

    return response
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      })
    } finally {
      // Remove token even if request fails
      removeAuthToken()
    }
  },

  getProfile: async () => {
    return await apiRequest<{
      success: boolean
      data: {
        user: {
          id: string
          username: string
          email: string
          displayName?: string
          bio?: string
          profileImage?: string
          walletAddress?: string
          isVerified: boolean
          createdAt: string
        }
      }
    }>('/auth/profile')
  },
}

// Video API calls
export const videoAPI = {
  // Upload a video
  upload: async (videoFile: File, thumbnailFile: File | null, title: string, description: string, category: string) => {
    const token = getAuthToken()

    if (!token) {
      throw new Error('Authentication required')
    }

    const formData = new FormData()
    formData.append('video', videoFile)
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile)
    }
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)

    const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed')
    }

    return data
  },

  // Get all videos (feed)
  getAll: async (limit = 50, offset = 0) => {
    const token = getAuthToken()
    const headers: HeadersInit = {}

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/videos?limit=${limit}&offset=${offset}`, {
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch videos')
    }

    return data
  },

  // Get my videos
  getMyVideos: async () => {
    return await apiRequest<{
      success: boolean
      data: {
        videos: any[]
        count: number
      }
    }>('/videos/me/videos')
  },

  // Like a video
  like: async (videoId: string) => {
    return await apiRequest<{
      success: boolean
      data: {
        liked: boolean
      }
    }>(`/videos/${videoId}/like`, {
      method: 'POST'
    })
  },

  // Delete a video
  delete: async (videoId: string) => {
    return await apiRequest<{
      success: boolean
      message: string
    }>(`/videos/${videoId}`, {
      method: 'DELETE'
    })
  }
}

// Comments API
export const commentsAPI = {
  // Get comments for a video
  getComments: async (videoId: string) => {
    const token = getAuthToken()
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/videos/${videoId}/comments`, { headers })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load comments')
    }
    return data
  },

  // Post a comment
  postComment: async (videoId: string, content: string) => {
    return await apiRequest<{
      success: boolean
      data: {
        comment: any
      }
    }>(`/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  },

  // Delete a comment
  deleteComment: async (commentId: string) => {
    return await apiRequest<{
      success: boolean
      message: string
    }>(`/comments/${commentId}`, {
      method: 'DELETE'
    })
  }
}

// Health check
export const checkAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}
