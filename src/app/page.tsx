'use client'

import { useState } from 'react'
import { VideoFeed } from '@/components/VideoFeed'
import { ReelsInterface } from '@/components/ReelsInterface'
import { CreatorProfile } from '@/components/CreatorProfile'
import { MintInterface } from '@/components/MintInterface'
import { CommunityHub } from '@/components/CommunityHub'
import { TopNav } from '@/components/TopNav'
import { PasswordGate } from '@/components/PasswordGate'

export default function Home() {
  const [activeTab, setActiveTab] = useState('feed')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <PasswordGate>
      <div className="bg-gray-900 min-h-screen text-white">
        {activeTab === 'feed' && (
          // Full-screen reels interface
          <ReelsInterface
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
          />
        )}

        {activeTab === 'creator' && (
          <CreatorProfile onBack={() => setActiveTab('feed')} />
        )}

        {activeTab === 'trade' && (
          <MintInterface onBack={() => setActiveTab('feed')} />
        )}

        {activeTab === 'community' && (
          <CommunityHub onBack={() => setActiveTab('feed')} />
        )}

      </div>
    </PasswordGate>
  )
}