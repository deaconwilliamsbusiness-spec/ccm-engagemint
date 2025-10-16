'use client'

import { ArrowLeft, Users as UsersIcon } from 'lucide-react'
import { useState } from 'react'

interface CommunityHubProps {
  onBack: () => void
  selectedCommunity?: string // Community name passed from video
}

export function CommunityHub({ onBack, selectedCommunity }: CommunityHubProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'trending'>('latest')
  const currentCommunity = selectedCommunity || 'SOL Community'

  const communities = {
    'SOL Community': { logo: '🔥', members: '45.2K', color: 'orange' },
    'AI Community': { logo: '🤖', members: '32.8K', color: 'blue' },
    'DeFi Community': { logo: '💎', members: '28.5K', color: 'purple' },
    'PEPE Community': { logo: '🐸', members: '67.3K', color: 'green' },
    'Trading Community': { logo: '📈', members: '89.1K', color: 'yellow' }
  }

  const communityContent = {
    'SOL Community': {
      latest: [
        {
          id: 1,
          author: '@solana_dev',
          avatar: '/mint-logo.png',
          verified: true,
          content: 'Just deployed a new DeFi protocol on Solana! Testing shows 400ms finality 🚀',
          timestamp: '12m ago',
          likes: '234',
          comments: '45'
        },
        {
          id: 2,
          author: '@sol_trader',
          avatar: '/mint-logo.png',
          verified: false,
          content: 'SOL looking bullish after the recent network upgrades. Anyone else seeing this pattern? 📈',
          timestamp: '1h ago',
          likes: '156',
          comments: '32'
        }
      ],
      trending: [
        {
          id: 1,
          title: 'Network Upgrade Discussion',
          engagement: '8.2K',
          author: '@cryptoking',
          preview: 'The latest Solana upgrade brought major improvements...'
        },
        {
          id: 2,
          title: 'SOL Price Analysis Thread',
          engagement: '6.5K',
          author: '@sol_analyst',
          preview: 'Technical analysis shows strong support at $180...'
        }
      ]
    },
    'AI Community': {
      latest: [
        {
          id: 1,
          author: '@ai_researcher',
          avatar: '/mint-logo.png',
          verified: true,
          content: 'New paper on transformer architectures just dropped! The implications for crypto trading bots are huge 🤖',
          timestamp: '8m ago',
          likes: '189',
          comments: '67'
        },
        {
          id: 2,
          author: '@nftqueen',
          avatar: '/mint-logo.png',
          verified: true,
          content: 'Building an AI-powered NFT generator. Beta testers needed! Who\'s interested? 🎨',
          timestamp: '45m ago',
          likes: '298',
          comments: '84'
        }
      ],
      trending: [
        {
          id: 1,
          title: 'AI Trading Bot Performance',
          engagement: '12.1K',
          author: '@nftqueen',
          preview: 'Our AI trading bot achieved 34% returns this month...'
        },
        {
          id: 2,
          title: 'Machine Learning in DeFi',
          engagement: '9.8K',
          author: '@ml_crypto',
          preview: 'How ML models are revolutionizing yield farming...'
        }
      ]
    },
    'PEPE Community': {
      latest: [
        {
          id: 1,
          author: '@pepe_king',
          avatar: '/mint-logo.png',
          verified: true,
          content: 'PEPE holders unite! 🐸 New meme contest starting tomorrow. Prizes in $PEPE tokens!',
          timestamp: '5m ago',
          likes: '567',
          comments: '123'
        },
        {
          id: 2,
          author: '@meme_master',
          avatar: '/mint-logo.png',
          verified: false,
          content: 'That feeling when PEPE pumps 40% in one day 🚀🐸 Diamond hands paying off!',
          timestamp: '20m ago',
          likes: '432',
          comments: '89'
        }
      ],
      trending: [
        {
          id: 1,
          title: 'PEPE Meme Competition',
          engagement: '15.7K',
          author: '@memecoin_guru',
          preview: 'Biggest meme contest of the year! $10K in prizes...'
        },
        {
          id: 2,
          title: 'PEPE Ecosystem Update',
          engagement: '11.2K',
          author: '@pepe_dev',
          preview: 'New utility features coming to PEPE protocol...'
        }
      ]
    }
  }

  const getCurrentCommunityData = () => {
    const content = communityContent as Record<string, typeof communityContent['SOL Community']>
    return content[currentCommunity] || communityContent['SOL Community']
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
              <h1 className="font-bold text-2xl text-white">ENGAGE</h1>
              <div className="bg-green-500 rounded-full p-3">
                <img src="/handshake-logo.png" alt="ENGAGE" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Community Header */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl">
                  {(communities as Record<string, typeof communities['SOL Community']>)[currentCommunity]?.logo}
                </div>
                <h3 className="text-black text-xl font-black">{currentCommunity}</h3>
                <div className="flex items-center justify-center gap-4 mt-2 text-black/80 text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{(communities as Record<string, typeof communities['SOL Community']>)[currentCommunity]?.members}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 bg-gray-800 rounded-xl p-1.5 border border-gray-700">
              <button
                onClick={() => setActiveTab('latest')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                  activeTab === 'latest'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                LATEST
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                  activeTab === 'trending'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                TRENDING
              </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
              {/* LATEST Tab Content */}
              {activeTab === 'latest' && (
                <>
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                    💬 RECENT CHATS IN {currentCommunity.toUpperCase()}
                  </div>
                  {getCurrentCommunityData().latest.map((post) => (
                    <div key={post.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-green-500 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.avatar} alt={`${post.author} avatar`} className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-bold text-sm">{post.author}</span>
                            {post.verified && <span className="text-green-400 text-lg">✅</span>}
                            <span className="text-gray-500 text-xs">{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{post.content}</p>
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-700">
                        <button
                          onClick={() => alert(`Liked post by ${post.author}`)}
                          className="text-gray-400 hover:text-green-400 text-sm font-medium transition-colors"
                        >
                          ❤️ {post.likes}
                        </button>
                        <button
                          onClick={() => {
                            // Future: Open chat for this post
                            alert(`Opening chat for ${post.author}'s post in ${currentCommunity}`)
                          }}
                          className="text-gray-400 hover:text-green-400 text-sm font-medium transition-colors relative"
                        >
                          💬 {post.comments}
                          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2 animate-pulse"></div>
                        </button>
                        <button
                          onClick={() => {
                            const postUrl = `${window.location.origin}/community/${currentCommunity}/post/${post.id}`
                            navigator.clipboard.writeText(postUrl).then(() => {
                              alert('Post link copied to clipboard!')
                            }).catch(() => {
                              alert('Share feature coming soon!')
                            })
                          }}
                          className="text-gray-400 hover:text-green-400 text-sm font-medium transition-colors"
                        >
                          🔗 Share
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Create Post Button */}
                  <button
                    onClick={() => alert(`Opening post composer for ${currentCommunity}...\n\nThis would open a modal or new page to create a post.`)}
                    className="w-full bg-gray-800 border-2 border-dashed border-gray-600 hover:border-green-500 rounded-2xl p-6 transition-colors group text-center"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">✍️</div>
                    <p className="text-gray-400 group-hover:text-green-400 font-medium">Create a post in {currentCommunity}</p>
                    <p className="text-gray-500 text-sm mt-1">Share your thoughts with the community</p>
                  </button>
                </>
              )}

              {/* TRENDING Tab Content */}
              {activeTab === 'trending' && (
                <>
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    🔥 TRENDING IN {currentCommunity.toUpperCase()}
                  </div>
                  {getCurrentCommunityData().trending.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => alert(`Opening trending post: ${post.title}`)}
                      className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-base mb-1">{post.title}</h3>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span>by {post.author}</span>
                            <span>•</span>
                            <span>{(communities as Record<string, typeof communities['SOL Community']>)[currentCommunity]?.logo} {currentCommunity}</span>
                          </div>
                        </div>
                        <div className="text-green-400 font-bold text-lg">{post.engagement}</div>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">{post.preview}</p>
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="text-green-400 text-xs font-medium">ENGAGEMENT SCORE</div>
                        <div className="text-green-400 text-2xl font-bold">{post.engagement}</div>
                      </div>
                    </div>
                  ))}

                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">
                      🎯 These are the most engaged conversations in {currentCommunity} this week
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}