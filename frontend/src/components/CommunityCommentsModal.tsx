'use client'

import { useState } from 'react'
import { X, MessageCircleIcon, Send, Trash2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'

interface Comment {
  id: string
  user_id: string
  username: string
  avatar: string
  content: string
  timestamp: string
  likes: number
}

interface CommunityCommentsModalProps {
  isOpen: boolean
  onClose: () => void
  postId: number
  postAuthor: string
  initialCommentCount: number
  onCommentCountChange: (count: number) => void
}

export function CommunityCommentsModal({
  isOpen,
  onClose,
  onCommentCountChange
}: CommunityCommentsModalProps) {
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user || isPosting) return

    setIsPosting(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const comment: Comment = {
      id: `${Date.now()}-${Math.random()}`,
      user_id: user.id,
      username: user.username,
      avatar: user.username[0].toUpperCase(),
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    }

    setComments([comment, ...comments])
    onCommentCountChange(comments.length + 1)
    setNewComment('')
    setIsPosting(false)
  }

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    setComments(comments.filter(c => c.id !== commentId))
    onCommentCountChange(Math.max(0, comments.length - 1))
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md h-[70vh] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-t border-x border-green-500/30 rounded-t-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <MessageCircleIcon className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-bold text-base">Comments</h3>
            <span className="text-gray-400 text-sm">({comments.length})</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-1.5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-500/10">
                  <MessageCircleIcon className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Start the conversation</h3>
                <p className="text-gray-400 text-sm mb-1">No comments yet on this post.</p>
                <p className="text-green-400 text-xs font-semibold">Be the first to share your thoughts!</p>
              </div>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {comment.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 group-hover:border-gray-600/50 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">@{comment.username}</span>
                        <span className="text-gray-500 text-xs">{formatTime(comment.timestamp)}</span>
                      </div>
                      {user && user.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-500/10 rounded"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-200 text-sm break-words leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Comment Input */}
        <div className="border-t border-gray-700/50 p-4 bg-gray-900/80 backdrop-blur-sm">
          {user ? (
            <form onSubmit={handlePostComment} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user.username[0].toUpperCase()}
              </div>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                disabled={isPosting}
                className="flex-1 bg-gray-800/80 border border-gray-700/50 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isPosting}
                className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl p-2.5 transition-all shadow-lg disabled:shadow-none active:scale-95"
              >
                {isPosting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-gray-400 text-sm">Log in to comment on this post</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
