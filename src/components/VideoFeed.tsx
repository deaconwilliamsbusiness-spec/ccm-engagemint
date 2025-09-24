'use client'

import { useState } from 'react'
import { PlayIcon, HeartIcon, MessageCircleIcon, ShareIcon, TrendingUp, Eye } from 'lucide-react'

interface VideoData {
  id: string
  creator: string
  creatorToken: string
  price: string
  change: string
  thumbnail: string
  title: string
  views: string
  likes: string
  comments: string
}

const mockVideos: VideoData[] = [
  {
    id: '1',
    creator: '@cryptoking',
    creatorToken: 'KING',
    price: '$2.45',
    change: '+12.3%',
    thumbnail: '/api/placeholder/400/600',
    title: 'Why Solana will 10x in 2025 - Deep Analysis',
    views: '1.2M',
    likes: '89K',
    comments: '3.2K'
  },
  {
    id: '2',
    creator: '@nftqueen',
    creatorToken: 'QUEEN',
    price: '$1.87',
    change: '+8.7%',
    thumbnail: '/api/placeholder/400/600',
    title: 'Building the metaverse with AI and blockchain',
    views: '890K',
    likes: '67K',
    comments: '2.1K'
  },
  {
    id: '3',
    creator: '@defimaster',
    creatorToken: 'DEFI',
    price: '$3.21',
    change: '+15.4%',
    thumbnail: '/api/placeholder/400/600',
    title: 'DeFi strategies that actually work in 2025',
    views: '567K',
    likes: '45K',
    comments: '1.8K'
  }
]

export function VideoFeed() {
  const [currentVideo, setCurrentVideo] = useState(0)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Reels</h1>
          </div>
          <div className="relative">
            <select className="bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="trending">🔥 Trending</option>
              <option value="new">⚡ New</option>
              <option value="top">👑 Top Rated</option>
              <option value="following">❤️ Following</option>
            </select>
          </div>
        </div>

        {/* Featured Video */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden mb-8">
          <div className="relative aspect-video bg-gray-700">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayIcon className="w-20 h-20 text-white opacity-60" />
            </div>

            {/* Video Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-500 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                  <img src="/mint-logo.png" alt="Mint" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-white font-medium">{mockVideos[currentVideo].creator}</span>
                <div className="bg-green-500 px-3 py-1 rounded-full">
                  <span className="text-black font-bold text-xs">{mockVideos[currentVideo].creatorToken}</span>
                </div>
              </div>

              <h2 className="text-white font-bold text-xl mb-2">{mockVideos[currentVideo].title}</h2>

              <div className="flex items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{mockVideos[currentVideo].views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartIcon className="w-4 h-4" />
                  <span className="text-sm">{mockVideos[currentVideo].likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircleIcon className="w-4 h-4" />
                  <span className="text-sm">{mockVideos[currentVideo].comments}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Actions */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl transition-colors">
                  <HeartIcon className="w-5 h-5 text-red-400" />
                  <span className="text-white">{mockVideos[currentVideo].likes}</span>
                </button>
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl transition-colors">
                  <MessageCircleIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-white">{mockVideos[currentVideo].comments}</span>
                </button>
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl transition-colors">
                  <ShareIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white">Share</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Token Price</p>
                  <p className="text-white font-bold text-lg">{mockVideos[currentVideo].price}</p>
                  <p className="text-green-400 text-sm font-medium">{mockVideos[currentVideo].change}</p>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl transition-colors">
                  Buy {mockVideos[currentVideo].creatorToken}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockVideos.slice(1).map((video, index) => (
            <div key={video.id} className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer"
                 onClick={() => setCurrentVideo(index + 1)}>
              <div className="relative aspect-video bg-gray-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayIcon className="w-12 h-12 text-white opacity-50" />
                </div>
                <div className="absolute top-3 left-3">
                  <div className="bg-green-500 px-2 py-1 rounded">
                    <span className="text-black font-bold text-xs">{video.creatorToken}</span>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3">
                  <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                    <span className="text-white text-xs">{video.views}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-500 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                    <img src="/mint-logo.png" alt="Mint" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-gray-300 text-sm">{video.creator}</span>
                </div>
                <h3 className="text-white font-medium text-sm mb-2">{video.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                    <span>{video.likes} likes</span>
                    <span>{video.comments} comments</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{video.price}</p>
                    <p className="text-green-400 text-xs">{video.change}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}