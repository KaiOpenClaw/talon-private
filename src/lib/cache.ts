/**
 * Simple in-memory cache with TTL support
 * Used to reduce API calls and improve performance
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Run cleanup every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  /**
   * Set a value in cache with TTL (in seconds)
   */
  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all keys matching a prefix
   */
  clearPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Singleton instance
export const cache = new MemoryCache()

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SESSIONS: 10,      // Session list refreshes frequently
  AGENTS: 60,        // Agent list rarely changes
  CRON_JOBS: 30,     // Cron jobs change occasionally
  SKILLS: 120,       // Skills rarely change
  CHANNELS: 60,      // Channel status fairly stable
  SYSTEM_HEALTH: 15, // Health checks should be fresh
  SEARCH: 300,       // Search results can be cached longer
} as const

/**
 * Cache wrapper for async functions
 * Automatically caches results with TTL
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const data = await fetcher()
  cache.set(key, data, ttlSeconds)
  return data
}

/**
 * Stale-while-revalidate pattern
 * Returns cached data immediately, fetches fresh data in background
 */
export async function withSWR<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get<T>(key)
  
  // If we have cached data, return it and revalidate in background
  if (cached !== null) {
    // Fire and forget - update cache in background
    fetcher().then(data => {
      cache.set(key, data, ttlSeconds)
    }).catch(() => {
      // Ignore errors in background fetch
    })
    return cached
  }

  // No cache, must wait for fresh data
  const data = await fetcher()
  cache.set(key, data, ttlSeconds)
  return data
}
