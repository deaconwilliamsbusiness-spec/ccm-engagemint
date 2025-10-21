'use client'

import { X, Lock, ShieldCheck, Users, MessageCircle, Heart, ChevronDown } from 'lucide-react'
import { useState } from 'react'

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
  const [postFilter, setPostFilter] = useState<'creator' | 'community'>('creator')

  const hasAccess = isAdmin || userTokenBalance >= minimumTokens

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

  const currentPosts = postFilter === 'creator' ? creatorPosts : communityPosts

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-gray-900 rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-gray-800 mx-4"
        style={{ pointerEvents: 'auto', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-b border-gray-800 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{communityLogo}</div>
              <div>
                <h2 className="text-white font-bold text-xl">{communityName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-400 text-sm">{communityMembers} members</p>
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-full px-2 py-0.5">
                    <Lock className="w-3 h-3 text-yellow-400 inline" />
                    <span className="text-yellow-400 text-[10px] font-bold ml-1">TOKEN GATED</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Token Gate Banner */}
          {hasAccess ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-green-400 font-bold text-sm">Access Granted ✓</h4>
                <p className="text-gray-300 text-xs">
                  {isAdmin
                    ? '🔥 Admin Access - Ultimate Powers'
                    : `You hold ${userTokenBalance} $${creatorToken} tokens`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-yellow-400 font-bold text-sm">Community Locked</h4>
                <p className="text-gray-300 text-xs">
                  Hold {minimumTokens} ${creatorToken} tokens to unlock full access
                </p>
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-base">
                {hasAccess ? 'Recent Posts' : 'Preview (Top 3)'}
              </h3>

              {/* Filter Dropdown */}
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

            {/* Post Previews */}
            <div className="space-y-3">
              {currentPosts.map((post, index) => {
                const isLocked = !hasAccess && index > 0

                return (
                  <div key={post.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 relative overflow-hidden">
                    {/* Locked Overlay for non-members */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                        <div className="text-center px-4">
                          <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-yellow-400 text-xs font-bold mb-1">Token Gated Content</p>
                          <p className="text-gray-400 text-[10px]">
                            Buy {minimumTokens} ${creatorToken} to unlock
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {post.avatar}
                        </span>
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
                )
              })}
            </div>

            {/* Token Gate Info */}
            {!hasAccess && (
              <div className="mt-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
                <p className="text-gray-400 text-xs text-center">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Viewing {postFilter === 'creator' ? 'creator' : 'community'} posts preview. Buy tokens to unlock all content.
                </p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
              <div className="text-gray-400 text-[10px] mb-1">Posts</div>
              <div className="text-white font-bold text-base">
                {postFilter === 'creator' ? '47' : '247'}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
              <div className="text-gray-400 text-[10px] mb-1">Members</div>
              <div className="text-white font-bold text-base">{communityMembers}</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-center">
              <div className="text-gray-400 text-[10px] mb-1">Min. ${creatorToken}</div>
              <div className="text-green-400 font-bold text-base">{minimumTokens}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!hasAccess && (
              <button
                onClick={() => {
                  onClose()
                  onBuyTokens?.()
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-lg">💰</span>
                <span>Buy ${creatorToken} to Join</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all border border-gray-700"
            >
              Close Preview
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <p className="text-gray-400 text-xs leading-relaxed text-center">
              <Users className="w-3 h-3 inline mr-1" />
              This community is token-gated. Hold {minimumTokens} ${creatorToken} tokens to unlock exclusive content, posts, and discussions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
