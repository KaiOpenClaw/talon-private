import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

interface PerformanceMetric {
  timestamp: number
  operation: string
  duration: number
  success: boolean
  error?: string
  agent?: string
  metadata?: Record<string, unknown>
}

interface SystemMetrics {
  timestamp: number
  activeConnections: number
  requestsPerMinute: number
  errorRate: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics
  private requestCounts: Map<number, number> = new Map() // timestamp -> count
  private connectionCount = 0

  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>) {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    }

    // Add to metrics array
    this.metrics.push(fullMetric)

    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log significant errors
    if (!fullMetric.success && fullMetric.error) {
      logger.warn('Performance metric recorded error', {
        operation: fullMetric.operation,
        duration: fullMetric.duration,
        error: fullMetric.error,
        agent: fullMetric.agent
      })
    }
  }

  incrementConnection() {
    this.connectionCount++
  }

  decrementConnection() {
    this.connectionCount = Math.max(0, this.connectionCount - 1)
  }

  recordRequest() {
    const minute = Math.floor(Date.now() / 60000) // Round to minute
    this.requestCounts.set(minute, (this.requestCounts.get(minute) || 0) + 1)

    // Clean old request counts (keep last 10 minutes)
    const cutoff = minute - 10
    for (const [key] of this.requestCounts) {
      if (key < cutoff) {
        this.requestCounts.delete(key)
      }
    }
  }

  getStats(timeRangeMs: number = 300000) { // Default 5 minutes
    const cutoff = Date.now() - timeRangeMs
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff)

    if (recentMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        successRate: 1,
        errorCount: 0,
        operationsPerMinute: 0
      }
    }

    const durations = recentMetrics.map(m => m.duration).sort((a, b) => a - b)
    const successes = recentMetrics.filter(m => m.success).length
    const errors = recentMetrics.filter(m => !m.success)

    return {
      totalOperations: recentMetrics.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: durations[Math.floor(durations.length * 0.95)] || 0,
      p99ResponseTime: durations[Math.floor(durations.length * 0.99)] || 0,
      successRate: successes / recentMetrics.length,
      errorCount: errors.length,
      operationsPerMinute: (recentMetrics.length / timeRangeMs) * 60000
    }
  }

  getRecentErrors(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => !m.success)
      .slice(-limit)
      .reverse()
  }

  getSlowestOperations(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  getMetrics(limit?: number): PerformanceMetric[] {
    return limit ? this.metrics.slice(-limit) : [...this.metrics]
  }

  getSystemMetrics(): SystemMetrics {
    const currentMinute = Math.floor(Date.now() / 60000)
    const requestsThisMinute = this.requestCounts.get(currentMinute) || 0
    
    // Calculate error rate from recent metrics (last 5 minutes)
    const recentStats = this.getStats(300000)
    
    return {
      timestamp: Date.now(),
      activeConnections: this.connectionCount,
      requestsPerMinute: requestsThisMinute,
      errorRate: 1 - recentStats.successRate
    }
  }

  getOperationBreakdown() {
    const operations = new Map<string, { count: number, totalDuration: number, errors: number }>()
    
    this.metrics.forEach(metric => {
      if (!operations.has(metric.operation)) {
        operations.set(metric.operation, { count: 0, totalDuration: 0, errors: 0 })
      }
      
      const op = operations.get(metric.operation)!
      op.count++
      op.totalDuration += metric.duration
      if (!metric.success) {
        op.errors++
      }
    })

    return Array.from(operations.entries()).map(([operation, stats]) => ({
      operation,
      count: stats.count,
      averageDuration: stats.totalDuration / stats.count,
      errorRate: stats.errors / stats.count,
      totalDuration: stats.totalDuration
    })).sort((a, b) => b.count - a.count)
  }

  clear() {
    this.metrics = []
    this.requestCounts.clear()
    this.connectionCount = 0
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor()

// Middleware function to wrap API routes
export function withPerformanceMonitoring<T extends unknown[], R>(
  operation: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    
    // Record the request
    performanceMonitor.recordRequest()
    performanceMonitor.incrementConnection()

    try {
      const result = await handler(...args)
      
      // Record successful operation
      performanceMonitor.recordMetric({
        operation,
        duration: Date.now() - startTime,
        success: true
      })

      return result
    } catch (error) {
      // Record failed operation
      performanceMonitor.recordMetric({
        operation,
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })

      throw error
    } finally {
      performanceMonitor.decrementConnection()
    }
  }
}

// Next.js middleware wrapper
export function createPerformanceMiddleware(operation: string) {
  return function performanceMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async (req: NextRequest): Promise<NextResponse> => {
      return withPerformanceMonitoring(operation, handler)(req)
    }
  }
}