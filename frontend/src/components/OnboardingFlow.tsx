'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowRight, Sparkles, User, Heart } from 'lucide-react'
import { interestsAPI, socialAPI } from '@/lib/api'

interface Interest {
  id: string
  name: string
  display_name: string
  icon: string
  description: string
}

interface SuggestedUser {
  id: string
  username: string
  display_name?: string
  profile_image_url?: string
  bio?: string
  follower_count: number
}

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [interests, setInterests] = useState<Interest[]>([])
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set())
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  // Load interests on mount
  useEffect(() => {
    loadInterests()
  }, [])

  // Load suggested users when moving to step 2
  useEffect(() => {
    if (step === 2) {
      loadSuggestedUsers()
    }
  }, [step])

  const loadInterests = async () => {
    try {
      const response = await interestsAPI.getAllInterests()
      if (response.success) {
        setInterests(response.data.interests)
      }
    } catch (error) {
      console.error('Failed to load interests:', error)
    }
  }

  const loadSuggestedUsers = async () => {
    try {
      const response = await socialAPI.getSuggestedUsers(10)
      if (response.success) {
        // Remove duplicates by creating a Map keyed by user ID
        const uniqueUsers = Array.from(
          new Map(response.data.users.map(u => [u.id, u])).values()
        )
        setSuggestedUsers(uniqueUsers)
      }
    } catch (error) {
      console.error('Failed to load suggested users:', error)
    }
  }

  const toggleInterest = (interestId: string) => {
    const newSelected = new Set(selectedInterests)
    if (newSelected.has(interestId)) {
      newSelected.delete(interestId)
    } else {
      newSelected.add(interestId)
    }
    setSelectedInterests(newSelected)
  }

  const toggleFollowUser = async (userId: string) => {
    const newFollowed = new Set(followedUsers)
    try {
      if (newFollowed.has(userId)) {
        await socialAPI.unfollowUser(userId)
        newFollowed.delete(userId)
      } else {
        await socialAPI.followUser(userId)
        newFollowed.add(userId)
      }
      setFollowedUsers(newFollowed)
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error)
    }
  }

  const handleNext = async () => {
    if (step === 1) {
      // Save interests and move to step 2
      if (selectedInterests.size > 0) {
        setIsLoading(true)
        try {
          await interestsAPI.setUserInterests(Array.from(selectedInterests))
          setStep(2)
        } catch (error) {
          console.error('Failed to save interests:', error)
        } finally {
          setIsLoading(false)
        }
      }
    } else if (step === 2) {
      // Complete onboarding
      setIsLoading(true)
      try {
        await interestsAPI.completeOnboarding()
        onComplete()
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSkip = async () => {
    if (step === 1) {
      setStep(2)
    } else {
      // Complete onboarding even if skipped
      setIsLoading(true)
      try {
        await interestsAPI.completeOnboarding()
        onComplete()
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-gray-900 to-emerald-900/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
        {/* Progress bar */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {step} of 2</span>
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip
            </button>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Select Interests */}
        {step === 1 && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-500/10">
                <Heart className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                What are you interested in?
              </h2>
              <p className="text-gray-400">
                Choose at least 3 topics to personalize your feed
              </p>
            </div>

            {/* Interest Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                    selectedInterests.has(interest.id)
                      ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{interest.icon}</span>
                    {selectedInterests.has(interest.id) && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-left">
                    {interest.display_name}
                  </h3>
                  <p className="text-gray-400 text-xs text-left mt-1">
                    {interest.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={selectedInterests.size < 3 || isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-700 disabled:to-gray-700 text-black disabled:text-gray-500 font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-gray-500 text-sm mt-3">
              {selectedInterests.size < 3
                ? `Select ${3 - selectedInterests.size} more`
                : `${selectedInterests.size} interests selected`}
            </p>
          </div>
        )}

        {/* Step 2: Follow Creators */}
        {step === 2 && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-500/10">
                <User className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Follow creators you like
              </h2>
              <p className="text-gray-400">
                Discover amazing content from these popular creators
              </p>
            </div>

            {/* Suggested Users List */}
            <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto">
              {suggestedUsers.map((suggestedUser) => (
                <div
                  key={suggestedUser.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex items-center justify-between hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center ring-2 ring-green-500/20">
                      {suggestedUser.profile_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={suggestedUser.profile_image_url}
                          alt={suggestedUser.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">
                        {suggestedUser.display_name || suggestedUser.username}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        @{suggestedUser.username} • {suggestedUser.follower_count} followers
                      </p>
                      {suggestedUser.bio && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                          {suggestedUser.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollowUser(suggestedUser.id)}
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                      followedUsers.has(suggestedUser.id)
                        ? 'bg-gray-700 text-white border border-gray-600'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-600 hover:to-emerald-600'
                    }`}
                  >
                    {followedUsers.has(suggestedUser.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>

            {/* Complete button */}
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Start Exploring
                </>
              )}
            </button>
            <p className="text-center text-gray-500 text-sm mt-3">
              {followedUsers.size > 0 && `Following ${followedUsers.size} creators`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
