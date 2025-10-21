'use client'

import { useState } from 'react'
import { X, User as UserIcon, Mail, Lock, Sparkles } from 'lucide-react'
import { useUser, type User } from '@/context/UserContext'

interface SmartAuthModalProps {
  isOpen: boolean
  onClose: () => void
  action?: string // e.g., "like", "comment", "share"
}

export function SmartAuthModal({ isOpen, onClose, action = "continue" }: SmartAuthModalProps) {
  const { setUser } = useUser()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { authAPI } = await import('@/lib/api')
      const response = await authAPI.login(loginEmail, loginPassword)

      if (response.success && response.data.user) {
        const userData: User = {
          id: response.data.user.id as string,
          username: response.data.user.username as string,
          email: response.data.user.email as string,
        }
        setUser(userData)
        onClose()
      }
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (signupUsername.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const { authAPI } = await import('@/lib/api')
      const response = await authAPI.signup(signupUsername, signupEmail, signupPassword)

      if (response.success && response.data.user) {
        const userData: User = {
          id: response.data.user.id as string,
          username: response.data.user.username as string,
          email: response.data.user.email as string,
        }
        setUser(userData)
        onClose()
      }
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getActionText = () => {
    switch (action) {
      case 'like': return 'like this video'
      case 'comment': return 'leave a comment'
      case 'share': return 'share this video'
      case 'upload': return 'upload your video'
      case 'trade': return 'trade tokens'
      case 'view analytics': return 'view analytics'
      case 'view community': return 'access community'
      default: return 'continue'
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-3xl p-8 w-full max-w-md border-2 border-green-500/30 shadow-2xl transform transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-500/10 relative">
            <div className="text-4xl">🎬</div>
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-green-400 animate-pulse" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Join EngageMint
          </h2>
          <p className="text-gray-400 text-sm">
            Sign up to {getActionText()} and unlock all features
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-gray-800/50 rounded-xl p-1.5 mb-6">
          <button
            onClick={() => {
              setActiveTab('signup')
              setError('')
            }}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => {
              setActiveTab('login')
              setError('')
            }}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Login
          </button>
        </div>

        {/* Forms */}
        {activeTab === 'signup' ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Username
              </label>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                placeholder="@yourname"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                placeholder="Min. 8 characters"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                `Create Account & ${getActionText()}`
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                `Login & ${getActionText()}`
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
