import { NextResponse } from 'next/server'
import { cache } from '@/lib/cache'
import { rateLimiter } from '@/lib/rate-limit'

/**
 * Get system performance stats
 * Includes cache and rate limiting metrics
 */
export async function GET() {
  const cacheStats = cache.stats()
  const rateLimitStats = rateLimiter.stats()
  
  return NextResponse.json({
    cache: {
      entries: cacheStats.size,
      keys: cacheStats.keys,
    },
    rateLimit: {
      activeKeys: rateLimitStats.activeKeys,
    },
    timestamp: new Date().toISOString(),
  })
}

/**
 * Clear cache or reset rate limits
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, prefix } = body
    
    if (action === 'clear-cache') {
      if (prefix) {
        cache.clearPrefix(prefix)
        return NextResponse.json({ ok: true, cleared: `prefix:${prefix}` })
      }
      cache.clear()
      return NextResponse.json({ ok: true, cleared: 'all' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
