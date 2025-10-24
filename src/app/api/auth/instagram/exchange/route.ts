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
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!, // Server-side only
        grant_type: 'authorization_code',
        redirect_uri: process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!,
        code,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.access_token) {
      console.error('Instagram token exchange failed:', data)
      return NextResponse.json(
        { error: data.error_message || 'Failed to exchange code for token' },
        { status: response.status }
      )
    }

    // Return access token as HTTP-only cookie
    const cookieResponse = NextResponse.json({
      success: true,
      message: 'Instagram authentication successful',
    })

    // Set HTTP-only cookie for Instagram token
    cookieResponse.cookies.set('instagram_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour (Instagram short-lived tokens)
      path: '/',
    })

    return cookieResponse
  } catch (error) {
    console.error('Instagram OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with Instagram' },
      { status: 500 }
    )
  }
}
