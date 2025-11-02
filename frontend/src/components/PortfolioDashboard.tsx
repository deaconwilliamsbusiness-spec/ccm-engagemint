'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, RefreshCw, ExternalLink } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { TradingInterface } from './TradingInterface'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TokenHolding {
  token_name: string
  token_symbol: string
  mint_address: string
  balance: number
  current_price: number
  value_sol: number
  avg_buy_price?: number
  total_invested?: number
  profit_loss?: number
  profit_loss_percent?: number
}

interface PortfolioData {
  holdings: TokenHolding[]
  total_value_sol: number
  total_invested_sol: number
  total_profit_loss: number
  total_profit_loss_percent: number
}

export function PortfolioDashboard() {
  const { user } = useUser()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [showTrading, setShowTrading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchPortfolio()
    }
  }, [user])

  const fetchPortfolio = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/tokens/user/${user.id}/portfolio`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setPortfolio(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTradeClick = (mintAddress: string) => {
    setSelectedToken(mintAddress)
    setShowTrading(true)
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Wallet className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Portfolio</h2>
        <p className="text-gray-400">Sign in to view your token holdings</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    )
  }

  if (!portfolio || portfolio.holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Wallet className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Holdings Yet</h2>
        <p className="text-gray-400 mb-4">Start trading tokens to build your portfolio</p>
      </div>
    )
  }

  const totalPnLPositive = (portfolio.total_profit_loss || 0) >= 0

  return (
    <div className="flex flex-col h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-400" />
            Portfolio
          </h1>
          <button
            onClick={fetchPortfolio}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Total Portfolio Value */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-white mb-2">
            {portfolio.total_value_sol.toFixed(4)} SOL
          </p>

          {portfolio.total_invested_sol > 0 && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${totalPnLPositive ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnLPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {totalPnLPositive ? '+' : ''}{portfolio.total_profit_loss.toFixed(4)} SOL
                </span>
              </div>
              <span className={`text-sm font-semibold ${totalPnLPositive ? 'text-green-400' : 'text-red-400'}`}>
                ({totalPnLPositive ? '+' : ''}{portfolio.total_profit_loss_percent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Holdings List */}
      <div className="flex-1 p-4 space-y-3">
        {portfolio.holdings.map((holding) => {
          const pnlPositive = (holding.profit_loss || 0) >= 0

          return (
            <div
              key={holding.mint_address}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500/30 transition-all"
            >
              {/* Token Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg">{holding.token_name}</h3>
                  <p className="text-green-400 font-mono text-sm">${holding.token_symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{holding.balance.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">tokens</p>
                </div>
              </div>

              {/* Price & Value */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Current Price</p>
                  <p className="text-white font-mono text-sm">{holding.current_price.toFixed(6)} SOL</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Total Value</p>
                  <p className="text-white font-mono text-sm">{holding.value_sol.toFixed(4)} SOL</p>
                </div>
              </div>

              {/* P&L */}
              {holding.profit_loss !== undefined && (
                <div className={`rounded-lg p-3 mb-3 ${pnlPositive ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pnlPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-gray-400 text-xs">Profit/Loss</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${pnlPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {pnlPositive ? '+' : ''}{holding.profit_loss.toFixed(4)} SOL
                      </p>
                      <p className={`text-xs ${pnlPositive ? 'text-green-400' : 'text-red-400'}`}>
                        ({pnlPositive ? '+' : ''}{holding.profit_loss_percent?.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTradeClick(holding.mint_address)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded-lg transition-colors"
                >
                  Trade
                </button>
                <button
                  onClick={() => window.open(`https://solscan.io/token/${holding.mint_address}?cluster=devnet`, '_blank')}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Trading Modal */}
      {showTrading && selectedToken && (
        <TradingInterface
          mintAddress={selectedToken}
          onClose={() => {
            setShowTrading(false)
            setSelectedToken(null)
            fetchPortfolio() // Refresh portfolio after trading
          }}
        />
      )}
    </div>
  )
}
