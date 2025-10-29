'use client'

import { X, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface SimplifiedTradingModalProps {
  onClose: () => void
  communityName: string
  communityLogo: string
  creatorToken: string
}

export function SimplifiedTradingModal({ onClose, communityName, communityLogo, creatorToken }: SimplifiedTradingModalProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [solAmount, setSolAmount] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [slippage, setSlippage] = useState(1)

  // Mock data
  const tokenPrice = 0.0024 // SOL per token
  const estimatedTokens = solAmount ? (parseFloat(solAmount) / tokenPrice).toFixed(0) : '0'

  const quickAmounts = [0.1, 0.5, 1, 5]

  const handleQuickAmount = (amount: number) => {
    setSolAmount(amount.toString())
  }

  const handleTrade = () => {
    console.log(`${activeTab}ing ${solAmount} SOL for ${estimatedTokens} ${creatorToken}`)
    // Implement trade logic here
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal - Clean and minimal */}
      <div
        className="relative w-full max-w-md bg-black rounded-t-3xl flex flex-col overflow-hidden shadow-2xl border-t border-x border-white/10 mx-0 animate-slide-up"
        style={{ pointerEvents: 'auto', maxHeight: '85vh' }}
      >
        {/* Simple Header */}
        <div className="px-6 py-5 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{communityLogo}</div>
              <div>
                <h2 className="text-white font-semibold text-lg">${creatorToken}</h2>
                <p className="text-gray-500 text-sm">{communityName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Buy/Sell Tabs - Minimal style */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'buy'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'sell'
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Amount Input - Clean and simple */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 text-sm">You pay</label>
              <span className="text-gray-600 text-xs">Balance: 1.5 SOL</span>
            </div>

            {/* Clean Input */}
            <div className="relative">
              <input
                type="number"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 text-white text-3xl font-medium rounded-xl px-4 py-4 focus:outline-none focus:bg-white/10 border border-white/10 focus:border-white/20 placeholder-gray-700 transition-all"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-500 font-medium text-sm">SOL</span>
              </div>
            </div>

            {/* Quick Amounts - Simple pills */}
            <div className="flex gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    solAmount === amount.toString()
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* You Receive - Clean and simple */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">You receive</span>
              <div className="text-xl">{communityLogo}</div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-white font-semibold text-2xl">{estimatedTokens || '0'}</span>
              <span className="text-gray-500 text-sm">${creatorToken}</span>
            </div>
            {solAmount && parseFloat(solAmount) > 0 && (
              <div className="mt-2 text-gray-600 text-xs">
                ≈ ${(parseFloat(estimatedTokens || '0') * 2.45).toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Advanced Settings Toggle - Minimal */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-all border border-white/10 flex items-center justify-between group"
          >
            <span className="text-gray-500 font-medium text-xs group-hover:text-gray-400 transition-colors">
              Advanced
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
            )}
          </button>

          {/* Advanced Settings Content - Minimal */}
          {showAdvanced && (
            <div className="space-y-3 animate-fade-in">
              {/* Slippage Settings */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Slippage Tolerance</span>
                  <span className="text-white font-medium text-sm">{slippage}%</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 2, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        slippage === value
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Trade Details */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Price per token</span>
                  <span className="text-white font-medium text-sm">{tokenPrice} SOL</span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Network fee</span>
                  <span className="text-white font-medium text-sm">~0.0001 SOL</span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Slippage</span>
                  <span className="text-white font-medium text-sm">{slippage}%</span>
                </div>
              </div>

              {/* Price Chart */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium text-sm">24h Price Chart</h3>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="h-32 flex items-end justify-between gap-1">
                  {[...Array(20)].map((_, i) => {
                    const height = Math.random() * 80 + 20
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-white/20 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Button - Clean and minimal */}
          <button
            onClick={handleTrade}
            disabled={!solAmount || parseFloat(solAmount) <= 0}
            className={`w-full py-4 rounded-xl font-medium text-base transition-all ${
              activeTab === 'buy'
                ? 'bg-white hover:bg-white/90 text-black'
                : 'bg-white hover:bg-white/90 text-black'
            } disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]`}
          >
            {activeTab === 'buy' ? `Buy ${creatorToken}` : `Sell ${creatorToken}`}
          </button>

          {/* Info Tip - Minimal and subtle */}
          {!showAdvanced && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-gray-500 text-xs leading-relaxed">
                {activeTab === 'buy'
                  ? `Buying ${creatorToken} supports the creator and unlocks exclusive content.`
                  : `Selling ${creatorToken} converts your tokens back to SOL instantly.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
