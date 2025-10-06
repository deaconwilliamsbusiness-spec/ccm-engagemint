'use client'

import { useState, useEffect, useRef } from 'react'
import { PlayIcon, HeartIcon, MessageCircleIcon, ShareIcon, X, Lock, ShieldCheck } from 'lucide-react'

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

const mockVideos: VideoData[] = [
  {
    id: '1',
    creator: '@cryptoking',
    creatorToken: 'KING',
    price: '$2.45',
    change: '+12.3%',
    title: 'Why Solana will 10x in 2025 - Deep Analysis 🚀',
    views: '1.2M',
    likes: '89K',
    comments: '3.2K',
    videoUrl: 'https://player.vimeo.com/external/522606146.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
    isLiked: false,
    community: {
      name: 'SOL Community',
      members: '45.2K',
      logo: '🔥',
      minimumTokens: 50
    },
    engagementData: [
      { time: '1h', views: 150000, likes: 12000, comments: 450 },
      { time: '2h', views: 340000, likes: 28000, comments: 890 },
      { time: '4h', views: 670000, likes: 54000, comments: 1800 },
      { time: '8h', views: 920000, likes: 71000, comments: 2500 },
      { time: '12h', views: 1200000, likes: 89000, comments: 3200 }
    ]
  },
  {
    id: '2',
    creator: '@nftqueen',
    creatorToken: 'QUEEN',
    price: '$1.87',
    change: '+8.7%',
    title: 'Building the metaverse with AI and blockchain 🔮',
    views: '890K',
    likes: '67K',
    comments: '2.1K',
    videoUrl: 'https://player.vimeo.com/external/522606122.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
    isLiked: true,
    community: {
      name: 'AI Community',
      members: '32.8K',
      logo: '🤖',
      minimumTokens: 25
    },
    engagementData: [
      { time: '1h', views: 98000, likes: 8500, comments: 320 },
      { time: '2h', views: 245000, likes: 19000, comments: 650 },
      { time: '4h', views: 456000, likes: 38000, comments: 1200 },
      { time: '8h', views: 698000, likes: 52000, comments: 1700 },
      { time: '12h', views: 890000, likes: 67000, comments: 2100 }
    ]
  },
  {
    id: '3',
    creator: '@defimaster',
    creatorToken: 'DEFI',
    price: '$3.21',
    change: '+15.4%',
    title: 'DeFi strategies that actually work in 2025 💰',
    views: '567K',
    likes: '45K',
    comments: '1.8K',
    videoUrl: 'https://player.vimeo.com/external/522606097.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
    isLiked: false,
    community: {
      name: 'DeFi Community',
      members: '28.5K',
      logo: '💎',
      minimumTokens: 100
    },
    engagementData: [
      { time: '1h', views: 67000, likes: 5400, comments: 210 },
      { time: '2h', views: 145000, likes: 12000, comments: 450 },
      { time: '4h', views: 298000, likes: 24000, comments: 890 },
      { time: '8h', views: 423000, likes: 34000, comments: 1300 },
      { time: '12h', views: 567000, likes: 45000, comments: 1800 }
    ]
  },
  {
    id: '4',
    creator: '@memecoin_guru',
    creatorToken: 'MEME',
    price: '$0.89',
    change: '+45.2%',
    title: 'New meme coin about to explode 🌙',
    views: '2.1M',
    likes: '156K',
    comments: '8.9K',
    videoUrl: 'https://player.vimeo.com/external/522606071.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
    isLiked: false,
    community: {
      name: 'PEPE Community',
      members: '67.3K',
      logo: '🐸',
      minimumTokens: 1000
    },
    engagementData: [
      { time: '1h', views: 245000, likes: 18000, comments: 890 },
      { time: '2h', views: 567000, likes: 45000, comments: 2100 },
      { time: '4h', views: 1200000, likes: 89000, comments: 4500 },
      { time: '8h', views: 1700000, likes: 125000, comments: 6800 },
      { time: '12h', views: 2100000, likes: 156000, comments: 8900 }
    ]
  },
  {
    id: '5',
    creator: '@trader_pro',
    creatorToken: 'TRADE',
    price: '$4.56',
    change: '-3.2%',
    title: 'Reading crypto charts like a pro 📈',
    views: '678K',
    likes: '34K',
    comments: '1.2K',
    videoUrl: 'https://player.vimeo.com/external/522606043.hd.mp4?s=4b71a3c79b7e8b0e8b6b0e8b6b0e8b6b&profile_id=175',
    isLiked: true,
    community: {
      name: 'Trading Community',
      members: '89.1K',
      logo: '📈',
      minimumTokens: 200
    },
    engagementData: [
      { time: '1h', views: 89000, likes: 4500, comments: 180 },
      { time: '2h', views: 189000, likes: 9800, comments: 380 },
      { time: '4h', views: 345000, likes: 18000, comments: 650 },
      { time: '8h', views: 512000, likes: 26000, comments: 890 },
      { time: '12h', views: 678000, likes: 34000, comments: 1200 }
    ]
  }
]

export function ReelsInterface({ setActiveTab }: ReelsInterfaceProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [videos, setVideos] = useState(mockVideos)
  const [isChartsOpen, setIsChartsOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Mock user token balances
  const [userTokenBalances] = useState({
    'KING': 75, 'QUEEN': 15, 'DEFI': 150, 'MEME': 500, 'TRADE': 250
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // FLAWLESS SCROLL NAVIGATION
  const goToNext = () => {
    if (isScrolling) return
    setIsScrolling(true)
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length)

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1000)
  }

  const goToPrevious = () => {
    if (isScrolling) return
    setIsScrolling(true)
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1000)
  }

  // PERFECT WHEEL SCROLLING
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (isScrolling) return
      if (Math.abs(e.deltaY) < 30) return // Ignore tiny scrolls

      if (e.deltaY > 0) goToNext()
      else goToPrevious()
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => {
        container.removeEventListener('wheel', handleWheel)
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isScrolling])

  // PERFECT TOUCH SCROLLING
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setTouchStartY(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!touchStartY || isScrolling) {
      setTouchStartY(null)
      return
    }

    const touchEndY = e.changedTouches[0]?.clientY
    if (!touchEndY) {
      setTouchStartY(null)
      return
    }

    const distance = touchStartY - touchEndY
    const minDistance = 120 // Minimum swipe distance

    if (Math.abs(distance) > minDistance) {
      if (distance > 0) goToNext() // Swipe up = next
      else goToPrevious() // Swipe down = previous
    }

    setTouchStartY(null)
  }

  // KEYBOARD CONTROLS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowDown':
          e.preventDefault()
          goToNext()
          break
        case ' ':
          e.preventDefault()
          togglePlay()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isScrolling])

  const togglePlay = () => setIsPlaying(!isPlaying)

  const toggleLike = () => {
    setVideos(prev => prev.map((video, index) => {
      if (index === currentVideoIndex) {
        const newIsLiked = !video.isLiked
        const currentLikes = parseInt(video.likes.replace(/[^\d]/g, '')) || 0
        const newLikeCount = newIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)

        // Format likes count like TikTok
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

    // TikTok-style heart animation
    if (!videos[currentVideoIndex].isLiked) {
      // Create floating hearts animation
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const heart = document.createElement('div')
          heart.innerHTML = '❤️'
          heart.className = 'fixed text-2xl pointer-events-none z-50 animate-bounce'
          heart.style.left = `${45 + Math.random() * 10}%`
          heart.style.bottom = `${35 + Math.random() * 10}%`
          heart.style.animationDuration = '0.6s'
          document.body.appendChild(heart)

          setTimeout(() => {
            heart.style.opacity = '0'
            heart.style.transform = 'translateY(-50px) scale(1.5)'
            heart.style.transition = 'all 0.5s ease-out'
          }, 100)

          setTimeout(() => document.body.removeChild(heart), 800)
        }, i * 100)
      }
    }
  }

  const currentVideo = videos[currentVideoIndex]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
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
          <div className="absolute inset-0 z-20 cursor-pointer" onClick={togglePlay} />

          {/* Gradients */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent z-30"></div>


          {/* Green Navigation Menu - Left Side */}
          {!isChartsOpen && (
            <div className="absolute bottom-48 left-8 z-50">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-all shadow-lg hover:shadow-green-500/50 animate-pulse-glow"
                >
                  <img src="/handshake-logo.png" alt="Menu" className="w-8 h-8" />
                </button>

              {/* Navigation Menu - Centered on Screen */}
              {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="bg-gray-900/95 backdrop-blur-sm border border-green-500/50 rounded-xl p-4 sm:p-6 w-[90vw] max-w-[320px] shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <img src="/handshake-logo.png" alt="Menu" className="w-5 h-5" />
                        Navigation
                      </h3>
                      <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    {/* Menu Options */}
                    <div className="space-y-2">
                      <button
                        onClick={() => { setActiveTab('creator'); setIsMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-green-500/20 rounded-xl transition-all group"
                      >
                        <div className="bg-blue-500 rounded-full p-2">
                          <span className="text-white text-sm">👤</span>
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
                        <div className="bg-green-500 rounded-full p-2">
                          <span className="text-white text-sm">🚀</span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium group-hover:text-green-400">MINT</div>
                          <div className="text-gray-400 text-xs">Create & Launch Tokens</div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setActiveTab('community'); setIsMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-green-500/20 rounded-xl transition-all group"
                      >
                        <div className="bg-purple-500 rounded-full p-2">
                          <span className="text-white text-sm">🌟</span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium group-hover:text-green-400">ENGAGE</div>
                          <div className="text-gray-400 text-xs">Community & Governance</div>
                        </div>
                      </button>

                      <button
                        onClick={() => { alert('Wallet functionality coming soon!'); setIsMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-green-500/20 rounded-xl transition-all group"
                      >
                        <div className="bg-yellow-500 rounded-full p-2">
                          <span className="text-white text-sm">💰</span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium group-hover:text-green-400">Wallet</div>
                          <div className="text-gray-400 text-xs">Manage Tokens & Portfolio</div>
                        </div>
                      </button>
                    </div>

                    {/* Live Status Indicator */}
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
            </div>
          )}

          {/* ANALYTICS CHARTS - Left of Center */}
          {!isMenuOpen && (
            <div className="absolute bottom-48 left-1/3 transform -translate-x-1/2 z-40">
              <div className="relative">
                <button
                  onClick={() => setIsChartsOpen(!isChartsOpen)}
                  className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-all shadow-lg hover:shadow-green-500/50"
                >
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* BOTTOM: Title with Background */}
          {!isMenuOpen && !isChartsOpen && (
            <div className="absolute bottom-8 left-8 right-8 z-40">
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                <h2 className="text-white font-bold text-xl mb-4 leading-tight">
                  {currentVideo.title}
                </h2>

                {/* Creator and Token Info */}
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

          {/* RIGHT SIDE: TikTok-Style Actions */}
          {!isMenuOpen && !isChartsOpen && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-6 items-center">
            {/* Like - TikTok Style */}
            <div className="flex flex-col items-center">
              <button
                onClick={toggleLike}
                className="bg-black/20 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/40 hover:scale-110 transform"
              >
                <HeartIcon
                  className={`w-8 h-8 transition-all duration-300 ${
                    currentVideo.isLiked
                      ? 'text-red-500 fill-red-500 animate-bounce'
                      : 'text-white hover:text-red-400'
                  }`}
                />
              </button>
              <span className="text-white text-sm font-bold mt-1">{currentVideo.likes}</span>
            </div>

            {/* Comment - TikTok Style */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-black/20 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/40 hover:scale-110 transform group"
              >
                <MessageCircleIcon className="w-8 h-8 text-white group-hover:text-green-400 transition-colors" />
              </button>
              <span className="text-white text-sm font-bold mt-1">{currentVideo.comments}</span>
            </div>

            {/* Share - TikTok Style */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/video/${currentVideo.id}`
                  navigator.clipboard.writeText(url).then(() => {
                    // TikTok-style share animation
                    const button = document.activeElement
                    button?.classList.add('animate-pulse')
                    setTimeout(() => button?.classList.remove('animate-pulse'), 1000)
                  }).catch(() => {
                    console.log('Share feature coming soon!')
                  })
                }}
                className="bg-black/20 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/40 hover:scale-110 transform group"
              >
                <ShareIcon className="w-8 h-8 text-white group-hover:text-green-400 transition-colors" />
              </button>
              <span className="text-white text-sm font-bold mt-1">Share</span>
            </div>

            </div>
          )}


        </div>
      </div>

      {/* Backdrop to close menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Analytics Charts Modal - FULL SCREEN */}
      {isChartsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black/95 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 sm:p-8 w-full max-w-7xl h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-2xl">📊 Analytics & Market</h3>
              <button onClick={() => setIsChartsOpen(false)} className="text-gray-400 hover:text-white transition-colors text-3xl">✕</button>
            </div>

            {/* Two Column Layout - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Left: TikTok-Style Engagement Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold text-lg">📊 Engagement Rate</h4>
                  <div className="text-green-400 font-bold text-2xl">
                    {(() => {
                      const views = parseInt(currentVideo.views.replace(/[^\d]/g, '')) || 0
                      const likes = parseInt(currentVideo.likes.replace(/[^\d]/g, '')) || 0
                      const comments = parseInt(currentVideo.comments.replace(/[^\d]/g, '')) || 0
                      const shares = Math.floor(comments * 0.3)
                      const engagementRate = ((likes + comments * 5 + shares * 7) / views * 100).toFixed(1)
                      return `${engagementRate}%`
                    })()}
                  </div>
                </div>

                {/* Time-based Line Chart (TikTok Style) */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="h-64 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="border-t border-gray-800/50"></div>
                      ))}
                    </div>

                    {/* Engagement line chart */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="url(#gradient-engagement)"
                        strokeWidth="3"
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

                  {/* Time labels */}
                  <div className="flex justify-between mt-3 text-sm text-gray-500">
                    {currentVideo.engagementData.map((point, index) => (
                      index % 2 === 0 && <span key={index}>{point.time}</span>
                    ))}
                  </div>
                </div>

                {/* Engagement Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                    <div className="text-blue-400 font-bold text-lg">{currentVideo.views}</div>
                    <div className="text-gray-400 text-sm">Views</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <div className="text-red-400 font-bold text-lg">{currentVideo.likes}</div>
                    <div className="text-gray-400 text-sm">Likes ×1</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                    <div className="text-yellow-400 font-bold text-lg">{currentVideo.comments}</div>
                    <div className="text-gray-400 text-sm">Cmts ×5</div>
                  </div>
                </div>
              </div>

              {/* Right: Pump.fun-Style Token Chart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold text-lg">💰 ${currentVideo.creatorToken} on Solana</h4>
                  <div className={`font-bold text-lg ${currentVideo.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {currentVideo.change}
                  </div>
                </div>

                {/* Bonding Curve Chart (Pump.fun Style) */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 relative">
                  <div className="h-64 relative">
                    {/* Bonding curve line */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <path
                        d="M 0,100 Q 25,80 50,50 T 100,10"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        className="opacity-80"
                      />
                      {/* Fill under curve */}
                      <path
                        d="M 0,100 Q 25,80 50,50 T 100,10 L 100,100 Z"
                        fill="url(#gradient-bonding)"
                        className="opacity-20"
                      />
                      <defs>
                        <linearGradient id="gradient-bonding" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Current position indicator */}
                    <div className="absolute" style={{ left: '75%', top: '20%' }}>
                      <div className="relative">
                        <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="absolute -top-8 -left-10 bg-green-500 text-black text-sm font-bold px-3 py-1 rounded whitespace-nowrap">
                          {currentVideo.price}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress to graduation */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress to Raydium</span>
                      <span className="text-green-400 font-bold">82%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Token Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Market Cap</div>
                    <div className="text-white font-bold text-lg">$2.4M</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">24h Vol</div>
                    <div className="text-white font-bold text-lg">$184K</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Holders</div>
                    <div className="text-white font-bold text-lg">1,247</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Liquidity</div>
                    <div className="text-white font-bold text-lg">$890K</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token-Gated Comments Section */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl border-t border-gray-700 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-lg">Token-Gated Comments</h3>
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-gray-400 text-sm truncate">{currentVideo.title}</p>
                <p className="text-green-400 text-xs mt-1">
                  🔒 Requires {currentVideo.community.minimumTokens || 10}+ ${currentVideo.creatorToken} tokens
                </p>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex-shrink-0 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-sm">@holder_{i + 1}</span>
                      <div className="bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs font-bold">{Math.floor(Math.random() * 500 + 50)} ${currentVideo.creatorToken}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{Math.floor(Math.random() * 60)}m ago</span>
                    </div>
                    <p className="text-gray-200 text-sm">Great analysis! This is exactly what I needed to hear 🚀</p>
                    <span className="text-gray-400 text-xs">{Math.floor(Math.random() * 100)} likes</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Access Status */}
            <div className="border-t border-gray-700 p-4">
              {(userTokenBalances[currentVideo.creatorToken as keyof typeof userTokenBalances] || 0) >= (currentVideo.community.minimumTokens || 10) ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold">Verified Token Holder</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-bold">Comments Locked</span>
                  </div>
                  <p className="text-gray-300 text-xs mb-3">
                    Hold {currentVideo.community.minimumTokens || 10}+ ${currentVideo.creatorToken} tokens to join
                  </p>
                  <button className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-bold">
                    Buy ${currentVideo.creatorToken} Tokens
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}