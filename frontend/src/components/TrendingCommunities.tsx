'use client'

import { useState } from 'react'
import { X, Users, TrendingUp, Flame, CheckCircle, Sparkles, Activity, MessageCircle, ChevronRight, Search } from 'lucide-react'
import { PhoneContainer } from './PhoneContainer'

interface Community {
  id: string
  name: string
  tagline: string
  description: string
  logo: string
  banner: string
  members: string
  memberCount: number
  activeNow: string
  growth: string
  growthNumber: number
  category: string
  verified: boolean
  trending: boolean
  trendingRank?: number
  postsToday: string
  joined: boolean
  hotTopics: string[]
  color: string
  token: string
  established?: boolean
}

interface CommunitiesProps {
  onClose: () => void
  onOpenCommunity: (community: { name: string; logo: string; members: string; token: string }) => void
}

const initialCommunities: Community[] = [
  // Established Communities
  {
    id: 'btc-1',
    name: 'Bitcoin Maximalists',
    tagline: 'Digital gold standard since 2009',
    description: 'The OG cryptocurrency community. HODLers, miners, and believers in the original vision of decentralized money. Bitcoin is the only real crypto.',
    logo: '₿',
    banner: 'from-orange-500 to-yellow-600',
    members: '1.2M',
    memberCount: 1200000,
    activeNow: '67.8K',
    growth: '+8.3%',
    growthNumber: 8.3,
    category: 'Blockchain',
    verified: true,
    trending: false,
    postsToday: '15.2K',
    joined: false,
    hotTopics: ['Halving 2024', 'Lightning Network', 'HODL Gang'],
    color: 'orange',
    token: 'BTC',
    established: true
  },
  {
    id: 'eth-1',
    name: 'Ethereum Community',
    tagline: 'Building the decentralized world',
    description: 'The largest smart contract platform community. Developers, validators, and enthusiasts building the future of web3 on Ethereum.',
    logo: '◈',
    banner: 'from-indigo-500 to-purple-600',
    members: '980K',
    memberCount: 980000,
    activeNow: '52.4K',
    growth: '+11.7%',
    growthNumber: 11.7,
    category: 'Blockchain',
    verified: true,
    trending: false,
    postsToday: '12.8K',
    joined: false,
    hotTopics: ['ETH 2.0', 'Layer 2s', 'EIP Updates'],
    color: 'indigo',
    token: 'ETH',
    established: true
  },
  {
    id: 'bnb-1',
    name: 'BNB Chain Hub',
    tagline: 'Fast, affordable, and scalable',
    description: 'The official community for Binance Smart Chain. Low fees, high speed, and massive ecosystem of DeFi projects and dApps.',
    logo: '🔶',
    banner: 'from-yellow-500 to-amber-600',
    members: '654K',
    memberCount: 654000,
    activeNow: '34.2K',
    growth: '+9.4%',
    growthNumber: 9.4,
    category: 'Blockchain',
    verified: true,
    trending: false,
    postsToday: '8.7K',
    joined: false,
    hotTopics: ['BSC DeFi', 'PancakeSwap', 'BNB Burn'],
    color: 'yellow',
    token: 'BNB',
    established: true
  },
  {
    id: 'ada-1',
    name: 'Cardano Builders',
    tagline: 'Peer-reviewed blockchain innovation',
    description: 'Research-driven community building the most sustainable and scalable blockchain. Academic rigor meets real-world applications.',
    logo: '₳',
    banner: 'from-blue-500 to-cyan-600',
    members: '427K',
    memberCount: 427000,
    activeNow: '18.9K',
    growth: '+6.2%',
    growthNumber: 6.2,
    category: 'Blockchain',
    verified: true,
    trending: false,
    postsToday: '5.3K',
    joined: false,
    hotTopics: ['Hydra', 'Plutus', 'Governance'],
    color: 'blue',
    token: 'ADA',
    established: true
  },
  {
    id: '1',
    name: 'SOL Ecosystem',
    tagline: 'Building the future on Solana',
    description: 'The premier community for Solana builders, traders, and enthusiasts. Join us to discuss the latest protocols, share alpha, and connect with fellow Solana lovers.',
    logo: '⚡',
    banner: 'from-purple-600 to-indigo-700',
    members: '245K',
    memberCount: 245000,
    activeNow: '12.3K',
    growth: '+18.2%',
    growthNumber: 18.2,
    category: 'Blockchain',
    verified: true,
    trending: true,
    trendingRank: 1,
    postsToday: '3.2K',
    joined: false,
    hotTopics: ['Jupiter Airdrop', 'DeFi Yield', 'New Protocols'],
    color: 'purple',
    token: 'SOL'
  },
  {
    id: '2',
    name: 'PEPE Nation',
    tagline: 'The dankest corner of crypto',
    description: 'Home of the most legendary meme coin community. We don\'t just hold PEPE, we ARE PEPE. Join the movement that\'s taking over crypto one meme at a time.',
    logo: '🐸',
    banner: 'from-green-600 to-emerald-700',
    members: '892K',
    memberCount: 892000,
    activeNow: '45.7K',
    growth: '+32.1%',
    growthNumber: 32.1,
    category: 'Meme',
    verified: true,
    trending: true,
    trendingRank: 2,
    postsToday: '8.9K',
    joined: false,
    hotTopics: ['PEPE 2.0', 'Moon Mission', 'Dank Memes'],
    color: 'green',
    token: 'PEPE'
  },
  {
    id: '3',
    name: 'AI x Crypto',
    tagline: 'Where artificial intelligence meets blockchain',
    description: 'Exploring the intersection of AI and cryptocurrency. From AI trading bots to decentralized ML models, this is where the future is being built.',
    logo: '🤖',
    banner: 'from-cyan-600 to-blue-700',
    members: '156K',
    memberCount: 156000,
    activeNow: '8.4K',
    growth: '+24.5%',
    growthNumber: 24.5,
    category: 'Technology',
    verified: true,
    trending: true,
    trendingRank: 3,
    postsToday: '1.8K',
    joined: false,
    hotTopics: ['ChatGPT Tokens', 'AI Agents', 'ML Trading'],
    color: 'cyan',
    token: 'AIBOT'
  },
  {
    id: '4',
    name: 'DeFi Protocol Hub',
    tagline: 'Your gateway to decentralized finance',
    description: 'Deep dives into DeFi protocols, yield farming strategies, and the latest innovations in decentralized finance. For serious DeFi enthusiasts only.',
    logo: '💎',
    banner: 'from-blue-600 to-indigo-700',
    members: '178K',
    memberCount: 178000,
    activeNow: '6.2K',
    growth: '+15.8%',
    growthNumber: 15.8,
    category: 'DeFi',
    verified: true,
    trending: false,
    postsToday: '2.1K',
    joined: false,
    hotTopics: ['Liquid Staking', 'Yield Strategies', 'Protocol Wars'],
    color: 'blue',
    token: 'DEFI'
  },
  {
    id: '5',
    name: 'Trading Signals Pro',
    tagline: 'Elite trading community',
    description: 'Professional traders sharing real-time signals, technical analysis, and market insights. Our calls have a proven track record of success.',
    logo: '📈',
    banner: 'from-orange-600 to-red-700',
    members: '423K',
    memberCount: 423000,
    activeNow: '18.9K',
    growth: '+21.3%',
    growthNumber: 21.3,
    category: 'Trading',
    verified: true,
    trending: true,
    trendingRank: 4,
    postsToday: '5.7K',
    joined: false,
    hotTopics: ['Breakout Alerts', 'TA Masterclass', 'Whale Moves'],
    color: 'orange',
    token: 'TRADE'
  },
  {
    id: '6',
    name: 'NFT Collectors',
    tagline: 'Where digital art meets community',
    description: 'The ultimate hub for NFT collectors, creators, and enthusiasts. Discover new drops, share your collections, and connect with fellow art lovers.',
    logo: '🎨',
    banner: 'from-pink-600 to-purple-700',
    members: '289K',
    memberCount: 289000,
    activeNow: '11.2K',
    growth: '+12.7%',
    growthNumber: 12.7,
    category: 'NFT',
    verified: true,
    trending: false,
    postsToday: '3.8K',
    joined: false,
    hotTopics: ['New Drops', 'Blue Chips', 'Artist Spotlights'],
    color: 'pink',
    token: 'NFTC'
  },
  {
    id: '7',
    name: 'GameFi Arena',
    tagline: 'Play-to-earn revolution',
    description: 'The premier community for blockchain gaming. Discover new P2E games, guild up, and start earning while you play.',
    logo: '🎮',
    banner: 'from-violet-600 to-purple-700',
    members: '312K',
    memberCount: 312000,
    activeNow: '14.5K',
    growth: '+28.9%',
    growthNumber: 28.9,
    category: 'Gaming',
    verified: true,
    trending: true,
    trendingRank: 5,
    postsToday: '4.6K',
    joined: false,
    hotTopics: ['New Launches', 'Guild Recruitment', 'Earning Guides'],
    color: 'violet',
    token: 'GAME'
  },
  {
    id: '8',
    name: 'Degen Traders',
    tagline: 'High risk, higher rewards',
    description: 'For those who live on the edge. Share your most degen plays, celebrate wins, and commiserate losses with fellow risk-takers.',
    logo: '🎲',
    banner: 'from-red-600 to-orange-700',
    members: '534K',
    memberCount: 534000,
    activeNow: '23.1K',
    growth: '+41.2%',
    growthNumber: 41.2,
    category: 'Trading',
    verified: true,
    trending: true,
    trendingRank: 6,
    postsToday: '9.3K',
    joined: false,
    hotTopics: ['100x Gems', 'YOLO Plays', 'Loss Porn'],
    color: 'red',
    token: 'DEGEN'
  }
]

export function TrendingCommunities({ onClose, onOpenCommunity }: CommunitiesProps) {
  const [communities, setCommunities] = useState<Community[]>(initialCommunities)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewType, setViewType] = useState<'trending' | 'established'>('trending')
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false
  })

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => {
      setToast({ message: '', visible: false })
    }, 2000)
  }

  const toggleJoin = (id: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === id) {
        const newJoinedState = !c.joined
        showToast(newJoinedState ? `🎉 Joined ${c.name}!` : `Left ${c.name}`)
        return { ...c, joined: newJoinedState }
      }
      return c
    }))
  }

  const filteredCommunities = communities
    .filter(c =>
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hotTopics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(c => viewType === 'established' ? c.established : !c.established)

  const joinedCount = communities.filter(c => c.joined).length

  return (
    <PhoneContainer>
      {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/95 via-green-900/20 to-gray-900/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-2.5 shadow-lg ring-2 ring-green-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">
                Communities
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {joinedCount} joined
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2 transition-all hover:rotate-90 duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Search & Tabs */}
        <div className="px-4 py-3 border-b border-gray-700/30 bg-gray-900/50">
          {/* View Type Tabs */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setViewType('trending')
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                viewType === 'trending'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trending</span>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setViewType('established')
              }}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                viewType === 'established'
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Established</span>
              </div>
            </button>
          </div>

          {/* Compact Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg pl-8 pr-8 py-1.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSearchQuery('')
                }}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Communities Grid */}
          <div className="h-full overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-4">
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
                      className="group relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                      {/* Banner */}
                      <div className={`h-16 bg-gradient-to-r ${community.banner} relative`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        {community.trending && (
                          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                            <Flame className="w-2.5 h-2.5" />
                            #{community.trendingRank}
                          </div>
                        )}
                        {community.verified && (
                          <div className="absolute top-1.5 right-1.5 bg-green-500 rounded-full p-0.5 shadow-lg ring-2 ring-white/20">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Logo & Name */}
                        <div className="flex items-start gap-3 mb-2.5">
                          <div className="relative -mt-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-2xl border-3 border-gray-900 shadow-xl group-hover:scale-110 transition-transform">
                              {community.logo}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-base mb-0.5 group-hover:text-green-400 transition-colors">
                              {community.name}
                            </h3>
                            <p className="text-gray-400 text-[11px] font-medium">{community.tagline}</p>
                          </div>
                          <div>
                            {community.joined ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleJoin(community.id)
                                }}
                                className="bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-1 text-green-400 text-[10px] font-bold hover:bg-green-500/30 transition-all active:scale-95"
                              >
                                ✓ JOINED
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleJoin(community.id)
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg px-3.5 py-1 text-white text-[10px] font-bold shadow-lg hover:shadow-green-500/50 transition-all active:scale-95"
                              >
                                JOIN
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 text-xs leading-relaxed mb-3 line-clamp-2">
                          {community.description}
                        </p>

                        {/* Hot Topics */}
                        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
                          {community.hotTopics.map((topic, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-700/50 border border-gray-600/50 rounded-full px-2 py-0.5 text-[9px] text-gray-300 whitespace-nowrap font-medium hover:bg-gray-600/50 transition-colors cursor-pointer"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="bg-gray-700/30 rounded-lg p-1.5 text-center">
                            <div className="flex items-center justify-center gap-0.5 mb-0.5">
                              <Users className="w-2.5 h-2.5 text-gray-400" />
                            </div>
                            <div className="text-white font-bold text-[10px]">{community.members}</div>
                            <div className="text-gray-500 text-[8px] font-medium">Members</div>
                          </div>
                          <div className="bg-gray-700/30 rounded-lg p-1.5 text-center">
                            <div className="flex items-center justify-center gap-0.5 mb-0.5">
                              <Activity className="w-2.5 h-2.5 text-green-400" />
                            </div>
                            <div className="text-white font-bold text-[10px]">{community.activeNow}</div>
                            <div className="text-gray-500 text-[8px] font-medium">Active</div>
                          </div>
                          <div className="bg-gray-700/30 rounded-lg p-1.5 text-center">
                            <div className="flex items-center justify-center gap-0.5 mb-0.5">
                              <TrendingUp className="w-2.5 h-2.5 text-green-400" />
                            </div>
                            <div className="text-green-400 font-bold text-[10px]">{community.growth}</div>
                            <div className="text-gray-500 text-[8px] font-medium">Growth</div>
                          </div>
                          <div className="bg-gray-700/30 rounded-lg p-1.5 text-center">
                            <div className="flex items-center justify-center gap-0.5 mb-0.5">
                              <MessageCircle className="w-2.5 h-2.5 text-gray-400" />
                            </div>
                            <div className="text-white font-bold text-[10px]">{community.postsToday}</div>
                            <div className="text-gray-500 text-[8px] font-medium">Today</div>
                          </div>
                        </div>

                        {/* View Button */}
                        <div className="mt-2.5 flex items-center justify-end">
                          <button className="text-gray-400 hover:text-green-400 transition-colors group/btn">
                            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>

              {filteredCommunities.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
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
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-green-500/50 rounded-2xl px-8 py-4 shadow-2xl shadow-green-500/20 backdrop-blur-xl">
            <p className="text-white font-bold text-base">{toast.message}</p>
          </div>
        </div>
      )}
    </PhoneContainer>
  )
}
