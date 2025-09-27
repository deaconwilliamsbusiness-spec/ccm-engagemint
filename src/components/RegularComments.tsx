'use client'

import { useState } from 'react'
import { X, Heart, Send, Lock } from 'lucide-react'

interface Comment {
  id: string
  user: string
  message: string
  timestamp: string
  likes: number
  isLiked?: boolean
  tokenBalance?: number
}

interface RegularCommentsProps {
  isOpen: boolean
  onClose: () => void
  title: string
  tokenSymbol: string
  minimumTokensToComment: number
  userTokenBalance?: number
  onBuyTokens?: () => void
}

export function RegularComments({
  isOpen,
  onClose,
  tokenSymbol,
  minimumTokensToComment,
  userTokenBalance = 0,
  onBuyTokens
}: RegularCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: '@cryptoking',
      message: 'This analysis is spot on! SOL is definitely going to moon 🚀',
      timestamp: '2h ago',
      likes: 24,
      isLiked: false,
      tokenBalance: 1000
    },
    {
      id: '2',
      user: '@diamond_hands',
      message: 'Finally someone who actually understands the tech. Holding strong! 💎🙌',
      timestamp: '1h ago',
      likes: 18,
      isLiked: true,
      tokenBalance: 250
    },
    {
      id: '3',
      user: '@early_adopter',
      message: 'Been saying this for months. Glad to see more people catching on.',
      timestamp: '45m ago',
      likes: 12,
      isLiked: false,
      tokenBalance: 500
    },
    {
      id: '4',
      user: '@trader_pro',
      message: 'Charts don\'t lie. This breakout pattern is textbook bullish 📈',
      timestamp: '30m ago',
      likes: 31,
      isLiked: false,
      tokenBalance: 750
    },
    {
      id: '5',
      user: '@hodl_queen',
      message: 'Love the detailed explanation. More creators need to educate like this!',
      timestamp: '15m ago',
      likes: 9,
      isLiked: false,
      tokenBalance: 150
    },
    {
      id: '6',
      user: '@sol_maximalist',
      message: 'SOL ecosystem is absolutely killing it right now. The growth is insane!',
      timestamp: '12m ago',
      likes: 15,
      isLiked: false,
      tokenBalance: 800
    },
    {
      id: '7',
      user: '@defi_degen',
      message: 'Already aped in hard. This is the alpha we\'ve been waiting for 🦍',
      timestamp: '10m ago',
      likes: 22,
      isLiked: false,
      tokenBalance: 300
    },
    {
      id: '8',
      user: '@nft_collector',
      message: 'Great content as always! Your predictions are always on point.',
      timestamp: '8m ago',
      likes: 7,
      isLiked: false,
      tokenBalance: 200
    },
    {
      id: '9',
      user: '@yield_farmer',
      message: 'Thanks for breaking this down so clearly. Time to rotate some positions!',
      timestamp: '5m ago',
      likes: 11,
      isLiked: false,
      tokenBalance: 450
    },
    {
      id: '10',
      user: '@web3_builder',
      message: 'The fundamentals are there. This is just the beginning! 🚀🌙',
      timestamp: '3m ago',
      likes: 19,
      isLiked: false,
      tokenBalance: 600
    },
    {
      id: '11',
      user: '@crypto_researcher',
      message: 'Your technical analysis combined with fundamental insights is chef\'s kiss 👨‍🍳💋',
      timestamp: '2m ago',
      likes: 8,
      isLiked: false,
      tokenBalance: 350
    },
    {
      id: '12',
      user: '@moon_mission',
      message: 'LFG!!! This is why I follow you. Always delivering alpha 📡',
      timestamp: '1m ago',
      likes: 13,
      isLiked: false,
      tokenBalance: 550
    }
  ])

  const canComment = userTokenBalance >= minimumTokensToComment

  const handleSubmitComment = () => {
    if (!canComment || !newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      user: '@you',
      message: newComment,
      timestamp: 'now',
      likes: 0,
      isLiked: false,
      tokenBalance: userTokenBalance
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
  }

  const toggleLike = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const newIsLiked = !comment.isLiked
        return {
          ...comment,
          isLiked: newIsLiked,
          likes: newIsLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1)
        }
      }
      return comment
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-md h-[80vh] border-t border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h3 className="text-white font-bold text-lg">💬 Comments</h3>
            <p className="text-gray-400 text-sm">{comments.length} comments</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-black">{comment.user.charAt(1).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{comment.user}</span>
                  <span className="text-green-400 text-xs font-bold">
                    {comment.tokenBalance} {tokenSymbol}
                  </span>
                  <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-2">{comment.message}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${comment.isLiked ? 'text-red-500 fill-red-500' : ''}`}
                    />
                    <span className="text-xs">{comment.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-800">
          {canComment ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-black rounded-full p-2 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-medium">Token Required to Comment</span>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                You need at least <span className="text-green-400 font-bold">{minimumTokensToComment} {tokenSymbol}</span> tokens to comment.
              </p>
              <p className="text-gray-500 text-xs mb-3">
                Your balance: <span className="text-white">{userTokenBalance} {tokenSymbol}</span>
              </p>
              <button
                onClick={() => {
                  onBuyTokens?.()
                  onClose()
                }}
                className="bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Buy {tokenSymbol} Tokens
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}