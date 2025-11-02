'use client'

import { useState } from 'react'
import { X, Wallet, Zap, AlertCircle } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface SolanaLaunchPopupProps {
  isOpen: boolean
  onClose: () => void
  tokenName: string
  tokenTicker: string
  onConfirm: (solAmount: number) => Promise<void>
}

export function SolanaLaunchPopup({
  isOpen,
  onClose,
  tokenName,
  tokenTicker,
  onConfirm
}: SolanaLaunchPopupProps) {
  const wallet = useWallet()
  const [solAmount, setSolAmount] = useState(0.1)
  const [isLaunching, setIsLaunching] = useState(false)

  if (!isOpen) return null

  const platformFee = solAmount * 0.01 // 1%
  const networkFee = 0.001 // Solana network fee estimate
  const totalCost = solAmount + platformFee + networkFee

  const presetAmounts = [0.1, 0.5, 1, 2, 5]

  const handleLaunch = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet first')
      return
    }

    setIsLaunching(true)
    try {
      await onConfirm(solAmount)
      onClose()
    } catch (error) {
      console.error('Launch failed:', error)
      alert('Launch failed: ' + (error as Error).message)
    } finally {
      setIsLaunching(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl w-full max-w-md border border-green-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-400" />
            Launch Token
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Token Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Launching Token</p>
            <p className="text-white font-bold text-lg">{tokenName || 'Your Token'}</p>
            <p className="text-green-400 font-mono">${tokenTicker || 'TICKER'}</p>
          </div>

          {/* Wallet Connection */}
          {!wallet.connected ? (
            <div className="space-y-3">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-200 text-sm">
                  Connect your Solana wallet to launch your token on-chain
                </p>
              </div>
              <WalletMultiButton className="!w-full !bg-gradient-to-r !from-green-500 !to-emerald-500 hover:!from-green-600 hover:!to-emerald-600 !rounded-xl !py-3 !font-bold !text-black !shadow-lg !transition-all" />
            </div>
          ) : (
            <>
              {/* Connected Wallet Info */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm mb-2 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Connected
                </p>
                <p className="text-white font-mono text-xs">
                  {wallet.publicKey?.toString().slice(0, 8)}...{wallet.publicKey?.toString().slice(-8)}
                </p>
              </div>

              {/* SOL Amount Selector */}
              <div className="space-y-3">
                <label className="block text-white font-semibold">
                  Initial Liquidity (SOL)
                </label>
                <p className="text-gray-400 text-sm">
                  This SOL will be added to the bonding curve for trading
                </p>

                {/* Preset Buttons */}
                <div className="grid grid-cols-5 gap-2">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSolAmount(amount)}
                      className={`py-2 rounded-lg font-semibold transition-all ${
                        solAmount === amount
                          ? 'bg-green-500 text-black'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={solAmount}
                  onChange={(e) => setSolAmount(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Fee Breakdown */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-2">
                <p className="text-white font-semibold mb-2">Fee Breakdown</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Initial Liquidity</span>
                    <span className="text-white font-mono">{solAmount.toFixed(3)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee (1%)</span>
                    <span className="text-white font-mono">{platformFee.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee (est.)</span>
                    <span className="text-white font-mono">{networkFee.toFixed(4)} SOL</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
                    <span className="text-white font-bold">Total Cost</span>
                    <span className="text-green-400 font-mono font-bold">{totalCost.toFixed(4)} SOL</span>
                  </div>
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={handleLaunch}
                disabled={isLaunching || solAmount < 0.1}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  isLaunching || solAmount < 0.1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black shadow-lg hover:shadow-xl active:scale-95'
                }`}
              >
                <Zap className="w-5 h-5" />
                {isLaunching ? 'Launching...' : 'Confirm & Launch Token'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
