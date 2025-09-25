'use client'

import { useState } from 'react'
import { ArrowLeft, MoreHorizontal, Camera, TrendingUp, Play, Heart } from 'lucide-react'

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
  duration: string
}

const mockPnlData: PnlData[] = [
  { time: '1h', profit: 1200, revenue: 15600 },
  { time: '6h', profit: 3400, revenue: 28900 },
  { time: '12h', profit: 5800, revenue: 45200 },
  { time: '1d', profit: 8900, revenue: 67800 },
  { time: '2d', profit: 12400, revenue: 89300 },
  { time: '3d', profit: 15600, revenue: 112500 },
]

const mockContent: VideoContent[] = [
  { id: '1', title: 'Crypto Analysis', views: '1.2M', likes: '89K', thumbnail: '', duration: '2:45' },
  { id: '2', title: 'Market Update', views: '890K', likes: '67K', thumbnail: '', duration: '1:32' },
  { id: '3', title: 'MINT Tips', views: '567K', likes: '45K', thumbnail: '', duration: '3:21' },
  { id: '4', title: 'DeFi Guide', views: '423K', likes: '34K', thumbnail: '', duration: '4:12' },
  { id: '5', title: 'NFT Trends', views: '334K', likes: '28K', thumbnail: '', duration: '2:18' },
  { id: '6', title: 'Yield Farming', views: '298K', likes: '23K', thumbnail: '', duration: '5:07' },
]

interface CreatorProfileProps {
  onBack: () => void
}

export function CreatorProfile({ onBack }: CreatorProfileProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('1d')
  const [showChart, setShowChart] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getMaxValue = () => {
    const values = mockPnlData.map(d => d.profit)
    return Math.max(...values)
  }

  const maxValue = getMaxValue()

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Centered content container */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="relative w-full max-w-md h-full bg-gray-900 border-x border-gray-800 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10">
            <button
              onClick={onBack}
              className="text-white hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-xl text-white">Creator Profile</h1>
            <button className="text-white">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="p-6">
        {/* Avatar and Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center">
              <img src="/mint-logo.png" alt="Creator" className="w-20 h-20 object-contain" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-3 shadow-lg">
              <Camera className="w-5 h-5 text-black" />
            </button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">@cryptoking</h2>
              {/* Verification Mark */}
              <div className="bg-blue-500 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-green-400 font-medium mb-2">KING Token Creator</p>
            <p className="text-gray-400 text-sm max-w-xs">
              Crypto analyst & content creator. Building the future of decentralized finance. 🚀
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">🎬</div>
            <p className="text-gray-400 text-sm">Videos</p>
            <p className="text-white font-bold text-lg">127</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-gray-400 text-sm">Followers</p>
            <p className="text-white font-bold text-lg">45.2K</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-gray-400 text-sm">Total Earned</p>
            <p className="text-green-400 font-bold text-lg">$89.3K</p>
          </div>
        </div>

        {/* P&L Chart Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Creator P&L</h3>
            <button
              onClick={() => setShowChart(!showChart)}
              className="bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-black" />
            </button>
          </div>

          {showChart && (
            <>
              {/* Time Period Selector */}
              <div className="flex gap-2 mb-6">
                {['1h', '6h', '12h', '1d', '2d', '3d'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-green-500 text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="h-40 flex items-end gap-2 mb-6 bg-gray-900 rounded-lg p-4">
                {mockPnlData.map((point, index) => {
                  const height = (point.profit / maxValue) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all duration-300"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-400 mt-2">{point.time}</span>
                    </div>
                  )
                })}
              </div>

              {/* P&L Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-green-400 font-bold text-xl">
                    ${formatNumber(mockPnlData[mockPnlData.length - 1]?.profit || 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Total Profit</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-blue-400 font-bold text-xl">
                    ${formatNumber(mockPnlData[mockPnlData.length - 1]?.revenue || 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content Grid */}
        <div>
          <h3 className="text-white font-bold text-xl mb-4">Your Content</h3>
          <div className="grid grid-cols-2 gap-4">
            {mockContent.map((video) => (
              <div key={video.id} className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors group" onClick={() => alert(`Opening video: ${video.title}`)}>
                <div className="relative aspect-video bg-gray-700">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs font-medium">{video.duration}</span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-green-500 rounded-full p-1 w-6 h-6 flex items-center justify-center">
                      <img src="/mint-logo.png" alt="Mint" className="w-4 h-4 object-contain" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">{video.title}</h4>
                  <div className="flex items-center justify-between text-gray-400 text-xs">
                    <div className="flex items-center gap-3">
                      <span>{video.views} views</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{video.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}