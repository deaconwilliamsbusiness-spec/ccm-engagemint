'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Heart, Smile, Lock, Wallet, ExternalLink } from 'lucide-react'
import { LiveChat } from './LiveChat'

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: string
  isOwner?: boolean
  likes?: number
  tokenBalance?: number
}

interface TokenGatedChatProps {
  isOpen: boolean
  onClose: () => void
  title: string
  tokenSymbol: string
  minimumTokens: number
  userTokenBalance?: number
  onBuyTokens?: () => void
}

export function TokenGatedChat({
  isOpen,
  onClose,
  title,
  tokenSymbol,
  minimumTokens,
  userTokenBalance = 0,
  onBuyTokens
}: TokenGatedChatProps) {
  const hasAccess = userTokenBalance >= minimumTokens

  // Mock token holder messages
  const tokenHolderMessages: ChatMessage[] = [
    {
      id: '1',
      user: '@cryptoking',
      message: `Welcome to the exclusive ${tokenSymbol} community! 🎉 Only token holders can participate here.`,
      timestamp: '5m ago',
      isOwner: true,
      tokenBalance: 1000,
      likes: 15
    },
    {
      id: '2',
      user: '@diamond_hands',
      message: 'Holding 250 tokens strong! This community is amazing 💎🙌',
      timestamp: '3m ago',
      tokenBalance: 250,
      likes: 8
    },
    {
      id: '3',
      user: '@early_adopter',
      message: 'Got in early with 500 tokens. The alpha in this chat is incredible!',
      timestamp: '2m ago',
      tokenBalance: 500,
      likes: 12
    }
  ]

  if (!isOpen) return null

  // If user doesn't have enough tokens, show access gate
  if (!hasAccess) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-500" />
                Token-Gated Community
              </h3>
              <p className="text-gray-400 text-sm">{title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Access Requirements */}
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-yellow-500" />
            </div>

            <div>
              <h4 className="text-white font-bold text-xl mb-2">Exclusive Community Access</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                This is a token-gated community. You need to hold at least{' '}
                <span className="text-green-400 font-bold">{minimumTokens} {tokenSymbol}</span> tokens
                to join the conversation.
              </p>
            </div>

            {/* Current Holdings */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Your Balance</span>
                </div>
                <span className="text-white font-bold">{userTokenBalance} {tokenSymbol}</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Need {minimumTokens - userTokenBalance} more</span>
                  <span>{Math.round((userTokenBalance / minimumTokens) * 100)}% of requirement</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((userTokenBalance / minimumTokens) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Community Preview */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-left">
              <h5 className="text-green-400 font-bold text-sm mb-3 flex items-center gap-2">
                👥 Active Community Members
              </h5>
              <div className="space-y-3">
                {tokenHolderMessages.slice(0, 2).map((msg) => (
                  <div key={msg.id} className="flex gap-3 opacity-60">
                    <div className="w-8 h-8 bg-green-500/50 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">{msg.user.charAt(1).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{msg.user}</span>
                        <span className="text-green-400 text-xs font-bold">
                          {msg.tokenBalance} {tokenSymbol}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="text-gray-500 text-xs">
                  🔒 {tokenHolderMessages.length}+ exclusive messages waiting...
                </span>
              </div>
            </div>

            {/* Buy Tokens Button */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onBuyTokens?.()
                  onClose()
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                <span>Buy {tokenSymbol} Tokens</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <p className="text-gray-500 text-xs">
                Purchase {tokenSymbol} tokens to unlock exclusive community access
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If user has access, show the live chat with token holder context
  const enhancedMessages = tokenHolderMessages.map(msg => ({
    ...msg,
    user: `${msg.user} (${msg.tokenBalance} ${tokenSymbol})`
  }))

  return (
    <LiveChat
      isOpen={isOpen}
      onClose={onClose}
      title={`🔒 ${tokenSymbol} Token Holders • ${title}`}
      initialMessages={enhancedMessages}
    />
  )
}