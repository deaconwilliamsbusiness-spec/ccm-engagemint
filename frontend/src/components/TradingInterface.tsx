'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  ExternalLink,
  Info,
  BarChart3
} from 'lucide-react'
import { buyTokens, sellTokens, getTokenPrice, getMarketCap, getSolBalance, getTokenBalance } from '@/lib/solana'
import { PublicKey } from '@solana/web3.js'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TradingInterfaceProps {
  mintAddress: string
  tokenName: string
  tokenSymbol: string
  bondingCurveAddress: string
  onClose?: () => void
}

interface TradeHistory {
  type: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: number
  signature: string
}

interface CurveState {
  realSolReserves: number
  realTokenReserves: number
  targetSolAmount: number
  progressPercent: number
  isGraduated: boolean
  tradeCount: number
}

export function TradingInterface({
  mintAddress,
  tokenName,
  tokenSymbol,
  bondingCurveAddress,
  onClose
}: TradingInterfaceProps) {
  const wallet = useWallet()

  // State
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [solAmount, setSolAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [slippage, setSlippage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Market data
  const [price, setPrice] = useState(0)
  const [marketCap, setMarketCap] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [priceChange24h, setPriceChange24h] = useState(0)
  const [curveState, setCurveState] = useState<CurveState | null>(null)

  // User balances
  const [solBalance, setSolBalance] = useState(0)
  const [tokenBalance, setTokenBalance] = useState(0)

  // Trade history
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])

  // Chart data
  const [priceHistory, setPriceHistory] = useState<Array<{ time: string; price: number }>>([])
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H')
  const [loadingChart, setLoadingChart] = useState(false)

  // Load market data
  const loadMarketData = useCallback(async () => {
    try {
      const currentPrice = await getTokenPrice(new PublicKey(mintAddress))
      const currentMarketCap = await getMarketCap(mintAddress)

      setPrice(currentPrice)
      setMarketCap(currentMarketCap)

      // TODO: Fetch from API
      setVolume24h(1234.56)
      setPriceChange24h(15.3)

      // Fetch curve state
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tokens/${mintAddress}/curve-state`
      )
      if (response.ok) {
        const data = await response.json()
        setCurveState(data.curveState)
      }
    } catch (err) {
      console.error('Failed to load market data:', err)
    }
  }, [mintAddress])

  // Load user balances
  const loadBalances = useCallback(async () => {
    if (!wallet.publicKey) return

    try {
      const sol = await getSolBalance(wallet.publicKey)
      const tokens = await getTokenBalance(wallet.publicKey, new PublicKey(mintAddress))

      setSolBalance(sol)
      setTokenBalance(tokens)
    } catch (err) {
      console.error('Failed to load balances:', err)
    }
  }, [wallet.publicKey, mintAddress])

  // Fetch price history for chart
  const fetchPriceHistory = useCallback(async () => {
    setLoadingChart(true)
    try {
      const response = await fetch(`${API_URL}/tokens/${mintAddress}/price-history?timeframe=${timeframe}`)
      const data = await response.json()

      if (data.success && data.data) {
        setPriceHistory(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch price history:', err)
    } finally {
      setLoadingChart(false)
    }
  }, [mintAddress, timeframe])

  // Initial load and refresh interval
  useEffect(() => {
    loadMarketData()
    loadBalances()
    fetchPriceHistory()

    const interval = setInterval(() => {
      loadMarketData()
      loadBalances()
      fetchPriceHistory()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [loadMarketData, loadBalances, fetchPriceHistory])

  // Fetch price history when timeframe changes
  useEffect(() => {
    fetchPriceHistory()
  }, [timeframe, fetchPriceHistory])

  // Calculate expected output
  const calculateOutput = useCallback(() => {
    if (activeTab === 'buy' && solAmount) {
      // Simple calculation - in production, query actual bonding curve
      const sol = parseFloat(solAmount)
      const expectedTokens = (sol / price) * (1 - slippage / 100)
      setTokenAmount(expectedTokens.toFixed(2))
    } else if (activeTab === 'sell' && tokenAmount) {
      const tokens = parseFloat(tokenAmount)
      const expectedSol = (tokens * price) * (1 - slippage / 100)
      setSolAmount(expectedSol.toFixed(4))
    }
  }, [activeTab, solAmount, tokenAmount, price, slippage])

  useEffect(() => {
    calculateOutput()
  }, [calculateOutput])

  // Handle buy
  const handleBuy = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet')
      return
    }

    if (!solAmount || parseFloat(solAmount) <= 0) {
      setError('Enter a valid SOL amount')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await buyTokens({
        wallet,
        tokenMint: new PublicKey(mintAddress),
        solAmount: parseFloat(solAmount),
        slippage,
      })

      // Add to trade history
      setTradeHistory([
        {
          type: 'buy',
          amount: parseFloat(solAmount),
          price,
          timestamp: Date.now(),
          signature: result,
        },
        ...tradeHistory,
      ])

      // Reset form
      setSolAmount('')
      setTokenAmount('')

      // Reload data
      await loadMarketData()
      await loadBalances()

      alert(`✅ Buy successful! ${tokenAmount} ${tokenSymbol} purchased`)
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle sell
  const handleSell = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet')
      return
    }

    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      setError('Enter a valid token amount')
      return
    }

    if (parseFloat(tokenAmount) > tokenBalance) {
      setError(`Insufficient balance. You have ${tokenBalance.toFixed(2)} ${tokenSymbol}`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await sellTokens({
        wallet,
        tokenMint: new PublicKey(mintAddress),
        tokenAmount: parseFloat(tokenAmount),
        slippage,
      })

      // Add to trade history
      setTradeHistory([
        {
          type: 'sell',
          amount: parseFloat(tokenAmount),
          price,
          timestamp: Date.now(),
          signature: result,
        },
        ...tradeHistory,
      ])

      // Reset form
      setSolAmount('')
      setTokenAmount('')

      // Reload data
      await loadMarketData()
      await loadBalances()

      alert(`✅ Sell successful! Received ${solAmount} SOL`)
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const isPositiveChange = priceChange24h >= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{tokenName}</h1>
            <div className="flex items-center gap-3 text-gray-400">
              <span className="text-lg">${tokenSymbol}</span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                {mintAddress.substring(0, 4)}...{mintAddress.substring(mintAddress.length - 4)}
              </span>
              <button
                onClick={() => window.open(`https://solscan.io/token/${mintAddress}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK}`, '_blank')}
                className="hover:text-green-400"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <WalletMultiButton />
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price
            </div>
            <div className="text-2xl font-bold">${price.toFixed(8)}</div>
            <div className={`text-sm mt-2 flex items-center gap-1 ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
              {isPositiveChange ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(priceChange24h).toFixed(2)}% (24h)
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Market Cap
            </div>
            <div className="text-2xl font-bold">${marketCap.toFixed(2)}</div>
            <div className="text-sm mt-2 text-gray-400">
              {curveState?.isGraduated ? '✅ Graduated' : '🔥 Bonding Curve'}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              24h Volume
            </div>
            <div className="text-2xl font-bold">${volume24h.toFixed(2)}</div>
            <div className="text-sm mt-2 text-gray-400">
              {curveState?.tradeCount || 0} trades
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Holders
            </div>
            <div className="text-2xl font-bold">-</div>
            <div className="text-sm mt-2 text-gray-400">Coming soon</div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h3 className="text-xl font-bold">Price Chart</h3>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-2">
              {(['1H', '24H', '7D', '30D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    timeframe === tf
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Simple SVG Line Chart */}
          <div className="relative h-64 bg-gray-900 rounded-lg p-4">
            {loadingChart ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading chart...</div>
              </div>
            ) : priceHistory.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Simple line chart using polyline */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  points={priceHistory
                    .map((point, i) => {
                      const x = (i / (priceHistory.length - 1)) * 800
                      const minPrice = Math.min(...priceHistory.map((p) => p.price))
                      const maxPrice = Math.max(...priceHistory.map((p) => p.price))
                      const priceRange = maxPrice - minPrice || 1
                      const y = 200 - ((point.price - minPrice) / priceRange) * 180
                      return `${x},${y}`
                    })
                    .join(' ')}
                />
                {/* Gradient fill under line */}
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#chartGradient)"
                  points={`0,200 ${priceHistory
                    .map((point, i) => {
                      const x = (i / (priceHistory.length - 1)) * 800
                      const minPrice = Math.min(...priceHistory.map((p) => p.price))
                      const maxPrice = Math.max(...priceHistory.map((p) => p.price))
                      const priceRange = maxPrice - minPrice || 1
                      const y = 200 - ((point.price - minPrice) / priceRange) * 180
                      return `${x},${y}`
                    })
                    .join(' ')} 800,200`}
                />
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No price data available yet
              </div>
            )}
          </div>

          {/* Chart Info */}
          {priceHistory.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <div>
                Low: ${Math.min(...priceHistory.map((p) => p.price)).toFixed(8)}
              </div>
              <div>
                High: ${Math.max(...priceHistory.map((p) => p.price)).toFixed(8)}
              </div>
              <div>
                {priceHistory.length} data points
              </div>
            </div>
          )}
        </div>

        {/* Raydium Progress (if not graduated) */}
        {curveState && !curveState.isGraduated && (
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 mb-8 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">🚀 Progress to Raydium</h3>
                <p className="text-sm text-gray-400">
                  {curveState.realSolReserves.toFixed(2)} / {curveState.targetSolAmount.toFixed(2)} SOL raised
                </p>
              </div>
              <div className="text-3xl font-bold text-green-400">
                {curveState.progressPercent.toFixed(1)}%
              </div>
            </div>

            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(curveState.progressPercent, 100)}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 mt-3">
              ℹ️ When 85 SOL is raised, liquidity will automatically migrate to Raydium with burned LP tokens
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Panel */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              {/* Trade Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'buy'
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowUpRight className="w-5 h-5" />
                    Buy
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('sell')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'sell'
                      ? 'bg-red-500 text-black'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ArrowDownRight className="w-5 h-5" />
                    Sell
                  </div>
                </button>
              </div>

              {/* Trade Form */}
              <div className="space-y-4">
                {activeTab === 'buy' ? (
                  <>
                    {/* SOL Input */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        You Pay
                      </label>
                      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="number"
                            value={solAmount}
                            onChange={(e) => setSolAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-transparent text-2xl font-bold outline-none w-full"
                            step="0.01"
                            min="0"
                          />
                          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                            <img src="/solana-logo.png" alt="SOL" className="w-5 h-5" />
                            <span className="font-bold">SOL</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          Balance: {solBalance.toFixed(4)} SOL
                        </div>
                      </div>
                    </div>

                    {/* Token Output */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        You Receive (estimated)
                      </label>
                      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="text"
                            value={tokenAmount}
                            readOnly
                            placeholder="0.00"
                            className="bg-transparent text-2xl font-bold outline-none w-full text-gray-400"
                          />
                          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                            <span className="font-bold">{tokenSymbol}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Token Input */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        You Sell
                      </label>
                      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="number"
                            value={tokenAmount}
                            onChange={(e) => setTokenAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-transparent text-2xl font-bold outline-none w-full"
                            step="0.01"
                            min="0"
                          />
                          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                            <span className="font-bold">{tokenSymbol}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          Balance: {tokenBalance.toFixed(2)} {tokenSymbol}
                        </div>
                      </div>
                    </div>

                    {/* SOL Output */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        You Receive (estimated)
                      </label>
                      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="text"
                            value={solAmount}
                            readOnly
                            placeholder="0.00"
                            className="bg-transparent text-2xl font-bold outline-none w-full text-gray-400"
                          />
                          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                            <img src="/solana-logo.png" alt="SOL" className="w-5 h-5" />
                            <span className="font-bold">SOL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Slippage */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Slippage Tolerance
                  </label>
                  <div className="flex gap-2">
                    {[0.5, 1, 2, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          slippage === value
                            ? 'bg-green-500 text-black'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Trade Button */}
                <button
                  onClick={activeTab === 'buy' ? handleBuy : handleSell}
                  disabled={loading || !wallet.connected}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    activeTab === 'buy'
                      ? 'bg-green-500 hover:bg-green-600 text-black'
                      : 'bg-red-500 hover:bg-red-600 text-black'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading
                    ? 'Processing...'
                    : !wallet.connected
                    ? 'Connect Wallet'
                    : activeTab === 'buy'
                    ? 'Buy ' + tokenSymbol
                    : 'Sell ' + tokenSymbol}
                </button>
              </div>
            </div>
          </div>

          {/* Trade History */}
          <div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Trades
              </h3>

              {tradeHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No trades yet</p>
              ) : (
                <div className="space-y-3">
                  {tradeHistory.slice(0, 10).map((trade, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-bold ${
                            trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {trade.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-400">
                          {trade.amount.toFixed(4)}{' '}
                          {trade.type === 'buy' ? 'SOL' : tokenSymbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          @ ${trade.price.toFixed(8)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
