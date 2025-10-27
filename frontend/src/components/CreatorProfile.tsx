'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, MoreHorizontal, Play, Heart, X, Upload, CheckCircle, Trash2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { formatNumber } from '@/lib/formatters'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const BASE_URL = API_BASE_URL.replace('/api', '')

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
  category: 'recent' | 'viral' | 'minted'
}

const mockPnlData: PnlData[] = [
  { time: '1h', profit: 1200, revenue: 15600 },
  { time: '6h', profit: 3400, revenue: 28900 },
  { time: '12h', profit: 5800, revenue: 45200 },
  { time: '1d', profit: 8900, revenue: 67800 },
  { time: '2d', profit: 12400, revenue: 89300 },
  { time: '3d', profit: 15600, revenue: 112500 },
]


interface CreatorProfileProps {
  onBack: () => void
}


export function CreatorProfile({ onBack }: CreatorProfileProps) {
  const { user } = useUser()
  const [selectedPeriod, setSelectedPeriod] = useState('1d')
  const [showChart, setShowChart] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [username, setUsername] = useState(user?.username || '@cryptoking')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [videoFilter, setVideoFilter] = useState<'all' | 'recent' | 'viral' | 'minted'>('all')
  const [myVideos, setMyVideos] = useState<Record<string, unknown>[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)
  const [followersCount, setFollowersCount] = useState(0)
  const [givebackPercentage, setGivebackPercentage] = useState(0) // Percentage of earnings returned to community - starts at 0
  const [totalEarnings, setTotalEarnings] = useState(0) // Total earnings - starts at 0, will be updated when Solana is integrated
  const [description, setDescription] = useState('Crypto analyst & content creator. Building the future of decentralized finance.')

  // Fetch user's videos
  useEffect(() => {
    const fetchMyVideos = async () => {
      if (!user) {
        setIsLoadingVideos(false)
        return
      }

      setIsLoadingVideos(true)
      try {
        const { videoAPI } = await import('@/lib/api')
        const response = await videoAPI.getMyVideos()

        if (response.success && response.data.videos) {
          setMyVideos(response.data.videos)
        } else {
          // If no videos or error, set empty array
          setMyVideos([])
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error)
        // On error (like auth failure), show empty state instead of infinite loading
        setMyVideos([])
      } finally {
        setIsLoadingVideos(false)
      }
    }

    fetchMyVideos()
  }, [user])

  // Fetch user profile data including followers and settings
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { authAPI } = await import('@/lib/api')
        const response = await authAPI.getProfile()

        if (response.success && response.data.user) {
          const userData = response.data.user
          setFollowersCount(userData.followers_count || 0)

          // Load creator settings
          if (userData.bio) {
            setDescription(userData.bio)
          }
          // Note: giveback_percentage and total_earnings will be added to the response type
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

  const getMaxValue = () => {
    const values = mockPnlData.map(d => d.profit)
    return Math.max(...values)
  }

  const maxValue = getMaxValue()

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

  const handleSaveSettings = async () => {
    try {
      const { authAPI } = await import('@/lib/api')
      const response = await authAPI.updateSettings(description, givebackPercentage)

      if (response.success) {
        alert('Settings saved successfully!')
        setIsSettingsOpen(false)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
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
            <h1 className="font-bold text-lg text-white tracking-tight">Profile</h1>
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
        <div className="flex flex-col items-center mb-3">
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
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Image src="/mint-logo.png" alt="Creator" width={72} height={72} className="object-contain" />
              )}
            </label>
          </div>

          {/* Username below PFP */}
          <div className="text-center">
            <h2 className="text-white font-bold text-xl tracking-tight">{username}</h2>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 shadow-lg">
            <p className="text-gray-400 text-[10px] mb-1">Videos</p>
            <p className="text-white font-bold text-lg tracking-tight">{myVideos.length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 shadow-lg">
            <p className="text-gray-400 text-[10px] mb-1">Followers</p>
            <p className="text-white font-bold text-lg tracking-tight">{formatNumber(followersCount)}</p>
          </div>
          <button
            onClick={() => setShowChart(!showChart)}
            className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 cursor-pointer shadow-lg"
          >
            <p className="text-gray-400 text-[10px] mb-1">Creator P&L</p>
            <p className="text-gray-400 font-bold text-lg tracking-tight">$0</p>
          </button>
        </div>

        {/* Description Bubble */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-sm rounded-2xl p-5 mb-3 border border-green-500/30 hover:border-green-500/50 transition-all shadow-lg">
          <p className="text-gray-300 text-sm text-center leading-relaxed">
            {description}
          </p>
        </div>

        {/* Community Giveback Box */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-5 mb-3 border-2 border-emerald-500/40 hover:border-emerald-500/60 transition-all shadow-xl hover:shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="text-2xl">💚</div>
              <h3 className="text-white font-bold text-base">Community Giveback</h3>
            </div>
            <div className="bg-emerald-500/20 rounded-full px-3 py-1 border border-emerald-500/40">
              <span className="text-emerald-400 font-bold text-sm">{givebackPercentage}%</span>
            </div>
          </div>

          {/* Total Given Back */}
          <div className="bg-emerald-500/10 rounded-xl p-3 mb-3 border border-emerald-500/30">
            <div className="text-center">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Total Given Back</div>
              <div className="text-emerald-400 font-bold text-2xl">
                ${((totalEarnings * givebackPercentage) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-gray-500 text-[10px] mt-1">
                from ${totalEarnings.toLocaleString('en-US')} total earnings
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-xs leading-relaxed mb-3">
            {givebackPercentage}% of all earnings are reinvested back into the community token, creating value for holders and supporters.
          </p>

          <div className="bg-gray-900/50 rounded-xl p-3 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">Allocation Split</span>
              <span className="text-emerald-400 font-bold">{givebackPercentage}% / {100 - givebackPercentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${givebackPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-2 text-gray-500">
              <span>Creator: {100 - givebackPercentage}%</span>
              <span>Community: {givebackPercentage}%</span>
            </div>
          </div>
        </div>

        {/* P&L Chart Dropdown */}
        {showChart && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 mb-3 border border-gray-700/50 shadow-xl">
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
                <p className="text-green-400 font-bold text-2xl tracking-tight mb-1">
                  ${formatNumber(mockPnlData[mockPnlData.length - 1]?.profit || 0)}
                </p>
                <p className="text-gray-400 text-xs font-medium">Total Profit</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl p-5 text-center border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-105 shadow-lg">
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
          <div className="flex items-center justify-between mb-3">
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
              <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-green-500/10">
                <div className="text-5xl">🎬</div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Your Stage Awaits
              </h3>
              <p className="text-gray-400 text-sm mb-6 px-4">
                Start creating content and watch your audience grow!
              </p>
              <button
                onClick={() => onBack()}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
              >
                🚀 Upload First Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredContent.map((video) => (
                <div key={video.id as string} className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl overflow-hidden group border border-gray-700/50 hover:border-gray-600/50 shadow-lg relative">
                  <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                    {/* Video/Image Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${BASE_URL}${video.video_url as string}`}
                      alt={video.title as string}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteVideo(video.id as string)
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
                    <h4 className="text-white font-medium text-sm line-clamp-2 mb-2">{video.title as string}</h4>
                    <div className="flex items-center justify-between text-gray-400 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {(video.views_count as number) || 0}
                        </span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{(video.likes_count as number) || 0}</span>
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
                      // eslint-disable-next-line @next/next/no-img-element
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

              {/* Description */}
              <div>
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={200}
                  className="w-full bg-gray-800/80 backdrop-blur-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700/50 hover:border-gray-600/50 transition-all text-sm resize-none"
                  placeholder="Tell your audience about yourself..."
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-gray-500 text-[10px]">This will appear on your profile</p>
                  <p className="text-gray-500 text-[10px]">{description.length}/200</p>
                </div>
              </div>

              {/* Community Giveback Control */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 shadow-lg">
                <div>
                  <label className="block text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">
                    💚 Community Giveback %
                  </label>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-bold">{givebackPercentage}%</span>
                      <span className="text-gray-500 text-xs">of earnings to community</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={givebackPercentage}
                      onChange={(e) => setGivebackPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-[10px] leading-relaxed">
                    Higher percentages build stronger community trust and token value.
                  </p>
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
                onClick={handleSaveSettings}
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