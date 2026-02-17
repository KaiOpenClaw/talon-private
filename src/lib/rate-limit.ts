/**
 * Rate limiting utility for API routes
 * Prevents abuse and ensures fair usage
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Run cleanup every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  /**
   * Check if a request should be allowed
   * @param key - Unique identifier (IP, user ID, etc.)
   * @param maxRequests - Maximum requests allowed in window
   * @param windowSeconds - Time window in seconds
   * @returns Object with allowed status and reset time
   */
  check(key: string, maxRequests: number, windowSeconds: number): {
    allowed: boolean
    remaining: number
    resetAt: number
  } {
    const now = Date.now()
    const entry = this.limits.get(key)

    // No entry or expired - allow and create new entry
    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowSeconds * 1000
      this.limits.set(key, { count: 1, resetAt })
      return { allowed: true, remaining: maxRequests - 1, resetAt }
    }

    // Entry exists and not expired
    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    // Increment count
    entry.count++
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key)
      }
    }
  }

  /**
   * Get stats about rate limits
   */
  stats(): { activeKeys: number } {
    return { activeKeys: this.limits.size }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Default rate limit configurations
export const RATE_LIMITS = {
  // API routes - general
  API_DEFAULT: { maxRequests: 60, windowSeconds: 60 },
  
  // Search - more expensive
  SEARCH: { maxRequests: 20, windowSeconds: 60 },
  
  // Send message - limited to prevent spam
  SEND_MESSAGE: { maxRequests: 10, windowSeconds: 60 },
  
  // Spawn agents - very limited
  SPAWN: { maxRequests: 5, windowSeconds: 300 },
  
  // Index operations - very expensive
  INDEX: { maxRequests: 2, windowSeconds: 600 },
} as const

/**
 * Get client identifier for rate limiting
 * Uses IP address or falls back to a default key
 */
export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback - all requests share same limit
  return 'default'
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(remaining: number, resetAt: number): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Remaining', String(remaining))
  headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString())
  return headers
}

/**
 * Rate limit middleware for API routes
 * Returns Response if rate limited, null if allowed
 */
export function checkRateLimit(
  request: Request,
  config: { maxRequests: number; windowSeconds: number } = RATE_LIMITS.API_DEFAULT
): Response | null {
  const clientKey = getClientKey(request)
  const result = rateLimiter.check(clientKey, config.maxRequests, config.windowSeconds)
  
  if (!result.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        ...Object.fromEntries(rateLimitHeaders(result.remaining, result.resetAt)),
      },
    })
  }
  
  return null
}
