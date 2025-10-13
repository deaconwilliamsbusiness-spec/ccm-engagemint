'use client'

import { ArrowLeft, TrendingUp, Flame, Globe } from 'lucide-react'
import { useState } from 'react'

interface DiscoveryPageProps {
  onBack: () => void
}

export function DiscoveryPage({ onBack }: DiscoveryPageProps) {
  const [activeTab, setActiveTab] = useState<'trending' | 'hot' | 'web3'>('trending')

  const trendingCreators = [
    { name: '@cryptoking', token: 'KING', avatar: '👑', growth: '+45%', members: '25.3K' },
    { name: '@nftqueen', token: 'QUEEN', avatar: '👸', growth: '+38%', members: '18.7K' },
    { name: '@solwizard', token: 'WIZ', avatar: '🧙', growth: '+32%', members: '22.1K' },
    { name: '@defi_master', token: 'DEFI', avatar: '💎', growth: '+28%', members: '15.4K' }
  ]

  const hotCommunities = [
    { name: 'SOL Community', icon: '🔥', members: '45.2K', activity: '8.2K', color: 'orange' },
    { name: 'PEPE Community', icon: '🐸', members: '67.3K', activity: '12.1K', color: 'green' },
    { name: 'Trading Community', icon: '📈', members: '89.1K', activity: '15.7K', color: 'yellow' },
    { name: 'AI Community', icon: '🤖', members: '32.8K', activity: '6.5K', color: 'blue' }
  ]

  const web3Content = [
    {
      creator: '@web3_dev',
      title: 'Building on Solana: Best practices',
      community: 'Web3',
      time: '15m ago',
      engagement: '892'
    },
    {
      creator: '@blockchain_pro',
      title: 'DeFi protocols comparison guide',
      community: 'DeFi',
      time: '28m ago',
      engagement: '1.2K'
    },
    {
      creator: '@nft_builder',
      title: 'Smart contract security tips',
      community: 'Web3',
      time: '45m ago',
      engagement: '645'
    },
    {
      creator: '@dao_master',
      title: 'Governance token economics explained',
      community: 'DAO',
      time: '1h ago',
      engagement: '423'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-blue-900/20 to-purple-900/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>
      </div>

      {/* Phone Container */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="relative w-full max-w-md h-full bg-gray-900 border-x border-gray-800 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="font-bold text-xl text-white">Discover</h1>
              <div className="bg-green-500 rounded-full p-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 space-y-4">
            {/* Tab Navigation */}
            <div className="flex gap-2 bg-gray-800 rounded-xl p-1.5 border border-gray-700">
              <button
                onClick={() => setActiveTab('trending')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'trending'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                TRENDING
              </button>
              <button
                onClick={() => setActiveTab('hot')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'hot'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                HOT
              </button>
              <button
                onClick={() => setActiveTab('web3')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'web3'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                WEB3
              </button>
            </div>

            {/* TRENDING Tab */}
            {activeTab === 'trending' && (
              <>
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  📈 Trending Creators
                </div>
                <div className="space-y-3">
                  {trendingCreators.map((creator, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-2xl">
                          {creator.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm">{creator.name}</span>
                            <span className="text-green-400 text-xs font-bold">${creator.token}</span>
                          </div>
                          <div className="text-gray-400 text-xs">{creator.members} members</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-sm">{creator.growth}</div>
                          <div className="text-gray-500 text-xs">24h</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* HOT Tab */}
            {activeTab === 'hot' && (
              <>
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  🔥 Hot Communities
                </div>
                <div className="space-y-3">
                  {hotCommunities.map((community, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-2xl">
                          {community.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-sm">{community.name}</div>
                          <div className="text-gray-400 text-xs">{community.members} members</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-sm">{community.activity}</div>
                          <div className="text-gray-500 text-xs">active</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* WEB3 Tab */}
            {activeTab === 'web3' && (
              <>
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  🌐 Web3 & Blockchain
                </div>
                <div className="space-y-3">
                  {web3Content.map((content, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-green-400 font-bold text-xs mb-1">{content.creator}</div>
                          <div className="text-white text-sm font-medium mb-2">{content.title}</div>
                          <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <span>{content.community}</span>
                            <span>•</span>
                            <span>{content.time}</span>
                            <span>•</span>
                            <span>❤️ {content.engagement}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Bottom Spacer */}
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
