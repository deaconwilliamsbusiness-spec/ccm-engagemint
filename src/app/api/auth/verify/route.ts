import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSessionToken, setSessionCookie } from '@/lib/auth'
import { withRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  // Rate limiting: max 5 attempts per minute
  const rateLimitResult = await withRateLimit(request, {
    maxRequests: 5,
    windowMs: 60000,
  })

  if (rateLimitResult.error) {
    return rateLimitResult.error
  }

  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Get password hash from environment
    const passwordHash = process.env.APP_PASSWORD_HASH

    if (!passwordHash) {
      console.error('APP_PASSWORD_HASH not configured')
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 500 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create session token
    const sessionToken = await createSessionToken({
      userId: 'admin', // For simple password gate, we use a single admin user
      username: 'admin',
    })

    // Set HTTP-only cookie
    await setSessionCookie(sessionToken)

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
    })
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
