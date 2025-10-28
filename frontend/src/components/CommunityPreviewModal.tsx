'use client'

import { X, Lock, ShieldCheck, Users, MessageCircle, Heart, ChevronDown, Coins } from 'lucide-react'
import { useState } from 'react'
import { PhoneContainer } from './PhoneContainer'

interface CommunityPreviewModalProps {
  onClose: () => void
  communityName: string
  communityLogo: string
  communityMembers: string
  creatorToken: string
  creatorName: string
  minimumTokens?: number
  userTokenBalance?: number
  isAdmin?: boolean
  onBuyTokens?: () => void
}

export function CommunityPreviewModal({
  onClose,
  communityName,
  communityLogo,
  communityMembers,
  creatorToken,
  creatorName,
  minimumTokens = 10,
  userTokenBalance = 0,
  isAdmin = false,
  onBuyTokens
}: CommunityPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'mincoins'>('posts')
  const [postFilter, setPostFilter] = useState<'creator' | 'community'>('creator')

  // BYPASS: Always grant access (Solana feature not built yet)
  const hasAccess = true // was: isAdmin || userTokenBalance >= minimumTokens

  // Sample posts data
  const creatorPosts = [
    {
      id: 1,
      author: creatorName,
      avatar: '👨‍💻',
      verified: true,
      content: `Just shared exclusive alpha on ${creatorToken} strategy 🔥\n\nNew video dropping tomorrow - members get early access!`,
      timestamp: '12m ago',
      likes: 234,
      comments: 45
    },
    {
      id: 2,
      author: creatorName,
      avatar: '👨‍💻',
      verified: true,
      content: 'Community call scheduled for Friday! 📞\n\nWe\'ll discuss the roadmap and answer your questions.',
      timestamp: '2h ago',
      likes: 189,
      comments: 67
    },
    {
      id: 3,
      author: creatorName,
      avatar: '👨‍💻',
      verified: true,
      content: `Big announcement coming next week! 🚀\n\n${creatorToken} holders are going to love this.`,
      timestamp: '5h ago',
      likes: 567,
      comments: 123
    }
  ]

  const communityPosts = [
    {
      id: 1,
      author: '@community_mod',
      avatar: '👥',
      verified: false,
      content: `Best ${creatorToken} holder discussion thread 💬\n\nShare your strategies and insights!`,
      timestamp: '30m ago',
      likes: 156,
      comments: 89
    },
    {
      id: 2,
      author: '@whale_trader',
      avatar: '🐋',
      verified: false,
      content: 'Just bought another 10k tokens! 💎🙌\n\nBullish on this project long term.',
      timestamp: '1h ago',
      likes: 234,
      comments: 56
    },
    {
      id: 3,
      author: '@community_lead',
      avatar: '⭐',
      verified: false,
      content: 'Weekly community highlights and updates 📊\n\nGreat progress this week everyone!',
      timestamp: '3h ago',
      likes: 178,
      comments: 34
    }
  ]

  // Sample members data
  const sampleMembers = [
    { id: 1, username: creatorName, avatar: '👨‍💻', role: 'Creator', tokens: 100000, verified: true },
    { id: 2, username: '@whale_trader', avatar: '🐋', role: 'Whale', tokens: 50000, verified: false },
    { id: 3, username: '@community_mod', avatar: '👥', role: 'Moderator', tokens: 25000, verified: false },
    { id: 4, username: '@early_adopter', avatar: '🌟', role: 'Member', tokens: 15000, verified: false },
    { id: 5, username: '@diamond_hands', avatar: '💎', role: 'Member', tokens: 12000, verified: false },
    { id: 6, username: '@new_member', avatar: '🆕', role: 'Member', tokens: 100, verified: false },
  ]

  const currentPosts = postFilter === 'creator' ? creatorPosts : communityPosts

  return (
    <div
      className="fixed inset-0 z-[110] bg-gray-950"
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
        {/* Header with Community Name */}
        <div className="px-6 py-5 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="text-gray-400 hover:text-white transition-all hover:scale-110"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
            <h1 className="font-bold text-lg text-white tracking-tight">{communityName}</h1>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="text-gray-400 hover:text-white transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'posts'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 inline mr-1" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'members'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              Members
            </button>
            <button
              onClick={() => setActiveTab('mincoins')}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'mincoins'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5 inline mr-1" />
              Min Coins
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="p-4 space-y-4">
              {/* Post Filter */}
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Recent Posts</h3>
                <div className="relative">
                  <select
                    value={postFilter}
                    onChange={(e) => setPostFilter(e.target.value as 'creator' | 'community')}
                    className="appearance-none bg-gray-800 text-white text-xs rounded-lg pl-3 pr-8 py-2 border border-gray-700 focus:outline-none focus:border-green-500 transition-colors cursor-pointer"
                  >
                    <option value="creator">Creator Posts</option>
                    <option value="community">Community Posts</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Posts List */}
              <div className="space-y-3">
                {currentPosts.map((post) => (
                  <div key={post.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{post.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold text-sm">{post.author}</span>
                          {post.verified && (
                            <span className="bg-green-500/20 border border-green-500/50 rounded-full px-1.5 py-0.5 text-green-400 text-[9px] font-bold">
                              CREATOR
                            </span>
                          )}
                          <span className="text-gray-500 text-xs">• {post.timestamp}</span>
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-gray-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Community Members</h3>
                <span className="text-gray-400 text-xs">{communityMembers} total</span>
              </div>

              <div className="space-y-2">
                {sampleMembers.map((member) => (
                  <div key={member.id} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{member.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{member.username}</span>
                        {member.verified && (
                          <span className="bg-green-500/20 border border-green-500/50 rounded-full px-1.5 py-0.5 text-green-400 text-[9px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-400 text-xs">{member.role}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-green-400 text-xs font-medium">{member.tokens.toLocaleString()} ${creatorToken}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Min Coins Tab */}
          {activeTab === 'mincoins' && (
            <div className="p-4 space-y-4">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/30">
                  <Coins className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Minimum Tokens Required</h3>
                <div className="text-5xl font-bold text-green-400 mb-2">{minimumTokens}</div>
                <p className="text-gray-400 text-sm mb-6">${creatorToken} tokens needed to join</p>

                {hasAccess ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 max-w-sm mx-auto">
                    <ShieldCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h4 className="text-green-400 font-bold text-sm mb-1">You Have Access! ✓</h4>
                    <p className="text-gray-300 text-xs">
                      You hold {userTokenBalance.toLocaleString()} ${creatorToken} tokens
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 max-w-sm mx-auto">
                    <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h4 className="text-yellow-400 font-bold text-sm mb-1">Access Locked</h4>
                    <p className="text-gray-300 text-xs mb-3">
                      You need {minimumTokens - userTokenBalance} more ${creatorToken} tokens
                    </p>
                    <button
                      onClick={() => {
                        onClose()
                        onBuyTokens?.()
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-2.5 rounded-lg transition-all text-sm"
                    >
                      Buy ${creatorToken} Tokens
                    </button>
                  </div>
                )}
              </div>

              {/* Benefits List */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <h4 className="text-white font-bold text-sm mb-3">Token Holder Benefits</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Access to all community posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Exclusive creator content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Community governance voting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Early access to new videos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Direct messaging with creator</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800/50 bg-gray-900/80">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all border border-gray-700"
          >
            Close
          </button>
        </div>
      </PhoneContainer>
    </div>
  )
}
