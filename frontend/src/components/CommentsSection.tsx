'use client'

import { useState, useEffect } from 'react'
import { X, HeartIcon, MessageCircleIcon, Send } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { commentsAPI } from '@/lib/api'

interface Comment {
  id: string
  video_id: string
  user_id: string
  username: string
  content: string
  likes_count: number
  created_at: string
}

interface CommentsSectionProps {
  videoId: string
  isOpen: boolean
  onClose: () => void
  onCommentPosted?: () => void
  onCommentDeleted?: () => void
}

export function CommentsSection({ videoId, isOpen, onClose, onCommentPosted, onCommentDeleted }: CommentsSectionProps) {
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPosting, setIsPosting] = useState(false)

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && videoId) {
      fetchComments()
    }
  }, [isOpen, videoId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await commentsAPI.getComments(videoId)
      if (response.success && response.data.comments) {
        setComments(response.data.comments)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isPosting) return

    setIsPosting(true)
    try {
      const response = await commentsAPI.postComment(videoId, newComment.trim())
      if (response.success && response.data.comment) {
        // Add new comment to top of list
        setComments([response.data.comment, ...comments])
        setNewComment('')
        // Notify parent component to update comment count
        onCommentPosted?.()
      }
    } catch (error: any) {
      console.error('Failed to post comment:', error)
      if (error.message.includes('authentication')) {
        alert('Please log in to comment')
      } else {
        alert('Failed to post comment. Please try again.')
      }
    } finally {
      setIsPosting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      await commentsAPI.deleteComment(commentId)
      setComments(comments.filter(c => c.id !== commentId))
      // Notify parent component to update comment count
      onCommentDeleted?.()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment')
    }
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="w-full max-w-md h-[65vh] bg-gray-900/95 backdrop-blur-md border-t border-x border-green-500/30 rounded-t-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-base">💬 Comments</h3>
            <span className="text-gray-400 text-sm">{comments.length}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <MessageCircleIcon className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                <h3 className="text-white font-bold text-lg mb-1">No comments yet</h3>
                <p className="text-gray-400 text-sm">Be the first to comment!</p>
              </div>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                  {comment.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">@{comment.username}</span>
                    <span className="text-gray-500 text-xs">{formatTime(comment.created_at)}</span>
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-400 hover:text-red-300 text-xs ml-auto"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-200 text-sm break-words">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Comment Input */}
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={handlePostComment} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              {user ? user.username[0].toUpperCase() : 'U'}
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Add a comment..." : "Log in to comment..."}
              disabled={!user || isPosting}
              className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || !user || isPosting}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full p-2.5 transition-colors"
            >
              {isPosting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
