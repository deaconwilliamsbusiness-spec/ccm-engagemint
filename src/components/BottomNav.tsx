'use client'

interface BottomNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: '🏠' },
    { id: 'creator', label: 'Profile', icon: '👤' },
    { id: 'trade', label: 'Trade', icon: '💰' },
    { id: 'community', label: 'ENGAGE', icon: '👥' },
  ]

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === tab.id
                ? 'text-green-500'
                : 'text-gray-600'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}