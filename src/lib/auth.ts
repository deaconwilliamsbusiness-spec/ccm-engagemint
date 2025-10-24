import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Constants
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars'
)
const SESSION_COOKIE_NAME = 'session'
const CSRF_COOKIE_NAME = 'csrf_token'

// Session payload type
export interface SessionPayload {
  userId: string
  username: string
  expiresAt: number
}

// Create a JWT session token
export async function createSessionToken(payload: Omit<SessionPayload, 'expiresAt'>): Promise<string> {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  const token = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

// Verify and decode a JWT session token
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Check expiration
    if (payload.expiresAt && typeof payload.expiresAt === 'number') {
      if (Date.now() > payload.expiresAt) {
        return null
      }
    }

    return payload as SessionPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Set session cookie (HTTP-only, Secure, SameSite)
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  })
}

// Get session from cookie
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifySessionToken(token)
}

// Delete session cookie
export async function deleteSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(CSRF_COOKIE_NAME)
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

// Set CSRF cookie
export async function setCSRFCookie(token: string) {
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  })
}

// Get CSRF token from cookie
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

// Verify CSRF token
export async function verifyCSRFToken(token: string): Promise<boolean> {
  const storedToken = await getCSRFToken()
  return storedToken === token
}

// Middleware helper to require authentication
export async function requireAuth(request: NextRequest): Promise<SessionPayload | NextResponse> {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    )
  }

  return session
}

// Optional authentication (returns null if not authenticated, doesn't block)
export async function optionalAuth(): Promise<SessionPayload | null> {
  return getSession()
}
