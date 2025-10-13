'use client'

import { X, TrendingUp, Users as UsersIcon } from 'lucide-react'
import { useState } from 'react'

interface TradingModalProps {
  onClose: () => void
  communityName: string
  communityLogo: string
  communityMembers: string
  creatorToken: string
}

export function TradingModal({ onClose, communityName, communityLogo, communityMembers, creatorToken }: TradingModalProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'trending' | 'engage'>('latest')
  const [latestFilter, setLatestFilter] = useState<'creator' | 'community'>('community')

  const communityContent = {
    latestCommunity: [
      {
        id: 1,
        author: '@trader_1',
        verified: true,
        content: `Just bought more $${creatorToken}! The community is growing fast 🚀`,
        timestamp: '8m ago',
        likes: '234',
        comments: '45'
      },
      {
        id: 2,
        author: '@holder_pro',
        verified: false,
        content: `Holding $${creatorToken} long term. Best decision I made this year! 💎`,
        timestamp: '25m ago',
        likes: '156',
        comments: '32'
      }
    ],
    latestCreator: [
      {
        id: 1,
        author: '@cryptoking',
        verified: true,
        content: `New video dropping tomorrow! Big announcement about $${creatorToken} 🎬`,
        timestamp: '3h ago',
        likes: '892',
        comments: '124'
      },
      {
        id: 2,
        author: '@cryptoking',
        verified: true,
        content: 'Thank you all for the amazing support! Just hit 50K holders! 🙏💚',
        timestamp: '1d ago',
        likes: '1.2K',
        comments: '203'
      }
    ],
    trending: [
      {
        id: 1,
        title: `$${creatorToken} Price Analysis`,
        engagement: '8.2K',
        author: '@crypto_analyst',
        preview: 'Technical analysis shows strong momentum for this token...'
      },
      {
        id: 2,
        title: 'Community Growth Discussion',
        engagement: '6.5K',
        author: '@community_lead',
        preview: 'Amazing to see how fast this community is growing...'
      }
    ]
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Backdrop - click to close */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md h-full bg-gray-900 flex flex-col overflow-hidden"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">{communityName}</h2>
            <button
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
              {/* Community Header Card */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl">
                    {communityLogo}
                  </div>
                  <h3 className="text-black text-xl font-black">{communityName}</h3>
                  <div className="flex items-center justify-center gap-4 mt-2 text-black/80 text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{communityMembers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>${creatorToken}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 bg-gray-800 rounded-xl p-1.5 border border-gray-700">
                <button
                  onClick={() => setActiveTab('latest')}
                  className={`flex-1 px-2 py-2 rounded-lg font-medium text-xs transition-all ${
                    activeTab === 'latest'
                      ? 'bg-green-500 text-black shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  LATEST
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`flex-1 px-2 py-2 rounded-lg font-medium text-xs transition-all ${
                    activeTab === 'trending'
                      ? 'bg-green-500 text-black shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  TRENDING
                </button>
                <button
                  onClick={() => setActiveTab('engage')}
                  className={`flex-1 px-2 py-2 rounded-lg font-medium text-xs transition-all ${
                    activeTab === 'engage'
                      ? 'bg-green-500 text-black shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  ENGAGE
                </button>
              </div>

              {/* LATEST Tab Content */}
              {activeTab === 'latest' && (
                <div className="space-y-3">
                  {/* Filter Dropdown */}
                  <div className="flex items-center justify-between">
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                      💬 Latest
                    </div>
                    <select
                      value={latestFilter}
                      onChange={(e) => setLatestFilter(e.target.value as 'creator' | 'community')}
                      className="bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                    >
                      <option value="community">Community</option>
                      <option value="creator">Creator</option>
                    </select>
                  </div>

                  {/* Posts */}
                  {(latestFilter === 'community' ? communityContent.latestCommunity : communityContent.latestCreator).map((post) => (
                    <div key={post.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-bold text-xs">{post.author}</span>
                            {post.verified && <span className="text-green-400 text-sm">✅</span>}
                            <span className="text-gray-500 text-xs">{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed mb-3">{post.content}</p>
                      <div className="flex items-center gap-3 pt-2 border-t border-gray-700">
                        <button className="text-gray-400 hover:text-green-400 text-xs font-medium transition-colors">
                          ❤️ {post.likes}
                        </button>
                        <button className="text-gray-400 hover:text-green-400 text-xs font-medium transition-colors">
                          💬 {post.comments}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TRENDING Tab Content */}
              {activeTab === 'trending' && (
                <div className="space-y-3">
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    🔥 Trending in {communityName}
                  </div>
                  {communityContent.trending.map((post) => (
                    <div key={post.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-colors">
                      <h3 className="text-white font-bold text-sm mb-2">{post.title}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                        <span>by {post.author}</span>
                        <span>•</span>
                        <span>{communityLogo} {communityName.split(' ')[0]}</span>
                      </div>
                      <p className="text-gray-300 text-xs mb-3">{post.preview}</p>
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                        <div className="text-green-400 text-xs font-bold">{post.engagement} engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ENGAGE Tab Content */}
              {activeTab === 'engage' && (
                <div className="space-y-4">
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    ⚡ Engage with Community
                  </div>

                  {/* Trading Section */}
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-2xl">💰</div>
                      <h3 className="text-white font-bold text-sm">Trade ${creatorToken}</h3>
                    </div>
                    <p className="text-gray-300 text-xs mb-4">Buy or sell tokens to support the creator and gain exclusive access.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-green-500 hover:bg-green-600 text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-colors">
                        Buy
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors">
                        Sell
                      </button>
                    </div>
                  </div>

                  {/* Token Stats */}
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-white font-bold text-sm mb-3">Token Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">Price</span>
                        <span className="text-green-400 font-bold text-sm">$2.45</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">24h Change</span>
                        <span className="text-green-400 font-bold text-sm">+12.3%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">Market Cap</span>
                        <span className="text-white font-bold text-sm">$1.2M</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">Holders</span>
                        <span className="text-white font-bold text-sm">{communityMembers}</span>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Actions */}
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-white font-bold text-sm mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-4 py-3 rounded-lg transition-colors text-left flex items-center gap-3">
                        <span className="text-lg">🎬</span>
                        <span>View Creator Videos</span>
                      </button>
                      <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-4 py-3 rounded-lg transition-colors text-left flex items-center gap-3">
                        <span className="text-lg">💬</span>
                        <span>Join Discussion</span>
                      </button>
                      <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium px-4 py-3 rounded-lg transition-colors text-left flex items-center gap-3">
                        <span className="text-lg">📊</span>
                        <span>View Analytics</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
