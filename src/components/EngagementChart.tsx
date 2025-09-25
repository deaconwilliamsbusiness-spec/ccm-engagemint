'use client'

import { useState } from 'react'

interface EngagementData {
  time: string
  views: number
  likes: number
  comments: number
}

interface EngagementChartProps {
  data: EngagementData[]
  isOpen: boolean
  onToggle: () => void
}

export function EngagementChart({ data, isOpen, onToggle }: EngagementChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'likes' | 'comments'>('views')

  const getMaxValue = () => {
    const values = data.map(d => d[selectedMetric])
    return Math.max(...values)
  }


  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const maxValue = getMaxValue()

  return (
    <div className="relative">
      {/* Chart Toggle Button */}
      <button
        onClick={onToggle}
        className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-all"
      >
        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </button>

      {/* Chart Modal */}
      {isOpen && (
        <div className="absolute right-0 bottom-16 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-6 min-w-[320px] shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Engagemint Chart</h3>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedMetric('views')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'views'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              👁️ Views
            </button>
            <button
              onClick={() => setSelectedMetric('likes')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'likes'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ❤️ Likes
            </button>
            <button
              onClick={() => setSelectedMetric('comments')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'comments'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💬 Comments
            </button>
          </div>

          {/* Chart Area */}
          <div className="h-32 flex items-end gap-2 mb-4">
            {data.map((point, index) => {
              const height = (point[selectedMetric] / maxValue) * 100
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className={`w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t transition-all duration-300 ${
                      selectedMetric === 'views' ? 'from-blue-500 to-blue-300' :
                      selectedMetric === 'likes' ? 'from-red-500 to-red-300' :
                      'from-yellow-500 to-yellow-300'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-400 mt-1">{point.time}</span>
                </div>
              )
            })}
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <p className="text-blue-400 font-bold text-lg">{formatNumber(data[data.length - 1]?.views || 0)}</p>
              <p className="text-gray-400 text-xs">Views</p>
            </div>
            <div className="text-center">
              <p className="text-red-400 font-bold text-lg">{formatNumber(data[data.length - 1]?.likes || 0)}</p>
              <p className="text-gray-400 text-xs">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 font-bold text-lg">{formatNumber(data[data.length - 1]?.comments || 0)}</p>
              <p className="text-gray-400 text-xs">Comments</p>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Trending Up</span>
            </div>
            <span className="text-green-400 text-sm">+{Math.floor(Math.random() * 20 + 5)}% this hour</span>
          </div>
        </div>
      )}
    </div>
  )
}