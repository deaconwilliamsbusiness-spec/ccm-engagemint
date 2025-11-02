'use client'

import { useState, useEffect } from 'react'
import { ReelsInterface } from '@/components/ReelsInterface'
import { CreatorProfile } from '@/components/CreatorProfile'
import { MintInterface } from '@/components/MintInterface'
import { EnhancedCommunityHub } from '@/components/EnhancedCommunityHub'
import { MintAnimationIntro } from '@/components/MintAnimationIntro'
import { OnboardingFlow } from '@/components/OnboardingFlow'
import { PortfolioDashboard } from '@/components/PortfolioDashboard'
import { useUser } from '@/context/UserContext'
import { interestsAPI } from '@/lib/api'

export default function Home() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('intro')
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const [feedRefreshTrigger, setFeedRefreshTrigger] = useState(0)

  // Onboarding disabled - skip directly to content
  // useEffect(() => {
  //   const checkOnboarding = async () => {
  //     if (user) {
  //       setCheckingOnboarding(true)
  //       try {
  //         const response = await interestsAPI.getUserPreferences()
  //         if (response.success) {
  //           setNeedsOnboarding(!response.data.preferences.onboarding_completed)
  //         }
  //       } catch (error) {
  //         console.error('Failed to check onboarding status:', error)
  //         setNeedsOnboarding(true)
  //       } finally {
  //         setCheckingOnboarding(false)
  //       }
  //     }
  //   }
  //   checkOnboarding()
  // }, [user])

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Animation Intro as a permanent tab */}
      {activeTab === 'intro' && (
        <MintAnimationIntro
          onComplete={() => setActiveTab('feed')}
          isStandalone={true}
        />
      )}

      {activeTab === 'feed' && (
        <ReelsInterface setActiveTab={setActiveTab} refreshTrigger={feedRefreshTrigger} />
      )}

      {activeTab === 'creator' && (
        <CreatorProfile onBack={() => setActiveTab('feed')} />
      )}

      {activeTab === 'trade' && (
        <MintInterface
          onBack={() => {
            setFeedRefreshTrigger(prev => prev + 1)
            setActiveTab('feed')
          }}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'community' && (
        <EnhancedCommunityHub onBack={() => setActiveTab('feed')} />
      )}

      {activeTab === 'portfolio' && (
        <PortfolioDashboard />
      )}
    </div>
  )
}