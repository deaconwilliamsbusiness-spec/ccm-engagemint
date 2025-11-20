'use client'

import { MintAnimationIntro } from '@/components/MintAnimationIntro'

export default function Home() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Teaser page - just the animation intro */}
      <MintAnimationIntro
        onComplete={() => {
          // Do nothing on complete - just show the animation
          console.log('Coming soon...')
        }}
        isStandalone={true}
      />
    </div>
  )
}