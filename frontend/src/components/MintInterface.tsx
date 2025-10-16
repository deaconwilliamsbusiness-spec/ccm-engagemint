'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Image, Play, Plus, X, Zap, Link, FileText, Users } from 'lucide-react'

interface MintInterfaceProps {
  onBack: () => void
  setActiveTab: (tab: string) => void
}

interface MediaItem {
  id: string
  type: 'image' | 'video'
  src: string
  file: File
}

export function MintInterface({ onBack, setActiveTab }: MintInterfaceProps) {
  const [uploadMode, setUploadMode] = useState<'choice' | 'mint' | 'post'>('choice')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tokenName, setTokenName] = useState('')
  const [tokenTicker, setTokenTicker] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [twitter, setTwitter] = useState('')
  const [telegram, setTelegram] = useState('')
  // Community type is set to 'discussion' by default
  const [minimumTokens, setMinimumTokens] = useState('10')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addMedia = (file: File) => {
    const url = URL.createObjectURL(file)
    const mediaItem: MediaItem = {
      id: Date.now().toString(),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      src: url,
      file
    }
    setMedia([...media, mediaItem])
  }

  const removeMedia = (id: string) => {
    setMedia(media.filter(item => item.id !== id))
    if (currentSlide >= media.length - 1) {
      setCurrentSlide(Math.max(0, media.length - 2))
    }
  }

  const hasVideos = media.some(item => item.type === 'video')
  const hasImages = media.some(item => item.type === 'image')
  const isSlideshow = hasImages && !hasVideos
  const canCreateToken = media.length > 0 && tokenName.trim() && tokenTicker.trim()

  const getMediaType = () => {
    if (hasVideos && hasImages) return 'Mixed Content'
    if (hasVideos) return 'Video'
    if (hasImages) return 'Slideshow'
    return 'Content'
  }

  // Choice Screen Component
  if (uploadMode === 'choice') {
    return (
      <div className="fixed inset-0 bg-black overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
        </div>

        {/* Phone Container */}
        <div className="relative h-full w-full flex items-center justify-center">
          <div className="relative w-full max-w-md h-full bg-gray-900 border-x border-gray-800 flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={onBack}
                  className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="font-bold text-2xl text-white">Choose Action</h1>
                <div className="w-12"></div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full space-y-4">
                {/* MINT A VIDEO Option */}
                <button
                  onClick={() => setUploadMode('mint')}
                  className="w-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-3xl p-8 transition-all transform hover:scale-105 shadow-2xl group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-black/20 rounded-full p-6 mb-4 group-hover:scale-110 transition-transform">
                      <Zap className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-black font-bold text-2xl mb-2">MINT A VIDEO</h2>
                    <p className="text-black/80 text-sm mb-4">
                      Create a new token + community with your video
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="bg-black/20 rounded-full px-3 py-1 text-xs text-white font-bold">💰 Token</span>
                      <span className="bg-black/20 rounded-full px-3 py-1 text-xs text-white font-bold">👥 Community</span>
                      <span className="bg-black/20 rounded-full px-3 py-1 text-xs text-white font-bold">🎬 Video</span>
                    </div>
                  </div>
                </button>

                {/* POST A VIDEO Option */}
                <button
                  onClick={() => setUploadMode('post')}
                  className="w-full bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-gray-600 hover:border-green-500 rounded-3xl p-8 transition-all transform hover:scale-105 shadow-xl group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-gray-600/50 rounded-full p-6 mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-white font-bold text-2xl mb-2">POST A VIDEO</h2>
                    <p className="text-gray-300 text-sm mb-4">
                      Just upload a video to your feed (no token)
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="bg-gray-600/50 rounded-full px-3 py-1 text-xs text-gray-300 font-bold">🎬 Video Only</span>
                      <span className="bg-gray-600/50 rounded-full px-3 py-1 text-xs text-gray-300 font-bold">⚡ Quick</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Upload Form (for both mint and post modes)
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Phone Container */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="relative w-full max-w-md h-full bg-gray-900 border-x border-gray-800 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setUploadMode('choice')}
                className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="font-bold text-2xl text-white">{uploadMode === 'mint' ? 'MINT VIDEO' : 'POST VIDEO'}</h1>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('feed')}
                  className="bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-colors"
                >
                  <span className="text-sm">🏠</span>
                </button>
                <button
                  onClick={() => setActiveTab('creator')}
                  className="bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-colors"
                >
                  <span className="text-sm">👤</span>
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className="bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-colors"
                >
                  <span className="text-sm">🌟</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Media Preview */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              {media.length > 0 ? (
                <>
                  {/* Preview Area */}
                  <div className="aspect-video bg-gray-700 relative overflow-hidden">
                    {media[currentSlide] && (
                      <>
                        {media[currentSlide].type === 'image' ? (
                          <img
                            src={media[currentSlide].src}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={media[currentSlide].src}
                            className="w-full h-full object-cover"
                            controls
                            muted
                          />
                        )}
                      </>
                    )}

                    {/* Play Button for Images (Slideshow Preview) */}
                    {isSlideshow && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="bg-green-500 rounded-full p-4">
                          <Play className="w-8 h-8 text-black ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Content Type Badge */}
                    <div className="absolute top-4 left-4 bg-green-500 rounded-full px-3 py-1">
                      <span className="text-black text-sm font-bold">
                        {getMediaType()}
                      </span>
                    </div>

                    {/* Slide Counter */}
                    {media.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-sm font-mono">
                          {currentSlide + 1}/{media.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timeline (only for multiple items) */}
                  {media.length > 1 && (
                    <div className="p-4 bg-gray-700">
                      <div className="flex gap-2 overflow-x-auto">
                        {media.map((item, index) => (
                          <div
                            key={item.id}
                            onClick={() => setCurrentSlide(index)}
                            className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${
                              index === currentSlide ? 'border-green-500' : 'border-gray-600'
                            }`}
                          >
                            {item.type === 'image' ? (
                              <img src={item.src} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <video src={item.src} className="w-full h-full object-cover" />
                            )}
                            {item.type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeMedia(item.id)
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Empty State
                <div className="aspect-video flex items-center justify-center text-center p-8">
                  <div>
                    <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-white font-bold text-lg mb-2">Upload Your Content</h3>
                    <p className="text-gray-400 text-sm">Photos will become a slideshow, videos stay as videos</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-800 border-2 border-dashed border-gray-600 hover:border-green-500 rounded-2xl p-8 transition-colors group"
              >
                <Plus className="w-8 h-8 text-gray-500 group-hover:text-green-500 mx-auto mb-2" />
                <p className="text-gray-400 group-hover:text-white font-medium">Add Photos/Videos</p>
                <p className="text-gray-500 text-sm">JPG, PNG, MP4, MOV</p>
              </button>


              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  Array.from(e.target.files || []).forEach(addMedia)
                  e.target.value = ''
                }}
                className="hidden"
              />
            </div>

            {/* Token Details - Only show in MINT mode */}
            {uploadMode === 'mint' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Token Details
                </h3>

              {/* Name */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="My Epic Token"
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Ticker */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Ticker</label>
                <input
                  type="text"
                  value={tokenTicker}
                  onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
                  placeholder="EPIC"
                  maxLength={10}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell people about your token..."
                  rows={3}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              </div>
            )}

            {/* Video Title - Always show */}
            {uploadMode === 'post' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Video Details
                </h3>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Title</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="My awesome video"
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell people about your video..."
                    rows={3}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Links (Optional) - Only in MINT mode */}
            {uploadMode === 'mint' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Link className="w-5 h-5" />
                Links (Optional)
              </h3>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://mytoken.com"
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Twitter</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@mytoken"
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Telegram</label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="t.me/mytoken"
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              </div>
            )}

            {/* Community Access Settings - Only in MINT mode */}
            {uploadMode === 'mint' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Access
              </h3>

              {/* Community Type */}

              {/* Minimum Token Requirement */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Minimum Tokens Required</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={minimumTokens}
                    onChange={(e) => setMinimumTokens(e.target.value)}
                    placeholder="10"
                    min="1"
                    className="flex-1 p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-gray-300 font-medium">{tokenTicker || 'TOKEN'} tokens</span>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Users must hold at least this many tokens to join your community
                </p>
              </div>

              {/* Community Features Preview */}
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                <h4 className="text-green-400 font-bold text-sm mb-3">🔒 Token-Gated Community Features</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Exclusive discussion threads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Token holder verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Creator badge privileges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Community governance voting</span>
                  </div>
                </div>
              </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="sticky bottom-0 pt-4">
              {uploadError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                  {uploadError}
                </div>
              )}

              <button
                disabled={uploadMode === 'post' ? (media.length === 0 || isUploading) : (!canCreateToken || isUploading)}
                onClick={async () => {
                  const canUpload = uploadMode === 'post' ? media.length > 0 : canCreateToken
                  if (canUpload && !isUploading) {
                    setIsUploading(true)
                    setUploadError('')

                    try {
                      const { videoAPI, getAuthToken } = await import('@/lib/api')

                      // Check if user is authenticated
                      const token = getAuthToken()
                      if (!token) {
                        setUploadError('Please log in or sign up first to post content')
                        setIsUploading(false)
                        return
                      }

                      // Upload the first media item as the main content
                      const mainMedia = media[0]
                      const videoFile = mainMedia.type === 'video' ? mainMedia.file : null
                      const imageFile = mainMedia.type === 'image' ? mainMedia.file : null

                      // In POST mode, don't create token (pass empty string)
                      const finalTokenTicker = uploadMode === 'mint' ? tokenTicker : ''

                      // For now, we'll upload the first item
                      // TODO: Support multiple media items in the future
                      if (videoFile) {
                        await videoAPI.upload(
                          videoFile,
                          media.length > 1 && media[1].type === 'image' ? media[1].file : null,
                          tokenName || 'Untitled',
                          description,
                          finalTokenTicker
                        )
                      } else if (imageFile) {
                        // Create a simple slideshow video or upload image
                        await videoAPI.upload(
                          imageFile,
                          null,
                          tokenName || 'Untitled',
                          description,
                          finalTokenTicker
                        )
                      }

                      // Success! Clear form and go to feed
                      setMedia([])
                      setTokenName('')
                      setTokenTicker('')
                      setDescription('')
                      setWebsite('')
                      setTwitter('')
                      setTelegram('')
                      setUploadMode('choice')
                      setActiveTab('feed')

                    } catch (err) {
                      const error = err as Error
                      console.error('Upload error:', error)

                      // If auth error, clear invalid token and show helpful message
                      if (error.message.includes('authentication') || error.message.includes('token')) {
                        const { removeAuthToken } = await import('@/lib/api')
                        removeAuthToken()
                        setUploadError('Session expired. Please refresh the page and log in again.')
                      } else {
                        setUploadError(error.message || 'Failed to upload. Please try again.')
                      }
                    } finally {
                      setIsUploading(false)
                    }
                  }
                }}
                className={`w-full font-bold py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                  (uploadMode === 'post' ? media.length > 0 : canCreateToken) && !isUploading
                    ? 'bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-black active:scale-95'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-6 h-6" />
                <span>
                  {isUploading
                    ? 'Uploading...'
                    : uploadMode === 'mint'
                      ? '🔥 Mint & Post'
                      : '📤 Post Video'}
                </span>
              </button>
              {(uploadMode === 'post' ? media.length > 0 : canCreateToken) && !isUploading && (
                <p className="text-center text-gray-400 text-xs mt-2">
                  {uploadMode === 'mint'
                    ? 'Create token + community and upload video'
                    : 'Upload video without creating a token'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}