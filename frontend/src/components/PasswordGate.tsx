'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordGateProps {
  children: React.ReactNode
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Check if already authenticated on mount
  useEffect(() => {
    // Clear any old authentication since we changed password
    localStorage.removeItem('ccm_authenticated')
    const isAuth = localStorage.getItem('ccm_authenticated') === 'true'
    setIsAuthenticated(isAuth)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Multiple valid passwords for testing deployment
    const validPasswords = [
      'MintDev',           // New password
      'ccm2024',           // Fallback old password
      'EngageMint2024',    // Alternative password
      'TestPass123'        // Emergency password
    ]

    if (validPasswords.includes(password)) {
      setIsAuthenticated(true)
      localStorage.setItem('ccm_authenticated', 'true')
      setError('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-green-500/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/10">
            <div className="text-5xl">🚀</div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            EngageMint
          </h1>
          <p className="text-gray-400 text-sm mb-1">Social Media Reimagined</p>
          <p className="text-green-400 text-xs font-semibold">Beta Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Enter Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-12 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/20 transform hover:scale-[1.02]"
          >
            🎬 Enter Platform
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-500 text-xs">
            Beta Testing • Password: <span className="text-green-400 font-mono">ccm2024</span>
          </p>
          <p className="text-gray-600 text-[10px]">
            Create content, engage communities, build the future
          </p>
        </div>
      </div>
    </div>
  )
}