'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useUser } from '@/context/UserContext'

interface AuthPageProps {
  children: React.ReactNode
}

export function AuthPage({ children }: AuthPageProps) {
  const { user, setUser } = useUser()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  // Real authentication handlers
  const handleLogin = async (email: string, password: string) => {
    // Already handled in LoginForm - just set authenticated
    setIsAuthenticated(true)
  }

  const handleSignup = async (username: string, email: string, password: string) => {
    // Already handled in SignUpForm - just set authenticated
    setIsAuthenticated(true)
  }

  if (isAuthenticated || user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-gray-900 to-black"></div>

      {/* Auth Container */}
      <div className="relative bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={async () => {
              // Auto-signup with demo account
              try {
                const { authAPI } = await import('@/lib/api')
                const demoUsername = `demo_${Date.now()}`
                const demoEmail = `${demoUsername}@demo.com`
                const demoPassword = 'demo_password_123'

                const response = await authAPI.signup(demoUsername, demoEmail, demoPassword)

                if (response.success && response.data.user) {
                  setUser({
                    id: response.data.user.id,
                    username: response.data.user.username,
                    email: response.data.user.email
                  })
                }

                setIsAuthenticated(true)
              } catch (error) {
                console.error('Auto-signup failed:', error)
                // Fallback: try to login if account already exists
                alert('Please sign up or login to continue')
              }
            }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-green-500/30 transition-all hover:scale-110 cursor-pointer"
            title="Click to skip login (Demo)"
          >
            <Lock className="w-10 h-10 text-green-500" />
          </button>
          <h1 className="text-white text-3xl font-bold mb-2">CCM ENGAGEMINT</h1>
          <p className="text-gray-400 text-sm">Create content. Mint tokens. Build community.</p>
          <p className="text-green-400 text-xs mt-2">💡 Click the lock to skip login</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-gray-800 rounded-xl p-1.5 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'login'
                ? 'bg-green-500 text-black shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'signup'
                ? 'bg-green-500 text-black shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {activeTab === 'login' ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <SignUpForm onSignup={handleSignup} />
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Beta Access • CCM Development
          </p>
        </div>
      </div>
    </div>
  )
}

// Login Form Component
function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { authAPI } = await import('@/lib/api')
      const { useUser } = await import('@/context/UserContext')

      const response = await authAPI.login(email, password)

      if (response.success) {
        // Set user in context
        if (response.data.user) {
          const { setUser } = useUser()
          setUser({
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email
          })
        }
        onLogin(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
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
        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Logging in...' : 'Login to Platform'}
      </button>

      <p className="text-gray-400 text-xs text-center mt-4">
        Don't have an account? Click Sign Up above.
      </p>
    </form>
  )
}

// Sign Up Form Component
function SignUpForm({ onSignup }: { onSignup: (username: string, email: string, password: string) => Promise<void> }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const { authAPI } = await import('@/lib/api')
      const { useUser } = await import('@/context/UserContext')

      const response = await authAPI.signup(username, email, password)

      if (response.success) {
        // Set user in context
        if (response.data.user) {
          const { setUser } = useUser()
          setUser({
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email
          })
        }
        onSignup(username, email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
          placeholder="@cryptoking"
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
          placeholder="••••••••"
          required
        />
        <p className="text-gray-500 text-xs mt-1">Min. 8 characters</p>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
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
        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className="text-gray-400 text-xs text-center mt-4">
        Already have an account? Click Login above.
      </p>
    </form>
  )
}
