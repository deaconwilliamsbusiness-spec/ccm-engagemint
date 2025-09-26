'use client'

import { useState, useEffect, useRef } from 'react'
import { PlayIcon, HeartIcon, MessageCircleIcon, ShareIcon } from 'lucide-react'
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

export function ReelsInterface({ setActiveTab, isDropdownOpen, setIsDropdownOpen }: ReelsInterfaceProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [videos, setVideos] = useState(mockVideos)
  const [isChartOpen, setIsChartOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Mock user token balances
  const [userTokenBalances] = useState({
    'KING': 75, 'QUEEN': 15, 'DEFI': 150, 'MEME': 500, 'TRADE': 250
  })

  const containerRef = useRef<HTMLDivElement>(null)
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
    setVideos(prev => prev.map((video, index) =>
      index === currentVideoIndex
        ? { ...video, isLiked: !video.isLiked }
        : video
    ))
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
        {/* Video Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20">
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
        <div className="relative w-full max-w-md h-full bg-gray-900 border-x border-gray-800 overflow-hidden">
          {/* Tap to play/pause */}
          <div className="absolute inset-0 z-20 cursor-pointer" onClick={togglePlay} />

          {/* Gradients */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-30"></div>
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent z-30"></div>

          {/* TOP: Navigation and Creator info */}
          <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 z-40">
            <div className="flex items-center gap-4">
              {/* MINT Dropdown Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-white hover:bg-gray-100 rounded-full p-4 sm:p-6 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center transition-all duration-200 shadow-xl ring-4 ring-green-400/30 hover:ring-green-500/50"
                >
                  <img src="/mint-logo.png" alt="MINT Menu" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-20 sm:top-24 left-0 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden min-w-[200px] sm:min-w-[220px]">
                    <button
                      onClick={() => { setActiveTab('creator'); setIsDropdownOpen(false) }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors border-b border-gray-700"
                    >
                      <span className="font-medium text-lg">Creator Profile</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('trade'); setIsDropdownOpen(false) }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors border-b border-gray-700"
                    >
                      <span className="font-medium text-lg">MINT</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('community'); setIsDropdownOpen(false) }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors"
                    >
                      <span className="font-medium text-lg">ENGAGE</span>
                    </button>
                  </div>
                )}

                {/* Backdrop to close dropdown */}
                {isDropdownOpen && (
                  <div className="fixed inset-0 -z-10" onClick={() => setIsDropdownOpen(false)} />
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

          {/* BOTTOM: Title and Buy Button */}
          <div className="absolute bottom-8 left-8 right-24 z-40">
            <h2 className="text-white font-bold text-xl mb-6 leading-tight">
              {currentVideo.title}
            </h2>

            <button
              onClick={() => {
                setActiveTab('trade')
                alert(`Redirecting to buy ${currentVideo.creatorToken} tokens...`)
              }}
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-xl transition-colors text-lg hover:scale-105 transform"
            >
              Buy {currentVideo.creatorToken} Token
            </button>
          </div>

          {/* RIGHT SIDE: Actions */}
          <div className="absolute right-4 bottom-32 z-40 flex flex-col gap-4">
            {/* Like */}
            <button
              onClick={toggleLike}
              className="bg-black/30 backdrop-blur-sm rounded-full p-3 transition-all hover:bg-black/50"
            >
              <HeartIcon
                className={`w-6 h-6 ${
                  currentVideo.isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                }`}
              />
            </button>

            {/* Comment */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-black/30 backdrop-blur-sm rounded-full p-3 transition-all hover:bg-black/50 group relative"
            >
              <MessageCircleIcon className="w-6 h-6 text-white group-hover:text-green-400 transition-colors" />
              <span className="absolute -bottom-6 right-0 text-xs text-white font-bold">{currentVideo.comments}</span>
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2 animate-pulse"></div>
            </button>

            {/* Share */}
            <button
              onClick={() => {
                const url = `${window.location.origin}/video/${currentVideo.id}`
                navigator.clipboard.writeText(url).then(() => {
                  alert('Video link copied to clipboard!')
                }).catch(() => {
                  alert('Share feature coming soon!')
                })
              }}
              className="bg-black/30 backdrop-blur-sm rounded-full p-3 transition-all hover:bg-black/50 group"
            >
              <ShareIcon className="w-6 h-6 text-white group-hover:text-green-400 transition-colors" />
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