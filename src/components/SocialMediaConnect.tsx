'use client'

import { useState, useEffect } from 'react'
import { Play, Instagram } from 'lucide-react'
import { socialMediaAPI } from '@/lib/socialMediaAPI'

interface SocialMediaContent {
  id: string
  platform: 'tiktok' | 'instagram'
  creator: string
  title: string
  description: string
  thumbnail: string
  videoUrl?: string
  views: string
  likes: string
  comments: string
  timestamp: string
  originalUrl: string
}

interface SocialMediaConnectProps {
  onContentImport: (content: SocialMediaContent[]) => void
}

export function SocialMediaConnect({ onContentImport }: SocialMediaConnectProps) {
  const [isConnectedTikTok, setIsConnectedTikTok] = useState(false)
  const [isConnectedInstagram, setIsConnectedInstagram] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [importedContent, setImportedContent] = useState<SocialMediaContent[]>([])

  useEffect(() => {
    // Check if user has stored tokens
    const tiktokToken = localStorage.getItem('tiktok_access_token')
    const instagramToken = localStorage.getItem('instagram_access_token')

    setIsConnectedTikTok(!!tiktokToken)
    setIsConnectedInstagram(!!instagramToken)
  }, [])

  const connectTikTok = () => {
    const authUrl = socialMediaAPI.generateTikTokAuthUrl()
    window.location.href = authUrl
  }

  const connectInstagram = () => {
    const authUrl = socialMediaAPI.generateInstagramAuthUrl()
    window.location.href = authUrl
  }

  const importContent = async () => {
    setIsLoading(true)
    try {
      const allContent: SocialMediaContent[] = []

      // Import TikTok content
      if (isConnectedTikTok) {
        const tiktokToken = localStorage.getItem('tiktok_access_token')
        if (tiktokToken) {
          const tiktokVideos = await socialMediaAPI.fetchTikTokVideos(tiktokToken, 10)
          const convertedTikTok = tiktokVideos.map(video =>
            socialMediaAPI.convertTikTokToUnified(video)
          )
          allContent.push(...convertedTikTok)
        }
      }

      // Import Instagram content
      if (isConnectedInstagram) {
        const instagramToken = localStorage.getItem('instagram_access_token')
        if (instagramToken) {
          const instagramMedia = await socialMediaAPI.fetchInstagramMedia(instagramToken, 10)
          const convertedInstagram = instagramMedia.map(media =>
            socialMediaAPI.convertInstagramToUnified(media)
          )
          allContent.push(...convertedInstagram)
        }
      }

      setImportedContent(allContent)
      onContentImport(allContent)
    } catch (error) {
      console.error('Failed to import content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectTikTok = () => {
    localStorage.removeItem('tiktok_access_token')
    setIsConnectedTikTok(false)
  }

  const disconnectInstagram = () => {
    localStorage.removeItem('instagram_access_token')
    setIsConnectedInstagram(false)
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-6">
      <h3 className="text-white text-xl font-bold mb-4">Connect Social Media</h3>

      {/* TikTok Connection */}
      <div className="border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold">TikTok</h4>
              <p className="text-gray-400 text-sm">Import your viral videos</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isConnectedTikTok ? (
              <>
                <span className="text-green-400 text-sm">✓ Connected</span>
                <button
                  onClick={disconnectTikTok}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectTikTok}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                Connect TikTok
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instagram Connection */}
      <div className="border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold">Instagram</h4>
              <p className="text-gray-400 text-sm">Import your posts & reels</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isConnectedInstagram ? (
              <>
                <span className="text-green-400 text-sm">✓ Connected</span>
                <button
                  onClick={disconnectInstagram}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectInstagram}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                Connect Instagram
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Import Button */}
      {(isConnectedTikTok || isConnectedInstagram) && (
        <button
          onClick={importContent}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Importing Content...
            </div>
          ) : (
            '🚀 Import Content & Launch Tokens'
          )}
        </button>
      )}

      {/* Imported Content Preview */}
      {importedContent.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white font-bold mb-3">Imported Content ({importedContent.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {importedContent.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden">
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium truncate">{item.title}</p>
                  <p className="text-gray-400 text-xs">
                    {item.platform === 'tiktok' ? '🎵' : '📸'} {item.creator} • {item.likes} likes
                  </p>
                </div>
              </div>
            ))}
            {importedContent.length > 5 && (
              <p className="text-gray-400 text-center text-sm">
                +{importedContent.length - 5} more items
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}