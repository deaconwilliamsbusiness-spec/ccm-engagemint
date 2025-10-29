'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Flame, CheckCircle, Activity, MessageCircle, Search, Users, Loader2, RefreshCw } from 'lucide-react'
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

// NO fallback communities - only show real ones from database

export function TrendingCommunities({ onClose, onOpenCommunity }: CommunitiesProps) {
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewType, setViewType] = useState<'trending' | 'all'>('trending')
  const [toast, setToast] = useState({ visible: false, message: '' })

  // Fetch communities from backend
  const fetchCommunities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api'
      const response = await fetch(`${apiUrl}/communities`)
      const data = await response.json()

      if (data.success && data.data && Array.isArray(data.data)) {
        // Map ONLY real communities from database
        const mappedCommunities: Community[] = data.data.map((dbCommunity: {
          id: string
          name: string
          description?: string
          creator_username?: string
          token_symbol?: string
          token_name?: string
          members_count?: number
        }, index: number) => {
          const memberCount = (dbCommunity.members_count as number) || 0
          const formattedMembers = formatNumber(memberCount)

          return {
            id: dbCommunity.id as string,
            name: dbCommunity.name as string,
            tagline: `Created by @${(dbCommunity.creator_username as string) || 'Unknown'}`,
            description: (dbCommunity.description as string) || 'No description available',
            logo: getLogoForToken((dbCommunity.token_symbol as string) || (dbCommunity.name as string)),
            members: formattedMembers,
            memberCount: memberCount,
            activeNow: '0', // TODO: Calculate from real activity data
            growth: '+0%', // TODO: Calculate from historical data
            category: (dbCommunity.token_name as string) || 'General',
            verified: true, // All database communities are verified
            trending: index < 3, // Top 3 are trending
            trendingRank: index < 3 ? index + 1 : undefined,
            postsToday: '0', // TODO: Count from actual posts
            joined: false,
            token: (dbCommunity.token_symbol as string) || 'TOKEN'
          }
        })

        setCommunities(mappedCommunities)
      } else {
        // API error - show empty
        setCommunities([])
      }
    } catch (err) {
      console.error('Failed to fetch communities:', err)
      setError('Failed to load communities')
      // Show empty on error
      setCommunities([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchCommunities()
  }, [fetchCommunities])

  // Get logo emoji based on token symbol or name
  const getLogoForToken = (tokenOrName: string): string => {
    const name = tokenOrName.toUpperCase()
    const logoMap: { [key: string]: string } = {
      'SOL': '⚡',
      'SOLANA': '⚡',
      'PEPE': '🐸',
      'AI': '🤖',
      'AIBOT': '🤖',
      'DEFI': '💎',
      'NFT': '🎨',
      'NATURE': '🌿',
      'TECH': '💻',
      'MUSIC': '🎵',
      'FITNESS': '💪',
      'GAMING': '🎮',
      'ART': '🎨',
      'FOOD': '🍕',
      'TRAVEL': '✈️',
      'SPORTS': '⚽',
      'CRYPTO': '₿',
      'MEME': '😂'
    }

    // Try exact match
    if (logoMap[name]) return logoMap[name]

    // Try partial match
    for (const key in logoMap) {
      if (name.includes(key)) return logoMap[key]
    }

    // Default
    return '🔥'
  }

  // Format numbers (1000 -> 1K, 1000000 -> 1M)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Filter communities by search query and view type
  const filteredCommunities = useMemo(() => {
    let filtered = communities

    // Apply view type filter
    if (viewType === 'trending') {
      filtered = filtered.filter(c => c.trending)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.token.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [communities, searchQuery, viewType])

  // Toggle join/unjoin
  const toggleJoin = useCallback((id: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === id) {
        const newJoinedState = !c.joined
        showToast(newJoinedState ? `🎉 Joined ${c.name}!` : `Left ${c.name}`)
        return { ...c, joined: newJoinedState }
      }
      return c
    }))
  }, [])

  // Show toast notification
  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 2000)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] bg-gray-950"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
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
          <button
            onClick={(e) => {
              e.stopPropagation()
              fetchCommunities()
            }}
            className="text-gray-400 hover:text-white transition-all hover:scale-110"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading communities...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={fetchCommunities}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg text-sm transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Search & Tabs */}
            <div className="px-4 py-3 border-b border-gray-700/30 bg-gray-900/50">
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

            {/* Communities List */}
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
                    <div className="flex items-center gap-2 text-[10px]">
                      <div className="bg-gray-700/30 rounded-lg p-1.5 text-center flex-1">
                        <Users className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                        <div className="text-white font-bold">{community.members}</div>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-1.5 text-center flex-1">
                        <Activity className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                        <div className="text-white font-bold">{community.activeNow}</div>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-1.5 text-center flex-1">
                        <MessageCircle className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                        <div className="text-white font-bold">{community.postsToday}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredCommunities.length === 0 && (
                  <div className="flex items-center justify-center py-20 px-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                        {searchQuery ? '🔍' : '🌱'}
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">
                        {searchQuery ? 'No communities found' : 'No communities yet'}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed mb-4">
                        {searchQuery
                          ? 'Try a different search term'
                          : 'Be the first to create a community! Mint a video with the "Create Community" option enabled.'}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={onClose}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold rounded-lg text-sm transition-all"
                        >
                          Go to Mint
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

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
