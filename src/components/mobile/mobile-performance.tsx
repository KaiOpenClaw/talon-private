/**
 * Mobile Performance Monitoring and Optimization
 * Battery usage, memory management, and mobile-specific performance tracking
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Battery, Cpu, Gauge, Smartphone, Zap, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobilePerformanceMetrics {
  batteryLevel?: number
  batteryCharging?: boolean
  batteryChargingTime?: number
  batteryDischargingTime?: number
  memoryUsage?: number
  connectionType?: string
  connectionSpeed?: string
  isLowPowerMode?: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
  effectiveType?: string
}

interface PerformanceEntry {
  name: string
  startTime: number
  duration: number
  type: string
}

/**
 * Hook for mobile performance monitoring
 */
export function useMobilePerformance() {
  const [metrics, setMetrics] = useState<MobilePerformanceMetrics>({})
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online')
  
  // Performance observer
  const performanceEntries = useRef<PerformanceEntry[]>([])
  
  useEffect(() => {
    const updateMetrics = async () => {
      const newMetrics: MobilePerformanceMetrics = {}

      // Battery API
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery()
          newMetrics.batteryLevel = battery.level * 100
          newMetrics.batteryCharging = battery.charging
          newMetrics.batteryChargingTime = battery.chargingTime
          newMetrics.batteryDischargingTime = battery.dischargingTime
          
          // Detect low power mode (battery < 20% and not charging)
          setIsLowPowerMode(!battery.charging && battery.level < 0.2)
        }
      } catch (error) {
        console.warn('Battery API not available:', error)
      }

      // Memory API
      if ('memory' in performance) {
        const memory = (performance as any).memory
        newMetrics.memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }

      // Hardware concurrency
      if ('hardwareConcurrency' in navigator) {
        newMetrics.hardwareConcurrency = navigator.hardwareConcurrency
      }

      // Device memory (Chrome)
      if ('deviceMemory' in navigator) {
        newMetrics.deviceMemory = (navigator as any).deviceMemory
      }

      // Network Information API
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        newMetrics.connectionType = connection.type
        newMetrics.connectionSpeed = connection.effectiveType
        newMetrics.effectiveType = connection.effectiveType
        
        // Determine network status
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setNetworkStatus('slow')
        } else {
          setNetworkStatus('online')
        }
      }

      setMetrics(newMetrics)
    }

    updateMetrics()

    // Listen for network changes
    const handleNetworkChange = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline')
      updateMetrics()
    }

    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 30000) // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleNetworkChange)
      window.removeEventListener('offline', handleNetworkChange)
      clearInterval(interval)
    }
  }, [])

  // Performance observer for paint timing
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          performanceEntries.current.push({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration || 0,
            type: entry.entryType
          })
        })
      })

      try {
        observer.observe({ entryTypes: ['paint', 'navigation', 'measure'] })
      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error)
      }

      return () => observer.disconnect()
    }
  }, [])

  const getPerformanceScore = useCallback(() => {
    let score = 100

    // Battery impact
    if (metrics.batteryLevel !== undefined) {
      if (metrics.batteryLevel < 20) score -= 20
      else if (metrics.batteryLevel < 50) score -= 10
    }

    // Memory impact
    if (metrics.memoryUsage !== undefined) {
      if (metrics.memoryUsage > 80) score -= 30
      else if (metrics.memoryUsage > 60) score -= 15
    }

    // Network impact
    if (networkStatus === 'slow') score -= 25
    else if (networkStatus === 'offline') score -= 50

    return Math.max(0, score)
  }, [metrics, networkStatus])

  return {
    metrics,
    isLowPowerMode,
    networkStatus,
    performanceScore: getPerformanceScore(),
    performanceEntries: performanceEntries.current
  }
}

interface MobilePerformanceIndicatorProps {
  className?: string
  variant?: 'compact' | 'detailed'
}

/**
 * Mobile performance indicator component
 */
export function MobilePerformanceIndicator({
  className,
  variant = 'compact'
}: MobilePerformanceIndicatorProps) {
  const { metrics, isLowPowerMode, networkStatus, performanceScore } = useMobilePerformance()

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getNetworkIcon = () => {
    switch (networkStatus) {
      case 'offline': return <WifiOff className="w-4 h-4 text-red-500" />
      case 'slow': return <Zap className="w-4 h-4 text-yellow-500" />
      default: return <Zap className="w-4 h-4 text-green-500" />
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Performance Score */}
        <div className="flex items-center gap-1">
          <Gauge className={cn("w-4 h-4", getScoreColor(performanceScore))} />
          <span className={cn("text-xs font-medium", getScoreColor(performanceScore))}>
            {performanceScore}
          </span>
        </div>

        {/* Battery */}
        {metrics.batteryLevel !== undefined && (
          <div className="flex items-center gap-1">
            <Battery className={cn(
              "w-4 h-4",
              isLowPowerMode ? "text-red-500" : 
              metrics.batteryLevel > 50 ? "text-green-500" : "text-yellow-500"
            )} />
            <span className="text-xs text-ink-secondary">
              {Math.round(metrics.batteryLevel)}%
            </span>
          </div>
        )}

        {/* Network */}
        {getNetworkIcon()}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Overall Score */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-secondary">Performance</span>
        <div className="flex items-center gap-2">
          <Gauge className={cn("w-4 h-4", getScoreColor(performanceScore))} />
          <span className={cn("font-semibold", getScoreColor(performanceScore))}>
            {performanceScore}/100
          </span>
        </div>
      </div>

      {/* Battery Status */}
      {metrics.batteryLevel !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-secondary">Battery</span>
          <div className="flex items-center gap-2">
            <Battery className={cn(
              "w-4 h-4",
              isLowPowerMode ? "text-red-500" : 
              metrics.batteryLevel > 50 ? "text-green-500" : "text-yellow-500"
            )} />
            <span className="text-sm font-medium">
              {Math.round(metrics.batteryLevel)}%
              {metrics.batteryCharging && ' ⚡'}
              {isLowPowerMode && ' 🔋'}
            </span>
          </div>
        </div>
      )}

      {/* Memory Usage */}
      {metrics.memoryUsage !== undefined && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-secondary">Memory</span>
          <div className="flex items-center gap-2">
            <Cpu className={cn(
              "w-4 h-4",
              metrics.memoryUsage > 80 ? "text-red-500" :
              metrics.memoryUsage > 60 ? "text-yellow-500" : "text-green-500"
            )} />
            <span className="text-sm font-medium">
              {Math.round(metrics.memoryUsage)}%
            </span>
          </div>
        </div>
      )}

      {/* Network */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-secondary">Network</span>
        <div className="flex items-center gap-2">
          {getNetworkIcon()}
          <span className="text-sm font-medium capitalize">
            {metrics.effectiveType || networkStatus}
          </span>
        </div>
      </div>

      {/* Device Info */}
      <div className="pt-2 border-t border-border-subtle text-xs text-ink-tertiary">
        <div className="flex items-center justify-between">
          <span>Device</span>
          <div className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            {metrics.deviceMemory && <span>{metrics.deviceMemory}GB RAM</span>}
            {metrics.hardwareConcurrency && (
              <span className="ml-2">{metrics.hardwareConcurrency} cores</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile performance optimization recommendations
 */
export function MobilePerformanceRecommendations() {
  const { metrics, isLowPowerMode, networkStatus, performanceScore } = useMobilePerformance()
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    const newRecommendations: string[] = []

    if (isLowPowerMode) {
      newRecommendations.push('Enable battery saver mode - reduced animations and background sync')
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 80) {
      newRecommendations.push('Clear browser cache to free up memory')
    }

    if (networkStatus === 'slow') {
      newRecommendations.push('Using data saver mode - images and updates reduced')
    }

    if (networkStatus === 'offline') {
      newRecommendations.push('Offline mode active - using cached data')
    }

    if (performanceScore < 60) {
      newRecommendations.push('Consider closing other browser tabs for better performance')
    }

    setRecommendations(newRecommendations)
  }, [metrics, isLowPowerMode, networkStatus, performanceScore])

  if (recommendations.length === 0) return null

  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="text-sm font-medium text-yellow-800 mb-2">
        Performance Recommendations
      </h4>
      <ul className="text-xs text-yellow-700 space-y-1">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-yellow-500">•</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Auto-optimization based on performance metrics
 */
export function useMobileOptimizations() {
  const { isLowPowerMode, networkStatus, metrics } = useMobilePerformance()
  const [optimizations, setOptimizations] = useState({
    reduceAnimations: false,
    enableDataSaver: false,
    reduceImageQuality: false,
    disableBackgroundSync: false
  })

  useEffect(() => {
    setOptimizations({
      reduceAnimations: isLowPowerMode || (metrics.memoryUsage || 0) > 80,
      enableDataSaver: networkStatus === 'slow',
      reduceImageQuality: networkStatus === 'slow' || isLowPowerMode,
      disableBackgroundSync: isLowPowerMode
    })
  }, [isLowPowerMode, networkStatus, metrics.memoryUsage])

  return optimizations
}

export {
  type MobilePerformanceMetrics,
  type PerformanceEntry
}