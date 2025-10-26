'use client'

import { X, ArrowLeft, Play, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PublicCreatorProfileProps {
  onClose: () => void
  creatorUsername: string
  creatorId: string
}

export function PublicCreatorProfile({ onClose, creatorUsername, creatorId }: PublicCreatorProfileProps) {
  const [videos, setVideos] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [followersCount, setFollowersCount] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)
  const [givebackPercentage] = useState(15) // Demo: Creator's community giveback percentage
  const [isFollowing, setIsFollowing] = useState(false)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  const BASE_URL = API_BASE_URL.replace('/api', '')

  useEffect(() => {
    const fetchCreatorData = async () => {
      setIsLoading(true)
      try {
        const { videoAPI, socialAPI } = await import('@/lib/api')

        // ✅ FIXED: Use dedicated getCreatorVideos API endpoint instead of filtering all videos
        const videoResponse = await fetch(`${BASE_URL}/api/videos/creator/${creatorId}`)
        const videoData = await videoResponse.json()

        if (videoData.success && videoData.data.videos) {
          const creatorVideos = videoData.data.videos
          setVideos(creatorVideos)

          // Calculate stats
          const views = creatorVideos.reduce((sum: number, v: Record<string, unknown>) =>
            sum + ((v.views_count as number) || 0), 0
          )
          const likes = creatorVideos.reduce((sum: number, v: Record<string, unknown>) =>
            sum + ((v.likes_count as number) || 0), 0
          )

          setTotalViews(views)
          setTotalLikes(likes)
        }

        // ✅ FIXED: Get real follower count from API
        try {
          const countsResponse = await socialAPI.getCounts(creatorId)
          if (countsResponse.success) {
            setFollowersCount(countsResponse.data.followers_count)
          }
        } catch (error) {
          console.log('Could not fetch follower count:', error)
          setFollowersCount(0)
        }

        // ✅ FIXED: Check if current user is following this creator
        try {
          const followingResponse = await socialAPI.isFollowing(creatorId)
          if (followingResponse.success) {
            setIsFollowing(followingResponse.data.isFollowing)
          }
        } catch (error) {
          console.log('Could not check following status:', error)
        }
      } catch (error) {
        console.error('Failed to fetch creator data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCreatorData()
  }, [creatorId])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // ✅ FIXED: Add real follow/unfollow functionality
  const handleFollowToggle = async () => {
    try {
      const { socialAPI } = await import('@/lib/api')

      if (isFollowing) {
        await socialAPI.unfollowUser(creatorId)
        setIsFollowing(false)
        setFollowersCount(prev => Math.max(0, prev - 1))
      } else {
        await socialAPI.followUser(creatorId)
        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
      // Revert optimistic update on error
      setIsFollowing(!isFollowing)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-md h-full bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex flex-col overflow-hidden"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-white font-bold text-lg">{creatorUsername}</h2>
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="px-6 pt-6 pb-6">
              {/* Profile Section */}
              <div className="flex flex-col items-center mb-3">
                <div className="relative mb-4">
                  <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-gray-800/50">
                    <Image src="/mint-logo.png" alt="Creator" width={72} height={72} className="object-contain" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-white font-bold text-xl tracking-tight mb-2">{creatorUsername}</h2>
                  {/* Follow Button - ✅ FIXED: Now calls real API */}
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                      isFollowing
                        ? 'bg-gray-800 hover:bg-gray-700 text-white border border-green-500/50'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 shadow-lg">
                  <p className="text-gray-400 text-[10px] mb-1">Videos</p>
                  <p className="text-white font-bold text-lg tracking-tight">{videos.length}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 shadow-lg">
                  <p className="text-gray-400 text-[10px] mb-1">Followers</p>
                  <p className="text-white font-bold text-lg tracking-tight">{formatNumber(followersCount)}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl p-3 text-center border border-green-500/30 hover:border-green-500/50 transition-all hover:scale-105 shadow-lg">
                  <p className="text-gray-400 text-[10px] mb-1">Total Views</p>
                  <p className="text-white font-bold text-lg tracking-tight">{formatNumber(totalViews)}</p>
                </div>
              </div>

              {/* Description Bubble */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-sm rounded-2xl p-5 mb-3 border border-green-500/30 hover:border-green-500/50 transition-all shadow-lg">
                <p className="text-gray-300 text-sm text-center leading-relaxed">
                  Crypto analyst & content creator. Building the future of decentralized finance.
                </p>
              </div>

              {/* Community Giveback Box */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-5 mb-3 border-2 border-emerald-500/40 hover:border-emerald-500/60 transition-all shadow-xl hover:shadow-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">💚</div>
                    <h3 className="text-white font-bold text-base">Community Giveback</h3>
                  </div>
                  <div className="bg-emerald-500/20 rounded-full px-3 py-1 border border-emerald-500/40">
                    <span className="text-emerald-400 font-bold text-sm">{givebackPercentage}%</span>
                  </div>
                </div>

                <p className="text-gray-300 text-xs leading-relaxed mb-3">
                  {givebackPercentage}% of all earnings are reinvested back into the community token, creating value for holders and supporters.
                </p>

                <div className="bg-gray-900/50 rounded-xl p-3 border border-emerald-500/20">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-400">Allocation Split</span>
                    <span className="text-emerald-400 font-bold">{givebackPercentage}% / {100 - givebackPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${givebackPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-2 text-gray-500">
                    <span>Creator: {100 - givebackPercentage}%</span>
                    <span>Community: {givebackPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Videos Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-xl tracking-tight">Content</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{videos.length} videos</p>
                  </div>
                </div>
                {videos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No videos yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {videos.map((video: Record<string, unknown>) => (
                      <div key={video.id as string} className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 backdrop-blur-sm rounded-2xl overflow-hidden group border border-gray-700/50 hover:border-gray-600/50 shadow-lg relative">
                        <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`${BASE_URL}${video.video_url as string}`}
                            alt={video.title as string}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />

                          {/* Play Icon */}
                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full p-2">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-white font-medium text-sm line-clamp-2 mb-2">{video.title as string}</h4>
                          <div className="flex items-center justify-between text-gray-400 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                {(video.views_count as number) || 0}
                              </span>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                <span>{(video.likes_count as number) || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
