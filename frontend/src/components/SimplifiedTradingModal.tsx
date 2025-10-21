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
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-3xl flex flex-col overflow-hidden shadow-2xl border-2 border-gray-800/50 mx-4"
        style={{ pointerEvents: 'auto', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-b border-gray-700/50 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{communityLogo}</div>
              <div>
                <h2 className="text-white font-black text-xl">${creatorToken}</h2>
                <p className="text-gray-400 text-sm font-medium">{communityName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-full p-2.5 transition-all hover:scale-110"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Token Stats Row */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
              <div className="text-gray-400 text-[10px] font-semibold mb-1">PRICE</div>
              <div className="text-white font-bold text-base">$2.45</div>
            </div>
            <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-3 border border-green-500/30">
              <div className="text-gray-400 text-[10px] font-semibold mb-1">24H</div>
              <div className="text-green-400 font-bold text-base">+12.3%</div>
            </div>
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
              <div className="text-gray-400 text-[10px] font-semibold mb-1">MCAP</div>
              <div className="text-white font-bold text-base">$1.2M</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Buy/Sell Tabs */}
          <div className="flex gap-2 bg-gray-800/60 backdrop-blur-sm rounded-xl p-1.5 border border-gray-700/30">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-3.5 rounded-lg font-bold text-base transition-all ${
                activeTab === 'buy'
                  ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-3.5 rounded-lg font-bold text-base transition-all ${
                activeTab === 'sell'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Amount Input Section */}
          <div className="space-y-3">
            <label className="text-gray-300 text-sm font-bold">You Pay</label>

            {/* SOL Input */}
            <div className="relative">
              <input
                type="number"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-gray-800/60 backdrop-blur-sm text-white text-3xl font-bold rounded-xl px-5 py-5 focus:outline-none focus:ring-2 focus:ring-green-500/50 border border-gray-700/50 placeholder-gray-600"
              />
              <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                <div className="bg-gray-700/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600/50">
                  <span className="text-white font-bold text-base">SOL</span>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="bg-gray-800/60 backdrop-blur-sm hover:bg-green-500/20 hover:border-green-500/50 text-white font-bold text-sm py-3 rounded-lg transition-all border border-gray-700/50"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* You Receive Section */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-5 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm font-bold">You {activeTab === 'buy' ? 'Receive' : 'Pay'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-black text-3xl">{estimatedTokens}</span>
              <span className="text-green-400 font-bold text-xl">${creatorToken}</span>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-gray-800/40 hover:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 transition-all border border-gray-700/30 flex items-center justify-between group"
          >
            <span className="text-gray-300 font-semibold text-sm group-hover:text-white transition-colors">
              Advanced Settings
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            )}
          </button>

          {/* Advanced Settings Content */}
          {showAdvanced && (
            <div className="space-y-4 animate-fade-in">
              {/* Slippage Settings */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 text-sm font-bold">Slippage Tolerance</span>
                  <span className="text-white font-bold text-base">{slippage}%</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 2, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                        slippage === value
                          ? 'bg-green-500 text-black shadow-lg'
                          : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Trade Details */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Price per token</span>
                  <span className="text-white font-semibold text-sm">{tokenPrice} SOL</span>
                </div>
                <div className="h-px bg-gray-700/50"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Network fee</span>
                  <span className="text-white font-semibold text-sm">~0.0001 SOL</span>
                </div>
                <div className="h-px bg-gray-700/50"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Slippage</span>
                  <span className="text-white font-semibold text-sm">{slippage}%</span>
                </div>
              </div>

              {/* Price Chart */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-sm">24h Price Chart</h3>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="h-32 flex items-end justify-between gap-1">
                  {[...Array(20)].map((_, i) => {
                    const height = Math.random() * 80 + 20
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-green-500/80 to-green-400/80 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleTrade}
            disabled={!solAmount || parseFloat(solAmount) <= 0}
            className={`w-full py-5 rounded-xl font-black text-xl transition-all shadow-2xl ${
              activeTab === 'buy'
                ? 'bg-green-500 hover:bg-green-600 text-black shadow-green-500/50 hover:shadow-green-500/70'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/50 hover:shadow-red-500/70'
            } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}
          >
            {activeTab === 'buy' ? '🚀 Buy' : '💸 Sell'} ${creatorToken}
          </button>

          {/* Info Tip - Only show when not in advanced mode */}
          {!showAdvanced && (
            <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {activeTab === 'buy'
                    ? `Buying ${creatorToken} supports the creator and unlocks exclusive content!`
                    : `Selling ${creatorToken} converts your tokens back to SOL instantly.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
