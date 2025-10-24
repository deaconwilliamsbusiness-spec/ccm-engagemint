'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function InstagramCallbackContent() {
  const [status, setStatus] = useState('Processing...')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const state = searchParams.get('state')

      if (error) {
        setStatus(`Error: ${error}`)
        return
      }

      if (!code) {
        setStatus('No authorization code received')
        return
      }

      try {
        setStatus('Exchanging code for access token...')

        // Exchange code for token via server-side API
        const response = await fetch('/api/auth/instagram/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            csrfToken: state, // Use state parameter for CSRF validation
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to authenticate')
        }

        setStatus('Success! Redirecting...')

        // Redirect back to the main app
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (error) {
        console.error('Instagram OAuth error:', error)
        setStatus('Failed to authenticate with Instagram')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Instagram Authentication</h1>
        <p className="text-gray-300">{status}</p>
      </div>
    </div>
  )
}

export default function InstagramCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Instagram Authentication</h1>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <InstagramCallbackContent />
    </Suspense>
  )
}