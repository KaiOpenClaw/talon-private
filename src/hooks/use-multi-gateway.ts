'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  multiGatewayManager, 
  type GatewayConfig, 
  type GatewayHealthMetrics 
} from '@/lib/multi-gateway'
import { logger } from '@/lib/logger'

interface UseMultiGatewayState {
  gateways: GatewayConfig[]
  activeGateway: GatewayConfig | null
  healthMetrics: Map<string, GatewayHealthMetrics>
  systemHealth: {
    overallStatus: 'healthy' | 'degraded' | 'critical'
    totalGateways: number
    onlineGateways: number
    offlineGateways: number
    errorGateways: number
    avgResponseTime: number
    totalAgents: number
    totalSessions: number
  }
  isLoading: boolean
  error: string | null
}

interface UseMultiGatewayActions {
  addGateway: (config: Omit<GatewayConfig, 'id' | 'status' | 'errorCount' | 'createdAt' | 'updatedAt'>) => Promise<string | null>
  removeGateway: (gatewayId: string) => boolean
  updateGateway: (gatewayId: string, updates: Partial<GatewayConfig>) => boolean
  setActiveGateway: (gatewayId: string) => boolean
  refreshHealth: (gatewayId?: string) => Promise<void>
  refresh: () => void
}

export function useMultiGateway(): UseMultiGatewayState & UseMultiGatewayActions {
  const [state, setState] = useState<UseMultiGatewayState>({
    gateways: [],
    activeGateway: null,
    healthMetrics: new Map(),
    systemHealth: {
      overallStatus: 'healthy',
      totalGateways: 0,
      onlineGateways: 0,
      offlineGateways: 0,
      errorGateways: 0,
      avgResponseTime: 0,
      totalAgents: 0,
      totalSessions: 0
    },
    isLoading: true,
    error: null
  })

  // Refresh data from multi-gateway manager
  const refresh = useCallback(() => {
    try {
      const gateways = multiGatewayManager.getGateways()
      const activeGateway = multiGatewayManager.getActiveGateway()
      const healthMetrics = multiGatewayManager.getHealthMetrics()
      const systemHealth = multiGatewayManager.getSystemHealth()

      setState(prev => ({
        ...prev,
        gateways,
        activeGateway,
        healthMetrics,
        systemHealth,
        isLoading: false,
        error: null
      }))

      logger.debug('Multi-gateway state refreshed', {
        gatewayCount: gateways.length,
        activeGatewayId: activeGateway?.id,
        onlineCount: systemHealth.onlineGateways,
        component: 'useMultiGateway'
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error),
        isLoading: false
      }))

      logger.error('Failed to refresh multi-gateway state', {
        error: error instanceof Error ? error.message : String(error),
        component: 'useMultiGateway'
      })
    }
  }, [])

  // Add a new gateway
  const addGateway = useCallback(async (
    config: Omit<GatewayConfig, 'id' | 'status' | 'errorCount' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> => {
    try {
      const gatewayId = await multiGatewayManager.addGateway(config)
      refresh()
      
      logger.info('Gateway added via hook', {
        gatewayId,
        gatewayName: config.name,
        gatewayType: config.type,
        component: 'useMultiGateway'
      })

      return gatewayId
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }))

      logger.error('Failed to add gateway', {
        error: error instanceof Error ? error.message : String(error),
        gatewayName: config.name,
        component: 'useMultiGateway'
      })

      return null
    }
  }, [refresh])

  // Remove a gateway
  const removeGateway = useCallback((gatewayId: string): boolean => {
    try {
      const success = multiGatewayManager.removeGateway(gatewayId)
      
      if (success) {
        refresh()
        
        logger.info('Gateway removed via hook', {
          gatewayId,
          component: 'useMultiGateway'
        })
      }

      return success
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }))

      logger.error('Failed to remove gateway', {
        error: error instanceof Error ? error.message : String(error),
        gatewayId,
        component: 'useMultiGateway'
      })

      return false
    }
  }, [refresh])

  // Update a gateway
  const updateGateway = useCallback((gatewayId: string, updates: Partial<GatewayConfig>): boolean => {
    try {
      const success = multiGatewayManager.updateGateway(gatewayId, updates)
      
      if (success) {
        refresh()
        
        logger.info('Gateway updated via hook', {
          gatewayId,
          updateKeys: Object.keys(updates),
          component: 'useMultiGateway'
        })
      }

      return success
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }))

      logger.error('Failed to update gateway', {
        error: error instanceof Error ? error.message : String(error),
        gatewayId,
        component: 'useMultiGateway'
      })

      return false
    }
  }, [refresh])

  // Set active gateway
  const setActiveGateway = useCallback((gatewayId: string): boolean => {
    try {
      const success = multiGatewayManager.setActiveGateway(gatewayId)
      
      if (success) {
        refresh()
        
        logger.info('Active gateway changed via hook', {
          gatewayId,
          component: 'useMultiGateway'
        })
      }

      return success
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }))

      logger.error('Failed to set active gateway', {
        error: error instanceof Error ? error.message : String(error),
        gatewayId,
        component: 'useMultiGateway'
      })

      return false
    }
  }, [refresh])

  // Refresh health for specific gateway or all gateways
  const refreshHealth = useCallback(async (gatewayId?: string): Promise<void> => {
    try {
      if (gatewayId) {
        await multiGatewayManager.checkGatewayHealth(gatewayId)
      } else {
        // Refresh health for all enabled gateways
        const gateways = multiGatewayManager.getGateways().filter(g => g.enabled)
        await Promise.allSettled(
          gateways.map(g => multiGatewayManager.checkGatewayHealth(g.id))
        )
      }

      refresh()

      logger.debug('Gateway health refreshed via hook', {
        gatewayId: gatewayId || 'all',
        component: 'useMultiGateway'
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }))

      logger.error('Failed to refresh gateway health', {
        error: error instanceof Error ? error.message : String(error),
        gatewayId: gatewayId || 'all',
        component: 'useMultiGateway'
      })
    }
  }, [refresh])

  // Initial data load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Listen for gateway failover events
  useEffect(() => {
    const handleFailover = (event: CustomEvent) => {
      logger.info('Gateway failover detected', {
        previousGateway: event.detail.previousGateway,
        newGateway: event.detail.newGateway,
        component: 'useMultiGateway'
      })

      refresh()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('gateway-failover', handleFailover as EventListener)
      return () => {
        window.removeEventListener('gateway-failover', handleFailover as EventListener)
      }
    }
  }, [refresh])

  // Periodic health refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refresh()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refresh])

  return {
    ...state,
    addGateway,
    removeGateway,
    updateGateway,
    setActiveGateway,
    refreshHealth,
    refresh
  }
}

/**
 * Hook for getting the currently active gateway
 */
export function useActiveGateway(): {
  gateway: GatewayConfig | null
  isLoading: boolean
  isOnline: boolean
  metrics: GatewayHealthMetrics | null
} {
  const { activeGateway, healthMetrics, isLoading } = useMultiGateway()
  
  const metrics = activeGateway ? healthMetrics.get(activeGateway.id) || null : null
  const isOnline = activeGateway?.status === 'online'

  return {
    gateway: activeGateway,
    isLoading,
    isOnline,
    metrics
  }
}

/**
 * Hook for monitoring system health across all gateways
 */
export function useSystemHealth(): {
  health: UseMultiGatewayState['systemHealth']
  isHealthy: boolean
  isDegraded: boolean
  isCritical: boolean
  onlineGateways: GatewayConfig[]
  offlineGateways: GatewayConfig[]
} {
  const { systemHealth, gateways } = useMultiGateway()

  const onlineGateways = gateways.filter(g => g.status === 'online')
  const offlineGateways = gateways.filter(g => g.status !== 'online')

  return {
    health: systemHealth,
    isHealthy: systemHealth.overallStatus === 'healthy',
    isDegraded: systemHealth.overallStatus === 'degraded',
    isCritical: systemHealth.overallStatus === 'critical',
    onlineGateways,
    offlineGateways
  }
}

export default useMultiGateway