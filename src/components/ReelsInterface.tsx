'use client'

import { useState, useEffect, useRef } from 'react'
import { PlayIcon, PauseIcon, HeartIcon, MessageCircleIcon, ShareIcon, TrendingUp, Eye, Volume2, VolumeX } from 'lucide-react'
import { EngagementChart } from './EngagementChart'
import { TokenGatedChat } from './TokenGatedChat'

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
  activeTab: string
  setActiveTab: (tab: string) => void
  isDropdownOpen: boolean
  setIsDropdownOpen: (open: boolean) => void
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

export function ReelsInterface({ activeTab, setActiveTab, isDropdownOpen, setIsDropdownOpen }: ReelsInterfaceProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [videos, setVideos] = useState(mockVideos)
  const [isChartOpen, setIsChartOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  // Mock user token balances (in a real app, this would come from wallet/API)
  const [userTokenBalances] = useState({
    'KING': 75, // Has access to SOL Community (needs 50)
    'QUEEN': 15, // No access to AI Community (needs 25)
    'DEFI': 150, // Has access to DeFi Community (needs 100)
    'MEME': 500, // No access to PEPE Community (needs 1000)
    'TRADE': 250 // Has access to Trading Community (needs 200)
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToNext()
      } else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentVideoIndex])

  // Handle wheel scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (e.deltaY > 0) {
        goToNext()
      } else if (e.deltaY < 0) {
        goToPrevious()
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [currentVideoIndex])

  const goToNext = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
  }

  const goToPrevious = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleLike = () => {
    setVideos(prev => prev.map((video, index) =>
      index === currentVideoIndex
        ? { ...video, isLiked: !video.isLiked }
        : video
    ))
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!touchStart || !touchEnd || isTransitioning) return

    const distance = touchStart - touchEnd
    const isUpSwipe = distance > 80
    const isDownSwipe = distance < -80

    if (isUpSwipe) {
      goToNext()
    }
    if (isDownSwipe) {
      goToPrevious()
    }

    setTouchStart(0)
    setTouchEnd(0)
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
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Video Container */}
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Video Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
        </div>

        {/* Play/Pause overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {!isPlaying && (
            <div className="bg-black/50 rounded-full p-8 animate-fade-in">
              <PlayIcon className="w-16 h-16 text-white" />
            </div>
          )}
        </div>

        {/* Video Content */}
        <div className={`relative w-full max-w-md h-full bg-gray-900 border-x border-gray-800 overflow-hidden transition-all duration-600 ${isTransitioning ? 'opacity-95 scale-[0.98]' : 'opacity-100 scale-100'}`}>
          {/* Tap to play/pause area */}
          <div
            className="absolute inset-0 z-20 cursor-pointer"
            onClick={togglePlay}
          />

          {/* Top gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-30"></div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent z-30"></div>

          {/* Navigation and Creator info - Top */}
          <div className="absolute top-8 left-8 right-8 z-40">
            <div className="flex items-center gap-4">
              {/* Navigation dropdown - Mint logo button */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-green-500 hover:bg-green-600 rounded-full p-4 w-20 h-20 flex items-center justify-center transition-all duration-200 shadow-xl ring-4 ring-green-400/30"
                >
                  <img src="/mint-logo.png" alt="Menu" className="w-14 h-14 object-contain drop-shadow-lg" />
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute top-20 left-0 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
                    <button
                      onClick={() => {
                        setActiveTab('creator')
                        setIsDropdownOpen(false)
                      }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-700"
                    >
                      <img src="/mint-logo.png" alt="Profile" className="w-6 h-6" />
                      <span className="font-medium">Creator Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('trade')
                        setIsDropdownOpen(false)
                      }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-700"
                    >
                      <img src="/mint-leaf-logo.png" alt="MINT" className="w-6 h-6" />
                      <span className="font-medium">MINT</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('community')
                        setIsDropdownOpen(false)
                      }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <img src="/handshake-logo.png" alt="ENGAGE" className="w-6 h-6" />
                      <span className="font-medium">ENGAGE</span>
                    </button>
                  </div>
                )}

                {/* Backdrop to close dropdown */}
                {isDropdownOpen && (
                  <div
                    className="fixed inset-0 -z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}
              </div>

              {/* Creator info */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">{currentVideo.creator}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="bg-green-500 px-3 py-1.5 rounded-lg">
                    <span className="text-black font-bold text-sm">{currentVideo.creatorToken}</span>
                  </div>
                  <span className="text-white font-bold text-lg">{currentVideo.price}</span>
                  <span className={`text-base font-medium ${
                    currentVideo.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {currentVideo.change}
                  </span>
                </div>

                {/* Community Badge */}
                <button
                  onClick={() => setActiveTab('community')}
                  className="mt-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-3 hover:bg-black/60 transition-all group"
                >
                  <div className="text-2xl">{currentVideo.community.logo}</div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-bold text-sm group-hover:text-green-400 transition-colors">
                      {currentVideo.community.name}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {currentVideo.community.members} members
                    </div>
                    <div className="text-yellow-400 text-xs font-bold">
                      🔒 Need {currentVideo.community.minimumTokens} {currentVideo.creatorToken}
                    </div>
                  </div>
                  <div className="text-white/60 text-sm font-medium group-hover:text-green-400 transition-colors">
                    JOIN
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Video title and buy button - Bottom */}
          <div className="absolute bottom-8 left-8 right-24 z-40">
            <h2 className="text-white font-bold text-xl mb-6 leading-tight">
              {currentVideo.title}
            </h2>

            {/* Buy button */}
            <button
              onClick={() => {
                // Navigate to token purchase page or open buy modal
                setActiveTab('trade')
                alert(`Redirecting to buy ${currentVideo.creatorToken} tokens...`)
              }}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl transition-colors text-lg hover:scale-105 transform"
            >
              Buy {currentVideo.creatorToken} Token
            </button>
          </div>

          {/* Right side actions */}
          <div className="absolute right-6 bottom-36 z-40 flex flex-col gap-8">
            {/* Like button */}
            <button
              onClick={toggleLike}
              className="bg-black/30 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/50"
            >
              <HeartIcon
                className={`w-8 h-8 ${
                  currentVideo.isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                }`}
              />
            </button>

            {/* Comment button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-black/30 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/50 group relative"
            >
              <MessageCircleIcon className="w-8 h-8 text-white group-hover:text-green-400 transition-colors" />
              <span className="absolute -bottom-8 right-0 text-xs text-white font-bold">{currentVideo.comments}</span>
              {/* Live indicator */}
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 animate-pulse"></div>
            </button>

            {/* Share button */}
            <button
              onClick={() => {
                // Copy video URL to clipboard or open share menu
                const url = `${window.location.origin}/video/${currentVideo.id}`
                navigator.clipboard.writeText(url).then(() => {
                  alert('Video link copied to clipboard!')
                }).catch(() => {
                  alert('Share feature coming soon!')
                })
              }}
              className="bg-black/30 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/50 group"
            >
              <ShareIcon className="w-8 h-8 text-white group-hover:text-green-400 transition-colors" />
            </button>

            {/* Engagement Chart */}
            <EngagementChart
              data={currentVideo.engagementData}
              isOpen={isChartOpen}
              onToggle={() => setIsChartOpen(!isChartOpen)}
            />
          </div>

        </div>

      </div>

      {/* Token-Gated Community Chat */}
      <TokenGatedChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        title={currentVideo.title}
        tokenSymbol={currentVideo.creatorToken}
        minimumTokens={currentVideo.community.minimumTokens || 10}
        userTokenBalance={userTokenBalances[currentVideo.creatorToken as keyof typeof userTokenBalances] || 0}
        onBuyTokens={() => setActiveTab('trade')}
      />
    </div>
  )
}