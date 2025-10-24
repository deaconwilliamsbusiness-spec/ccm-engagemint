import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { withRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await withRateLimit(request, {
    maxRequests: 10,
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
      title,
      description,
      videoUrl,
      thumbnailUrl,
      platform = 'native',
      externalId,
    } = body

    // Validation
    if (!title || !videoUrl || !thumbnailUrl) {
      return NextResponse.json(
        { error: 'Title, videoUrl, and thumbnailUrl are required' },
        { status: 400 }
      )
    }

    // Create video
    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        platform,
        externalId,
        userId: session.userId,
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error('Failed to create video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
