'use client'

import { useState } from 'react'
import { ArrowLeft, Users, TrendingUp, Star, Search } from 'lucide-react'

interface Community {
  id: string
  name: string
  logo: string
  members: string
  description: string
  trending: boolean
  growth: string
  category: string
  minimumTokens: number
  tokenSymbol: string
  isJoined: boolean
}

interface CommunityDiscoveryProps {
  onBack: () => void
}

const trendingCommunities: Community[] = [
  {
    id: 'sol',
    name: 'SOL Community',
    logo: '🔥',
    members: '45.2K',
    description: 'The largest Solana community for traders, builders, and hodlers',
    trending: true,
    growth: '+28%',
    category: 'DeFi',
    minimumTokens: 50,
    tokenSymbol: 'KING',
    isJoined: false
  },
  {
    id: 'ai',
    name: 'AI Community',
    logo: '🤖',
    members: '32.8K',
    description: 'Exploring AI-powered blockchain solutions and NFTs',
    trending: true,
    growth: '+45%',
    category: 'Tech',
    minimumTokens: 25,
    tokenSymbol: 'QUEEN',
    isJoined: true
  },
  {
    id: 'defi',
    name: 'DeFi Community',
    logo: '💎',
    members: '28.5K',
    description: 'Advanced DeFi strategies and yield farming discussions',
    trending: false,
    growth: '+12%',
    category: 'DeFi',
    minimumTokens: 100,
    tokenSymbol: 'DEFI',
    isJoined: false
  },
  {
    id: 'pepe',
    name: 'PEPE Community',
    logo: '🐸',
    members: '67.3K',
    description: 'Meme coin enthusiasts and degen traders unite!',
    trending: true,
    growth: '+89%',
    category: 'Memes',
    minimumTokens: 1000,
    tokenSymbol: 'MEME',
    isJoined: false
  },
  {
    id: 'trading',
    name: 'Trading Community',
    logo: '📈',
    members: '89.1K',
    description: 'Professional crypto trading strategies and market analysis',
    trending: false,
    growth: '+8%',
    category: 'Trading',
    minimumTokens: 200,
    tokenSymbol: 'TRADE',
    isJoined: true
  },
  {
    id: 'doge',
    name: 'DOGE Army',
    logo: '🐕',
    members: '156.3K',
    description: 'Much wow, very community. DOGE to the moon!',
    trending: true,
    growth: '+67%',
    category: 'Memes',
    minimumTokens: 500,
    tokenSymbol: 'DOGE',
    isJoined: false
  },
  {
    id: 'yield',
    name: 'Yield Farmers',
    logo: '🌾',
    members: '78.9K',
    description: 'High-yield farming opportunities and LP strategies',
    trending: false,
    growth: '+15%',
    category: 'DeFi',
    minimumTokens: 300,
    tokenSymbol: 'YIELD',
    isJoined: false
  },
  {
    id: 'nft',
    name: 'NFT Flippers',
    logo: '🖼️',
    members: '92.4K',
    description: 'NFT trading, flipping strategies, and alpha drops',
    trending: true,
    growth: '+34%',
    category: 'NFTs',
    minimumTokens: 150,
    tokenSymbol: 'FLIP',
    isJoined: false
  },
  {
    id: 'altcoin',
    name: 'Altcoin Hunters',
    logo: '🔍',
    members: '234.1K',
    description: 'Discover hidden gems and low-cap altcoins before they moon',
    trending: true,
    growth: '+156%',
    category: 'Research',
    minimumTokens: 750,
    tokenSymbol: 'ALPHA',
    isJoined: false
  },
  {
    id: 'gamefi',
    name: 'GameFi Guild',
    logo: '🎮',
    members: '145.7K',
    description: 'Web3 gaming, play-to-earn, and GameFi token discussions',
    trending: false,
    growth: '+21%',
    category: 'Gaming',
    minimumTokens: 400,
    tokenSymbol: 'WIZARD',
    isJoined: false
  }
]

export function CommunityDiscovery({ onBack }: CommunityDiscoveryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [communities, setCommunities] = useState(trendingCommunities)

  const categories = ['All', 'DeFi', 'Memes', 'Trading', 'Tech', 'NFTs', 'Research', 'Gaming']

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || community.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const trendingCount = filteredCommunities.filter(c => c.trending).length

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(community =>
      community.id === communityId
        ? { ...community, isJoined: !community.isJoined }
        : community
    ))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Discover Communities</h1>
            <p className="text-gray-400 text-sm">Find your tribe and start earning</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search communities..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
            <p className="text-2xl font-bold text-green-400">{filteredCommunities.length}</p>
            <p className="text-gray-400 text-sm">Communities</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
            <p className="text-2xl font-bold text-yellow-400">{trendingCount}</p>
            <p className="text-gray-400 text-sm">Trending</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
            <p className="text-2xl font-bold text-blue-400">{communities.filter(c => c.isJoined).length}</p>
            <p className="text-gray-400 text-sm">Joined</p>
          </div>
        </div>
      </div>

      {/* Communities List */}
      <div className="px-4 pb-20">
        <div className="space-y-4">
          {filteredCommunities.map((community) => (
            <div
              key={community.id}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-3xl">
                  {community.logo}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{community.name}</h3>
                    {community.trending && (
                      <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 text-red-400" />
                        <span className="text-red-400 text-xs font-bold">TRENDING</span>
                      </div>
                    )}
                    {community.isJoined && (
                      <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-green-400 fill-current" />
                        <span className="text-green-400 text-xs font-bold">JOINED</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">{community.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{community.members}</span>
                      </div>
                      <div className="text-green-400 font-bold">{community.growth} growth</div>
                      <div className="bg-gray-800 px-2 py-1 rounded text-xs">{community.category}</div>
                    </div>

                    <button
                      onClick={() => handleJoinCommunity(community.id)}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all transform hover:scale-105 ${
                        community.isJoined
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-green-500 text-black hover:bg-green-400'
                      }`}
                    >
                      {community.isJoined ? 'Joined' : 'Join'}
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Minimum: {community.minimumTokens} {community.tokenSymbol} tokens
                      </span>
                      <span className="text-green-400 font-bold">Token Gated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Communities Found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  )
}