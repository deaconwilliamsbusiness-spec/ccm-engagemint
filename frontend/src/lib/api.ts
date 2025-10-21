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

  // Check if response is JSON before trying to parse it
  const contentType = response.headers.get('content-type')
  let data: unknown

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      throw new Error('Invalid response from server')
    }
  } else {
    // If not JSON, get text and handle authentication errors
    const text = await response.text()

    // If we get "Too many requests" or auth errors, clear token
    if (text.includes('Too many requests') || response.status === 401 || response.status === 403) {
      removeAuthToken()
      throw new Error('Session expired. Please log in again.')
    }

    throw new Error(text || 'API request failed')
  }

  if (!response.ok) {
    const errorData = data as { message?: string }
    throw new Error(errorData.message || 'API request failed')
  }

  return data as T
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
          followers_count?: number
          isVerified: boolean
          createdAt: string
        }
      }
    }>('/auth/profile')
  },

  updateFollowers: async (count: number) => {
    return await apiRequest<{
      success: boolean
      data: {
        followers_count: number
        message: string
      }
    }>('/auth/update-followers', {
      method: 'POST',
      body: JSON.stringify({ count })
    })
  },

  updateSettings: async (bio?: string, giveback_percentage?: number) => {
    return await apiRequest<{
      success: boolean
      data: {
        user: {
          id: string
          username: string
          bio: string
          giveback_percentage: number
          total_earnings: number
        }
        message: string
      }
    }>('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify({ bio, giveback_percentage })
    })
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
        videos: Record<string, unknown>[]
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
        comment: Record<string, unknown>
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

// Social/Follow API
export const socialAPI = {
  // Follow a user
  followUser: async (userId: string) => {
    return await apiRequest<{
      success: boolean
      message: string
    }>(`/social/users/${userId}/follow`, {
      method: 'POST'
    })
  },

  // Unfollow a user
  unfollowUser: async (userId: string) => {
    return await apiRequest<{
      success: boolean
      message: string
    }>(`/social/users/${userId}/follow`, {
      method: 'DELETE'
    })
  },

  // Check if following a user
  isFollowing: async (userId: string) => {
    return await apiRequest<{
      success: boolean
      data: { isFollowing: boolean }
    }>(`/social/users/${userId}/is-following`)
  },

  // Get user's followers
  getFollowers: async (userId: string, limit = 50, offset = 0) => {
    return await apiRequest<{
      success: boolean
      data: {
        followers: Array<{
          id: string
          username: string
          display_name?: string
          profile_image_url?: string
          follower_count: number
          following_count: number
        }>
        total: number
      }
    }>(`/social/users/${userId}/followers?limit=${limit}&offset=${offset}`)
  },

  // Get users that a user is following
  getFollowing: async (userId: string, limit = 50, offset = 0) => {
    return await apiRequest<{
      success: boolean
      data: {
        following: Array<{
          id: string
          username: string
          display_name?: string
          profile_image_url?: string
          follower_count: number
          following_count: number
        }>
        total: number
      }
    }>(`/social/users/${userId}/following?limit=${limit}&offset=${offset}`)
  },

  // Get follower/following counts
  getCounts: async (userId: string) => {
    return await apiRequest<{
      success: boolean
      data: {
        followers_count: number
        following_count: number
      }
    }>(`/social/users/${userId}/counts`)
  },

  // Get suggested users to follow
  getSuggestedUsers: async (limit = 20) => {
    return await apiRequest<{
      success: boolean
      data: {
        users: Array<{
          id: string
          username: string
          display_name?: string
          profile_image_url?: string
          bio?: string
          follower_count: number
        }>
      }
    }>(`/social/suggested-users?limit=${limit}`)
  }
}

// Interests & Preferences API
export const interestsAPI = {
  // Get all available interests
  getAllInterests: async () => {
    return await apiRequest<{
      success: boolean
      data: {
        interests: Array<{
          id: string
          name: string
          display_name: string
          icon: string
          description: string
        }>
      }
    }>('/interests')
  },

  // Get user's interests
  getUserInterests: async () => {
    return await apiRequest<{
      success: boolean
      data: {
        interests: Array<{
          id: string
          name: string
          display_name: string
          icon: string
          description: string
          weight: number
        }>
      }
    }>('/user/interests')
  },

  // Set user interests (for onboarding)
  setUserInterests: async (interestIds: string[]) => {
    return await apiRequest<{
      success: boolean
      message: string
    }>('/user/interests', {
      method: 'POST',
      body: JSON.stringify({ interestIds })
    })
  },

  // Get user preferences
  getUserPreferences: async () => {
    return await apiRequest<{
      success: boolean
      data: {
        preferences: {
          id: string
          user_id: string
          content_language: string
          auto_play_videos: boolean
          show_mature_content: boolean
          personalized_recommendations: boolean
          push_notifications: boolean
          email_notifications: boolean
          onboarding_completed: boolean
        }
      }
    }>('/user/preferences')
  },

  // Update user preferences
  updateUserPreferences: async (preferences: Record<string, unknown>) => {
    return await apiRequest<{
      success: boolean
      message: string
      data: { preferences: Record<string, unknown> }
    }>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    })
  },

  // Complete onboarding
  completeOnboarding: async () => {
    return await apiRequest<{
      success: boolean
      message: string
    }>('/user/onboarding/complete', {
      method: 'POST'
    })
  }
}
