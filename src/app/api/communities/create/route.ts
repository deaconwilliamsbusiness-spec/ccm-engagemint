import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await withRateLimit(request, {
    maxRequests: 5,
    windowMs: 60000,
  })

  if (rateLimitResult.error) {
    return rateLimitResult.error
  }

  // Require authentication
  const session = await requireAuth(request)
  if (session instanceof NextResponse) {
    return session // Return error response
  }

  try {
    const body = await request.json()
    const { name, description, logo, tokenId, minimumTokens = 0 } = body

    // Validation
    if (!name || !tokenId) {
      return NextResponse.json(
        { error: 'Name and tokenId are required' },
        { status: 400 }
      )
    }

    // Check if token exists and belongs to user
    const token = await prisma.token.findUnique({
      where: { id: tokenId },
      include: { community: true },
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      )
    }

    if (token.userId !== session.userId) {
      return NextResponse.json(
        { error: 'You can only create communities for your own tokens' },
        { status: 403 }
      )
    }

    if (token.community) {
      return NextResponse.json(
        { error: 'This token already has a community' },
        { status: 400 }
      )
    }

    // Create community
    const community = await prisma.community.create({
      data: {
        name,
        description,
        logo,
        tokenId,
        minimumTokens,
      },
      include: {
        token: {
          select: {
            symbol: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ community }, { status: 201 })
  } catch (error) {
    console.error('Failed to create community:', error)
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    )
  }
}
