import { NextRequest } from 'next/server'

// Simple in-memory rate limiter (upgrade to Redis for production multi-instance deployments)
interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
  // Get client identifier (IP address)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const key = `ratelimit:${ip}`
  const now = Date.now()

  let entry = store.get(key)

  // Create new entry or reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + options.windowMs,
    }
    store.set(key, entry)
  }

  // Increment count
  entry.count++

  const success = entry.count <= options.maxRequests
  const remaining = Math.max(0, options.maxRequests - entry.count)

  return {
    success,
    limit: options.maxRequests,
    remaining,
    reset: entry.resetAt,
  }
}

// Middleware wrapper for rate limiting
export async function withRateLimit(
  request: NextRequest,
  options?: RateLimitOptions
): Promise<{ error?: Response }> {
  const result = await rateLimit(request, options)

  if (!result.success) {
    return {
      error: new Response(
        JSON.stringify({
          error: 'Too many requests',
          limit: result.limit,
          reset: new Date(result.reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
          },
        }
      ),
    }
  }

  return {}
}
