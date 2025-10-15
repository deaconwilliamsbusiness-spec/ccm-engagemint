'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { PlayIcon, HeartIcon, MessageCircleIcon, ShareIcon, X, Lock, ShieldCheck, User, Users, Home, Menu } from 'lucide-react'
import { TradingModal } from './TradingModal'
import { CommunityDiscovery } from './CommunityDiscovery'
import { CommentsSection } from './CommentsSection'
import { useUser } from '@/context/UserContext'

interface EngagementData {
  time: string
  views: number
  likes: number
  comments: number
}

interface VideoData {
  id: string
  creator: string
  creator_id: string
  creatorToken: string
  price: string
  change: string
  title: string
  views: string
  likes: string
  comments: string
  videoUrl?: string
  isLiked?: boolean
  profileImage?: string
  community: {
    name: string
    members: string
    logo?: string
    minimumTokens?: number
  }
  engagementData: EngagementData[]
}

interface ReelsInterfaceProps {
  setActiveTab: (tab: string) => void
}

// Helper function to format numbers
const formatNumber = (num: number) => {
  // Ensure we always return a string, even for 0
  if (num === 0) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Convert API video data to VideoData format
const convertAPIVideoToVideoData = (apiVideo: any): VideoData => {
  const views = apiVideo.views_count || 0
  const likes = apiVideo.likes_count || 0
  const comments = apiVideo.comments_count || 0

  return {
    id: apiVideo.id,
    creator: `@${apiVideo.username}`,
    creator_id: apiVideo.creator_id,
    creatorToken: apiVideo.creator_token || 'TOKEN',
    price: '$0.50',
    change: '+5.2%',
    title: apiVideo.title,
    views: formatNumber(views),
    likes: formatNumber(likes),
    comments: formatNumber(comments),
    videoUrl: `http://localhost:5000${apiVideo.video_url}`,
    isLiked: false,
    profileImage: apiVideo.profile_image_url || '👤',
    community: {
      name: 'Community',
      members: '1K',
      logo: '🔥',
      minimumTokens: 10
    },
    engagementData: [
      { time: '1h', views: Math.floor(views * 0.1), likes: Math.floor(likes * 0.1), comments: Math.floor(comments * 0.1) },
      { time: '2h', views: Math.floor(views * 0.25), likes: Math.floor(likes * 0.25), comments: Math.floor(comments * 0.25) },
      { time: '4h', views: Math.floor(views * 0.5), likes: Math.floor(likes * 0.5), comments: Math.floor(comments * 0.5) },
      { time: '8h', views: Math.floor(views * 0.75), likes: Math.floor(likes * 0.75), comments: Math.floor(comments * 0.75) },
      { time: '12h', views, likes, comments }
    ]
  }
}

export function ReelsInterface({ setActiveTab }: ReelsInterfaceProps) {
  const { user } = useUser()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [videos, setVideos] = useState<VideoData[]>([])
  const [isChartsOpen, setIsChartsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTradingOpen, setIsTradingOpen] = useState(false)
  const [isEngageDiscoveryOpen, setIsEngageDiscoveryOpen] = useState(false)
  const [isCommunityPageOpen, setIsCommunityPageOpen] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<{
    name: string
    logo: string
    members: string
    token: string
  } | null>(null)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [hasMoreVideos, setHasMoreVideos] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const [userTokenBalances] = useState({
    'KING': 1000, // You're the creator, you have plenty of your own token
    'QUEEN': 0, 'DEFI': 0, 'MEME': 0, 'TRADE': 0,
    'WEB3': 0, 'ALPHA': 0, 'DAO': 0,
    'TOKEN': 100
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTapRef = useRef<number>(0)
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch videos from API
  const fetchVideos = useCallback(async () => {
    if (isLoadingVideos || !hasMoreVideos) return

    setIsLoadingVideos(true)
    try {
      const { videoAPI } = await import('@/lib/api')
      const response = await videoAPI.getAll(10, videos.length)

      if (response.success && response.data.videos) {
        const newVideos = response.data.videos.map(convertAPIVideoToVideoData)
        setVideos(prev => [...prev, ...newVideos])
        setHasLoadedOnce(true)

        // If we got fewer than requested, we've reached the end
        if (newVideos.length < 10) {
          setHasMoreVideos(false)
        }
      } else {
        setHasLoadedOnce(true)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      setHasLoadedOnce(true)
    } finally {
      setIsLoadingVideos(false)
    }
  }, [videos.length, hasMoreVideos, isLoadingVideos])

  // Initial load
  useEffect(() => {
    fetchVideos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Infinite scroll - load more videos
  useEffect(() => {
    if (currentVideoIndex >= videos.length - 3 && hasMoreVideos && !isLoadingVideos) {
      fetchVideos()
    }
  }, [currentVideoIndex, videos.length, hasMoreVideos, isLoadingVideos, fetchVideos])


  // Navigation functions
  const goToNext = useCallback(() => {
    if (scrollTimeoutRef.current) return

    setCurrentVideoIndex(prev => prev + 1)
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null
    }, 500)
  }, [])

  const goToPrevious = useCallback(() => {
    if (scrollTimeoutRef.current || currentVideoIndex === 0) return

    setCurrentVideoIndex(prev => prev - 1)
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null
    }, 500)
  }, [currentVideoIndex])

  // Wheel scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Don't handle wheel events if any modal is open
      if (isTradingOpen || isChartsOpen || isChatOpen || isMenuOpen || isEngageDiscoveryOpen || isCommunityPageOpen) return

      e.preventDefault()
      if (Math.abs(e.deltaY) < 30) return

      if (e.deltaY > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [goToNext, goToPrevious, isTradingOpen, isChartsOpen, isChatOpen, isMenuOpen, isEngageDiscoveryOpen, isCommunityPageOpen])

  // Touch scrolling
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY) return

    // Don't handle touch events if any modal is open
    if (isTradingOpen || isChartsOpen || isChatOpen || isMenuOpen || isEngageDiscoveryOpen || isCommunityPageOpen) {
      setTouchStartY(null)
      return
    }

    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY - touchEndY

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }

    setTouchStartY(null)
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events if any modal is open
      if (isTradingOpen || isChartsOpen || isChatOpen || isMenuOpen || isEngageDiscoveryOpen || isCommunityPageOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious, isTradingOpen, isChartsOpen, isChatOpen, isMenuOpen, isEngageDiscoveryOpen, isCommunityPageOpen])

  const toggleLike = async () => {
    const video = videos[currentVideoIndex]
    if (!video) return

    // Optimistically update UI
    setVideos(prev => prev.map((v, index) => {
      if (index === currentVideoIndex) {
        const newIsLiked = !v.isLiked
        const currentLikes = parseInt(v.likes.replace(/[^\d]/g, '')) || 0
        const newLikeCount = newIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)

        const formatLikes = (count: number) => {
          if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
          if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
          return count.toString()
        }

        return {
          ...v,
          isLiked: newIsLiked,
          likes: formatLikes(newLikeCount)
        }
      }
      return v
    }))

    // Call backend API
    try {
      const { videoAPI } = await import('@/lib/api')
      await videoAPI.like(video.id)
    } catch (error) {
      console.error('Failed to like video:', error)
      // Revert on error
      setVideos(prev => prev.map((v, index) => {
        if (index === currentVideoIndex) {
          return video // Revert to original
        }
        return v
      }))
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/video/${currentVideo.id}`
    const shareData = {
      title: currentVideo.title,
      text: `Check out this video by ${currentVideo.creator}!`,
      url: url
    }

    // Try Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setShowCopiedToast(true)
        setTimeout(() => setShowCopiedToast(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleOpenCommunityFromDiscovery = (community: { name: string; logo: string; members: string; token: string }) => {
    setSelectedCommunity(community)
    setIsTradingOpen(true)
  }

  // Double-tap handler for buy page (like TikTok/Instagram)
  const handleVideoTap = () => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected - open buy page
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
        tapTimeoutRef.current = null
      }
      setIsTradingOpen(true)
      lastTapRef.current = 0
    } else {
      // Single tap - wait to see if there's a second tap
      lastTapRef.current = now
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
      }
      tapTimeoutRef.current = setTimeout(() => {
        // No second tap, toggle play/pause
        setIsPlaying(prev => !prev)
        tapTimeoutRef.current = null
      }, 300)
    }
  }

  const currentVideo = videos[currentVideoIndex]

  // Loading state
  if (!hasLoadedOnce) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold text-lg">Loading videos...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (hasLoadedOnce && videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative text-center max-w-md">
          {/* Icon with gradient background */}
          <div className="w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/10">
            <div className="text-6xl">🎬</div>
          </div>

          <h2 className="text-white font-bold text-3xl mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Be the First!
          </h2>
          <p className="text-gray-300 text-base mb-2 leading-relaxed">
            No videos yet. Start the party!
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Create and upload your first video to get this feed started.
          </p>

          <button
            onClick={() => setActiveTab('trade')}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
          >
            🎬 Upload Your First Video
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Create. Share. Engage.</span>
          </div>
        </div>
      </div>
    )
  }

  // Check if currentVideo exists
  if (!currentVideo) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'none',
        overscrollBehavior: 'none',
        pointerEvents: (isTradingOpen || isEngageDiscoveryOpen || isCommunityPageOpen) ? 'none' : 'auto'
      }}
    >
      {/* Video Container */}
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Play/Pause overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {!isPlaying && (
            <div className="bg-black/50 rounded-full p-8 animate-fade-in">
              <PlayIcon className="w-16 h-16 text-white" />
            </div>
          )}
        </div>

        {/* Video Content */}
        <div className="relative w-full max-w-md h-full bg-gray-900 border-x border-gray-800 overflow-hidden">
          {/* Video/Image Element */}
          {currentVideo.videoUrl?.endsWith('.mp4') || currentVideo.videoUrl?.endsWith('.webm') || currentVideo.videoUrl?.endsWith('.mov') ? (
            <video
              key={currentVideo.id}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              src={currentVideo.videoUrl}
              loop
              playsInline
              autoPlay={isPlaying}
              muted
              ref={(el) => {
                if (el && isPlaying) {
                  el.play().catch(() => {})
                } else if (el && !isPlaying) {
                  el.pause()
                }
              }}
            />
          ) : (
            <img
              key={currentVideo.id}
              src={currentVideo.videoUrl}
              alt={currentVideo.title}
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          )}

          {/* Tap to play/pause, double-tap to buy */}
          <div className="absolute inset-0 z-20 cursor-pointer" onClick={handleVideoTap} />

          {/* Gradients */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent z-30"></div>

          {/* Home Button - Top Left */}
          {!isMenuOpen && !isChartsOpen && !isTradingOpen && !isEngageDiscoveryOpen && !isCommunityPageOpen && (
            <div className="absolute top-6 left-6 z-40">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-full p-5 transition-all hover:scale-110 shadow-2xl"
              >
                <Home className="w-8 h-8 text-black" />
              </button>
            </div>
          )}

          {/* Bottom Section: Description Card with Action Buttons */}
          {!isMenuOpen && !isChartsOpen && !isTradingOpen && !isEngageDiscoveryOpen && !isCommunityPageOpen && (
            <div className="absolute bottom-8 left-0 right-0 z-40 px-6">
              <div className="bg-black/40 backdrop-blur-sm rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden">
                {/* Description Section */}
                <div className="p-4">
                  {/* Creator Name */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/20">
                      <span className="text-lg">{currentVideo.profileImage || '👤'}</span>
                    </div>
                    <span className="text-white font-bold text-base">{currentVideo.creator}</span>
                    {user && user.id === currentVideo.creator_id && (
                      <span className="bg-green-500/20 border border-green-500/50 rounded-full px-2 py-0.5 text-green-400 text-[10px] font-bold">
                        YOUR POST
                      </span>
                    )}
                    <span className="text-green-400 font-bold text-sm">{currentVideo.creatorToken}</span>
                    <span className={`font-bold text-xs ${currentVideo.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {currentVideo.change} 1H
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-white/90 text-sm leading-relaxed mb-3">
                    {currentVideo.title}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsTradingOpen(true)
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl py-3 px-4 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      <span className="text-base block w-5 h-5 flex items-center justify-center">💰</span>
                      <span className="text-black font-bold text-sm">Buy</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsChartsOpen(true)
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 rounded-xl py-3 px-4 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-black font-bold text-sm">Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu Modal */}
          {isMenuOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="bg-gray-900/95 backdrop-blur-sm border border-green-500/50 rounded-xl p-6 w-[90vw] max-w-[320px] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Menu className="w-5 h-5" />
                    Navigation
                  </h3>
                  <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => { setActiveTab('creator'); setIsMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-green-500/20 rounded-xl transition-all group"
                  >
                    <div className="bg-green-500 rounded-full p-3 flex items-center justify-center">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium group-hover:text-green-400">Creator Profile</div>
                      <div className="text-gray-400 text-xs">Analytics & Content Management</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('trade'); setIsMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-green-500/20 rounded-xl transition-all group"
                  >
                    <div className="bg-green-500 rounded-full p-3 flex items-center justify-center">
                      <Image src="/mint-menu-logo.png" alt="MINT" width={28} height={28} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium group-hover:text-green-400">MINT</div>
                      <div className="text-gray-400 text-xs">Create & Launch Tokens</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setIsEngageDiscoveryOpen(true); setIsMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-green-500/20 rounded-xl transition-all group"
                  >
                    <div className="bg-green-500 rounded-full p-3 flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium group-hover:text-green-400">ENGAGE</div>
                      <div className="text-gray-400 text-xs">Discover Communities</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          {!isMenuOpen && !isChartsOpen && !isTradingOpen && !isEngageDiscoveryOpen && !isCommunityPageOpen && (
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-4 items-center">
              {/* Like */}
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleLike}
                  className="bg-black/20 backdrop-blur-sm rounded-full p-3 transition-all hover:bg-black/40 hover:scale-110 group"
                >
                  <HeartIcon
                    className={`w-7 h-7 transition-all ${
                      currentVideo.isLiked
                        ? 'text-green-500 fill-green-500'
                        : 'text-white group-hover:text-green-500'
                    }`}
                  />
                </button>
                <span className="text-white text-xs font-bold mt-1">{currentVideo.likes}</span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-black/20 backdrop-blur-sm rounded-full p-3 transition-all hover:bg-black/40 hover:scale-110 group"
                >
                  <MessageCircleIcon className={`w-7 h-7 transition-all ${isChatOpen ? 'text-green-500' : 'text-white group-hover:text-green-500'}`} />
                </button>
                <span className="text-white text-xs font-bold mt-1">{currentVideo.comments}</span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleShare}
                  className="bg-black/20 backdrop-blur-sm rounded-full p-3 transition-all hover:bg-black/40 hover:scale-110 group"
                >
                  <ShareIcon className="w-7 h-7 text-white group-hover:text-green-500 transition-all" />
                </button>
                <span className="text-white text-xs font-bold mt-1">Share</span>
              </div>

              {/* Community */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setIsCommunityPageOpen(true)}
                  className="bg-black/20 backdrop-blur-sm rounded-full p-3 transition-all hover:bg-black/40 hover:scale-110 group"
                >
                  <Users className={`w-7 h-7 transition-all ${isCommunityPageOpen ? 'text-green-500' : 'text-white group-hover:text-green-500'}`} />
                </button>
                <span className="text-white text-xs font-bold mt-1">{currentVideo.community.name.split(' ')[0]}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copied Toast */}
      {showCopiedToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Link Copied!
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Analytics Charts Modal - Compact Like Navigation */}
      {isChartsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-green-500/30 rounded-xl p-4 w-[90vw] max-w-[320px] shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-base">📊 Analytics</h3>
              <button onClick={() => setIsChartsOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Engagement Chart */}
              <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">Engagement</h4>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <div className="h-32 relative">
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border-t border-gray-700/50"></div>
                      ))}
                    </div>

                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="url(#gradient-engagement)"
                        strokeWidth="2"
                        points={currentVideo.engagementData.map((point, index) => {
                          const x = (index / (currentVideo.engagementData.length - 1)) * 100
                          const y = 100 - (point.views / Math.max(...currentVideo.engagementData.map(d => d.views)) * 80)
                          return `${x}%,${y}%`
                        }).join(' ')}
                      />
                      <defs>
                        <linearGradient id="gradient-engagement" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-center">
                    <div className="text-blue-400 font-bold text-xs">{currentVideo.views}</div>
                    <div className="text-gray-400 text-[10px]">Views</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                    <div className="text-red-400 font-bold text-xs">{currentVideo.likes}</div>
                    <div className="text-gray-400 text-[10px]">Likes</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
                    <div className="text-yellow-400 font-bold text-xs">{currentVideo.comments}</div>
                    <div className="text-gray-400 text-[10px]">Comments</div>
                  </div>
                </div>
              </div>

              {/* Token Chart */}
              <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">💰 ${currentVideo.creatorToken}</h4>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <div className="h-28 relative">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <path
                        d="M 0,100 Q 25,80 50,50 T 100,10"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                      />
                      <path
                        d="M 0,100 Q 25,80 50,50 T 100,10 L 100,100 Z"
                        fill="url(#gradient-bonding)"
                        opacity="0.2"
                      />
                      <defs>
                        <linearGradient id="gradient-bonding" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2">
                    <div className="text-gray-400 text-[10px]">Price</div>
                    <div className="text-white font-bold text-xs">{currentVideo.price}</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2">
                    <div className="text-gray-400 text-[10px]">24h</div>
                    <div className={`font-bold text-xs ${currentVideo.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {currentVideo.change}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <CommentsSection
        videoId={currentVideo.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onCommentPosted={() => {
          // Update comment count when a new comment is posted
          setVideos(prev => prev.map((v, index) => {
            if (index === currentVideoIndex) {
              const currentComments = parseInt(v.comments.replace(/[^\d]/g, '')) || 0
              const newCommentCount = currentComments + 1
              return {
                ...v,
                comments: formatNumber(newCommentCount)
              }
            }
            return v
          }))
        }}
        onCommentDeleted={() => {
          // Update comment count when a comment is deleted
          setVideos(prev => prev.map((v, index) => {
            if (index === currentVideoIndex) {
              const currentComments = parseInt(v.comments.replace(/[^\d]/g, '')) || 0
              const newCommentCount = Math.max(0, currentComments - 1)
              return {
                ...v,
                comments: formatNumber(newCommentCount)
              }
            }
            return v
          }))
        }}
      />

      {/* Trading Modal */}
      {isTradingOpen && (
        <TradingModal
          onClose={() => {
            setIsTradingOpen(false)
            setSelectedCommunity(null)
          }}
          communityName={selectedCommunity?.name || currentVideo.community.name}
          communityLogo={selectedCommunity?.logo || currentVideo.community.logo || '🔥'}
          communityMembers={selectedCommunity?.members || currentVideo.community.members}
          creatorToken={selectedCommunity?.token || currentVideo.creatorToken}
        />
      )}

      {/* Community Discovery Modal */}
      {isEngageDiscoveryOpen && (
        <CommunityDiscovery
          onClose={() => setIsEngageDiscoveryOpen(false)}
          onOpenCommunity={handleOpenCommunityFromDiscovery}
        />
      )}

      {/* Community Preview Modal */}
      {isCommunityPageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsCommunityPageOpen(false)}
            style={{ pointerEvents: 'auto' }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-gray-900 rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-gray-800 mx-4" style={{ pointerEvents: 'auto', maxHeight: '90vh' }}>
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-b border-gray-800 px-6 py-5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">{currentVideo.community.logo}</div>
                  <div>
                    <h2 className="text-white font-bold text-xl">{currentVideo.community.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-400 text-sm">{currentVideo.community.members} members</p>
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-full px-2 py-0.5">
                        <Lock className="w-3 h-3 text-yellow-400 inline" />
                        <span className="text-yellow-400 text-[10px] font-bold ml-1">TOKEN GATED</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsCommunityPageOpen(false)}
                  className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Token Gate Banner */}
              {userTokenBalances[currentVideo.creatorToken as keyof typeof userTokenBalances] >= (currentVideo.community.minimumTokens || 0) ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-green-400 font-bold text-sm">Access Granted</h4>
                    <p className="text-gray-300 text-xs">
                      You hold {userTokenBalances[currentVideo.creatorToken as keyof typeof userTokenBalances]} ${currentVideo.creatorToken} tokens
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-yellow-400 font-bold text-sm">Community Locked</h4>
                    <p className="text-gray-300 text-xs">
                      Hold {currentVideo.community.minimumTokens || 0} ${currentVideo.creatorToken} to unlock access
                    </p>
                  </div>
                </div>
              )}

              {/* Preview Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-base">Community Preview</h3>
                  <span className="text-gray-400 text-xs">{userTokenBalances[currentVideo.creatorToken as keyof typeof userTokenBalances] >= (currentVideo.community.minimumTokens || 0) ? 'Full Access' : 'Limited'}</span>
                </div>

                {/* Post Previews */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 relative overflow-hidden">
                      {/* Locked Overlay for non-members */}
                      {userTokenBalances[currentVideo.creatorToken as keyof typeof userTokenBalances] < (currentVideo.community.minimumTokens || 0) && i > 1 && (
                        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                          <div className="text-center">
                            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400 text-xs font-bold">Members Only</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{currentVideo.creator[1]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold text-sm">{currentVideo.creator}</span>
                            <span className="text-gray-500 text-xs">• 2h ago</span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {i === 1 ? `Just shared exclusive alpha on ${currentVideo.creatorToken} strategy 🔥`
                              : i === 2 ? 'New video dropping tomorrow - members get early access!'
                              : 'Community call scheduled for Friday 📞'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-gray-400 text-xs">
                            <span className="flex items-center gap-1">
                              <HeartIcon className="w-4 h-4" />
                              {Math.floor(Math.random() * 50 + 20)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircleIcon className="w-4 h-4" />
                              {Math.floor(Math.random() * 20 + 5)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
                  <div className="text-gray-400 text-[10px] mb-1">Posts</div>
                  <div className="text-white font-bold text-base">247</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
                  <div className="text-gray-400 text-[10px] mb-1">Members</div>
                  <div className="text-white font-bold text-base">{currentVideo.community.members}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
                  <div className="text-gray-400 text-[10px] mb-1">Min. ${currentVideo.creatorToken}</div>
                  <div className="text-green-400 font-bold text-base">{currentVideo.community.minimumTokens || 0}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {userTokenBalances[currentVideo.creatorToken as keyof typeof userTokenBalances] < (currentVideo.community.minimumTokens || 0) && (
                  <button
                    onClick={() => {
                      setIsCommunityPageOpen(false)
                      setIsTradingOpen(true)
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">💰</span>
                    <span>Buy ${currentVideo.creatorToken} to Join</span>
                  </button>
                )}
                <button
                  onClick={() => setIsCommunityPageOpen(false)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all border border-gray-700"
                >
                  Close Preview
                </button>
              </div>

              {/* Info Banner */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <p className="text-gray-400 text-xs leading-relaxed text-center">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Most communities are token-gated. Hold the required amount of creator tokens to unlock exclusive content, posts, and discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
