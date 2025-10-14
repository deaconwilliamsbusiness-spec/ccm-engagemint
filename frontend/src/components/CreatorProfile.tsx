'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, MoreHorizontal, Play, Heart, X, Upload, CheckCircle, Trash2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'

interface PnlData {
  time: string
  profit: number
  revenue: number
}

interface VideoContent {
  id: string
  title: string
  views: string
  likes: string
  thumbnail: string
  videoUrl: string
  duration: string
  category: 'recent' | 'viral' | 'minted' | 'migrated'
}

const mockPnlData: PnlData[] = [
  { time: '1h', profit: 1200, revenue: 15600 },
  { time: '6h', profit: 3400, revenue: 28900 },
  { time: '12h', profit: 5800, revenue: 45200 },
  { time: '1d', profit: 8900, revenue: 67800 },
  { time: '2d', profit: 12400, revenue: 89300 },
  { time: '3d', profit: 15600, revenue: 112500 },
]

const mockContent: VideoContent[] = [
  { id: '1', title: 'Crypto Analysis 🚀', views: '1.2M', likes: '89K', thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: '2:45', category: 'viral' },
  { id: '2', title: 'Market Update 📈', views: '890K', likes: '67K', thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: '1:32', category: 'recent' },
  { id: '3', title: 'MINT Tips 💎', views: '567K', likes: '45K', thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: '3:21', category: 'minted' },
  { id: '4', title: 'DeFi Guide 🔥', views: '423K', likes: '34K', thumbnail: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=300&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: '4:12', category: 'migrated' },
  { id: '5', title: 'NFT Trends 🎨', views: '334K', likes: '28K', thumbnail: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=300&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', duration: '2:18', category: 'recent' },
  { id: '6', title: 'Yield Farming 🌾', views: '298K', likes: '23K', thumbnail: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=300&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', duration: '5:07', category: 'minted' },
  { id: '7', title: 'Trading Strategies 📊', views: '756K', likes: '58K', thumbnail: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=300&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', duration: '3:45', category: 'viral' },
  { id: '8', title: 'Community Alpha 💡', views: '512K', likes: '42K', thumbnail: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&h=300&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', duration: '2:55', category: 'migrated' },
]

interface CreatorProfileProps {
  onBack: () => void
}

// Badge tiers based on migrated videos
const badgeTiers = [
  { name: 'Starter', videos: 1, color: 'gray', emoji: '🌱', description: 'First video migrated' },
  { name: 'Rising', videos: 10, color: 'blue', emoji: '🌠', description: '10 videos migrated' },
  { name: 'Verified', videos: 50, color: 'green', emoji: '✓', description: '50 videos migrated' },
  { name: 'Pro', videos: 100, color: 'purple', emoji: '💎', description: '100 videos migrated' },
  { name: 'Elite', videos: 200, color: 'orange', emoji: '🔥', description: '200 videos migrated' },
  { name: 'Legend', videos: 500, color: 'red', emoji: '🏆', description: '500 videos migrated' },
  { name: 'Master', videos: 1000, color: 'yellow', emoji: '👑', description: '1000 videos migrated' },
]

const getBadgeColor = (color: string) => {
  const colors = {
    gray: 'bg-gray-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  }
  return colors[color as keyof typeof colors] || colors.gray
}

export function CreatorProfile({ onBack }: CreatorProfileProps) {
  const { user } = useUser()
  const [selectedPeriod, setSelectedPeriod] = useState('1d')
  const [showChart, setShowChart] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [username, setUsername] = useState(user?.username || '@cryptoking')
  const [migratedVideos, setMigratedVideos] = useState(127) // Number of migrated videos
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [videoFilter, setVideoFilter] = useState<'all' | 'recent' | 'viral' | 'minted' | 'migrated'>('all')
  const [myVideos, setMyVideos] = useState<any[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)
  const [totalViews, setTotalViews] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)

  // Fetch user's videos
  useEffect(() => {
    const fetchMyVideos = async () => {
      if (!user) return

      setIsLoadingVideos(true)
      try {
        const { videoAPI } = await import('@/lib/api')
        const response = await videoAPI.getMyVideos()

        if (response.success && response.data.videos) {
          setMyVideos(response.data.videos)

          // Calculate totals
          const views = response.data.videos.reduce((sum: number, v: any) => sum + (v.views_count || 0), 0)
          const likes = response.data.videos.reduce((sum: number, v: any) => sum + (v.likes_count || 0), 0)
          setTotalViews(views)
          setTotalLikes(likes)
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error)
      } finally {
        setIsLoadingVideos(false)
      }
    }

    fetchMyVideos()
  }, [user])

  // Fetch user profile data including followers
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { authAPI } = await import('@/lib/api')
        const response = await authAPI.getProfile()

        if (response.success && response.data.user) {
          const userData = response.data.user
          setFollowersCount(userData.followers_count || 0)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    fetchProfile()
  }, [user])

  // Update username when user changes
  useEffect(() => {
    if (user?.username) {
      setUsername(`@${user.username}`)
    }
  }, [user])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getMaxValue = () => {
    const values = mockPnlData.map(d => d.profit)
    return Math.max(...values)
  }

  const getCurrentBadge = () => {
    // Find the highest tier that the user has achieved
    const achievedTiers = badgeTiers.filter(tier => migratedVideos >= tier.videos)
    return achievedTiers[achievedTiers.length - 1] || null
  }

  const getNextBadge = () => {
    // Find the next tier to achieve
    return badgeTiers.find(tier => migratedVideos < tier.videos) || null
  }

  const getProgressToNextBadge = () => {
    const nextBadge = getNextBadge()
    if (!nextBadge) return 100 // Max level reached

    const currentBadge = getCurrentBadge()
    const previousVideos = currentBadge ? currentBadge.videos : 0
    const progress = ((migratedVideos - previousVideos) / (nextBadge.videos - previousVideos)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const maxValue = getMaxValue()
  const currentBadge = getCurrentBadge()
  const nextBadge = getNextBadge()
  const progress = getProgressToNextBadge()

  const filteredContent = myVideos

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return

    try {
      const { videoAPI } = await import('@/lib/api')
      const response = await videoAPI.delete(videoId)

      if (response.success) {
        // Remove from local state
        setMyVideos(prev => prev.filter(v => v.id !== videoId))
        alert('Video deleted successfully')
      }
    } catch (error) {
      console.error('Failed to delete video:', error)
      alert('Failed to delete video. Please try again.')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
      </div>

      {/* Centered content container */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="relative w-full max-w-md h-full bg-gray-900/50 backdrop-blur-xl border-x border-gray-800/50 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-all hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg text-white tracking-tight">Creator Dashboard</h1>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-400 hover:text-white transition-all hover:scale-110"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="px-6 pt-8 pb-6">
        {/* Avatar and Info */}
        <div className="flex flex-col items-center mb-8">
          {/* Avatar */}
          <div className="relative mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="pfp-upload"
            />
            <label
              htmlFor="pfp-upload"
              className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-gray-800/50 hover:ring-green-500/50 transition-all cursor-pointer hover:scale-105 overflow-hidden"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Image src="/mint-logo.png" alt="Creator" width={72} height={72} className="object-contain" />
              )}
            </label>
            {/* Badge next to PFP */}
            {currentBadge && (
              <div className="absolute -bottom-2 -right-2 pointer-events-none" title={currentBadge.description}>
                <span className="text-3xl">{currentBadge.emoji}</span>
              </div>
            )}
          </div>

          {/* Username below PFP */}
          <div className="text-center">
            <h2 className="text-white font-bold text-xl tracking-tight">{username}</h2>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 shadow-lg">
            <div className="text-xl mb-1">🎬</div>
            <p className="text-gray-400 text-[10px] mb-1">Videos</p>
            <p className="text-white font-bold text-lg tracking-tight">{myVideos.length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 shadow-lg">
            <div className="text-xl mb-1">👥</div>
            <p className="text-gray-400 text-[10px] mb-1">Followers</p>
            <p className="text-white font-bold text-lg tracking-tight">{formatNumber(followersCount)}</p>
          </div>
          <button
            onClick={() => setShowChart(!showChart)}
            className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 cursor-pointer shadow-lg"
          >
            <div className="text-xl mb-1">📊</div>
            <p className="text-gray-400 text-[10px] mb-1">Creator P&L</p>
            <p className="text-gray-400 font-bold text-lg tracking-tight">$0</p>
          </button>
        </div>

        {/* Description Bubble */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-sm rounded-2xl p-5 mb-8 border border-green-500/30 hover:border-green-500/50 transition-all shadow-lg">
          <p className="text-gray-300 text-sm text-center leading-relaxed">
            Crypto analyst & content creator. Building the future of decentralized finance.
          </p>
        </div>

        {/* P&L Chart Dropdown */}
        {showChart && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50 shadow-xl">
            {/* Time Period Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['1h', '6h', '12h', '1d', '2d', '3d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedPeriod === period
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg shadow-green-500/30 scale-105'
                      : 'bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:bg-gray-700/80 border border-gray-700/50 hover:border-gray-600/50 hover:scale-105'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="h-48 flex items-end gap-3 mb-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl p-5 border border-gray-800/50 shadow-inner">
              {mockPnlData.map((point, index) => {
                const height = (point.profit / maxValue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 via-green-400 to-emerald-300 rounded-t-lg transition-all duration-300 hover:from-green-400 hover:via-green-300 hover:to-emerald-200 shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40"
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    />
                    <span className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-300 transition-colors">{point.time}</span>
                  </div>
                )
              })}
            </div>

            {/* P&L Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-xl p-5 text-center border border-green-500/20 hover:border-green-500/40 transition-all hover:scale-105 shadow-lg">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-green-400 font-bold text-2xl tracking-tight mb-1">
                  ${formatNumber(mockPnlData[mockPnlData.length - 1]?.profit || 0)}
                </p>
                <p className="text-gray-400 text-xs font-medium">Total Profit</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl p-5 text-center border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-105 shadow-lg">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-blue-400 font-bold text-2xl tracking-tight mb-1">
                  ${formatNumber(mockPnlData[mockPnlData.length - 1]?.revenue || 0)}
                </p>
                <p className="text-gray-400 text-xs font-medium">Total Revenue</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold text-xl tracking-tight">Your Content</h3>
              <p className="text-gray-500 text-xs mt-0.5">{filteredContent.length} videos</p>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={videoFilter}
                onChange={(e) => setVideoFilter(e.target.value as typeof videoFilter)}
                className="bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 pr-8 rounded-xl border border-gray-700/50 hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer appearance-none transition-all"
              >
                <option value="all">All Videos</option>
                <option value="recent">Recent</option>
                <option value="viral">Viral</option>
                <option value="minted">Minted</option>
                <option value="migrated">Migrated</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {isLoadingVideos ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-white font-bold text-xl mb-2">No Videos Yet</h3>
              <p className="text-gray-400 text-sm">Start creating content to see it here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredContent.map((video) => (
                <div key={video.id} className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl overflow-hidden group border border-gray-700/50 hover:border-gray-600/50 shadow-lg relative">
                  <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                    {/* Video/Image Thumbnail */}
                    <img
                      src={`http://localhost:5000${video.video_url}`}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteVideo(video.id)
                      }}
                      className="absolute top-2 left-2 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm rounded-full p-2 transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>

                    {/* Play Icon */}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full p-2">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-medium text-sm line-clamp-2 mb-2">{video.title}</h4>
                    <div className="flex items-center justify-between text-gray-400 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {video.views_count || 0}
                        </span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{video.likes_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsSettingsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden ring-1 ring-gray-800/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl">
              <div>
                <h2 className="text-white font-bold text-xl tracking-tight">Profile Settings</h2>
                <p className="text-gray-500 text-xs mt-0.5">Customize your creator profile</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-white transition-all hover:scale-110 hover:rotate-90 duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="settings-pfp-upload"
                  />
                  <label htmlFor="settings-pfp-upload" className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-gray-800/50 cursor-pointer overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Image src="/mint-logo.png" alt="Profile" width={72} height={72} className="object-contain" />
                    )}
                  </label>
                  <label htmlFor="settings-pfp-upload" className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-2.5 shadow-xl hover:shadow-green-500/50 transition-all hover:scale-110 ring-4 ring-gray-900 cursor-pointer">
                    <Upload className="w-4 h-4 text-white" />
                  </label>
                </div>
                <p className="text-gray-400 text-xs font-medium">Upload Profile Picture</p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800/80 backdrop-blur-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700/50 hover:border-gray-600/50 transition-all text-sm"
                  placeholder="@username"
                />
              </div>

              {/* Badge System */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 shadow-lg">
                <h3 className="text-white font-bold text-base mb-4 tracking-tight">Creator Badge Progress</h3>

                {/* Current Badge */}
                {currentBadge && (
                  <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl border border-green-500/30 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className={`${getBadgeColor(currentBadge.color)} rounded-full p-2.5 shadow-lg ring-2 ring-gray-800`}>
                        <span className="text-xl">{currentBadge.emoji}</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm tracking-tight">{currentBadge.name}</p>
                        <p className="text-gray-400 text-xs">{currentBadge.description}</p>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}

                {/* Progress to Next Badge */}
                {nextBadge && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-xs font-semibold">Next: {nextBadge.name} {nextBadge.emoji}</p>
                      <p className="text-gray-300 text-xs font-bold">{migratedVideos}/{nextBadge.videos}</p>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div
                        className={`${getBadgeColor(nextBadge.color)} h-full transition-all duration-500 shadow-lg`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* All Badge Tiers */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {badgeTiers.map((tier, index) => {
                    const isAchieved = migratedVideos >= tier.videos
                    const isCurrent = currentBadge?.name === tier.name
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/30 shadow-lg'
                            : isAchieved
                            ? 'bg-gray-900/80 border border-gray-700/50 hover:border-gray-600/50'
                            : 'bg-gray-900/30 border border-gray-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${getBadgeColor(tier.color)} rounded-full p-1.5 shadow-md ${!isAchieved && 'opacity-30 grayscale'}`}>
                            <span className="text-sm">{tier.emoji}</span>
                          </div>
                          <div>
                            <p className={`text-xs font-bold tracking-tight ${isAchieved ? 'text-white' : 'text-gray-600'}`}>
                              {tier.name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium">{tier.videos} videos</p>
                          </div>
                        </div>
                        {isAchieved && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      </div>
                    )
                  })}
                </div>

                {/* Followers Counter (Demo) */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <label className="block text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">
                    Followers Count (Demo)
                  </label>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="number"
                      value={followersCount}
                      onChange={(e) => setFollowersCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 bg-gray-900 text-white text-center rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700/50"
                    />
                    <button
                      onClick={async () => {
                        try {
                          const { authAPI } = await import('@/lib/api')
                          await authAPI.updateFollowers(followersCount)
                          alert('Followers count updated!')
                        } catch (error) {
                          alert('Failed to update followers count')
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-105 shadow-lg"
                    >
                      Save
                    </button>
                  </div>
                  <button
                    onClick={async () => {
                      setFollowersCount(45200)
                      try {
                        const { authAPI } = await import('@/lib/api')
                        await authAPI.updateFollowers(45200)
                        alert('Followers set to 45.2K!')
                      } catch (error) {
                        alert('Failed to update followers count')
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all hover:scale-105 shadow-lg"
                  >
                    Set to 45.2K
                  </button>
                </div>

                {/* Migrated Videos Counter */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <label className="block text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">
                    Migrated Videos (Demo)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMigratedVideos(Math.max(0, migratedVideos - 10))}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-105 shadow-lg"
                    >
                      -10
                    </button>
                    <input
                      type="number"
                      value={migratedVideos}
                      onChange={(e) => setMigratedVideos(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 bg-gray-900 text-white text-center rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700/50"
                    />
                    <button
                      onClick={() => setMigratedVideos(migratedVideos + 10)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-105 shadow-lg"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800/50 flex gap-3 bg-gray-900/50 backdrop-blur-xl">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-white font-bold py-3.5 rounded-xl transition-all border border-gray-700/50 hover:border-gray-600/50 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 hover:scale-105"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}