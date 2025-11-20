'use client'

import { useState, useEffect } from 'react'

interface MintAnimationIntroProps {
  onComplete?: () => void
  isStandalone?: boolean
}

// Generate particle data once (deterministic)
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  width: 2 + (i * 0.3) % 4,
  height: 2 + (i * 0.5) % 4,
  left: (i * 5.3) % 100,
  top: (i * 7.1) % 100,
  duration: 2 + (i * 0.3) % 3,
  delay: (i * 0.2) % 2
}))

export function MintAnimationIntro({ onComplete }: MintAnimationIntroProps) {
  const [step, setStep] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Animation sequence - Show button after animation
    const timers = [
      setTimeout(() => setStep(1), 500),    // Show logo
      setTimeout(() => setStep(2), 1800),   // Pulse effect
      setTimeout(() => setStep(3), 3000),   // Show tagline
      setTimeout(() => setShowButton(true), 3500)  // Show button
    ]

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [])

  // Removed handleEnter function - not needed for teaser page

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f3d2d 50%, #1a1a1a 75%, #0a0a0a 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 3s ease infinite'
      }}
    >
      {/* Animated background particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-green-500/20"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `float ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative text-center px-4">
        {/* Logo */}
        <div
          className={`transition-all duration-500 transform ${
            step >= 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mint-logo.png"
              alt="EngageMint Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Brand name and subtitle */}
        <div
          className={`transition-all duration-500 transform ${
            step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-white">
            EngageMint
          </h1>
          <p className="text-lg sm:text-xl font-bold text-green-400 tracking-wide">
            CREATOR COMMUNITY MARKET
          </p>
        </div>

        {/* Coming Soon Tagline */}
        <div
          className={`mt-8 transition-all duration-500 transform ${
            showButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-2 animate-pulse-slow">
              Coming Soon
            </p>
            <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto">
              The future of creator tokens on Solana
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
