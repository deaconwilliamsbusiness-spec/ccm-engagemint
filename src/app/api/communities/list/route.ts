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

    const communities = await prisma.community.findMany({
      take: limit,
      skip: offset,
      orderBy: { memberCount: 'desc' },
      include: {
        token: {
          select: {
            symbol: true,
            name: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json({
      communities,
      hasMore: communities.length === limit,
    })
  } catch (error) {
    console.error('Failed to fetch communities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    )
  }
}
