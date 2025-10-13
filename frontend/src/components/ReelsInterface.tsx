'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { PlayIcon, HeartIcon, MessageCircleIcon, ShareIcon, X, Lock, ShieldCheck, User, Users, Home, Menu } from 'lucide-react'
import { TradingModal } from './TradingModal'

interface EngagementData {
  time: string
  views: number
  likes: number
  comments: number
}

interface VideoData {
  id: string
  creator: string
  creatorToken: string
  price: string
  change: string
  title: string
  views: string
  likes: string
  comments: string
  videoUrl?: string
  isLiked?: boolean
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

// Base video templates for infinite generation
const videoTemplates = [
  {
    creator: '@cryptoking',
    creatorToken: 'KING',
    community: { name: 'SOL Community', members: '45.2K', logo: '🔥', minimumTokens: 50 }
  },
  {
    creator: '@nftqueen',
    creatorToken: 'QUEEN',
    community: { name: 'AI Community', members: '32.8K', logo: '🤖', minimumTokens: 25 }
  },
  {
    creator: '@defimaster',
    creatorToken: 'DEFI',
    community: { name: 'DeFi Community', members: '28.5K', logo: '💎', minimumTokens: 100 }
  },
  {
    creator: '@memecoin_guru',
    creatorToken: 'MEME',
    community: { name: 'PEPE Community', members: '67.3K', logo: '🐸', minimumTokens: 1000 }
  },
  {
    creator: '@trader_pro',
    creatorToken: 'TRADE',
    community: { name: 'Trading Community', members: '89.1K', logo: '📈', minimumTokens: 200 }
  },
  {
    creator: '@web3wizard',
    creatorToken: 'WEB3',
    community: { name: 'Web3 Community', members: '56.4K', logo: '🌐', minimumTokens: 75 }
  },
  {
    creator: '@nft_alpha',
    creatorToken: 'ALPHA',
    community: { name: 'Alpha Community', members: '91.2K', logo: '🎯', minimumTokens: 150 }
  },
  {
    creator: '@dao_builder',
    creatorToken: 'DAO',
    community: { name: 'DAO Community', members: '43.7K', logo: '🏛️', minimumTokens: 300 }
  }
]

const videoTitles = [
  'Why Solana will 10x in 2025 - Deep Analysis 🚀',
  'Building the metaverse with AI and blockchain 🔮',
  'DeFi strategies that actually work in 2025 💰',
  'New meme coin about to explode 🌙',
  'Reading crypto charts like a pro 📈',
  'The future of NFTs in gaming 🎮',
  'How to find 100x gems in crypto 💎',
  'Best airdrop strategies for 2025 🪂',
  'Layer 2 solutions explained simply 🔗',
  'Tokenomics 101 - What makes a good token 📊',
  'DAO governance best practices 🗳️',
  'Crypto security tips you NEED to know 🔒',
  'Market analysis - Bull run incoming? 📈',
  'Top 5 Web3 projects to watch 👀',
  'How I made $10k from airdrops 💸'
]

const videoUrls = [
  'https://player.vimeo.com/external/522606146.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
  'https://player.vimeo.com/external/522606122.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
  'https://player.vimeo.com/external/522606097.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
  'https://player.vimeo.com/external/522606071.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
  'https://player.vimeo.com/external/522606043.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175'
]

// Generate a random video dynamically
const generateVideo = (id: number): VideoData => {
  const template = videoTemplates[Math.floor(Math.random() * videoTemplates.length)]
  const title = videoTitles[Math.floor(Math.random() * videoTitles.length)]
  const videoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)]

  const price = (Math.random() * 5 + 0.5).toFixed(2)
  const change = Math.random() > 0.3 ? `+${(Math.random() * 50).toFixed(1)}%` : `-${(Math.random() * 10).toFixed(1)}%`
  const views = Math.floor(Math.random() * 2000 + 100)
  const likes = Math.floor(views * (Math.random() * 0.15 + 0.05))
  const comments = Math.floor(likes * (Math.random() * 0.1 + 0.02))

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return {
    id: `${id}`,
    creator: template.creator,
    creatorToken: template.creatorToken,
    price: `$${price}`,
    change,
    title,
    views: formatNumber(views),
    likes: formatNumber(likes),
    comments: formatNumber(comments),
    videoUrl,
    isLiked: false,
    community: template.community,
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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [videos, setVideos] = useState<VideoData[]>(() =>
    Array.from({ length: 10 }, (_, i) => generateVideo(i + 1))
  )
  const [isChartsOpen, setIsChartsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isTradingOpen, setIsTradingOpen] = useState(false)
  const [nextVideoId, setNextVideoId] = useState(11)
  const [showCopiedToast, setShowCopiedToast] = useState(false)

  const [userTokenBalances] = useState({
    'KING': 75, 'QUEEN': 15, 'DEFI': 150, 'MEME': 500, 'TRADE': 250,
    'WEB3': 80, 'ALPHA': 200, 'DAO': 350
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Infinite scroll - load more videos
  useEffect(() => {
    if (currentVideoIndex >= videos.length - 3) {
      const newVideos = Array.from({ length: 5 }, (_, i) => generateVideo(nextVideoId + i))
      setVideos(prev => [...prev, ...newVideos])
      setNextVideoId(prev => prev + 5)
    }
  }, [currentVideoIndex, videos.length, nextVideoId])

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
  }, [goToNext, goToPrevious])

  // Touch scrolling
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY) return

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
  }, [goToNext, goToPrevious])

  const toggleLike = () => {
    setVideos(prev => prev.map((video, index) => {
      if (index === currentVideoIndex) {
        const newIsLiked = !video.isLiked
        const currentLikes = parseInt(video.likes.replace(/[^\d]/g, '')) || 0
        const newLikeCount = newIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)

        const formatLikes = (count: number) => {
          if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
          if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
          return count.toString()
        }

        return {
          ...video,
          isLiked: newIsLiked,
          likes: formatLikes(newLikeCount)
        }
      }
      return video
    }))
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

  const currentVideo = videos[currentVideoIndex]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'none',
        overscrollBehavior: 'none'
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
          {/* Tap to play/pause */}
          <div className="absolute inset-0 z-20 cursor-pointer" onClick={() => setIsPlaying(!isPlaying)} />

          {/* Gradients */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent z-30"></div>

          {/* Green Navigation Menu - Left Side */}
          {!isChartsOpen && !isTradingOpen && (
            <div className="absolute bottom-48 left-8 z-50">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-all shadow-lg hover:shadow-green-500/50"
              >
                <Home className="w-8 h-8 text-black" />
              </button>

              {/* Navigation Menu */}
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
                        onClick={() => { setIsTradingOpen(true); setIsMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-green-500/20 rounded-xl transition-all group"
                      >
                        <div className="bg-green-500 rounded-full p-3 flex items-center justify-center">
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium group-hover:text-green-400">ENGAGE</div>
                          <div className="text-gray-400 text-xs">Trading & Community</div>
                        </div>
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm font-medium">Platform Active</span>
                      </div>
                      <span className="text-gray-400 text-sm">• {Math.floor(Math.random() * 500 + 100)} users online</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Charts Button */}
          {!isMenuOpen && !isTradingOpen && (
            <div className="absolute bottom-48 left-1/3 transform -translate-x-1/2 z-40">
              <button
                onClick={() => setIsChartsOpen(!isChartsOpen)}
                className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-all shadow-lg hover:shadow-green-500/50"
              >
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </button>
            </div>
          )}

          {/* Title with Background */}
          {!isMenuOpen && !isChartsOpen && !isTradingOpen && (
            <div className="absolute bottom-8 left-8 right-8 z-40">
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                <h2 className="text-white font-bold text-xl mb-4 leading-tight">
                  {currentVideo.title}
                </h2>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/80">{currentVideo.creator}</span>
                  <span className="text-green-400 font-bold">{currentVideo.creatorToken} {currentVideo.price}</span>
                  <span className={`font-bold ${currentVideo.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {currentVideo.change}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          {!isMenuOpen && !isChartsOpen && !isTradingOpen && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-6 items-center">
              {/* Like */}
              <div className="flex flex-col items-center">
                <button
                  onClick={toggleLike}
                  className="bg-black/20 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/40 hover:scale-110"
                >
                  <HeartIcon
                    className={`w-8 h-8 transition-all ${
                      currentVideo.isLiked
                        ? 'text-red-500 fill-red-500'
                        : 'text-white'
                    }`}
                  />
                </button>
                <span className="text-white text-sm font-bold mt-1">{currentVideo.likes}</span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-black/20 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/40 hover:scale-110"
                >
                  <MessageCircleIcon className="w-8 h-8 text-white" />
                </button>
                <span className="text-white text-sm font-bold mt-1">{currentVideo.comments}</span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleShare}
                  className="bg-black/20 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/40 hover:scale-110"
                >
                  <ShareIcon className="w-8 h-8 text-white" />
                </button>
                <span className="text-white text-sm font-bold mt-1">Share</span>
              </div>

              {/* Community */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setIsTradingOpen(true)}
                  className="bg-black/20 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/40 hover:scale-110"
                >
                  <Users className="w-8 h-8 text-white" />
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

      {/* Token-Gated Comments */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl border-t border-gray-700 max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-base">Token-Gated Comments</h3>
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-gray-400 text-xs truncate">{currentVideo.title}</p>
                <p className="text-green-400 text-xs mt-1">
                  🔒 Requires {currentVideo.community.minimumTokens}+ ${currentVideo.creatorToken}
                </p>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-white font-bold text-xs">@holder_{i + 1}</span>
                      <div className="bg-green-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-green-400" />
                        <span className="text-green-400 text-[10px] font-bold">{Math.floor(Math.random() * 500 + 50)} ${currentVideo.creatorToken}</span>
                      </div>
                    </div>
                    <p className="text-gray-200 text-xs">Great analysis! 🚀</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 p-3">
              {(userTokenBalances[currentVideo.creatorToken as keyof typeof userTokenBalances] || 0) >= (currentVideo.community.minimumTokens || 10) ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 text-green-400 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-bold">Verified Token Holder</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="font-bold">Comments Locked</span>
                  </div>
                  <p className="text-gray-300 text-[11px] mb-2">
                    Hold {currentVideo.community.minimumTokens}+ ${currentVideo.creatorToken} tokens to join
                  </p>
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded-lg font-bold">
                    Buy ${currentVideo.creatorToken} Tokens
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trading Modal */}
      {isTradingOpen && (
        <TradingModal
          onClose={() => setIsTradingOpen(false)}
          communityName={currentVideo.community.name}
          communityLogo={currentVideo.community.logo || '🔥'}
          communityMembers={currentVideo.community.members}
          creatorToken={currentVideo.creatorToken}
        />
      )}
    </div>
  )
}
