'use client'

import { X, Users, TrendingUp, Sparkles, Check } from 'lucide-react'
import { useState } from 'react'

interface CommunityDiscoveryProps {
  onClose: () => void
  onOpenCommunity: (community: { name: string; logo: string; members: string; token: string }) => void
}

const featuredCommunities = [
  { name: 'SOL Community', logo: '🔥', members: '45.2K', token: 'KING', trending: true, genre: 'crypto' },
  { name: 'AI Community', logo: '🤖', members: '32.8K', token: 'QUEEN', trending: true, genre: 'tech' },
  { name: 'DeFi Community', logo: '💎', members: '28.5K', token: 'DEFI', trending: false, genre: 'crypto' },
  { name: 'PEPE Community', logo: '🐸', members: '67.3K', token: 'MEME', trending: true, genre: 'meme' },
  { name: 'Trading Community', logo: '📈', members: '89.1K', token: 'TRADE', trending: false, genre: 'finance' },
  { name: 'Web3 Community', logo: '🌐', members: '56.4K', token: 'WEB3', trending: false, genre: 'tech' },
  { name: 'Alpha Community', logo: '🎯', members: '91.2K', token: 'ALPHA', trending: true, genre: 'finance' },
  { name: 'DAO Community', logo: '🏛️', members: '43.7K', token: 'DAO', trending: false, genre: 'governance' },
]

const genres = [
  { value: 'all', label: 'All Categories' },
  { value: 'crypto', label: '🪙 Crypto' },
  { value: 'tech', label: '⚡ Tech' },
  { value: 'meme', label: '😂 Meme' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'governance', label: '🏛️ Governance' },
]

export function CommunityDiscovery({ onClose, onOpenCommunity }: CommunityDiscoveryProps) {
  const [activeTab, setActiveTab] = useState<'trending' | 'all' | 'joined'>('trending')
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set())
  const [hoveredCommunity, setHoveredCommunity] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')

  const toggleJoin = (communityName: string) => {
    setJoinedCommunities(prev => {
      const newSet = new Set(prev)
      if (newSet.has(communityName)) {
        newSet.delete(communityName)
      } else {
        newSet.add(communityName)
      }
      return newSet
    })
  }

  const handleCommunityClick = (community: typeof featuredCommunities[0]) => {
    onOpenCommunity({
      name: community.name,
      logo: community.logo,
      members: community.members,
      token: community.token
    })
    onClose()
  }

  const displayedCommunities = activeTab === 'trending'
    ? featuredCommunities.filter(c => c.trending)
    : activeTab === 'joined'
    ? featuredCommunities.filter(c => joinedCommunities.has(c.name))
    : featuredCommunities.filter(c => {
        // Apply search filter
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             c.token.toLowerCase().includes(searchQuery.toLowerCase())

        // Apply genre filter
        const matchesGenre = selectedGenre === 'all' || c.genre === selectedGenre

        return matchesSearch && matchesGenre
      })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[51]"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md h-full bg-gray-900 flex flex-col overflow-hidden z-[52]" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">Discover Communities</h2>
              <p className="text-gray-400 text-xs mt-1">Find your people, join the conversation</p>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 pt-4 pb-2 flex gap-2 bg-gray-900 flex-shrink-0">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'trending'
                ? 'bg-green-500 text-black shadow-lg'
                : 'text-gray-300 bg-gray-800 hover:text-white hover:bg-gray-700'
            }`}
          >
            🔥 Trending
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'all'
                ? 'bg-green-500 text-black shadow-lg'
                : 'text-gray-300 bg-gray-800 hover:text-white hover:bg-gray-700'
            }`}
          >
            🌐 All
          </button>
          <button
            onClick={() => setActiveTab('joined')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'joined'
                ? 'bg-green-500 text-black shadow-lg'
                : 'text-gray-300 bg-gray-800 hover:text-white hover:bg-gray-700'
            }`}
          >
            ✅ Joined
          </button>
        </div>

        {/* Search and Filter - Only show on All tab */}
        {activeTab === 'all' && (
          <div className="px-4 pb-3 bg-gray-900 flex-shrink-0 space-y-2">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search communities or tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-lg px-4 py-2 pl-10 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Genre Filter Dropdown */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              {genres.map(genre => (
                <option key={genre.value} value={genre.value}>{genre.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">{activeTab === 'joined' ? '👥' : '🔍'}</div>
              <h3 className="text-white font-bold text-lg mb-2">
                {activeTab === 'joined' ? 'No communities yet' : 'No results found'}
              </h3>
              <p className="text-gray-400 text-sm max-w-xs">
                {activeTab === 'joined'
                  ? 'Start exploring and join communities that match your interests!'
                  : 'Try adjusting your search or filters to find communities.'}
              </p>
              {activeTab === 'all' && (searchQuery || selectedGenre !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedGenre('all')
                  }}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-black font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Featured Banner */}
              {activeTab === 'trending' && (
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-center relative overflow-hidden mb-4">
                  <div className="absolute top-2 right-2">
                    <Sparkles className="w-6 h-6 text-white/40" />
                  </div>
                  <div className="relative">
                    <div className="text-4xl mb-2">🚀</div>
                    <h3 className="text-black text-lg font-black">Hot Communities</h3>
                    <p className="text-black/70 text-xs mt-1">Join the fastest growing communities today</p>
                  </div>
                </div>
              )}

              {/* Community Cards */}
              {displayedCommunities.map((community, index) => {
                const isJoined = joinedCommunities.has(community.name)
                const isHovered = hoveredCommunity === community.name

                return (
                  <div
                    key={index}
                    onClick={() => handleCommunityClick(community)}
                    className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Logo */}
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                        {community.logo}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-sm">{community.name}</h3>
                          {community.trending && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">HOT</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{community.members}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>${community.token}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleJoin(community.name)
                          }}
                          onMouseEnter={() => setHoveredCommunity(community.name)}
                          onMouseLeave={() => setHoveredCommunity(null)}
                          className={`font-bold text-xs px-4 py-1.5 rounded-lg transition-all w-full flex items-center justify-center gap-1 ${
                            isJoined
                              ? isHovered
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gray-700 text-green-400 border border-green-500'
                              : 'bg-green-500 hover:bg-green-600 text-black'
                          }`}
                        >
                          {isJoined ? (
                            isHovered ? (
                              'Leave'
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Joined
                              </>
                            )
                          ) : (
                            'Join Community'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Explore More - Only show on Trending tab */}
              {activeTab === 'trending' && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <h4 className="text-white font-bold text-sm mb-1">More communities coming soon</h4>
                  <p className="text-gray-400 text-xs">We're constantly adding new communities for you to explore</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
