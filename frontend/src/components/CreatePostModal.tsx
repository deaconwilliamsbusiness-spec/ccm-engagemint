'use client'

import { useState } from 'react'
import { X, ImageIcon, VideoIcon, BarChart3, Loader2, Sparkles } from 'lucide-react'
import { useUser } from '@/context/UserContext'

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

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  communityName: string
  onPostCreated: (post: Post) => void
}

export function CreatePostModal({
  isOpen,
  onClose,
  communityName,
  onPostCreated
}: CreatePostModalProps) {
  const { user } = useUser()
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [selectedMediaType, setSelectedMediaType] = useState<'none' | 'image' | 'video' | 'poll'>('none')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user || isPosting) return

    setIsPosting(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const newPost = {
      id: Date.now(),
      author: `@${user.username}`,
      authorAvatar: user.username[0].toUpperCase(),
      verified: false,
      content: content.trim(),
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarked: false,
      liked: false,
      hasMedia: selectedMediaType !== 'none',
      mediaType: selectedMediaType !== 'none' ? selectedMediaType : undefined,
      reactions: {
        fire: 0,
        rocket: 0,
        thinking: 0,
        heart: 0
      }
    }

    onPostCreated(newPost)
    setContent('')
    setSelectedMediaType('none')
    setIsPosting(false)
    onClose()
  }

  const handleCancel = () => {
    if (content.trim() && !confirm('Discard your post?')) {
      return
    }
    setContent('')
    setSelectedMediaType('none')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-green-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700/50 bg-gray-900/80">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Create Post</h2>
              <p className="text-gray-400 text-xs">in {communityName}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-2 transition-all"
            disabled={isPosting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* User Info */}
          <div className="flex items-center gap-3 p-5 border-b border-gray-700/50">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg">
              {user ? user.username[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="text-white font-semibold text-sm">
                @{user?.username || 'Guest'}
              </div>
              <div className="text-gray-400 text-xs">Posting to community</div>
            </div>
          </div>

          {/* Text Input */}
          <div className="p-5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts with the community..."
              disabled={isPosting}
              className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none focus:outline-none min-h-[150px] max-h-[300px] disabled:opacity-50"
              autoFocus
            />
          </div>

          {/* Media Options */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedMediaType(selectedMediaType === 'image' ? 'none' : 'image')}
                disabled={isPosting}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedMediaType === 'image'
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600/50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Image</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMediaType(selectedMediaType === 'video' ? 'none' : 'video')}
                disabled={isPosting}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedMediaType === 'video'
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600/50'
                }`}
              >
                <VideoIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Video</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMediaType(selectedMediaType === 'poll' ? 'none' : 'poll')}
                disabled={isPosting}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedMediaType === 'poll'
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Poll</span>
              </button>
            </div>

            {selectedMediaType !== 'none' && (
              <div className="mt-3 bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-center">
                <p className="text-gray-400 text-sm">
                  {selectedMediaType === 'image' && '📷 Image upload coming soon'}
                  {selectedMediaType === 'video' && '🎥 Video upload coming soon'}
                  {selectedMediaType === 'poll' && '📊 Poll creation coming soon'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t border-gray-700/50 bg-gray-900/50">
            <div className="text-gray-400 text-xs">
              {content.length > 0 && (
                <span className={content.length > 500 ? 'text-red-400' : ''}>
                  {content.length}/500
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPosting}
                className="px-4 py-2 text-gray-400 hover:text-white transition-all text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!content.trim() || content.length > 500 || isPosting}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:shadow-none disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Post</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
