'use client'

import { Bell, User, Wallet, Home, TrendingUp, Users } from 'lucide-react'

interface TopNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function TopNav({ activeTab, setActiveTab }: TopNavProps) {
  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'creator', label: 'Creator', icon: User },
    { id: 'trade', label: 'MINT', icon: TrendingUp },
    { id: 'community', label: 'ENGAGE', icon: Users },
  ]
  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src="/mint-logo.png"
              alt="mint Logo"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">MINT</h1>
            <p className="text-green-400 text-sm font-medium">.meme</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-2 bg-gray-700 rounded-xl p-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-green-500 text-black font-bold'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {/* Wallet Balance */}
          <button
            onClick={() => alert('Wallet Details:\n• Balance: $1,247.83\n• SOL: 12.45\n• KING: 234\n• QUEEN: 89\n\nClick to manage wallet')}
            className="bg-gray-700 rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-gray-600 transition-colors"
          >
            <Wallet className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">$1,247.83</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => alert('Notifications:\n• New comment on your video\n• Token price alert: KING +12%\n• Community post liked')}
            className="relative bg-gray-700 rounded-xl p-3 hover:bg-gray-600 transition-colors"
          >
            <Bell className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 animate-pulse"></div>
          </button>

          {/* Profile */}
          <button
            onClick={() => setActiveTab('creator')}
            className="bg-gray-700 rounded-xl p-3 hover:bg-gray-600 transition-colors"
          >
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </nav>
  )
}