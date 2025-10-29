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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Mobile optimized (slides up from bottom like TikTok/Instagram) */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto border-t border-x border-green-500/30 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white text-base font-bold flex items-center gap-1.5">
                  ${videoData.creatorToken}
                  <span className="text-xs text-gray-400 font-normal">Analytics</span>
                </h2>
                <p className="text-gray-400 text-xs truncate">{videoData.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded-lg flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Chart Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('engagement')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                chartType === 'engagement'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
              }`}
            >
              📊 ENGAGEMINT CHART
            </button>
            <button
              onClick={() => setChartType('memecoin')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                chartType === 'memecoin'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
              }`}
            >
              💰 MEMECOIN CHART
            </button>
          </div>

          {/* Memecoin Chart View */}
          {chartType === 'memecoin' && (
            <div className="space-y-2">
              {/* Price & Market Cap Cards */}
              <div className="grid grid-cols-2 gap-2">
                {/* Token Price Card */}
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-[10px] font-medium">Token Price</span>
                    <DollarSign className="w-3 h-3 text-green-400" />
                  </div>
                  <div className="flex items-end gap-1.5">
                    <span className="text-white text-xl font-bold">{videoData.price}</span>
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                      isPriceUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isPriceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="font-bold text-[10px]">{videoData.change}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-[9px] mt-1">Last 1h</p>
                </div>

                {/* Market Cap Card */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-[10px] font-medium">Market Cap</span>
                    <TrendingUp className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="flex items-end gap-1.5">
                    <span className="text-white text-xl font-bold">${(marketCap / 1000).toFixed(1)}K</span>
                  </div>
                  <p className="text-gray-500 text-[9px] mt-1">FDV</p>
                </div>
              </div>

              {/* Token Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400 text-xs">24h Volume</span>
                  </div>
                  <p className="text-white text-lg font-bold">${(volume24h / 1000).toFixed(1)}K</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 text-xs">Holders</span>
                  </div>
                  <p className="text-white text-lg font-bold">{holders}</p>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Chart View */}
          {chartType === 'engagement' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                  <div className="flex flex-col items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-400" />
                    <span className="text-gray-400 text-[9px]">Views</span>
                  </div>
                  <p className="text-white text-xs font-bold text-center mt-1">{videoData.views}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                  <div className="flex flex-col items-center gap-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span className="text-gray-400 text-[9px]">Likes</span>
                  </div>
                  <p className="text-white text-xs font-bold text-center mt-1">{videoData.likes}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                  <div className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-yellow-400" />
                    <span className="text-gray-400 text-[9px]">Comments</span>
                  </div>
                  <p className="text-white text-xs font-bold text-center mt-1">{videoData.comments}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                  <div className="flex flex-col items-center gap-1">
                    <Activity className="w-3 h-3 text-green-400" />
                    <span className="text-gray-400 text-[9px]">Rate</span>
                  </div>
                  <p className="text-white text-xs font-bold text-center mt-1">{engagementRate}%</p>
                </div>
              </div>

              {/* Unified Engagement Chart */}
              <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm">Engagement Flow</h3>

              {/* Metric Selector */}
              <div className="flex gap-1 bg-gray-900 rounded-lg p-0.5">
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

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes draw-line {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-draw-line {
          stroke-dasharray: 1000;
          animation: draw-line 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
