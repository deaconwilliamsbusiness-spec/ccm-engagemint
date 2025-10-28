'use client'

import { ReactNode } from 'react'

interface PhoneContainerProps {
  children: ReactNode
  className?: string
}

/**
 * PhoneContainer - Standard background pattern for all dropdown menu pages
 *
 * Design Features:
 * - Fixed gradient background (doesn't scroll with content)
 * - Subtle radial green overlay (5% opacity)
 * - Centered phone-width container (max-w-md)
 * - Semi-transparent content area with backdrop blur
 * - Left/right borders for phone frame effect
 *
 * Used in: Profile, Community, Mint, Wallet pages
 */
export function PhoneContainer({ children, className = '' }: PhoneContainerProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Subtle background pattern - FIXED, doesn't scroll */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
      </div>

      {/* Centered content container - Content scrolls, background stays fixed */}
      <div className="relative h-full w-full flex items-center justify-center">
        <div className={`relative w-full max-w-md h-full bg-gray-900/50 backdrop-blur-xl border-x border-gray-800/50 overflow-y-auto ${className}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
