import { NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/lib/auth'

export async function POST() {
  try {
    // Delete session cookie
    await deleteSessionCookie()

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Also clear OAuth tokens
    response.cookies.delete('tiktok_access_token')
    response.cookies.delete('instagram_access_token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
