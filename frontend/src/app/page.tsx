'use client'

import { useState, useEffect } from 'react'
import { ReelsInterface } from '@/components/ReelsInterface'
import { CreatorProfile } from '@/components/CreatorProfile'
import { MintInterface } from '@/components/MintInterface'
import { EnhancedCommunityHub } from '@/components/EnhancedCommunityHub'
import { MintAnimationIntro } from '@/components/MintAnimationIntro'
import { OnboardingFlow } from '@/components/OnboardingFlow'
import { useUser } from '@/context/UserContext'
import { interestsAPI } from '@/lib/api'

export default function Home() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('intro')
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const [feedRefreshTrigger, setFeedRefreshTrigger] = useState(0)

  // Check if logged-in user needs onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        setCheckingOnboarding(true)
        try {
          const response = await interestsAPI.getUserPreferences()
          if (response.success) {
            setNeedsOnboarding(!response.data.preferences.onboarding_completed)
          }
        } catch (error) {
          console.error('Failed to check onboarding status:', error)
          // If error, assume onboarding needed
          setNeedsOnboarding(true)
        } finally {
          setCheckingOnboarding(false)
        }
      }
    }

    checkOnboarding()
  }, [user])

  // Show loading while checking onboarding (only for logged-in users)
  if (user && checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show onboarding if user is logged in and needs it
  if (user && needsOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          setNeedsOnboarding(false)
          setActiveTab('feed') // Go to feed after onboarding
        }}
      />
    )
  }

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
    </div>
  )
}