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
    const {
      name,
      symbol,
      videoId,
      supply = 1000000,
      decimals = 9,
      initialPrice = 0.01,
    } = body

    // Validation
    if (!name || !symbol || !videoId) {
      return NextResponse.json(
        { error: 'Name, symbol, and videoId are required' },
        { status: 400 }
      )
    }

    // Validate symbol format (uppercase, alphanumeric, 2-10 chars)
    if (!/^[A-Z0-9]{2,10}$/.test(symbol)) {
      return NextResponse.json(
        { error: 'Symbol must be 2-10 uppercase alphanumeric characters' },
        { status: 400 }
      )
    }

    // Check if video exists and belongs to user
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { token: true },
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    if (video.userId !== session.userId) {
      return NextResponse.json(
        { error: 'You can only create tokens for your own videos' },
        { status: 403 }
      )
    }

    if (video.token) {
      return NextResponse.json(
        { error: 'This video already has a token' },
        { status: 400 }
      )
    }

    // Check if symbol is already taken
    const existingToken = await prisma.token.findUnique({
      where: { symbol },
    })

    if (existingToken) {
      return NextResponse.json(
        { error: 'Token symbol already taken' },
        { status: 400 }
      )
    }

    // Create token (without blockchain integration for now)
    const token = await prisma.token.create({
      data: {
        name,
        symbol,
        videoId,
        userId: session.userId,
        supply: BigInt(supply),
        decimals,
        price: initialPrice,
        priceChange24h: 0,
        // mintAddress will be set when Solana integration is added
      },
      include: {
        video: {
          select: {
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    })

    return NextResponse.json({ token }, { status: 201 })
  } catch (error) {
    console.error('Failed to create token:', error)
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    )
  }
}
