'use client'

import { X, Users, MessageCircle, Heart, ChevronDown, Send, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PhoneContainer } from './PhoneContainer'

interface CommunityPreviewModalProps {
  onClose: () => void
  communityId: string
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

interface Post {
  id: string
  author: string
  avatar: string
  verified: boolean
  content: string
  timestamp: string
  likes: number
  comments: number
}

interface Member {
  id: string
  username: string
  avatar: string
  role: string
  tokens: number
  verified: boolean
}

export function CommunityPreviewModal({
  onClose,
  communityId,
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
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'create'>('posts')
  const [postFilter, setPostFilter] = useState<'creator' | 'community'>('creator')
  const [posts, setPosts] = useState<Post[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // BYPASS: Always grant access (Solana feature not built yet)
  const hasAccess = true // was: isAdmin || userTokenBalance >= minimumTokens

  // Fetch community posts and members from backend
  useEffect(() => {
    if (communityId) {
      fetchCommunityData()
    }
  }, [communityId, postFilter])

  const fetchCommunityData = async () => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'

      // TODO: Fetch real posts from backend API when community posts API is ready
      // For now, show empty state until API is implemented
      setPosts([])

      // TODO: Fetch real members from backend API when community members API is ready
      // For now, show empty state until API is implemented
      setMembers([])

    } catch (error) {
      console.error('Failed to fetch community data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    setIsSubmitting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'
      const token = localStorage.getItem('token')

      // TODO: Call backend API to create community post when API is ready
      // const response = await fetch(`${apiUrl}/api/communities/${communityId}/posts`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ content: newPostContent })
      // })

      // For now, just clear the form and show success
      setNewPostContent('')
      setActiveTab('posts')
      // Refresh posts after creation
      fetchCommunityData()

    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-lg'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5 inline mr-1" />
              Create Post
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Minimum Tokens Caution Box - Shown on all tabs */}
          <div className="p-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-xs font-semibold mb-0.5">Token Requirement</p>
                <p className="text-gray-300 text-[11px]">
                  Minimum {minimumTokens} ${creatorToken} tokens required to access this community
                </p>
              </div>
            </div>
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="px-4 pb-4 space-y-4">
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

              {/* Posts List or Empty State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-400 text-sm">Loading posts...</p>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-3">
                  {posts.map((post) => (
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
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h4 className="text-white font-bold text-sm mb-1">No Posts Yet</h4>
                  <p className="text-gray-400 text-xs mb-4">Be the first to share something with the community!</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-2 px-4 rounded-lg transition-all text-xs"
                  >
                    Create First Post
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="px-4 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Community Members</h3>
                <span className="text-gray-400 text-xs">{communityMembers} total</span>
              </div>

              {/* Members List or Empty State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-400 text-sm">Loading members...</p>
                </div>
              ) : members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member) => (
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
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h4 className="text-white font-bold text-sm mb-1">No Members Yet</h4>
                  <p className="text-gray-400 text-xs">Be the first to join this community!</p>
                </div>
              )}
            </div>
          )}

          {/* Create Post Tab */}
          {activeTab === 'create' && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <h3 className="text-white font-bold text-sm mb-2">Share with Community</h3>
                <p className="text-gray-400 text-xs mb-4">
                  Create a post to share updates, ideas, or start a discussion with {communityName} members
                </p>
              </div>

              {/* Post Content Input */}
              <div>
                <label className="text-white text-xs font-semibold mb-2 block">Post Content</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your thoughts with the community..."
                  rows={8}
                  maxLength={500}
                  className="w-full bg-gray-800 text-white text-sm rounded-lg p-3 border border-gray-700 focus:outline-none focus:border-green-500 transition-colors resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-500 text-xs">
                    {newPostContent.length}/500 characters
                  </span>
                  {newPostContent.length > 450 && (
                    <span className="text-yellow-400 text-xs font-semibold">
                      {500 - newPostContent.length} remaining
                    </span>
                  )}
                </div>
              </div>

              {/* Post Guidelines */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <h4 className="text-blue-400 font-semibold text-xs mb-2">Community Guidelines</h4>
                <ul className="space-y-1 text-gray-300 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Be respectful and constructive in your posts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Share valuable insights and engage meaningfully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>No spam, scams, or promotional content</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('posts')}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all border border-gray-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post to Community
                    </>
                  )}
                </button>
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
