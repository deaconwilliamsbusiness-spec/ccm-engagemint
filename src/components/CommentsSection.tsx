'use client'

import { X, Lock, ShieldCheck } from 'lucide-react'

interface CommentsSectionProps {
  isOpen: boolean
  onClose: () => void
  videoTitle: string
  tokenSymbol?: string
  minimumTokens?: number
  userTokenBalance?: number
}

const staticComments = [
  {
    id: '1',
    author: '@diamond_dave',
    content: 'this hits different when you been holding 💎🤲',
    timestamp: '18m ago',
    likes: 3421,
    tokenBalance: 1250,
    verified: true
  },
  {
    id: '2',
    author: '@solana_sarah',
    content: 'POV: you just learned something new 📚💅',
    timestamp: '7m ago',
    likes: 2134,
    tokenBalance: 890,
    verified: true
  },
  {
    id: '3',
    author: '@crypto_queen22',
    content: 'not me taking notes rn ✍️😭',
    timestamp: '15m ago',
    likes: 1876,
    tokenBalance: 567,
    verified: true
  },
  {
    id: '4',
    author: '@cryptobaby2025',
    content: 'YESSS!! Finally someone said it 🙌✨',
    timestamp: '2m ago',
    likes: 1247,
    tokenBalance: 234,
    verified: true
  },
  {
    id: '5',
    author: '@moonboy_mike',
    content: 'wait this actually makes sense 😳',
    timestamp: '4m ago',
    likes: 892,
    tokenBalance: 156,
    verified: true
  },
  {
    id: '6',
    author: '@hodl_hannah',
    content: 'telling my kids this is how I got rich 💸',
    timestamp: '23m ago',
    likes: 689,
    tokenBalance: 78,
    verified: true
  },
  {
    id: '7',
    author: '@degenerate_dan',
    content: 'bro really said 📈 and I felt that',
    timestamp: '11m ago',
    likes: 567,
    tokenBalance: 45,
    verified: true
  }
]

export function CommentsSection({
  isOpen,
  onClose,
  videoTitle,
  tokenSymbol = "KING",
  minimumTokens = 10,
  userTokenBalance = 0
}: CommentsSectionProps) {
  if (!isOpen) return null

  const hasAccess = userTokenBalance >= minimumTokens

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl border-t border-gray-700 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-lg">Token-Gated Comments</h3>
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm truncate">{videoTitle}</p>
            <p className="text-green-400 text-xs mt-1">
              🔒 Requires {minimumTokens}+ ${tokenSymbol} tokens to prevent FUD
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Token-Verified Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {staticComments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex-shrink-0 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-sm">{comment.author}</span>
                  <div className="bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs font-bold">{comment.tokenBalance} ${tokenSymbol}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-2">{comment.content}</p>
                <span className="text-gray-400 text-xs">{comment.likes} likes</span>
              </div>
            </div>
          ))}
        </div>

        {/* Token Gate Message */}
        <div className="border-t border-gray-700 p-4">
          {hasAccess ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold">Verified Token Holder</span>
              </div>
              <p className="text-gray-300 text-xs mt-1">
                You hold {userTokenBalance} ${tokenSymbol} tokens • FUD-free zone activated
              </p>
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Lock className="w-4 h-4" />
                <span className="font-bold">Comments Locked</span>
              </div>
              <p className="text-gray-300 text-xs mb-3">
                Hold {minimumTokens}+ ${tokenSymbol} tokens to join the discussion and prevent FUD
              </p>
              <button className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors">
                Buy ${tokenSymbol} Tokens
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}