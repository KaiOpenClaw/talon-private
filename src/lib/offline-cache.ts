/**
 * Enhanced Offline Cache System
 * Provides intelligent caching for mobile and offline experiences
 */

import { logger, logApiError } from './logger'

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiry?: number
  version?: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  tags?: string[]
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  priority?: 'low' | 'normal' | 'high' | 'critical'
  tags?: string[]
  version?: string
  persistToStorage?: boolean
}

interface NetworkState {
  isOnline: boolean
  effectiveType?: string // '2g', '3g', '4g', etc.
  downlink?: number // Mbps
  rtt?: number // Round trip time in ms
}

/**
 * Enhanced cache with offline-first capabilities
 */
class OfflineCache {
  private memoryCache = new Map<string, CacheEntry>()
  private networkState: NetworkState = { isOnline: true }
  private syncQueue: Array<{ key: string; data: any; timestamp: number }> = []
  private storagePrefix = 'talon-offline-cache:'
  private maxMemorySize = 50 // Maximum entries in memory
  private maxStorageSize = 200 // Maximum entries in localStorage

  constructor() {
    this.initializeNetworkMonitoring()
    this.initializeFromStorage()
    this.setupSyncScheduler()
  }

  /**
   * Initialize network state monitoring
   */
  private initializeNetworkMonitoring() {
    if (typeof window === 'undefined') return

    // Monitor online/offline status
    const updateOnlineStatus = () => {
      this.networkState.isOnline = navigator.onLine
      
      if (this.networkState.isOnline) {
        this.processSyncQueue()
      }
      
      logger.info('Network status changed', { 
        isOnline: this.networkState.isOnline 
      })
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Monitor connection quality if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateConnectionInfo = () => {
        this.networkState.effectiveType = connection.effectiveType
        this.networkState.downlink = connection.downlink
        this.networkState.rtt = connection.rtt
      }

      connection.addEventListener('change', updateConnectionInfo)
      updateConnectionInfo()
    }

    updateOnlineStatus()
  }

  /**
   * Load cached data from localStorage on initialization
   */
  private initializeFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.storagePrefix)
      )

      for (const fullKey of keys) {
        const key = fullKey.replace(this.storagePrefix, '')
        const stored = localStorage.getItem(fullKey)
        
        if (stored) {
          try {
            const entry: CacheEntry = JSON.parse(stored)
            
            // Check if entry is expired
            if (!this.isExpired(entry)) {
              // Load critical and high priority items into memory
              if (entry.priority === 'critical' || entry.priority === 'high') {
                this.memoryCache.set(key, entry)
              }
            } else {
              // Clean up expired entries
              localStorage.removeItem(fullKey)
            }
          } catch (parseError) {
            logger.error('Failed to parse cached entry', { key, error: parseError })
            localStorage.removeItem(fullKey)
          }
        }
      }

      logger.info('Initialized offline cache from storage', {
        memoryEntries: this.memoryCache.size,
        storageEntries: keys.length
      })
    } catch (error) {
      logger.error('Failed to initialize from storage', { error })
    }
  }

  /**
   * Setup periodic sync for offline changes
   */
  private setupSyncScheduler() {
    if (typeof window === 'undefined') return

    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.networkState.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 30000)
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    if (!entry.expiry) return false
    return Date.now() > entry.expiry
  }

  /**
   * Get cache key with prefix
   */
  private getStorageKey(key: string): string {
    return `${this.storagePrefix}${key}`
  }

  /**
   * Evict least recently used items from memory cache
   */
  private evictMemoryCache() {
    if (this.memoryCache.size <= this.maxMemorySize) return

    // Sort by priority and timestamp (LRU for same priority)
    const entries = Array.from(this.memoryCache.entries())
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 }
    
    entries.sort(([, a], [, b]) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return a.timestamp - b.timestamp // Older first for same priority
    })

    // Remove lowest priority, oldest items
    const toRemove = entries.slice(0, entries.length - this.maxMemorySize)
    for (const [key] of toRemove) {
      this.memoryCache.delete(key)
    }

    logger.info('Evicted memory cache entries', { 
      removed: toRemove.length,
      remaining: this.memoryCache.size 
    })
  }

  /**
   * Store data in cache with options
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      priority = 'normal',
      tags = [],
      version,
      persistToStorage = false
    } = options

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: ttl > 0 ? Date.now() + ttl : undefined,
      priority,
      tags,
      version
    }

    // Always store in memory
    this.memoryCache.set(key, entry)
    this.evictMemoryCache()

    // Store in localStorage for persistence if requested or high priority
    if (persistToStorage || priority === 'critical' || priority === 'high') {
      try {
        const storageKey = this.getStorageKey(key)
        localStorage.setItem(storageKey, JSON.stringify(entry))

        // Clean up old storage entries if we're at the limit
        this.evictStorageCache()
      } catch (error) {
        logger.error('Failed to store in localStorage', { key, error })
      }
    }

    logger.info('Cache entry stored', { 
      key, 
      priority, 
      ttl, 
      persistToStorage,
      memorySize: this.memoryCache.size 
    })
  }

  /**
   * Evict old items from localStorage
   */
  private evictStorageCache() {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.storagePrefix))

      if (keys.length <= this.maxStorageSize) return

      // Get all entries with metadata
      const entries = keys.map(fullKey => {
        const key = fullKey.replace(this.storagePrefix, '')
        const stored = localStorage.getItem(fullKey)
        
        if (!stored) return null

        try {
          const entry: CacheEntry = JSON.parse(stored)
          return { key, fullKey, entry }
        } catch {
          return null
        }
      }).filter(Boolean) as Array<{ key: string; fullKey: string; entry: CacheEntry }>

      // Sort by priority and age
      entries.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 }
        const priorityDiff = priorityOrder[a.entry.priority] - priorityOrder[b.entry.priority]
        if (priorityDiff !== 0) return priorityDiff
        return a.entry.timestamp - b.entry.timestamp
      })

      // Remove oldest, lowest priority entries
      const toRemove = entries.slice(0, entries.length - this.maxStorageSize)
      for (const { fullKey } of toRemove) {
        localStorage.removeItem(fullKey)
      }

      logger.info('Evicted storage cache entries', { 
        removed: toRemove.length,
        remaining: entries.length - toRemove.length
      })
    } catch (error) {
      logger.error('Failed to evict storage cache', { error })
    }
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    let entry = this.memoryCache.get(key)

    // If not in memory, check localStorage
    if (!entry && typeof window !== 'undefined') {
      try {
        const storageKey = this.getStorageKey(key)
        const stored = localStorage.getItem(storageKey)
        
        if (stored) {
          entry = JSON.parse(stored) as CacheEntry<T>
          
          // Promote to memory cache if high priority
          if (entry.priority === 'critical' || entry.priority === 'high') {
            this.memoryCache.set(key, entry)
            this.evictMemoryCache()
          }
        }
      } catch (error) {
        logger.error('Failed to get from localStorage', { key, error })
      }
    }

    if (!entry) {
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      await this.delete(key)
      return null
    }

    // Update timestamp for LRU
    entry.timestamp = Date.now()
    this.memoryCache.set(key, entry)

    return entry.data as T
  }

  /**
   * Check if key exists in cache and is valid
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key)
    return data !== null
  }

  /**
   * Delete entry from cache
   */
  async delete(key: string): Promise<void> {
    // Remove from memory
    this.memoryCache.delete(key)

    // Remove from localStorage
    if (typeof window !== 'undefined') {
      const storageKey = this.getStorageKey(key)
      localStorage.removeItem(storageKey)
    }

    logger.info('Cache entry deleted', { key })
  }

  /**
   * Clear cache entries by tags
   */
  async clearByTags(tags: string[]): Promise<void> {
    const toDelete: string[] = []

    // Check memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        toDelete.push(key)
      }
    }

    // Check localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.storagePrefix))

      for (const fullKey of keys) {
        const key = fullKey.replace(this.storagePrefix, '')
        const stored = localStorage.getItem(fullKey)
        
        if (stored) {
          try {
            const entry: CacheEntry = JSON.parse(stored)
            if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
              toDelete.push(key)
            }
          } catch {
            // Invalid entry, will be cleaned up naturally
          }
        }
      }
    }

    // Delete all matching entries
    for (const key of toDelete) {
      await this.delete(key)
    }

    logger.info('Cleared cache by tags', { tags, deleted: toDelete.length })
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()

    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.storagePrefix))

      for (const key of keys) {
        localStorage.removeItem(key)
      }
    }

    logger.info('Cleared all cache entries')
  }

  /**
   * Get current network state
   */
  getNetworkState(): NetworkState {
    return { ...this.networkState }
  }

  /**
   * Check if we should use cache instead of network
   */
  shouldUseCache(): boolean {
    if (!this.networkState.isOnline) return true

    // Use cache on slow networks
    if (this.networkState.effectiveType === '2g') return true
    if (this.networkState.effectiveType === 'slow-2g') return true
    
    // Use cache if high latency
    if (this.networkState.rtt && this.networkState.rtt > 1000) return true

    return false
  }

  /**
   * Add item to sync queue for when online
   */
  addToSyncQueue(key: string, data: any): void {
    this.syncQueue.push({
      key,
      data,
      timestamp: Date.now()
    })

    logger.info('Added to sync queue', { key, queueSize: this.syncQueue.length })
  }

  /**
   * Process sync queue when online
   */
  private async processSyncQueue(): Promise<void> {
    if (!this.networkState.isOnline || this.syncQueue.length === 0) return

    logger.info('Processing sync queue', { queueSize: this.syncQueue.length })

    const itemsToSync = [...this.syncQueue]
    this.syncQueue = []

    for (const item of itemsToSync) {
      try {
        // Here you would implement actual sync logic
        // For now, we just log the sync attempt
        logger.info('Syncing item', { key: item.key, timestamp: item.timestamp })
        
        // In a real implementation, you'd make API calls here
        // and handle failures by re-adding to queue
      } catch (error) {
        logger.error('Failed to sync item', { key: item.key, error })
        
        // Re-add failed items to queue
        this.syncQueue.push(item)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryEntries = this.memoryCache.size
    let storageEntries = 0
    let totalStorageSize = 0

    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.storagePrefix))
      
      storageEntries = keys.length
      totalStorageSize = keys.reduce((size, key) => {
        return size + (localStorage.getItem(key)?.length || 0)
      }, 0)
    }

    return {
      memory: {
        entries: memoryEntries,
        maxEntries: this.maxMemorySize
      },
      storage: {
        entries: storageEntries,
        maxEntries: this.maxStorageSize,
        totalSize: totalStorageSize
      },
      network: this.networkState,
      syncQueue: this.syncQueue.length
    }
  }
}

// Create singleton instance
export const offlineCache = new OfflineCache()

/**
 * Hook for using offline cache in React components
 */
export function useOfflineCache() {
  return {
    cache: offlineCache,
    isOnline: offlineCache.getNetworkState().isOnline,
    shouldUseCache: offlineCache.shouldUseCache(),
    stats: offlineCache.getStats()
  }
}

export default offlineCache