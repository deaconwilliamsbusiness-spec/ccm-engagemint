'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Eye, Heart, MessageCircle, DollarSign, Users, Activity } from 'lucide-react'

interface EngagementData {
  time: string
  views: number
  likes: number
  comments: number
}

interface EnhancedAnalyticsProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  videoData: {
    title: string
    creator: string
    creatorToken: string
    price: string
    change: string
    views: string
    likes: string
    comments: string
    engagementData: EngagementData[]
  }
}

export function EnhancedAnalytics({ isOpen, onClose, videoId, videoData }: EnhancedAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'views' | 'likes' | 'comments'>('all')
  const [chartType, setChartType] = useState<'memecoin' | 'engagement'>('engagement')
  const [marketCap, setMarketCap] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [holders, setHolders] = useState(0)
  const [realEngagementData, setRealEngagementData] = useState<EngagementData[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Fetch real engagement data from backend
  useEffect(() => {
    if (isOpen && videoId) {
      const fetchEngagementData = async () => {
        setIsLoadingData(true)
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'
          const response = await fetch(`${apiUrl}/api/videos/${videoId}/engagement-history?limit=12`)
          const data = await response.json()

          if (data.success && data.data && data.data.length > 0) {
            // Transform API data to chart format
            const chartData: EngagementData[] = data.data.map((point: {
              recorded_at: string;
              views_count: number;
              likes_count: number;
              comments_count: number;
            }) => {
              const recordedAt = new Date(point.recorded_at)
              const now = new Date()
              const minutesAgo = Math.floor((now.getTime() - recordedAt.getTime()) / 60000)

              return {
                time: minutesAgo < 60 ? `${minutesAgo}m` : `${Math.floor(minutesAgo / 60)}h`,
                views: point.views_count,
                likes: point.likes_count,
                comments: point.comments_count
              }
            })
            setRealEngagementData(chartData)
          } else {
            // Use mock data if no real data yet
            setRealEngagementData(videoData.engagementData)
          }
        } catch (error) {
          console.error('Failed to fetch engagement data:', error)
          // Fallback to mock data on error
          setRealEngagementData(videoData.engagementData)
        } finally {
          setIsLoadingData(false)
        }
      }

      fetchEngagementData()

      // Refresh every 60 seconds to get new data points
      const interval = setInterval(fetchEngagementData, 60000)
      return () => clearInterval(interval)
    }
  }, [isOpen, videoId, videoData.engagementData])

  useEffect(() => {
    if (isOpen) {
      // Simulate market data (in real app, fetch from blockchain/API)
      const basePrice = parseFloat(videoData.price.replace('$', '')) || 0.50
      setMarketCap(basePrice * 1000000) // Assume 1M supply
      setVolume24h(basePrice * 50000)
      setHolders(Math.floor(Math.random() * 500) + 100)
    }
  }, [isOpen, videoData.price])

  if (!isOpen) return null

  const parseCount = (str: string) => {
    const num = parseFloat(str.replace(/[^\d.]/g, ''))
    if (str.includes('K')) return num * 1000
    if (str.includes('M')) return num * 1000000
    return num
  }

  const totalViews = parseCount(videoData.views)
  const totalLikes = parseCount(videoData.likes)
  const totalComments = parseCount(videoData.comments)
  const engagementRate = ((totalLikes + totalComments) / totalViews * 100).toFixed(2)

  const priceChange = parseFloat(videoData.change.replace(/[^0-9.-]/g, ''))
  const isPriceUp = priceChange >= 0

  // Use real engagement data if available, otherwise fallback to mock data
  const displayData = realEngagementData.length > 0 ? realEngagementData : videoData.engagementData

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...displayData.map(d =>
      selectedMetric === 'all'
        ? Math.max(d.views, d.likes * 10, d.comments * 20)
        : selectedMetric === 'views' ? d.views
        : selectedMetric === 'likes' ? d.likes
        : d.comments
    )
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center animate-fade-in">
      {/* Backdrop - semi-transparent to show paused video behind */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal - Slides up from bottom */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-hidden border-t border-x border-green-500/20 shadow-2xl shadow-green-500/10 animate-slide-up">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 opacity-50 animate-pulse pointer-events-none rounded-t-3xl" />

        {/* Header with glassmorphism */}
        <div className="relative z-10 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border-b border-green-500/20 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 ring-2 ring-green-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ${videoData.creatorToken}
                  <span className="text-xs text-gray-400 font-normal bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700/50">Analytics</span>
                </h2>
                <p className="text-gray-400 text-sm truncate mt-1">{videoData.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-all p-2 hover:bg-gray-800/50 rounded-xl flex-shrink-0 border border-transparent hover:border-green-500/30"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
          <div className="p-6 space-y-5">
            {/* Chart Type Selector - Premium Toggle */}
            <div className="bg-gray-800/40 p-1.5 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setChartType('engagement')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all transform ${
                    chartType === 'engagement'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg shadow-green-500/30 scale-105'
                      : 'bg-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>ENGAGEMINT</span>
                  </div>
                </button>
                <button
                  onClick={() => setChartType('memecoin')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all transform ${
                    chartType === 'memecoin'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg shadow-green-500/30 scale-105'
                      : 'bg-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>MEMECOIN</span>
                  </div>
                </button>
              </div>
            </div>

          {/* Memecoin Chart View */}
          {chartType === 'memecoin' && (
            <>
              {/* Token Stats Grid - Matches Engagement Style */}
              <div className="grid grid-cols-4 gap-2">
                <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-xl p-3 border border-green-500/30 hover:scale-105 transition-transform group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="bg-green-500/20 rounded-lg p-1.5">
                      <DollarSign className="w-4 h-4 text-green-300" />
                    </div>
                    <span className="text-gray-300 text-[10px] font-semibold">Price</span>
                  </div>
                  <p className="relative text-white text-sm font-bold text-center mt-2">{videoData.price}</p>
                </div>

                <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl p-3 border border-blue-500/30 hover:scale-105 transition-transform group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="bg-blue-500/20 rounded-lg p-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-gray-300 text-[10px] font-semibold">MCap</span>
                  </div>
                  <p className="relative text-white text-sm font-bold text-center mt-2">${(marketCap / 1000).toFixed(0)}K</p>
                </div>

                <div className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/30 hover:scale-105 transition-transform group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="bg-yellow-500/20 rounded-lg p-1.5">
                      <Activity className="w-4 h-4 text-yellow-300" />
                    </div>
                    <span className="text-gray-300 text-[10px] font-semibold">Volume</span>
                  </div>
                  <p className="relative text-white text-sm font-bold text-center mt-2">${(volume24h / 1000).toFixed(0)}K</p>
                </div>

                <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-xl p-3 border border-purple-500/30 hover:scale-105 transition-transform group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="bg-purple-500/20 rounded-lg p-1.5">
                      <Users className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-gray-300 text-[10px] font-semibold">Holders</span>
                  </div>
                  <p className="relative text-white text-sm font-bold text-center mt-2">{holders}</p>
                </div>
              </div>

              {/* Price Flow Chart - Matches Engagement Chart */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-1.5">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    Price Flow
                  </h3>

                  {/* Price Change Indicator */}
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${
                    isPriceUp ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {isPriceUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span className="font-bold text-xs">{videoData.change}</span>
                  </div>
                </div>

                {/* Price Chart */}
                <div className="relative h-40">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-t border-gray-700/30 w-full" />
                    ))}
                  </div>

                  {/* SVG Price Chart */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient-price" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={isPriceUp ? "#10b981" : "#ef4444"} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={isPriceUp ? "#10b981" : "#ef4444"} stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Generate simulated price data based on current price */}
                    <path
                      d={`M ${displayData.map((point, index) => {
                        const x = (index / (displayData.length - 1)) * 100
                        // Simulate price movement based on engagement
                        const basePrice = parseFloat(videoData.price.replace('$', ''))
                        const priceVariation = (point.views / maxValue) * basePrice * 0.3
                        const simulatedPrice = basePrice + (isPriceUp ? priceVariation : -priceVariation)
                        const maxPrice = basePrice * 1.3
                        const y = 100 - ((simulatedPrice / maxPrice) * 90)
                        return `${x}%,${y}%`
                      }).join(' L ')}`}
                      fill="none"
                      stroke={isPriceUp ? "#10b981" : "#ef4444"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-draw-line"
                    />
                    <path
                      d={`M ${displayData.map((point, index) => {
                        const x = (index / (displayData.length - 1)) * 100
                        const basePrice = parseFloat(videoData.price.replace('$', ''))
                        const priceVariation = (point.views / maxValue) * basePrice * 0.3
                        const simulatedPrice = basePrice + (isPriceUp ? priceVariation : -priceVariation)
                        const maxPrice = basePrice * 1.3
                        const y = 100 - ((simulatedPrice / maxPrice) * 90)
                        return `${x}%,${y}%`
                      }).join(' L ')} L 100%,100% L 0%,100% Z`}
                      fill="url(#gradient-price)"
                    />
                  </svg>
                </div>

                {/* Time Labels */}
                <div className="flex justify-between mt-2 text-gray-500 text-[10px]">
                  {displayData.map((point, index) => {
                    if (index % 3 === 0 || index === displayData.length - 1) {
                      return <span key={index}>{point.time}</span>
                    }
                    return null
                  })}
                </div>

                {/* Chart Legend */}
                <div className="mt-4 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isPriceUp ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-gray-400 text-[10px]">Token Price</span>
                      <span className="text-white font-bold text-[10px]">{videoData.price}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-gray-400 text-[10px]">Market Cap</span>
                      <span className="text-white font-bold text-[10px]">${(marketCap / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Engagement Chart View */}
          {chartType === 'engagement' && (
            <>
              {/* Stats Grid - Premium Cards */}
              <div className="grid grid-cols-4 gap-2">
                <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-xl p-3 border border-blue-500/30 hover:scale-105 transition-transform group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="bg-blue-500/20 rounded-lg p-1.5">
                      <Eye className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-gray-300 text-[10px] font-semibold">Views</span>
                  </div>
                  <p className="relative text-white text-sm font-bold text-center mt-2">{videoData.views}</p>
                </div>

                <div className="relative bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm rounded-xl p-3 border border-red-500/30 hover:scale-105 transition-transform group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="bg-red-500/20 rounded-lg p-1.5">
                      <Heart className="w-4 h-4 text-red-300" />
                    </div>
                    <span className="text-gray-300 text-[10px] font-semibold">Likes</span>
                  </div>
                  <p className="relative text-white text-sm font-bold text-center mt-2">{videoData.likes}</p>
                </div>

                <div className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/30 hover:scale-105 transition-transform group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="bg-yellow-500/20 rounded-lg p-1.5">
                      <MessageCircle className="w-4 h-4 text-yellow-300" />
                    </div>
                    <span className="text-gray-300 text-[10px] font-semibold">Comments</span>
                  </div>
                  <p className="relative text-white text-sm font-bold text-center mt-2">{videoData.comments}</p>
                </div>

                <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-xl p-3 border border-green-500/30 hover:scale-105 transition-transform group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="bg-green-500/20 rounded-lg p-1.5">
                      <Activity className="w-4 h-4 text-green-300" />
                    </div>
                    <span className="text-gray-300 text-[10px] font-semibold">Rate</span>
                  </div>
                  <p className="relative text-white text-sm font-bold text-center mt-2">{engagementRate}%</p>
                </div>
              </div>

              {/* Unified Engagement Chart - Enhanced Container */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-1.5">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                Engagement Flow
              </h3>

              {/* Metric Selector - Premium Pills */}
              <div className="flex gap-1 bg-black/40 rounded-xl p-1 border border-gray-700/50 backdrop-blur-sm">
                <button
                  onClick={() => setSelectedMetric('all')}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    selectedMetric === 'all'
                      ? 'bg-green-500 text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedMetric('views')}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    selectedMetric === 'views'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Views
                </button>
                <button
                  onClick={() => setSelectedMetric('likes')}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    selectedMetric === 'likes'
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Likes
                </button>
                <button
                  onClick={() => setSelectedMetric('comments')}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    selectedMetric === 'comments'
                      ? 'bg-yellow-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Comments
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-40">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-gray-700/30 w-full" />
                ))}
              </div>

              {/* SVG Chart */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient-views" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="gradient-likes" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="gradient-comments" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Views Line */}
                {(selectedMetric === 'all' || selectedMetric === 'views') && (
                  <>
                    <path
                      d={`M ${displayData.map((point, index) => {
                        const x = (index / (displayData.length - 1)) * 100
                        const y = 100 - (point.views / maxValue * 90)
                        return `${x}%,${y}%`
                      }).join(' L ')}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-draw-line"
                    />
                    <path
                      d={`M ${displayData.map((point, index) => {
                        const x = (index / (displayData.length - 1)) * 100
                        const y = 100 - (point.views / maxValue * 90)
                        return `${x}%,${y}%`
                      }).join(' L ')} L 100%,100% L 0%,100% Z`}
                      fill="url(#gradient-views)"
                    />
                  </>
                )}

                {/* Likes Line */}
                {(selectedMetric === 'all' || selectedMetric === 'likes') && (
                  <>
                    <path
                      d={`M ${displayData.map((point, index) => {
                        const x = (index / (displayData.length - 1)) * 100
                        const scaledValue = selectedMetric === 'all' ? point.likes * 10 : point.likes
                        const y = 100 - (scaledValue / maxValue * 90)
                        return `${x}%,${y}%`
                      }).join(' L ')}`}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-draw-line"
                      style={{ animationDelay: '0.2s' }}
                    />
                    {selectedMetric === 'likes' && (
                      <path
                        d={`M ${displayData.map((point, index) => {
                          const x = (index / (displayData.length - 1)) * 100
                          const y = 100 - (point.likes / maxValue * 90)
                          return `${x}%,${y}%`
                        }).join(' L ')} L 100%,100% L 0%,100% Z`}
                        fill="url(#gradient-likes)"
                      />
                    )}
                  </>
                )}

                {/* Comments Line */}
                {(selectedMetric === 'all' || selectedMetric === 'comments') && (
                  <>
                    <path
                      d={`M ${displayData.map((point, index) => {
                        const x = (index / (displayData.length - 1)) * 100
                        const scaledValue = selectedMetric === 'all' ? point.comments * 20 : point.comments
                        const y = 100 - (scaledValue / maxValue * 90)
                        return `${x}%,${y}%`
                      }).join(' L ')}`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-draw-line"
                      style={{ animationDelay: '0.4s' }}
                    />
                    {selectedMetric === 'comments' && (
                      <path
                        d={`M ${displayData.map((point, index) => {
                          const x = (index / (displayData.length - 1)) * 100
                          const y = 100 - (point.comments / maxValue * 90)
                          return `${x}%,${y}%`
                        }).join(' L ')} L 100%,100% L 0%,100% Z`}
                        fill="url(#gradient-comments)"
                      />
                    )}
                  </>
                )}
              </svg>

              {/* Time labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
                {displayData.map((point, index) => (
                  <span key={index}>{point.time}</span>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-700/50">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-400 text-[10px]">Views</span>
                <span className="text-white font-bold text-[10px]">{videoData.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-400 text-[10px]">Likes</span>
                <span className="text-white font-bold text-[10px]">{videoData.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-400 text-[10px]">Comments</span>
                <span className="text-white font-bold text-[10px]">{videoData.comments}</span>
              </div>
            </div>
              </div>
            </>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-3 rounded-xl transition-all text-xs">
              💰 Trade ${videoData.creatorToken}
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all border border-gray-700 text-xs">
              📊 Dashboard
            </button>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes draw-line {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-draw-line {
          stroke-dasharray: 1000;
          animation: draw-line 1.5s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #047857);
        }
      `}</style>
    </div>
  )
}
