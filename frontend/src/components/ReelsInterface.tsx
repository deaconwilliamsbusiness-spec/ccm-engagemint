'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { PlayIcon, HeartIcon, MessageCircleIcon, ShareIcon, X, Lock, ShieldCheck, User, Users, Plus, Wallet } from 'lucide-react'
import { SimplifiedTradingModal } from './SimplifiedTradingModal'
import { CommunityPreviewModal } from './CommunityPreviewModal'
import { CommentsSection } from './CommentsSection'
import { SmartAuthModal } from './SmartAuthModal'
import { EnhancedAnalytics } from './EnhancedAnalytics'
import { TrendingCommunities } from './TrendingCommunities'
import { PublicCreatorProfile } from './PublicCreatorProfile'
import { useUser } from '@/context/UserContext'
import { formatNumber } from '@/lib/formatters'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const BASE_URL = API_BASE_URL.replace('/api', '')

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
  refreshTrigger?: number // When this changes, refresh the feed
}

// Convert API video data to VideoData format
const convertAPIVideoToVideoData = (apiVideo: Record<string, unknown>): VideoData => {
  const views = (apiVideo.views_count as number) || 0
  const likes = (apiVideo.likes_count as number) || 0
  const comments = (apiVideo.comments_count as number) || 0

  // Get token ticker from video metadata or fallback
  const tokenTicker = (apiVideo.creator_token as string) ||
                      (apiVideo.token_ticker as string) ||
                      (apiVideo.category as string) ||
                      'TOKEN'

  // Extract community data from API response if available
  const communityData = apiVideo.community_id ? {
    name: (apiVideo.community_name as string) || 'Community',
    members: formatNumber((apiVideo.community_members as number) || 0),
    logo: getLogoForCommunity((apiVideo.community_name as string) || '', tokenTicker),
    minimumTokens: (apiVideo.community_minimum_tokens as number) || 10
  } : {
    // Default community for videos without an explicit community
    name: `${tokenTicker} Community`,
    members: '1',
    logo: '🔥',
    minimumTokens: 10
  }

  return {
    id: apiVideo.id as string,
    creator: `@${apiVideo.username as string}`,
    creator_id: apiVideo.creator_id as string,
    creatorToken: tokenTicker,
    price: '$0.50',
    change: '+5.2%',
    title: apiVideo.title as string,
    views: formatNumber(views),
    likes: formatNumber(likes),
    comments: formatNumber(comments),
    videoUrl: `${BASE_URL}${apiVideo.video_url as string}`,
    isLiked: false,
    profileImage: (apiVideo.profile_image_url as string) || '👤',
    community: communityData,
    engagementData: [
      { time: '1h', views: Math.floor(views * 0.1), likes: Math.floor(likes * 0.1), comments: Math.floor(comments * 0.1) },
      { time: '2h', views: Math.floor(views * 0.25), likes: Math.floor(likes * 0.25), comments: Math.floor(comments * 0.25) },
      { time: '4h', views: Math.floor(views * 0.5), likes: Math.floor(likes * 0.5), comments: Math.floor(comments * 0.5) },
      { time: '8h', views: Math.floor(views * 0.75), likes: Math.floor(likes * 0.75), comments: Math.floor(comments * 0.75) },
      { time: '12h', views, likes, comments }
    ]
  }
}

// Helper function to get community logo based on name or token
const getLogoForCommunity = (communityName: string, tokenSymbol: string): string => {
  const name = (communityName || tokenSymbol).toUpperCase()
  const logoMap: { [key: string]: string } = {
    'SOLANA': '⚡',
    'SOL': '⚡',
    'PEPE': '🐸',
    'AI': '🤖',
    'AIBOT': '🤖',
    'DEFI': '💎',
    'NFT': '🎨',
    'NATURE': '🌿',
    'NATURECOIN': '🌿',
    'TECH': '💻',
    'MUSIC': '🎵',
    'FITNESS': '💪',
    'GAMING': '🎮',
    'ART': '🎨',
    'FOOD': '🍕',
    'TRAVEL': '✈️',
    'SPORTS': '⚽',
    'CRYPTO': '₿',
    'MEME': '😂'
  }

  // Try exact match
  if (logoMap[name]) return logoMap[name]

  // Try partial match
  for (const key in logoMap) {
    if (name.includes(key)) return logoMap[key]
  }

  // Default
  return '🔥'
}

export function ReelsInterface({ setActiveTab, refreshTrigger }: ReelsInterfaceProps) {
  const { user } = useUser()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [videos, setVideos] = useState<VideoData[]>([])
  const [isChartsOpen, setIsChartsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTradingOpen, setIsTradingOpen] = useState(false)
  const [isCommunityPageOpen, setIsCommunityPageOpen] = useState(false)
  const [isTrendingCommunitiesOpen, setIsTrendingCommunitiesOpen] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authAction, setAuthAction] = useState<string>('continue')
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [selectedCommunity, setSelectedCommunity] = useState<{
    name: string
    logo: string
    members: string
    token: string
  } | null>(null)
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [hasMoreVideos, setHasMoreVideos] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [communityPostFilter, setCommunityPostFilter] = useState<'creator' | 'community'>('creator')
  const [feedType, setFeedType] = useState<'discover' | 'newMints'>('discover')
  const [isPublicProfileOpen, setIsPublicProfileOpen] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState<{ username: string; id: string } | null>(null)

  // BYPASS: Set high token balances to bypass all token-gating (Solana not built yet)
  const [userTokenBalances] = useState({
    'KING': 999999,
    'QUEEN': 999999, 'DEFI': 999999, 'MEME': 999999, 'TRADE': 999999,
    'WEB3': 999999, 'ALPHA': 999999, 'DAO': 999999,
    'TOKEN': 999999,
    'NATURE': 999999, 'NATURECOIN': 999999
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTapRef = useRef<number>(0)
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch videos from API
  const fetchVideos = useCallback(async (reset = false) => {
    if (isLoadingVideos || (!hasMoreVideos && !reset)) return

    setIsLoadingVideos(true)
    try {
      const { videoAPI } = await import('@/lib/api')
      const offset = reset ? 0 : videos.length
      const response = await videoAPI.getAll(10, offset, feedType)

      if (response.success && response.data.videos) {
        const newVideos = response.data.videos.map(convertAPIVideoToVideoData)

        // Backend handles sorting based on feedType, no need to sort here

        if (reset) {
          setVideos(newVideos)
          setCurrentVideoIndex(0)
          setHasMoreVideos(true)
        } else {
          setVideos(prev => [...prev, ...newVideos])
        }

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
  }, [videos.length, hasMoreVideos, isLoadingVideos, feedType])

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

  // Reload videos when feed type changes
  useEffect(() => {
    if (hasLoadedOnce) {
      fetchVideos(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedType])

  // Refresh feed when refreshTrigger changes (after upload, etc)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && hasLoadedOnce) {
      fetchVideos(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  // Check if user is authenticated and execute action, or show auth modal
  const requireAuth = (action: () => void, actionName: string = 'continue') => {
    if (user) {
      action()
    } else {
      setAuthAction(actionName)
      setPendingAction(() => action)
      setIsAuthModalOpen(true)
    }
  }

  // Handle successful authentication
  const handleAuthSuccess = async (isNewUser: boolean) => {
    if (isNewUser) {
      // New user - check if they need onboarding
      try {
        const { interestsAPI } = await import('@/lib/api')
        const response = await interestsAPI.getUserPreferences()

        if (response.success && !response.data.preferences.onboarding_completed) {
          // User needs onboarding - this will be handled by parent page.tsx
          // Just refresh the page to trigger the onboarding check
          window.location.reload()
          return
        }
      } catch (error) {
        console.error('Failed to check onboarding:', error)
      }
    }

    // Execute pending action if any
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    } else {
      // No pending action, just refresh the feed
      fetchVideos(true)
    }
  }

  // When auth modal closes successfully (user logged in), execute pending action
  useEffect(() => {
    if (user && pendingAction) {
      pendingAction()
      setPendingAction(null)
      setIsAuthModalOpen(false)
    }
  }, [user, pendingAction])

  // Navigation functions
  const goToNext = useCallback(() => {
    if (scrollTimeoutRef.current) return

    setCurrentVideoIndex(prev => prev + 1)
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null
    }, 150) // ✅ FIXED: Reduced from 500ms to 150ms
  }, [])

  const goToPrevious = useCallback(() => {
    if (scrollTimeoutRef.current || currentVideoIndex === 0) return

    setCurrentVideoIndex(prev => prev - 1)
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null
    }, 150) // ✅ FIXED: Reduced from 500ms to 150ms
  }, [currentVideoIndex])

  // Wheel scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Don't handle wheel events if any modal is open
      if (isTradingOpen || isChartsOpen || isChatOpen || isMenuOpen || isCommunityPageOpen || isTrendingCommunitiesOpen) return

      e.preventDefault()
      if (Math.abs(e.deltaY) < 10) return // ✅ FIXED: Reduced from 30 to 10 for better sensitivity

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
  }, [goToNext, goToPrevious, isTradingOpen, isChartsOpen, isChatOpen, isMenuOpen, isCommunityPageOpen, isTrendingCommunitiesOpen])

  // Touch scrolling
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY) return

    // Don't handle touch events if any modal is open
    if (isTradingOpen || isChartsOpen || isChatOpen || isMenuOpen || isCommunityPageOpen || isTrendingCommunitiesOpen) {
      setTouchStartY(null)
      return
    }

    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY - touchEndY

    if (Math.abs(diff) > 30) { // ✅ FIXED: Reduced from 50px to 30px for better swipe sensitivity
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
      if (isTradingOpen || isChartsOpen || isChatOpen || isMenuOpen || isCommunityPageOpen || isTrendingCommunitiesOpen) return

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
  }, [goToNext, goToPrevious, isTradingOpen, isChartsOpen, isChatOpen, isMenuOpen, isCommunityPageOpen, isTrendingCommunitiesOpen])

  const toggleLike = () => {
    requireAuth(async () => {
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
    }, 'like')
  }

  const handleShare = () => {
    requireAuth(async () => {
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
    }, 'share')
  }

  const handleOpenCommunityFromDiscovery = (community: { name: string; logo: string; members: string; token: string }) => {
    requireAuth(() => {
      setSelectedCommunity(community)
      setIsTradingOpen(true)
    }, 'join community')
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
      requireAuth(() => setIsTradingOpen(true), 'trade')
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

          {user ? (
            <>
              <h2 className="text-white font-bold text-3xl mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Welcome, Creator!
              </h2>
              <p className="text-gray-300 text-base mb-2 leading-relaxed">
                You&apos;re the first one here. Start something amazing!
              </p>
              <p className="text-gray-400 text-sm mb-8">
                Upload your first video and become a pioneer in this community.
              </p>
              <button
                onClick={() => setActiveTab('trade')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
              >
                🎬 Upload Your First Video
              </button>
            </>
          ) : (
            <>
              <h2 className="text-white font-bold text-3xl mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Sign Up to Post
              </h2>
              <p className="text-gray-300 text-base mb-2 leading-relaxed">
                Join EngageMint and start creating content
              </p>
              <p className="text-gray-400 text-sm mb-8">
                Create an account to upload videos, mint tokens, and build your community.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
              >
                📝 Sign Up to Get Started
              </button>
            </>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Create. Share. Engage.</span>
          </div>
        </div>

        {/* Smart Auth Modal */}
        <SmartAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false)
            setPendingAction(null)
          }}
          action="sign up to post"
          onAuthSuccess={handleAuthSuccess}
        />
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
        touchAction: 'pan-y', // ✅ FIXED: Changed from 'none' to 'pan-y' for better touch handling
        overscrollBehavior: 'none',
        pointerEvents: (isTradingOpen || isCommunityPageOpen || isTrendingCommunitiesOpen || isPublicProfileOpen) ? 'none' : 'auto',
        WebkitOverflowScrolling: 'touch' // ✅ ADDED: Better iOS scroll performance
      }}
    >
      {/* Feed Type Toggle - TikTok Style */}
      {!isChartsOpen && !isTradingOpen && !isCommunityPageOpen && !isTrendingCommunitiesOpen && (
        <div className="absolute top-11 left-0 right-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-8 px-6 pointer-events-auto">
            <button
              onClick={() => setFeedType('discover')}
              className="relative transition-all"
            >
              <span className={`font-bold text-base transition-all ${
                feedType === 'discover'
                  ? 'text-white scale-110'
                  : 'text-gray-500 scale-100'
              }`}>
                Discover
              </span>
              {feedType === 'discover' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" />
              )}
            </button>
            <button
              onClick={() => setFeedType('newMints')}
              className="relative transition-all"
            >
              <span className={`font-bold text-base transition-all ${
                feedType === 'newMints'
                  ? 'text-white scale-110'
                  : 'text-gray-500 scale-100'
              }`}>
                New Mints
              </span>
              {feedType === 'newMints' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </div>
        </div>
      )}

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
            // eslint-disable-next-line @next/next/no-img-element
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
          {!isChartsOpen && !isTradingOpen && !isCommunityPageOpen && !isTrendingCommunitiesOpen && (
            <div className="absolute top-6 left-6 z-50">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-all hover:scale-110 shadow-2xl"
              >
                <Image src="/mint-logo.png" alt="EngageMint" width={40} height={40} className="rounded-full" />
              </button>
            </div>
          )}

          {/* Bottom Section: Description (Instagram Style - Free Floating) */}
          {!isChartsOpen && !isTradingOpen && !isCommunityPageOpen && !isTrendingCommunitiesOpen && (
            <div className="absolute bottom-8 left-0 right-0 z-40 px-4">
              <div className="space-y-3">
                {/* Creator Info & Description - Free Floating */}
                <div className="space-y-1.5">
                  {/* Creator Name Row */}
                  <div className="flex items-center gap-2 flex-wrap" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCreator({
                          username: currentVideo.creator,
                          id: currentVideo.creator_id
                        })
                        setIsPublicProfileOpen(true)
                      }}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-base">{currentVideo.profileImage || '👤'}</span>
                      </div>
                      <span className="text-white font-bold text-sm">{currentVideo.creator}</span>
                    </button>
                    {user && user.id === currentVideo.creator_id && (
                      <span className="bg-green-500/30 backdrop-blur-sm border border-green-400/50 rounded-full px-2 py-0.5 text-green-400 text-[9px] font-bold">
                        YOUR POST
                      </span>
                    )}
                  </div>

                  {/* Description Text */}
                  <p className="text-white text-sm leading-snug" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>
                    {currentVideo.title}
                  </p>

                  {/* Token Info Row */}
                  <div className="flex items-center gap-2 flex-wrap" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>
                    <span className="text-green-400 font-bold text-xs">{currentVideo.creatorToken}</span>
                    <span className={`font-bold text-xs ${currentVideo.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {currentVideo.change} 1H
                    </span>
                    <span className="text-gray-300 text-xs">• {currentVideo.views} views</span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-stretch gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      requireAuth(() => setIsTradingOpen(true), 'trade')
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 rounded-lg py-3 px-4 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <span className="text-base leading-none">💰</span>
                    <span className="text-black font-bold text-sm leading-none">Buy</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      requireAuth(() => setIsChartsOpen(true), 'view analytics')
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 rounded-lg py-3 px-4 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <svg className="w-4 h-4 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-black font-bold text-sm leading-none">Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu Dropdown */}
          {isMenuOpen && (
            <>
              {/* Backdrop with subtle fade */}
              <div
                className="fixed inset-0 z-45 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={() => setIsMenuOpen(false)}
                style={{ pointerEvents: 'auto' }}
              />

              {/* Dropdown Menu - slides from MINT button */}
              <div
                className="absolute top-28 left-6 z-50 w-80 animate-in fade-in slide-in-from-top-4 duration-300"
                style={{ pointerEvents: 'auto' }}
              >
                <div
                  className="relative bg-gradient-to-br from-gray-900/98 via-gray-800/98 to-gray-900/98 backdrop-blur-2xl border-2 border-green-500/40 rounded-3xl p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(34,197,94,0.3)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Decorative glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-600/20 rounded-3xl blur-xl -z-10" />

                  <div className="space-y-3">
                    {/* Profile */}
                    <button
                      onClick={() => requireAuth(() => { setActiveTab('creator'); setIsMenuOpen(false) }, 'view profile')}
                      className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl py-3.5 px-4 transition-all duration-300 active:scale-95 shadow-[0_8px_20px_-6px_rgba(34,197,94,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(34,197,94,0.6)] flex items-center justify-start gap-3 min-h-[48px] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="relative z-10 bg-green-600/40 backdrop-blur-sm rounded-full p-2 group-hover:bg-green-600/60 transition-all duration-300">
                        <User className="w-5 h-5 text-black group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-black font-bold text-sm leading-none relative z-10 group-hover:tracking-wide transition-all duration-300">Profile</span>
                    </button>

                    {/* Community */}
                    <button
                      onClick={() => requireAuth(() => { setIsTrendingCommunitiesOpen(true); setIsMenuOpen(false) }, 'browse communities')}
                      className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl py-3.5 px-4 transition-all duration-300 active:scale-95 shadow-[0_8px_20px_-6px_rgba(34,197,94,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(34,197,94,0.6)] flex items-center justify-start gap-3 min-h-[48px] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="relative z-10 bg-green-600/40 backdrop-blur-sm rounded-full p-2 group-hover:bg-green-600/60 transition-all duration-300 flex items-center justify-center w-9 h-9">
                        <span className="text-base leading-none group-hover:scale-110 transition-transform duration-300">👥</span>
                      </div>
                      <span className="text-black font-bold text-sm leading-none relative z-10 group-hover:tracking-wide transition-all duration-300">Community</span>
                    </button>

                    {/* Mint */}
                    <button
                      onClick={() => requireAuth(() => { setActiveTab('trade'); setIsMenuOpen(false) }, 'mint content')}
                      className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl py-3.5 px-4 transition-all duration-300 active:scale-95 shadow-[0_8px_20px_-6px_rgba(34,197,94,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(34,197,94,0.6)] flex items-center justify-start gap-3 min-h-[48px] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="relative z-10 bg-green-600/40 backdrop-blur-sm rounded-full p-2 group-hover:bg-green-600/60 transition-all duration-300">
                        <Plus className="w-5 h-5 text-black group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
                      </div>
                      <span className="text-black font-bold text-sm leading-none relative z-10 group-hover:tracking-wide transition-all duration-300">Mint</span>
                    </button>

                    {/* Wallet */}
                    <button
                      onClick={() => requireAuth(() => { setIsMenuOpen(false) }, 'view wallet')}
                      className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl py-3.5 px-4 transition-all duration-300 active:scale-95 shadow-[0_8px_20px_-6px_rgba(34,197,94,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(34,197,94,0.6)] flex items-center justify-start gap-3 min-h-[48px] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="relative z-10 bg-green-600/40 backdrop-blur-sm rounded-full p-2 group-hover:bg-green-600/60 transition-all duration-300">
                        <Wallet className="w-5 h-5 text-black group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-black font-bold text-sm leading-none relative z-10 group-hover:tracking-wide transition-all duration-300">Wallet</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Right Side Actions - Instagram Style */}
          {!isChartsOpen && !isTradingOpen && !isCommunityPageOpen && !isTrendingCommunitiesOpen && (
            <div className="absolute right-4 bottom-40 z-40 flex flex-col gap-6 items-center">
              {/* Like */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={toggleLike}
                  className="transition-transform active:scale-90 group"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                >
                  <HeartIcon
                    className={`w-7 h-7 transition-all ${
                      currentVideo.isLiked
                        ? 'text-green-500 fill-green-500'
                        : 'text-white group-hover:text-green-400'
                    }`}
                    strokeWidth={2}
                  />
                </button>
                <span className="text-white text-xs font-semibold" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}>
                  {currentVideo.likes}
                </span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => requireAuth(() => setIsChatOpen(true), 'comment')}
                  className="transition-transform active:scale-90 group"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                >
                  <MessageCircleIcon
                    className="w-7 h-7 text-white group-hover:text-green-400 transition-colors"
                    strokeWidth={2}
                  />
                </button>
                <span className="text-white text-xs font-semibold" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}>
                  {currentVideo.comments}
                </span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleShare}
                  className="transition-transform active:scale-90 group"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                >
                  <ShareIcon
                    className="w-7 h-7 text-white group-hover:text-green-400 transition-colors"
                    strokeWidth={2}
                  />
                </button>
                <span className="text-white text-xs font-semibold" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}>
                  Share
                </span>
              </div>

              {/* Community */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => requireAuth(() => setIsCommunityPageOpen(true), 'view community')}
                  className="transition-transform active:scale-90 group"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                >
                  <Users
                    className={`w-7 h-7 transition-all ${isCommunityPageOpen ? 'text-green-400' : 'text-white group-hover:text-green-400'}`}
                    strokeWidth={2}
                  />
                </button>
                <span className="text-white text-xs font-semibold" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}>
                  {currentVideo.community.name.split(' ')[0]}
                </span>
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

      {/* Enhanced Analytics Dashboard */}
      <EnhancedAnalytics
        isOpen={isChartsOpen}
        onClose={() => setIsChartsOpen(false)}
        videoId={currentVideo.id}
        videoData={currentVideo}
      />

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
        <SimplifiedTradingModal
          onClose={() => {
            setIsTradingOpen(false)
            setSelectedCommunity(null)
          }}
          communityName={selectedCommunity?.name || currentVideo.community.name}
          communityLogo={selectedCommunity?.logo || currentVideo.community.logo || '🔥'}
          creatorToken={selectedCommunity?.token || currentVideo.creatorToken}
        />
      )}

      {/* Community Preview Modal */}
      {isCommunityPageOpen && (
        <CommunityPreviewModal
          onClose={() => {
            setIsCommunityPageOpen(false)
            setSelectedCommunity(null)
          }}
          communityName={selectedCommunity?.name || currentVideo.community.name}
          communityLogo={selectedCommunity?.logo || currentVideo.community.logo || '🔥'}
          communityMembers={selectedCommunity?.members || currentVideo.community.members}
          creatorToken={selectedCommunity?.token || currentVideo.creatorToken}
          creatorName={selectedCommunity?.name || currentVideo.creator}
          minimumTokens={currentVideo.community?.minimumTokens || 10}
          userTokenBalance={userTokenBalances[(selectedCommunity?.token || currentVideo.creatorToken) as keyof typeof userTokenBalances] || 999999}
          isAdmin={user?.isAdmin}
          onBuyTokens={() => {
            setIsCommunityPageOpen(false)
            setIsTradingOpen(true)
          }}
        />
      )}

      {/* Trending Communities Modal */}
      {isTrendingCommunitiesOpen && (
        <TrendingCommunities
          onClose={() => setIsTrendingCommunitiesOpen(false)}
          onOpenCommunity={(community) => {
            setSelectedCommunity(community)
            setIsCommunityPageOpen(true)
          }}
        />
      )}

      {/* Public Creator Profile Modal */}
      {isPublicProfileOpen && selectedCreator && (
        <PublicCreatorProfile
          onClose={() => {
            setIsPublicProfileOpen(false)
            setSelectedCreator(null)
          }}
          creatorUsername={selectedCreator.username}
          creatorId={selectedCreator.id}
        />
      )}

      {/* Smart Auth Modal */}
      <SmartAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          setPendingAction(null)
        }}
        action={authAction}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
