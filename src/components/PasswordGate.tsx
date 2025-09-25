'use client'

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

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
    const isAuth = localStorage.getItem('ccm_authenticated') === 'true'
    setIsAuthenticated(isAuth)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Set your password here
    const correctPassword = 'ccm2024'

    if (password === correctPassword) {
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">CCM ENGAGEMINT</h1>
          <p className="text-gray-400 text-sm">Private Access Required</p>
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
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition-colors"
          >
            Access Platform
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Authorized access only • CCM Development
          </p>
        </div>
      </div>
    </div>
  )
}