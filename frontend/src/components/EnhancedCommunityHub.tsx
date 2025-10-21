'use client'

import { ArrowLeft, Search, TrendingUp, Users, Flame, Star, MessageCircle, Heart, Share2, Bookmark, MoreHorizontal, Shield, CheckCircle, Sparkles, Eye, Plus, Filter, Grid, List, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { CommunityCommentsModal } from './CommunityCommentsModal'
import { CreatePostModal } from './CreatePostModal'

interface EnhancedCommunityHubProps {
  onBack: () => void
  selectedCommunity?: string
}

type ViewMode = 'discovery' | 'community'
type DiscoveryView = 'grid' | 'list'
type SortOption = 'trending' | 'new' | 'top' | 'members'
type FeedFilter = 'all' | 'discussion' | 'media' | 'polls'

interface Community {
  id: string
  name: string
  logo: string
  coverImage?: string
  members: number
  online: number
  category: string
  verified: boolean
  description: string
  postsPerHour: number
  joined: boolean
  growth: string
  badges: string[]
  rules: string[]
  admins: { name: string; avatar: string }[]
}

interface Post {
  id: number
  author: string
  authorAvatar: string
  verified: boolean
  role?: 'admin' | 'moderator' | 'og' | 'active'
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  bookmarked: boolean
  liked: boolean
  isPinned?: boolean
  hasMedia?: boolean
  mediaType?: 'image' | 'video' | 'poll'
  mediaUrl?: string
  reactions: {
    fire: number
    rocket: number
    thinking: number
    heart: number
  }
}

const initialCommunities: Community[] = [
  {
    id: 'sol',
    name: 'SOL Ecosystem',
    logo: '🔥',
    coverImage: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    members: 45200,
    online: 3420,
    category: 'Blockchain',
    verified: true,
    description: 'Official Solana ecosystem community. Discuss dApps, NFTs, DeFi and network updates.',
    postsPerHour: 47,
    joined: true,
    growth: '+12.3%',
    badges: ['Verified', 'Top 10'],
    rules: ['Be respectful', 'No spam', 'Stay on topic'],
    admins: [{ name: '@solana_dev', avatar: '👨‍💻' }, { name: '@sol_admin', avatar: '👩‍💼' }]
  },
  {
    id: 'ai',
    name: 'AI x Crypto',
    logo: '🤖',
    coverImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    members: 32800,
    online: 2100,
    category: 'Technology',
    verified: true,
    description: 'Where artificial intelligence meets blockchain technology. AI trading, ML models, and more.',
    postsPerHour: 35,
    joined: false,
    growth: '+8.7%',
    badges: ['Verified', 'Rising'],
    rules: ['Quality content only', 'Cite sources', 'No FUD'],
    admins: [{ name: '@ai_research', avatar: '🧠' }]
  },
  {
    id: 'pepe',
    name: 'PEPE Army',
    logo: '🐸',
    coverImage: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    members: 67300,
    online: 5200,
    category: 'Meme',
    verified: true,
    description: 'The biggest PEPE community. Memes, diamond hands, and moon missions only! 🚀',
    postsPerHour: 89,
    joined: true,
    growth: '+25.1%',
    badges: ['Verified', 'Most Active'],
    rules: ['Memes welcome', 'HODL only', 'No negativity'],
    admins: [{ name: '@pepe_king', avatar: '👑' }, { name: '@meme_lord', avatar: '🎭' }]
  },
  {
    id: 'defi',
    name: 'DeFi Protocol Hub',
    logo: '💎',
    coverImage: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    members: 28500,
    online: 1800,
    category: 'DeFi',
    verified: true,
    description: 'Deep dive into DeFi protocols, yield farming strategies, and risk management.',
    postsPerHour: 28,
    joined: false,
    growth: '+6.2%',
    badges: ['Verified', 'Educational'],
    rules: ['Share alpha', 'DYOR', 'Discuss protocols'],
    admins: [{ name: '@defi_expert', avatar: '📊' }]
  },
  {
    id: 'trading',
    name: 'Trading Signals Pro',
    logo: '📈',
    coverImage: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    members: 89100,
    online: 6700,
    category: 'Trading',
    verified: true,
    description: 'Professional trading community. Chart analysis, strategies, and real-time signals.',
    postsPerHour: 112,
    joined: true,
    growth: '+15.8%',
    badges: ['Verified', 'Top 5', 'Premium'],
    rules: ['No financial advice', 'Share charts', 'Be professional'],
    admins: [{ name: '@trade_master', avatar: '💹' }, { name: '@chart_wizard', avatar: '🔮' }]
  },
  {
    id: 'nft',
    name: 'NFT Collectors',
    logo: '🎨',
    coverImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    members: 54600,
    online: 4100,
    category: 'NFT',
    verified: true,
    description: 'Discover, discuss, and trade NFTs. From art to utility NFTs and everything between.',
    postsPerHour: 56,
    joined: false,
    growth: '+9.4%',
    badges: ['Verified', 'Creative'],
    rules: ['Show your NFTs', 'No floor sweeping', 'Support artists'],
    admins: [{ name: '@nft_queen', avatar: '👸' }]
  }
]

const initialPosts: Post[] = [
  {
    id: 1,
    author: '@solana_dev',
    authorAvatar: '👨‍💻',
    verified: true,
    role: 'admin',
    content: 'Major network upgrade completed! 🎉\n\nTransaction finality is now down to 400ms on average. This is a huge step forward for the ecosystem.\n\n#Solana #Web3',
    timestamp: '12m ago',
    likes: 1247,
    comments: 156,
    shares: 89,
    bookmarked: false,
    liked: true,
    isPinned: true,
    reactions: { fire: 234, rocket: 189, thinking: 12, heart: 312 }
  },
  {
    id: 2,
    author: '@crypto_analyst',
    authorAvatar: '📊',
    verified: true,
    role: 'active',
    content: 'SOL technical analysis 🔥\n\nBreaking above $180 resistance with strong volume. Next target: $220\n\nNot financial advice, DYOR!',
    timestamp: '45m ago',
    likes: 892,
    comments: 234,
    shares: 67,
    bookmarked: true,
    liked: false,
    hasMedia: true,
    mediaType: 'image',
    reactions: { fire: 445, rocket: 234, thinking: 89, heart: 124 }
  },
  {
    id: 3,
    author: '@sol_trader',
    authorAvatar: '💹',
    verified: false,
    role: 'og',
    content: 'Who else is staking their SOL? 🤝\n\nJust hit 10k SOL staked. The passive income is beautiful! What are your favorite validators?',
    timestamp: '1h ago',
    likes: 567,
    comments: 123,
    shares: 34,
    bookmarked: false,
    liked: false,
    reactions: { fire: 89, rocket: 56, thinking: 23, heart: 399 }
  },
  {
    id: 4,
    author: '@nft_builder',
    authorAvatar: '🎨',
    verified: true,
    content: 'New NFT collection dropping on Solana next week! 👀\n\nFirst 100 minters get special perks. Who\'s interested?',
    timestamp: '2h ago',
    likes: 445,
    comments: 89,
    shares: 23,
    bookmarked: false,
    liked: true,
    hasMedia: true,
    mediaType: 'image',
    reactions: { fire: 123, rocket: 67, thinking: 12, heart: 243 }
  }
]

export function EnhancedCommunityHub({ onBack, selectedCommunity }: EnhancedCommunityHubProps) {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>(selectedCommunity ? 'community' : 'discovery')
  const [discoveryView, setDiscoveryView] = useState<DiscoveryView>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('trending')
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Data state
  const [communities, setCommunities] = useState<Community[]>(initialCommunities)
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(
    selectedCommunity ? initialCommunities.find(c => c.name === selectedCommunity) || null : null
  )

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  // Modal states
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)

  // Show toast notification
  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => {
      setToast({ message: '', visible: false })
    }, 2000)
  }

  // Toggle community join/leave
  const toggleCommunityJoin = (communityId: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === communityId) {
        const newJoinedState = !c.joined
        showToast(newJoinedState ? `Joined ${c.name}! 🎉` : `Left ${c.name}`)
        return { ...c, joined: newJoinedState }
      }
      return c
    }))

    // Update active community if it's the one being toggled
    if (activeCommunity?.id === communityId) {
      setActiveCommunity(prev => prev ? { ...prev, joined: !prev.joined } : null)
    }
  }

  // Toggle post like
  const togglePostLike = (postId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newLikedState = !p.liked
        return {
          ...p,
          liked: newLikedState,
          likes: newLikedState ? p.likes + 1 : p.likes - 1
        }
      }
      return p
    }))
  }

  // Toggle post bookmark
  const togglePostBookmark = (postId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newBookmarkedState = !p.bookmarked
        showToast(newBookmarkedState ? 'Post bookmarked!' : 'Bookmark removed')
        return { ...p, bookmarked: newBookmarkedState }
      }
      return p
    }))
  }

  // Add reaction to post
  const addReaction = (postId: number, reactionType: 'fire' | 'rocket' | 'thinking' | 'heart') => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: p.reactions[reactionType] + 1
          }
        }
      }
      return p
    }))
  }

  // Handle share action
  const handleShare = (postId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, shares: p.shares + 1 }
      }
      return p
    }))
    showToast('Post shared! 🚀')
  }

  // Handle comment action
  const handleComment = (postId: number) => {
    setSelectedPostId(postId)
    setIsCommentsModalOpen(true)
  }

  // Handle create post
  const handleCreatePost = () => {
    setIsCreatePostModalOpen(true)
  }

  // Handle comment count change
  const handleCommentCountChange = (postId: number, newCount: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: newCount }
      }
      return p
    }))
  }

  // Handle new post created
  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts])
    showToast('Post created successfully! 🎉')
  }

  const categories = ['all', 'Blockchain', 'DeFi', 'Meme', 'Trading', 'NFT', 'Technology']

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/50 rounded-full px-2 py-0.5">
          <Shield className="w-3 h-3 text-red-400" />
          <span className="text-red-400 text-[10px] font-bold">ADMIN</span>
        </div>
      case 'moderator':
        return <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/50 rounded-full px-2 py-0.5">
          <Shield className="w-3 h-3 text-blue-400" />
          <span className="text-blue-400 text-[10px] font-bold">MOD</span>
        </div>
      case 'og':
        return <div className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/50 rounded-full px-2 py-0.5">
          <Star className="w-3 h-3 text-purple-400" />
          <span className="text-purple-400 text-[10px] font-bold">OG</span>
        </div>
      case 'active':
        return <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 rounded-full px-2 py-0.5">
          <Flame className="w-3 h-3 text-green-400" />
          <span className="text-green-400 text-[10px] font-bold">ACTIVE</span>
        </div>
      default:
        return null
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedCommunities = [...filteredCommunities].sort((a, b) => {
    switch (sortBy) {
      case 'members':
        return b.members - a.members
      case 'trending':
        return b.postsPerHour - a.postsPerHour
      case 'new':
        return parseFloat(b.growth) - parseFloat(a.growth)
      default:
        return 0
    }
  })

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="relative w-full max-w-md h-full bg-black/40 backdrop-blur-sm border-x border-gray-800/50 overflow-hidden flex flex-col">

          {/* Header */}
          <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={viewMode === 'community' && activeCommunity ? () => setViewMode('discovery') : onBack}
                  className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-full p-2.5 hover:from-green-500/30 hover:to-emerald-600/30 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-green-400" />
                </button>

                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <h1 className="font-black text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {viewMode === 'community' && activeCommunity ? activeCommunity.name : 'ENGAGE'}
                  </h1>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Search Bar */}
              {viewMode === 'discovery' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Category Filter */}
            {viewMode === 'discovery' && (
              <div className="px-6 pb-3 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-green-500/30'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View Controls */}
            {viewMode === 'discovery' && (
              <div className="px-6 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="trending">🔥 Trending</option>
                    <option value="members">👥 Most Members</option>
                    <option value="new">✨ Fastest Growing</option>
                  </select>
                </div>

                <div className="flex gap-1 bg-gray-800/50 border border-gray-700/50 rounded-lg p-1">
                  <button
                    onClick={() => setDiscoveryView('grid')}
                    className={`p-1.5 rounded transition-all ${
                      discoveryView === 'grid' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDiscoveryView('list')}
                    className={`p-1.5 rounded transition-all ${
                      discoveryView === 'list' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'discovery' ? (
              /* Discovery Mode */
              <div className="px-6 py-4">
                {discoveryView === 'grid' ? (
                  /* Grid View */
                  <div className="grid grid-cols-2 gap-3">
                    {sortedCommunities.map(community => (
                      <div
                        key={community.id}
                        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-4 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all group"
                      >
                        {/* Cover - Clickable to open community */}
                        <div
                          onClick={() => {
                            console.log('Opening community:', community.name)
                            setActiveCommunity(community)
                            setViewMode('community')
                          }}
                          className="h-20 rounded-xl mb-3 flex items-center justify-center text-4xl relative overflow-hidden cursor-pointer"
                          style={{ background: community.coverImage }}
                        >
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                          <span className="relative z-10 drop-shadow-lg">{community.logo}</span>
                        </div>

                        {/* Info */}
                        <div className="space-y-2">
                          <div
                            onClick={() => {
                              console.log('Opening community:', community.name)
                              setActiveCommunity(community)
                              setViewMode('community')
                            }}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            <h3 className="font-bold text-sm text-white truncate group-hover:text-green-400 transition-colors">{community.name}</h3>
                            {community.verified && <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-gray-400">
                              <Users className="w-3 h-3" />
                              <span>{formatNumber(community.members)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-400">
                              <TrendingUp className="w-3 h-3" />
                              <span>{community.growth}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] bg-gray-700/50 border border-gray-600/50 rounded-full px-2 py-0.5 text-gray-300">
                              {community.category}
                            </span>
                            {community.joined ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('Leaving community:', community.name)
                                  toggleCommunityJoin(community.id)
                                }}
                                className="text-[10px] bg-green-500/20 border border-green-500/50 rounded-full px-2 py-0.5 text-green-400 font-bold hover:bg-green-500/30 transition-all active:scale-95"
                              >
                                ✓ JOINED
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('Joining community:', community.name)
                                  toggleCommunityJoin(community.id)
                                }}
                                className="text-[10px] bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-2 py-0.5 text-white font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95"
                              >
                                JOIN
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-3">
                    {sortedCommunities.map(community => (
                      <div
                        key={community.id}
                        className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-4 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                      >
                        <div className="flex gap-4">
                          {/* Logo - Clickable */}
                          <div
                            onClick={() => {
                              console.log('Opening community:', community.name)
                              setActiveCommunity(community)
                              setViewMode('community')
                            }}
                            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            style={{ background: community.coverImage }}
                          >
                            {community.logo}
                          </div>

                          {/* Info - Clickable */}
                          <div
                            onClick={() => {
                              console.log('Opening community:', community.name)
                              setActiveCommunity(community)
                              setViewMode('community')
                            }}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <h3 className="font-bold text-base text-white truncate group-hover:text-green-400 transition-colors">{community.name}</h3>
                              {community.verified && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                            </div>

                            <p className="text-xs text-gray-400 line-clamp-2 mb-2">{community.description}</p>

                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Users className="w-3 h-3" />
                                <span>{formatNumber(community.members)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-green-400">
                                <Flame className="w-3 h-3" />
                                <span>{community.postsPerHour}/hr</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-400">
                                <Eye className="w-3 h-3" />
                                <span>{formatNumber(community.online)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="flex flex-col items-end justify-between">
                            {community.joined ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('Leaving community:', community.name)
                                  toggleCommunityJoin(community.id)
                                }}
                                className="bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-1.5 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-all active:scale-95"
                              >
                                ✓ JOINED
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('Joining community:', community.name)
                                  toggleCommunityJoin(community.id)
                                }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg px-3 py-1.5 text-white text-xs font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95"
                              >
                                JOIN
                              </button>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-green-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Community Detail View */
              activeCommunity && (
                <div className="space-y-0">
                  {/* Community Header */}
                  <div
                    className="relative h-32 flex items-end justify-center overflow-hidden"
                    style={{ background: activeCommunity.coverImage }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="relative z-10 text-center pb-6">
                      <div className="text-5xl mb-2">{activeCommunity.logo}</div>
                    </div>
                  </div>

                  {/* Community Stats */}
                  <div className="bg-gray-900/95 border-b border-gray-800/50 px-6 py-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <h2 className="font-black text-xl text-white">{activeCommunity.name}</h2>
                      {activeCommunity.verified && <CheckCircle className="w-5 h-5 text-green-400" />}
                    </div>

                    <p className="text-sm text-gray-400 text-center mb-4">{activeCommunity.description}</p>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
                        <div className="text-green-400 font-bold text-lg">{formatNumber(activeCommunity.members)}</div>
                        <div className="text-gray-400 text-xs">Members</div>
                      </div>
                      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
                        <div className="text-blue-400 font-bold text-lg">{formatNumber(activeCommunity.online)}</div>
                        <div className="text-gray-400 text-xs">Online</div>
                      </div>
                      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
                        <div className="text-purple-400 font-bold text-lg">{activeCommunity.postsPerHour}</div>
                        <div className="text-gray-400 text-xs">Posts/hr</div>
                      </div>
                    </div>

                    {activeCommunity.joined ? (
                      <button
                        onClick={() => toggleCommunityJoin(activeCommunity.id)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 text-white font-bold hover:bg-gray-700 transition-all"
                      >
                        Joined ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleCommunityJoin(activeCommunity.id)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl py-3 text-white font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                      >
                        Join Community
                      </button>
                    )}
                  </div>

                  {/* Feed Filter Tabs */}
                  <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 px-6 py-3">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {(['all', 'discussion', 'media', 'polls'] as FeedFilter[]).map(filter => (
                        <button
                          key={filter}
                          onClick={() => setFeedFilter(filter)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                            feedFilter === filter
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                              : 'bg-gray-800/50 text-gray-400 hover:text-white'
                          }`}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Posts Feed */}
                  <div className="px-6 py-4 space-y-4">
                    {posts.map(post => (
                      <div
                        key={post.id}
                        className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 border rounded-2xl p-4 hover:border-green-500/30 transition-all ${
                          post.isPinned ? 'border-yellow-500/50' : 'border-gray-700/50'
                        }`}
                      >
                        {/* Pinned Badge */}
                        {post.isPinned && (
                          <div className="flex items-center gap-1.5 mb-3 text-yellow-400">
                            <Star className="w-3.5 h-3.5 fill-yellow-400" />
                            <span className="text-xs font-bold">PINNED POST</span>
                          </div>
                        )}

                        {/* Post Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg flex-shrink-0">
                            {post.authorAvatar}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold text-sm text-white">{post.author}</span>
                              {post.verified && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                              {getRoleBadge(post.role)}
                              <span className="text-gray-500 text-xs">{post.timestamp}</span>
                            </div>
                          </div>

                          <button className="text-gray-500 hover:text-white transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Post Content */}
                        <p className="text-gray-300 text-sm leading-relaxed mb-3 whitespace-pre-line">
                          {post.content}
                        </p>

                        {/* Media Preview */}
                        {post.hasMedia && (
                          <div className="bg-gray-700/30 border border-gray-700/50 rounded-xl h-48 mb-3 flex items-center justify-center text-gray-500">
                            📷 Media Content
                          </div>
                        )}

                        {/* Reactions */}
                        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-700/50">
                          <button
                            onClick={() => addReaction(post.id, 'heart')}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors group active:scale-95"
                          >
                            <div className="bg-gray-700/50 group-hover:bg-red-500/20 rounded-full p-1.5 transition-all">
                              ❤️
                            </div>
                            <span className="text-xs font-medium">{post.reactions.heart}</span>
                          </button>
                          <button
                            onClick={() => addReaction(post.id, 'fire')}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-orange-400 transition-colors group active:scale-95"
                          >
                            <div className="bg-gray-700/50 group-hover:bg-orange-500/20 rounded-full p-1.5 transition-all">
                              🔥
                            </div>
                            <span className="text-xs font-medium">{post.reactions.fire}</span>
                          </button>
                          <button
                            onClick={() => addReaction(post.id, 'rocket')}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors group active:scale-95"
                          >
                            <div className="bg-gray-700/50 group-hover:bg-blue-500/20 rounded-full p-1.5 transition-all">
                              🚀
                            </div>
                            <span className="text-xs font-medium">{post.reactions.rocket}</span>
                          </button>
                          <button
                            onClick={() => addReaction(post.id, 'thinking')}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-yellow-400 transition-colors group active:scale-95"
                          >
                            <div className="bg-gray-700/50 group-hover:bg-yellow-500/20 rounded-full p-1.5 transition-all">
                              🤔
                            </div>
                            <span className="text-xs font-medium">{post.reactions.thinking}</span>
                          </button>
                        </div>

                        {/* Post Actions */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleComment(post.id)}
                            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">{post.comments}</span>
                          </button>
                          <button
                            onClick={() => handleShare(post.id)}
                            className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors active:scale-95"
                          >
                            <Share2 className="w-4 h-4" />
                            <span className="text-xs font-medium">{post.shares}</span>
                          </button>
                          <button
                            onClick={() => togglePostBookmark(post.id)}
                            className={`transition-colors active:scale-95 ${post.bookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                          >
                            <Bookmark className={`w-4 h-4 ${post.bookmarked ? 'fill-yellow-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => togglePostLike(post.id)}
                            className={`transition-colors active:scale-95 ${post.liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                          >
                            <Heart className={`w-4 h-4 ${post.liked ? 'fill-red-400' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Create Post Button */}
                    <button
                      onClick={handleCreatePost}
                      className="w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-dashed border-gray-700/50 hover:border-green-500/50 rounded-2xl p-6 transition-all group active:scale-98"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-3 group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-white font-bold text-sm group-hover:text-green-400 transition-colors">Create a Post</div>
                          <div className="text-gray-400 text-xs">Share with the community</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-800 border border-green-500/50 rounded-xl px-6 py-3 shadow-2xl shadow-green-500/20 backdrop-blur-xl">
            <p className="text-white font-semibold text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Community Comments Modal */}
      {selectedPostId !== null && (
        <CommunityCommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => {
            setIsCommentsModalOpen(false)
            setSelectedPostId(null)
          }}
          postId={selectedPostId}
          postAuthor={posts.find(p => p.id === selectedPostId)?.author || ''}
          initialCommentCount={posts.find(p => p.id === selectedPostId)?.comments || 0}
          onCommentCountChange={(count) => handleCommentCountChange(selectedPostId, count)}
        />
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        communityName={activeCommunity?.name || 'Community'}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}
