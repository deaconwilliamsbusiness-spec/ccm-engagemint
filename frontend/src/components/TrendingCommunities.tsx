'use client'

import { useState, useMemo, useCallback } from 'react'
import { ArrowLeft, TrendingUp, Flame, CheckCircle, Activity, MessageCircle, Search, MoreHorizontal, Users } from 'lucide-react'
import { PhoneContainer } from './PhoneContainer'

interface Community {
  id: string
  name: string
  tagline: string
  description: string
  logo: string
  members: string
  memberCount: number
  activeNow: string
  growth: string
  category: string
  verified: boolean
  trending: boolean
  trendingRank?: number
  postsToday: string
  joined: boolean
  token: string
}

interface CommunitiesProps {
  onClose: () => void
  onOpenCommunity: (community: { name: string; logo: string; members: string; token: string }) => void
}

// Reduced from 12 to 6 communities for better performance
const initialCommunities: Community[] = [
  {
    id: '1',
    name: 'SOL Ecosystem',
    tagline: 'Building the future on Solana',
    description: 'The premier community for Solana builders, traders, and enthusiasts.',
    logo: '⚡',
    members: '245K',
    memberCount: 245000,
    activeNow: '12.3K',
    growth: '+18.2%',
    category: 'Blockchain',
    verified: true,
    trending: true,
    trendingRank: 1,
    postsToday: '3.2K',
    joined: false,
    token: 'SOL'
  },
  {
    id: '2',
    name: 'PEPE Nation',
    tagline: 'The dankest corner of crypto',
    description: 'Home of the most legendary meme coin community.',
    logo: '🐸',
    members: '892K',
    memberCount: 892000,
    activeNow: '45.7K',
    growth: '+32.1%',
    category: 'Meme',
    verified: true,
    trending: true,
    trendingRank: 2,
    postsToday: '8.9K',
    joined: false,
    token: 'PEPE'
  },
  {
    id: '3',
    name: 'AI x Crypto',
    tagline: 'Where AI meets blockchain',
    description: 'Exploring the intersection of AI and cryptocurrency.',
    logo: '🤖',
    members: '156K',
    memberCount: 156000,
    activeNow: '8.4K',
    growth: '+24.5%',
    category: 'Technology',
    verified: true,
    trending: true,
    trendingRank: 3,
    postsToday: '1.8K',
    joined: false,
    token: 'AIBOT'
  },
  {
    id: '4',
    name: 'DeFi Protocol Hub',
    tagline: 'Gateway to decentralized finance',
    description: 'Deep dives into DeFi protocols and yield farming strategies.',
    logo: '💎',
    members: '178K',
    memberCount: 178000,
    activeNow: '6.2K',
    growth: '+15.8%',
    category: 'DeFi',
    verified: true,
    trending: false,
    postsToday: '2.1K',
    joined: false,
    token: 'DEFI'
  },
  {
    id: '5',
    name: 'Trading Signals Pro',
    tagline: 'Elite trading community',
    description: 'Professional traders sharing real-time signals and analysis.',
    logo: '📈',
    members: '423K',
    memberCount: 423000,
    activeNow: '18.9K',
    growth: '+21.3%',
    category: 'Trading',
    verified: true,
    trending: true,
    trendingRank: 4,
    postsToday: '5.7K',
    joined: false,
    token: 'TRADE'
  },
  {
    id: '6',
    name: 'NFT Collectors',
    tagline: 'Where digital art meets community',
    description: 'The ultimate hub for NFT collectors and creators.',
    logo: '🎨',
    members: '289K',
    memberCount: 289000,
    activeNow: '11.2K',
    growth: '+12.7%',
    category: 'NFT',
    verified: true,
    trending: false,
    postsToday: '3.8K',
    joined: false,
    token: 'NFTC'
  }
]

export function TrendingCommunities({ onClose, onOpenCommunity }: CommunitiesProps) {
  const [communities, setCommunities] = useState<Community[]>(initialCommunities)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewType, setViewType] = useState<'trending' | 'all'>('trending')
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false
  })

  // Memoize filtered communities to avoid recalculation on every render
  const filteredCommunities = useMemo(() => {
    return communities
      .filter(c => {
        const matchesSearch = searchQuery === '' ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.tagline.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesView = viewType === 'all' || c.trending
        return matchesSearch && matchesView
      })
  }, [communities, searchQuery, viewType])

  // Memoize toast function
  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 2000)
  }, [])

  // Memoize toggle function
  const toggleJoin = useCallback((id: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === id) {
        const newJoinedState = !c.joined
        showToast(newJoinedState ? `🎉 Joined ${c.name}!` : `Left ${c.name}`)
        return { ...c, joined: newJoinedState }
      }
      return c
    }))
  }, [showToast])

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-gray-950"
      onClick={(e) => {
        // Close if clicking the backdrop (not the content)
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <PhoneContainer>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-gray-400 hover:text-white transition-all hover:scale-110"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-white tracking-tight">Communities</h1>
          <button className="text-gray-400 hover:text-white transition-all hover:scale-110 invisible">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

      {/* Compact Search & Tabs */}
      <div className="px-4 py-3 border-b border-gray-700/30 bg-gray-900/50">
        {/* View Type Tabs */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setViewType('trending')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
              viewType === 'trending'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending</span>
            </div>
          </button>
          <button
            onClick={() => setViewType('all')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
              viewType === 'all'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>All</span>
            </div>
          </button>
        </div>

        {/* Compact Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg pl-8 pr-3 py-1.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => {
                onOpenCommunity({
                  name: community.name,
                  logo: community.logo,
                  members: community.members,
                  token: community.token
                })
                onClose()
              }}
              className="bg-gray-800/80 border border-gray-700/50 rounded-xl p-4 hover:border-green-500/50 transition-all cursor-pointer"
            >
              {/* Header Row */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {community.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-white font-bold text-sm truncate">{community.name}</h3>
                    {community.verified && <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
                    {community.trending && (
                      <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        #{community.trendingRank}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-[10px]">{community.tagline}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleJoin(community.id)
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    community.joined
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {community.joined ? '✓' : 'JOIN'}
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-xs mb-3 line-clamp-1">{community.description}</p>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-700/30 rounded-lg p-1.5 text-center">
                  <Users className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                  <div className="text-white font-bold text-[10px]">{community.members}</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-1.5 text-center">
                  <Activity className="w-3 h-3 text-green-400 mx-auto mb-0.5" />
                  <div className="text-white font-bold text-[10px]">{community.activeNow}</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-1.5 text-center">
                  <TrendingUp className="w-3 h-3 text-green-400 mx-auto mb-0.5" />
                  <div className="text-green-400 font-bold text-[10px]">{community.growth}</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-1.5 text-center">
                  <MessageCircle className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                  <div className="text-white font-bold text-[10px]">{community.postsToday}</div>
                </div>
              </div>
            </div>
          ))}

          {filteredCommunities.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                  🔍
                </div>
                <h3 className="text-white font-bold text-lg mb-1">No communities found</h3>
                <p className="text-gray-400 text-xs">Try a different search</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60]">
          <div className="bg-gray-800 border border-green-500/50 rounded-xl px-6 py-3">
            <p className="text-white font-bold text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </PhoneContainer>
    </div>
  )
}
