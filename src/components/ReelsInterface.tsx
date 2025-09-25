'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PlayIcon, PauseIcon, HeartIcon, MessageCircleIcon, ShareIcon, Plus, TrendingUp, Eye, Volume2, VolumeX } from 'lucide-react'
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
    views: '2.1M',
    likes: '89.4K',
    comments: '12.1K',
    community: {
      name: 'SOL Community',
      members: '45.2K',
      minimumTokens: 100
    },
    engagementData: [
      { time: '0:00', views: 0, likes: 0, comments: 0 },
      { time: '0:10', views: 1200, likes: 45, comments: 8 },
      { time: '0:20', views: 3400, likes: 120, comments: 22 },
      { time: '0:30', views: 5800, likes: 210, comments: 35 }
    ]
  },
  {
    id: '2',
    creator: '@nftqueen',
    creatorToken: 'QUEEN',
    price: '$1.87',
    change: '+8.5%',
    title: 'New AI NFT Collection Mint Live! 🎨',
    views: '1.8M',
    likes: '76.2K',
    comments: '9.8K',
    community: {
      name: 'AI Community',
      members: '32.8K',
      minimumTokens: 50
    },
    engagementData: [
      { time: '0:00', views: 0, likes: 0, comments: 0 },
      { time: '0:15', views: 2100, likes: 78, comments: 12 },
      { time: '0:30', views: 4200, likes: 156, comments: 28 },
      { time: '0:45', views: 6800, likes: 245, comments: 41 }
    ]
  },
  {
    id: '3',
    creator: '@defi_guru',
    creatorToken: 'GURU',
    price: '$3.12',
    change: '+15.7%',
    title: 'DeFi Yield Farming Strategy - 400% APY 💰',
    views: '3.2M',
    likes: '145.8K',
    comments: '18.7K',
    community: {
      name: 'DeFi Community',
      members: '28.5K',
      minimumTokens: 200
    },
    engagementData: [
      { time: '0:00', views: 0, likes: 0, comments: 0 },
      { time: '0:12', views: 1800, likes: 92, comments: 15 },
      { time: '0:24', views: 4100, likes: 201, comments: 33 },
      { time: '0:36', views: 7200, likes: 334, comments: 52 }
    ]
  }
]

// Generate more videos for infinite scroll
const generateMoreVideos = (startId: number): VideoData[] => {
  const creators = ['@crypto_master', '@token_wizard', '@blockchain_pro', '@defi_expert', '@nft_collector']
  const tokens = ['MSTR', 'WIZ', 'PRO', 'EXP', 'COL']
  const communities = [
    { name: 'Trading Community', members: '89.1K', minimumTokens: 150 },
    { name: 'PEPE Community', members: '67.3K', minimumTokens: 75 },
    { name: 'SOL Community', members: '45.2K', minimumTokens: 100 }
  ]

  return Array.from({ length: 10 }, (_, i) => {
    const index = i % creators.length
    return {
      id: (startId + i).toString(),
      creator: creators[index],
      creatorToken: tokens[index],
      price: `$${(Math.random() * 5 + 0.5).toFixed(2)}`,
      change: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 20 + 1).toFixed(1)}%`,
      title: `Epic crypto content ${startId + i} 🔥`,
      views: `${(Math.random() * 3 + 0.5).toFixed(1)}M`,
      likes: `${(Math.random() * 100 + 10).toFixed(1)}K`,
      comments: `${(Math.random() * 20 + 1).toFixed(1)}K`,
      community: communities[i % communities.length],
      engagementData: [
        { time: '0:00', views: 0, likes: 0, comments: 0 },
        { time: '0:15', views: Math.floor(Math.random() * 2000), likes: Math.floor(Math.random() * 80), comments: Math.floor(Math.random() * 15) },
        { time: '0:30', views: Math.floor(Math.random() * 4000), likes: Math.floor(Math.random() * 150), comments: Math.floor(Math.random() * 30) },
        { time: '0:45', views: Math.floor(Math.random() * 6000), likes: Math.floor(Math.random() * 250), comments: Math.floor(Math.random() * 45) }
      ]
    }
  })
}

export function ReelsInterface({ activeTab, setActiveTab, isDropdownOpen, setIsDropdownOpen }: ReelsInterfaceProps) {
  const [videos, setVideos] = useState<VideoData[]>(mockVideos)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLDivElement | null)[]>([])

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setCurrentIndex(index)

            // Load more videos when near the end
            if (index > videos.length - 3 && !loading) {
              setLoading(true)
              setTimeout(() => {
                const newVideos = generateMoreVideos(videos.length + 1)
                setVideos(prev => [...prev, ...newVideos])
                setLoading(false)
              }, 500)
            }
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    )

    videoRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [videos.length, loading])

  const currentVideo = videos[currentIndex]
  const userTokenBalance = 75 // Mock user balance

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`Check out this crypto content from ${currentVideo.creator}!`)
      // Could add a toast notification here
    } catch (err) {
      console.log('Share failed:', err)
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 bg-black overflow-y-auto snap-y snap-mandatory"
        style={{
          height: '100vh',
          width: '100vw',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: 'none'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Top Navigation - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
          {/* Mint Button - Top Left */}
          <button
            onClick={() => setActiveTab('trade')}
            className="bg-green-500 hover:bg-green-600 rounded-full p-3 transition-all hover:scale-105 shadow-lg"
          >
            <Plus className="w-6 h-6 text-black" />
          </button>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('creator')}
              className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black/50 transition-all"
            >
              Creators
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black/50 transition-all"
            >
              Community
            </button>
          </div>
        </div>

        {/* Videos Container */}
        {videos.map((video, index) => (
          <div
            key={video.id}
            ref={(el) => (videoRefs.current[index] = el)}
            data-index={index}
            className="relative w-full h-screen snap-start snap-always flex-shrink-0"
          >
            {/* Video Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
              {/* Mock video content */}
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <div className="text-center">
                  <PlayIcon className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-lg">Video {video.id}</p>
                </div>
              </div>
            </div>

            {/* Video Content Overlay */}
            <div className="absolute inset-0 flex">
              {/* Left side - Video info */}
              <div className="flex-1 flex flex-col justify-end p-4 pb-20">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {video.creator.charAt(1).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{video.creator}</p>
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <span className="font-bold">{video.creatorToken}</span>
                        <span>{video.price}</span>
                        <span className={video.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                          {video.change}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-white text-lg font-medium leading-tight">
                    {video.title}
                  </p>

                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views}
                    </span>
                    <span>{video.community.name}</span>
                  </div>
                </div>
              </div>

              {/* Right side - Interaction buttons */}
              <div className="w-20 flex flex-col justify-end items-center pb-20 space-y-6">
                <button className="bg-black/30 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/50 group">
                  <HeartIcon
                    className={`w-8 h-8 transition-colors ${
                      video.isLiked ? 'text-red-500 fill-red-500' : 'text-white group-hover:text-red-400'
                    }`}
                  />
                  <span className="block text-white text-xs mt-1 font-medium">{video.likes}</span>
                </button>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-black/30 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/50 group relative"
                >
                  <MessageCircleIcon className="w-8 h-8 text-white group-hover:text-green-400 transition-colors" />
                  <span className="block text-white text-xs mt-1 font-medium">{video.comments}</span>
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 animate-pulse"></div>
                </button>

                <button
                  onClick={handleShare}
                  className="bg-black/30 backdrop-blur-sm rounded-full p-4 transition-all hover:bg-black/50 group"
                >
                  <ShareIcon className="w-8 h-8 text-white group-hover:text-blue-400 transition-colors" />
                </button>

                <button
                  onClick={() => setActiveTab('trade')}
                  className="bg-green-500 hover:bg-green-600 text-black rounded-full p-4 transition-all hover:scale-105 font-bold"
                >
                  <span className="text-sm">BUY</span>
                </button>

                {/* Engagement Chart Mini */}
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-2 w-16 h-12">
                  <EngagementChart data={video.engagementData} compact />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {/* Token Gated Chat */}
      <TokenGatedChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        title={currentVideo?.community.name || 'Community'}
        tokenSymbol={currentVideo?.creatorToken || 'TOKEN'}
        minimumTokens={currentVideo?.community.minimumTokens || 100}
        userTokenBalance={userTokenBalance}
        onBuyTokens={() => setActiveTab('trade')}
      />
    </>
  )
}