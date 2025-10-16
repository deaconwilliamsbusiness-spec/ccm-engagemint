'use client'

import { useState } from 'react'
import { ReelsInterface } from '@/components/ReelsInterface'
import { CreatorProfile } from '@/components/CreatorProfile'
import { MintInterface } from '@/components/MintInterface'
import { CommunityHub } from '@/components/CommunityHub'
import { MintAnimationIntro } from '@/components/MintAnimationIntro'
import { UserProvider } from '@/context/UserContext'

export default function Home() {
  const [activeTab, setActiveTab] = useState('feed')
  const [showIntro, setShowIntro] = useState(true)

  return (
    <UserProvider>
      {showIntro && (
        <MintAnimationIntro onComplete={() => setShowIntro(false)} />
      )}

      <div className="bg-gray-900 min-h-screen text-white">
        {activeTab === 'feed' && (
          <ReelsInterface setActiveTab={setActiveTab} />
        )}

        {activeTab === 'creator' && (
          <CreatorProfile onBack={() => setActiveTab('feed')} />
        )}

        {activeTab === 'trade' && (
          <MintInterface onBack={() => setActiveTab('feed')} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'community' && (
          <CommunityHub onBack={() => setActiveTab('feed')} />
        )}
      </div>
    </UserProvider>
  )
}