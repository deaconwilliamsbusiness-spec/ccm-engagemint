import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/ratelimit'
import { verifyCSRFToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await withRateLimit(request, {
    maxRequests: 10,
    windowMs: 60000,
  })

  if (rateLimitResult.error) {
    return rateLimitResult.error
  }

  try {
    const { code, csrfToken } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    // Verify CSRF token
    if (csrfToken) {
      const isValidCSRF = await verifyCSRFToken(csrfToken)
      if (!isValidCSRF) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    }

    // Exchange code for access token (server-side with secret)
    const response = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!, // Server-side only
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI!,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.access_token) {
      console.error('TikTok token exchange failed:', data)
      return NextResponse.json(
        { error: data.error_description || 'Failed to exchange code for token' },
        { status: response.status }
      )
    }

    // Return access token as HTTP-only cookie
    const cookieResponse = NextResponse.json({
      success: true,
      message: 'TikTok authentication successful',
    })

    // Set HTTP-only cookie for TikTok token
    cookieResponse.cookies.set('tiktok_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expires_in || 3600, // Use token expiration from TikTok
      path: '/',
    })

    return cookieResponse
  } catch (error) {
    console.error('TikTok OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with TikTok' },
      { status: 500 }
    )
  }
}
