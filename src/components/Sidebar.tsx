'use client'

import { Home, User, TrendingUp, Users, Trophy, Settings, HelpCircle } from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navigationItems = [
    { id: 'feed', label: 'Video Feed', icon: Home, description: 'Discover trending content' },
    { id: 'creator', label: 'Creator Profile', icon: User, description: 'Manage your presence' },
    { id: 'trade', label: 'MINT', icon: TrendingUp, description: 'Create videos & memes' },
    { id: 'community', label: 'ENGAGE', icon: Users, description: 'Governance & voting' },
  ]

  const secondaryItems = [
    { id: 'leaderboard', label: 'Daily Draw', icon: Trophy, description: 'Top performers' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
    { id: 'help', label: 'Help', icon: HelpCircle, description: 'Support center' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-800 border-r border-gray-700 pt-20">
      <div className="p-6">
        {/* Main Navigation */}
        <div className="mb-8">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
            Navigation
          </h3>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${
                    activeTab === item.id
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${
                    activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${
                      activeTab === item.id ? 'text-green-100' : 'text-gray-500 group-hover:text-gray-300'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Platform Stats */}
        <div className="bg-gray-900 rounded-xl p-4 mb-8">
          <h3 className="text-green-400 font-medium mb-3">Platform Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Total TVL</span>
              <span className="text-white font-medium">$2.4M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Active Creators</span>
              <span className="text-white font-medium">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">24h Volume</span>
              <span className="text-green-400 font-medium">$156K</span>
            </div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
            More
          </h3>
          <nav className="space-y-2">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 group"
                >
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}