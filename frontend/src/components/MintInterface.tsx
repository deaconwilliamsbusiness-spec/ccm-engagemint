'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Image, Play, Plus, X, Zap, Link, FileText, Users, Wallet } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { SmartAuthModal } from './SmartAuthModal'
import { PhoneContainer } from './PhoneContainer'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { instantMintToken } from '@/lib/solana'

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
  const { user } = useUser()
  const wallet = useWallet()
  const [uploadMode, setUploadMode] = useState<'choice' | 'mint' | 'post'>('choice')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tokenName, setTokenName] = useState('')
  const [tokenTicker, setTokenTicker] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [twitter, setTwitter] = useState('')
  const [telegram, setTelegram] = useState('')
  // Solana instant mint state
  const [isMinting, setIsMinting] = useState(false)
  const [mintResult, setMintResult] = useState<{
    mintAddress: string
    bondingCurveAddress: string
    signature: string
    solPaid: number
  } | null>(null)
  // Community selection and creation
  const [existingCommunities, setExistingCommunities] = useState<Array<{ id: string; name: string; token: string; token_symbol?: string; [key: string]: unknown }>>([])
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('')
  const [createCommunity, setCreateCommunity] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [communityDescription, setCommunityDescription] = useState('')
  const [minimumTokens, setMinimumTokens] = useState('10')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset upload state when switching modes
  useEffect(() => {
    // Reset error and uploading state when changing upload mode
    setUploadError('')
    setIsUploading(false)
  }, [uploadMode])

  // Fetch user's existing communities when they're logged in
  useEffect(() => {
    const fetchUserCommunities = async () => {
      if (user && uploadMode === 'mint') {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
          const response = await fetch(`${apiUrl}/communities/creator/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
          const data = await response.json()

          if (data.success && Array.isArray(data.data)) {
            setExistingCommunities(data.data)
          }
        } catch (error) {
          console.error('Failed to fetch user communities:', error)
        }
      }
    }

    fetchUserCommunities()
  }, [user, uploadMode])

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

  // Authentication Gate - Show auth modal if not logged in
  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative text-center max-w-md">
          {/* Icon with gradient background */}
          <div className="w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/10">
            <div className="text-6xl">🎬</div>
          </div>

          <h2 className="text-white font-bold text-3xl mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Sign In to Mint
          </h2>
          <p className="text-gray-300 text-base mb-2 leading-relaxed">
            Create and mint your videos as tokens
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Sign in to upload videos, create communities, and earn from your content.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
            >
              🔐 Sign In to Continue
            </button>
            <button
              onClick={onBack}
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all"
            >
              ← Go Back
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Create. Mint. Earn.</span>
          </div>
        </div>

        {/* Auth Modal */}
        <SmartAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          action="mint content"
        />
      </div>
    )
  }

  // Choice Screen Component
  if (uploadMode === 'choice') {
    return (
      <PhoneContainer>
        <div className="flex flex-col h-full">
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
                {/* MINT VIDEO! Option - PATH A: Instant Mint */}
                <button
                  onClick={() => setUploadMode('mint')}
                  className="w-full bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-3xl p-8 transition-all transform hover:scale-105 shadow-2xl group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-white/20 rounded-full p-6 mb-4 group-hover:scale-110 transition-transform">
                      <Zap className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-white font-bold text-3xl mb-2">MINT VIDEO!</h2>
                    <p className="text-white/90 text-sm mb-3">
                      Instant token creation - trading enabled immediately
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 mb-4">
                      <p className="text-white font-bold text-lg">
                        {process.env.NEXT_PUBLIC_INSTANT_MINT_COST_SOL || '0.1'} SOL
                      </p>
                      <p className="text-white/70 text-xs">
                        {process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' ? 'Devnet (Test)' : `~$${(parseFloat(process.env.NEXT_PUBLIC_INSTANT_MINT_COST_SOL || '0.1') * 200).toFixed(0)}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-bold">⚡ Instant</span>
                      <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-bold">💰 Token</span>
                      <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-bold">📈 Trading</span>
                    </div>
                  </div>
                </button>

                {/* POST VIDEO Option - PATH B: Viral Auto-Launch */}
                <button
                  onClick={() => setUploadMode('post')}
                  className="w-full bg-gradient-to-br from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 border-2 border-emerald-500 hover:border-emerald-400 rounded-3xl p-8 transition-all transform hover:scale-105 shadow-xl group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-white/20 rounded-full p-6 mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-white font-bold text-3xl mb-2">POST VIDEO</h2>
                    <p className="text-white/90 text-sm mb-3">
                      Free upload - token launches at {process.env.NEXT_PUBLIC_VIRAL_THRESHOLD || '100'} likes
                    </p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 mb-4">
                      <p className="text-white font-bold text-lg">FREE</p>
                      <p className="text-white/70 text-xs">Auto-mint at {process.env.NEXT_PUBLIC_VIRAL_THRESHOLD || '100'} likes</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-bold">🆓 Free</span>
                      <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-bold">🔥 Viral</span>
                      <span className="bg-white/20 rounded-full px-3 py-1 text-xs text-white font-bold">🎬 Video</span>
                    </div>
                  </div>
                </button>
              </div>
          </div>
        </div>
      </PhoneContainer>
    )
  }

  // Main Upload Form (for both mint and post modes)
  return (
    <PhoneContainer>
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

            <div className="w-12"></div>
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
                          // eslint-disable-next-line @next/next/no-img-element
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
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.src} alt="Media thumbnail" className="w-full h-full object-cover" />
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
                    <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" aria-label="Upload icon" />
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

            {/* Community Selection & Creation - Only in MINT mode */}
            {uploadMode === 'mint' && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
                {/* Existing Communities Dropdown */}
                {existingCommunities.length > 0 && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Post to Existing Community (Optional)
                    </label>
                    <select
                      value={selectedCommunityId}
                      onChange={(e) => {
                        setSelectedCommunityId(e.target.value)
                        // If selecting an existing community, disable create new toggle
                        if (e.target.value) {
                          setCreateCommunity(false)
                        }
                      }}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">None - Create standalone video</option>
                      {existingCommunities.map((community) => (
                        <option key={community.id} value={community.id}>
                          {community.name} ({community.token_symbol || 'TOKEN'})
                        </option>
                      ))}
                    </select>
                    <p className="text-gray-500 text-xs mt-2">
                      {selectedCommunityId
                        ? 'This video will be posted to the selected community'
                        : 'Or create a new community below'}
                    </p>
                  </div>
                )}

                {/* Divider if there are existing communities */}
                {existingCommunities.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-800 px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                )}

                {/* Create New Community Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Create New Community
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Build a token-gated community for your holders</p>
                  </div>

                  {/* Toggle Slider */}
                  <button
                    type="button"
                    onClick={() => {
                      setCreateCommunity(!createCommunity)
                      // If enabling create new, clear selected community
                      if (!createCommunity) {
                        setSelectedCommunityId('')
                      }
                    }}
                    disabled={!!selectedCommunityId}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                      createCommunity ? 'bg-green-500' : selectedCommunityId ? 'bg-gray-700' : 'bg-gray-600'
                    } ${selectedCommunityId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        createCommunity ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Community Form - Only show when toggled on */}
                {createCommunity && (
                  <div className="space-y-4 pt-4 border-t border-gray-700">
                    {/* Community Name */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Community Name</label>
                      <input
                        type="text"
                        value={communityName}
                        onChange={(e) => setCommunityName(e.target.value)}
                        placeholder={tokenName ? `${tokenName} Community` : "My Token Community"}
                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Defaults to your token name if left empty
                      </p>
                    </div>

                    {/* Community Description */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Community Description</label>
                      <textarea
                        value={communityDescription}
                        onChange={(e) => setCommunityDescription(e.target.value)}
                        placeholder="Describe what your community is about..."
                        rows={3}
                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      />
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

                      // Prepare community data - either link to existing OR create new
                      let communityPayload: { community_id?: string; name?: string; description?: string; minimum_tokens?: number; [key: string]: unknown } | undefined = undefined
                      if (uploadMode === 'mint') {
                        if (selectedCommunityId) {
                          // Link to existing community
                          communityPayload = {
                            community_id: selectedCommunityId
                          }
                        } else if (createCommunity) {
                          // Create new community
                          communityPayload = {
                            name: communityName || tokenName || 'Untitled Community',
                            description: communityDescription,
                            minimum_tokens: parseInt(minimumTokens) || 10
                          }
                        }
                      }

                      // For now, we'll upload the first item
                      // TODO: Support multiple media items in the future
                      if (videoFile) {
                        await videoAPI.upload(
                          videoFile,
                          media.length > 1 && media[1].type === 'image' ? media[1].file : null,
                          tokenName || 'Untitled',
                          description,
                          finalTokenTicker,
                          communityPayload
                        )
                      } else if (imageFile) {
                        // Create a simple slideshow video or upload image
                        await videoAPI.upload(
                          imageFile,
                          null,
                          tokenName || 'Untitled',
                          description,
                          finalTokenTicker,
                          communityPayload
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
                      setSelectedCommunityId('')
                      setCreateCommunity(false)
                      setCommunityName('')
                      setCommunityDescription('')
                      setMinimumTokens('10')
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
                      ? 'Mint & Post'
                      : 'Post Video'}
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
    </PhoneContainer>
  )
}