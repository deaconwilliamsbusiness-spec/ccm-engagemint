'use client'

import { X, TrendingUp, Settings } from 'lucide-react'
import { useState } from 'react'

interface TradingModalProps {
  onClose: () => void
  communityName: string
  communityLogo: string
  communityMembers: string
  creatorToken: string
}

export function TradingModal({ onClose, communityName, communityLogo, communityMembers, creatorToken }: TradingModalProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [solAmount, setSolAmount] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(1)

  // Mock data
  const tokenPrice = 0.0024 // SOL per token
  const estimatedTokens = solAmount ? (parseFloat(solAmount) / tokenPrice).toFixed(0) : '0'

  const quickAmounts = [0.1, 0.5, 1, 5]

  const handleQuickAmount = (amount: number) => {
    setSolAmount(amount.toString())
  }

  const handleTrade = () => {
    // Implement trade logic here
    console.log(`${activeTab}ing ${solAmount} SOL for ${estimatedTokens} ${creatorToken}`)
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
        className="relative w-full max-w-md bg-gray-900 rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-gray-800 mx-4"
        style={{ pointerEvents: 'auto', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-b border-gray-800 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{communityLogo}</div>
              <div>
                <h2 className="text-white font-bold text-lg">${creatorToken}</h2>
                <p className="text-gray-400 text-xs">{communityName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Token Stats Row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
              <div className="text-gray-400 text-[10px] font-medium mb-1">Price</div>
              <div className="text-white font-bold text-sm">$2.45</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
              <div className="text-gray-400 text-[10px] font-medium mb-1">24h</div>
              <div className="text-green-400 font-bold text-sm">+12.3%</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
              <div className="text-gray-400 text-[10px] font-medium mb-1">MCap</div>
              <div className="text-white font-bold text-sm">$1.2M</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Buy/Sell Tabs */}
          <div className="flex gap-2 bg-gray-800 rounded-xl p-1.5">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'buy'
                  ? 'bg-green-500 text-black shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'sell'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 text-sm font-medium">Amount (SOL)</label>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Slippage Settings */}
            {showSettings && (
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 text-sm font-medium">Slippage</span>
                  <span className="text-white font-bold text-sm">{slippage}%</span>
                </div>
                <div className="flex gap-2">
                  {[0.5, 1, 2, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        slippage === value
                          ? 'bg-green-500 text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SOL Input */}
            <div className="relative">
              <input
                type="number"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-gray-800 text-white text-2xl font-bold rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <div className="bg-gray-700 rounded-lg px-3 py-1">
                  <span className="text-white font-bold text-sm">SOL</span>
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs py-3 rounded-lg transition-all border border-gray-700 hover:border-green-500"
                >
                  {amount} SOL
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Output */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">You {activeTab === 'buy' ? 'receive' : 'pay'}</span>
              <span className="text-white font-bold text-lg">{estimatedTokens}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Token</span>
              <span className="text-green-400 font-bold text-sm">${creatorToken}</span>
            </div>
          </div>

          {/* Trade Info */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Price per token</span>
              <span className="text-white font-medium">{tokenPrice} SOL</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Slippage</span>
              <span className="text-white font-medium">{slippage}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Network fee</span>
              <span className="text-white font-medium">~0.0001 SOL</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleTrade}
            disabled={!solAmount || parseFloat(solAmount) <= 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              activeTab === 'buy'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {activeTab === 'buy' ? 'Buy' : 'Sell'} ${creatorToken}
          </button>

          {/* Additional Info */}
          <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-start gap-2">
              <div className="text-lg">💡</div>
              <div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {activeTab === 'buy'
                    ? `Buying ${creatorToken} tokens supports the creator and grants you access to exclusive content and community features.`
                    : `Selling ${creatorToken} tokens will convert them back to SOL. Make sure you have enough tokens in your wallet.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm">Price Chart</h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="h-32 flex items-end justify-between gap-1">
              {[...Array(20)].map((_, i) => {
                const height = Math.random() * 80 + 20
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
            <div className="mt-2 text-gray-400 text-xs text-center">
              24h price history
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
