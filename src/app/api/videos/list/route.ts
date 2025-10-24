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
    const platform = searchParams.get('platform') // Optional filter

    const where = platform ? { platform } : {}

    const videos = await prisma.video.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        token: {
          select: {
            symbol: true,
            name: true,
            price: true,
            priceChange24h: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    })

    return NextResponse.json({
      videos,
      hasMore: videos.length === limit,
    })
  } catch (error) {
    console.error('Failed to fetch videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
