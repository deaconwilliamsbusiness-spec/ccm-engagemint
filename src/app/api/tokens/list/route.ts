import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withRateLimit } from '@/lib/ratelimit'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await withRateLimit(request, {
    maxRequests: 30,
    windowMs: 60000,
  })

  if (rateLimitResult.error) {
    return rateLimitResult.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    const tokens = await prisma.token.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        video: {
          select: {
            title: true,
            thumbnailUrl: true,
            views: true,
            likes: true,
          },
        },
        community: {
          select: {
            name: true,
            memberCount: true,
          },
        },
      },
    })

    return NextResponse.json({
      tokens,
      hasMore: tokens.length === limit,
    })
  } catch (error) {
    console.error('Failed to fetch tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}
