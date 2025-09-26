'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Upload, Image, Play, Plus, X, Zap, Link, FileText, Users, MessageCircle } from 'lucide-react'

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
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tokenName, setTokenName] = useState('')
  const [tokenTicker, setTokenTicker] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [twitter, setTwitter] = useState('')
  const [telegram, setTelegram] = useState('')
  const [communityType, setCommunityType] = useState<'live_chat' | 'discussion'>('live_chat')
  const [minimumTokens, setMinimumTokens] = useState('10')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
                onClick={onBack}
                className="bg-gray-800 rounded-full p-3 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="font-bold text-2xl text-white">MINT</h1>

              {/* MINT Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-white hover:bg-gray-100 rounded-full p-3 w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-lg"
                >
                  <img src="/mint-logo.png" alt="MINT Menu" className="w-6 h-6 object-contain" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-12 right-0 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
                    <button
                      onClick={() => { setActiveTab('feed'); setIsDropdownOpen(false) }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors border-b border-gray-700"
                    >
                      <span className="font-medium">Feed</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('creator'); setIsDropdownOpen(false) }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors border-b border-gray-700"
                    >
                      <span className="font-medium">Creator Profile</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('community'); setIsDropdownOpen(false) }}
                      className="w-full text-left px-6 py-4 text-white hover:bg-gray-700 transition-colors"
                    >
                      <span className="font-medium">ENGAGE</span>
                    </button>
                  </div>
                )}

                {/* Backdrop to close dropdown */}
                {isDropdownOpen && (
                  <div className="fixed inset-0 -z-10" onClick={() => setIsDropdownOpen(false)} />
                )}
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
                        <button
                          onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                          className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-colors"
                        >
                          <Play className="w-8 h-8 text-black ml-1" />
                        </button>
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

            {/* Token Details */}
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

            {/* Links (Optional) */}
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

            {/* Community Access Settings */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Access
              </h3>

              {/* Community Type */}
              <div>
                <label className="block text-gray-400 text-sm mb-3">Discussion Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCommunityType('live_chat')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      communityType === 'live_chat'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <MessageCircle className={`w-6 h-6 mx-auto mb-2 ${
                      communityType === 'live_chat' ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    <div className={`font-medium ${
                      communityType === 'live_chat' ? 'text-green-400' : 'text-white'
                    }`}>
                      Live Chat
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Real-time community chat
                    </div>
                  </button>

                  <button
                    onClick={() => setCommunityType('discussion')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      communityType === 'discussion'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <Users className={`w-6 h-6 mx-auto mb-2 ${
                      communityType === 'discussion' ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    <div className={`font-medium ${
                      communityType === 'discussion' ? 'text-green-400' : 'text-white'
                    }`}>
                      Discussion
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Threaded conversations
                    </div>
                  </button>
                </div>
              </div>

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
                    <span>Exclusive {communityType === 'live_chat' ? 'live chat' : 'discussion threads'}</span>
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

            {/* Create Token Button */}
            <div className="sticky bottom-0 pt-4">
              <button
                disabled={!canCreateToken}
                onClick={() => {
                  if (canCreateToken) {
                    // Simulate token creation process
                    const tokenData = {
                      name: tokenName,
                      ticker: tokenTicker,
                      description,
                      website,
                      twitter,
                      telegram,
                      mediaCount: media.length,
                      communityType,
                      minimumTokens: parseInt(minimumTokens)
                    }
                    alert(`Creating ${tokenData.name} (${tokenData.ticker}) token with ${tokenData.mediaCount} media files...\n\nThis would connect to the Solana blockchain to mint the token.`)
                    // Here you would integrate with the backend/blockchain
                    console.log('Token creation data:', tokenData)
                  }
                }}
                className={`w-full font-bold py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                  canCreateToken
                    ? 'bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-black active:scale-95'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-6 h-6" />
                <span>Create Token</span>
              </button>
              {canCreateToken && (
                <p className="text-center text-gray-400 text-xs mt-2">
                  Creation fee: ~0.02 SOL
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}