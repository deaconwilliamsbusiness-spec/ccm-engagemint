interface TikTokVideo {
  id: string
  title: string
  video_description: string
  duration: number
  cover_image_url: string
  embed_html: string
  embed_link: string
  like_count: number
  comment_count: number
  share_count: number
  view_count: number
  username: string
  display_name: string
  avatar_url: string
  create_time: number
}

interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  caption: string
  timestamp: string
  like_count?: number
  comments_count?: number
  username: string
  permalink: string
}

interface SocialMediaContent {
  id: string
  platform: 'tiktok' | 'instagram'
  creator: string
  title: string
  description: string
  thumbnail: string
  videoUrl?: string
  views: string
  likes: string
  comments: string
  timestamp: string
  originalUrl: string
}

export class SocialMediaAPI {
  private tiktokClientKey: string
  private tiktokClientSecret: string
  private instagramClientId: string
  private instagramClientSecret: string

  constructor() {
    this.tiktokClientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY || ''
    this.tiktokClientSecret = process.env.TIKTOK_CLIENT_SECRET || ''
    this.instagramClientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || ''
    this.instagramClientSecret = process.env.INSTAGRAM_CLIENT_SECRET || ''
  }

  // TikTok OAuth URL generation
  generateTikTokAuthUrl(): string {
    const baseUrl = 'https://www.tiktok.com/v2/auth/authorize/'
    const params = new URLSearchParams({
      client_key: this.tiktokClientKey,
      scope: 'user.info.basic,video.list',
      response_type: 'code',
      redirect_uri: process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI || '',
      state: Math.random().toString(36).substring(7)
    })
    return `${baseUrl}?${params.toString()}`
  }

  // Instagram OAuth URL generation
  generateInstagramAuthUrl(): string {
    const baseUrl = 'https://api.instagram.com/oauth/authorize'
    const params = new URLSearchParams({
      client_id: this.instagramClientId,
      redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || '',
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: Math.random().toString(36).substring(7)
    })
    return `${baseUrl}?${params.toString()}`
  }

  // Exchange TikTok code for access token
  async exchangeTikTokCode(code: string): Promise<string> {
    const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.tiktokClientKey,
        client_secret: this.tiktokClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI || ''
      })
    })

    const data = await response.json()
    return data.access_token
  }

  // Exchange Instagram code for access token
  async exchangeInstagramCode(code: string): Promise<string> {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.instagramClientId,
        client_secret: this.instagramClientSecret,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || '',
        code
      })
    })

    const data = await response.json()
    return data.access_token
  }

  // Fetch TikTok videos
  async fetchTikTokVideos(accessToken: string, count: number = 20): Promise<TikTokVideo[]> {
    const response = await fetch(`https://open-api.tiktok.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,embed_html,embed_link,like_count,comment_count,share_count,view_count,username,display_name,avatar_url,create_time&max_count=${count}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    const data = await response.json()
    return data.data?.videos || []
  }

  // Fetch Instagram media
  async fetchInstagramMedia(accessToken: string, count: number = 20): Promise<InstagramMedia[]> {
    const response = await fetch(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,like_count,comments_count,username,permalink&limit=${count}&access_token=${accessToken}`)

    const data = await response.json()
    return data.data || []
  }

  // Convert to unified format
  convertTikTokToUnified(video: TikTokVideo): SocialMediaContent {
    return {
      id: video.id,
      platform: 'tiktok',
      creator: `@${video.username}`,
      title: video.title || video.video_description.substring(0, 50) + '...',
      description: video.video_description,
      thumbnail: video.cover_image_url,
      videoUrl: video.embed_link,
      views: this.formatCount(video.view_count),
      likes: this.formatCount(video.like_count),
      comments: this.formatCount(video.comment_count),
      timestamp: new Date(video.create_time * 1000).toISOString(),
      originalUrl: video.embed_link
    }
  }

  convertInstagramToUnified(media: InstagramMedia): SocialMediaContent {
    return {
      id: media.id,
      platform: 'instagram',
      creator: `@${media.username}`,
      title: media.caption?.substring(0, 50) + '...' || 'Instagram Post',
      description: media.caption || '',
      thumbnail: media.thumbnail_url || media.media_url,
      videoUrl: media.media_type === 'VIDEO' ? media.media_url : undefined,
      views: 'N/A', // Instagram doesn't provide view counts in basic API
      likes: this.formatCount(media.like_count || 0),
      comments: this.formatCount(media.comments_count || 0),
      timestamp: media.timestamp,
      originalUrl: media.permalink
    }
  }

  private formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }
}

export const socialMediaAPI = new SocialMediaAPI()