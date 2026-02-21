/**
 * Multi-Gateway Support System
 * Manages connections to multiple OpenClaw Gateway instances
 */

import { logger } from './logger'

export interface GatewayConfig {
  id: string
  name: string
  url: string
  token: string
  type: 'production' | 'staging' | 'development' | 'local'
  enabled: boolean
  priority: number // Higher = preferred for load balancing
  healthCheckUrl?: string
  tags?: string[]
  description?: string
  lastHealthCheck?: Date
  status: 'online' | 'offline' | 'error' | 'unknown'
  responseTime?: number
  errorCount: number
  createdAt: Date
  updatedAt: Date
}

export interface GatewayHealthMetrics {
  gatewayId: string
  status: 'online' | 'offline' | 'error'
  responseTime: number
  lastCheck: Date
  errorCount: number
  uptime: number
  connectedClients: number
  activeAgents: number
  activeSessions: number
  cronJobs: number
  version?: string
}

export interface MultiGatewayState {
  gateways: GatewayConfig[]
  activeGateway: string | null
  healthMetrics: Map<string, GatewayHealthMetrics>
  connectionStates: Map<string, WebSocket | null>
  loadBalancingEnabled: boolean
  failoverEnabled: boolean
  lastHealthCheck: Date | null
}

class MultiGatewayManager {
  private static instance: MultiGatewayManager
  private state: MultiGatewayState
  private healthCheckInterval: NodeJS.Timeout | null = null
  private readonly HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
  private readonly CONNECTION_TIMEOUT = 10000 // 10 seconds
  private readonly MAX_ERROR_COUNT = 5

  constructor() {
    this.state = {
      gateways: [],
      activeGateway: null,
      healthMetrics: new Map(),
      connectionStates: new Map(),
      loadBalancingEnabled: true,
      failoverEnabled: true,
      lastHealthCheck: null
    }

    // Load saved gateway configurations
    this.loadGatewayConfigs()
    
    // Start health monitoring
    this.startHealthMonitoring()
  }

  static getInstance(): MultiGatewayManager {
    if (!MultiGatewayManager.instance) {
      MultiGatewayManager.instance = new MultiGatewayManager()
    }
    return MultiGatewayManager.instance
  }

  /**
   * Add a new gateway configuration
   */
  async addGateway(config: Omit<GatewayConfig, 'id' | 'status' | 'errorCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const gatewayId = `gateway-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newGateway: GatewayConfig = {
      ...config,
      id: gatewayId,
      status: 'unknown',
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.state.gateways.push(newGateway)
    
    // Set as active gateway if it's the first one
    if (!this.state.activeGateway) {
      this.state.activeGateway = gatewayId
    }

    // Initial health check
    await this.checkGatewayHealth(gatewayId)
    
    // Save configurations
    this.saveGatewayConfigs()
    
    logger.info('Gateway added to multi-gateway manager', {
      gatewayId,
      name: config.name,
      type: config.type,
      url: config.url.replace(/\/\/.*@/, '//[redacted]@'),
      component: 'MultiGatewayManager'
    })

    return gatewayId
  }

  /**
   * Remove a gateway configuration
   */
  removeGateway(gatewayId: string): boolean {
    const index = this.state.gateways.findIndex(g => g.id === gatewayId)
    
    if (index === -1) {
      return false
    }

    // Close any existing connection
    const connection = this.state.connectionStates.get(gatewayId)
    if (connection) {
      connection.close()
      this.state.connectionStates.delete(gatewayId)
    }

    // Remove from state
    this.state.gateways.splice(index, 1)
    this.state.healthMetrics.delete(gatewayId)
    
    // Update active gateway if needed
    if (this.state.activeGateway === gatewayId) {
      const nextGateway = this.state.gateways.find(g => g.enabled && g.status === 'online')
      this.state.activeGateway = nextGateway?.id || null
    }

    this.saveGatewayConfigs()
    
    logger.info('Gateway removed from multi-gateway manager', {
      gatewayId,
      component: 'MultiGatewayManager'
    })

    return true
  }

  /**
   * Update gateway configuration
   */
  updateGateway(gatewayId: string, updates: Partial<GatewayConfig>): boolean {
    const gateway = this.state.gateways.find(g => g.id === gatewayId)
    
    if (!gateway) {
      return false
    }

    Object.assign(gateway, updates, { updatedAt: new Date() })
    this.saveGatewayConfigs()

    logger.info('Gateway configuration updated', {
      gatewayId,
      updates: Object.keys(updates),
      component: 'MultiGatewayManager'
    })

    return true
  }

  /**
   * Get all gateway configurations
   */
  getGateways(): GatewayConfig[] {
    return [...this.state.gateways]
  }

  /**
   * Get gateway by ID
   */
  getGateway(gatewayId: string): GatewayConfig | null {
    return this.state.gateways.find(g => g.id === gatewayId) || null
  }

  /**
   * Get active gateway
   */
  getActiveGateway(): GatewayConfig | null {
    if (!this.state.activeGateway) return null
    return this.getGateway(this.state.activeGateway)
  }

  /**
   * Set active gateway
   */
  setActiveGateway(gatewayId: string): boolean {
    const gateway = this.getGateway(gatewayId)
    
    if (!gateway || !gateway.enabled) {
      return false
    }

    this.state.activeGateway = gatewayId
    
    logger.info('Active gateway changed', {
      gatewayId,
      gatewayName: gateway.name,
      gatewayType: gateway.type,
      component: 'MultiGatewayManager'
    })

    return true
  }

  /**
   * Get best available gateway for load balancing
   */
  getBestGateway(): GatewayConfig | null {
    const onlineGateways = this.state.gateways
      .filter(g => g.enabled && g.status === 'online')
      .sort((a, b) => {
        // Sort by priority (higher first), then by response time (lower first)
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        const aResponseTime = this.state.healthMetrics.get(a.id)?.responseTime || Infinity
        const bResponseTime = this.state.healthMetrics.get(b.id)?.responseTime || Infinity
        return aResponseTime - bResponseTime
      })

    return onlineGateways[0] || null
  }

  /**
   * Get health metrics for all gateways
   */
  getHealthMetrics(): Map<string, GatewayHealthMetrics> {
    return new Map(this.state.healthMetrics)
  }

  /**
   * Get overall system health across all gateways
   */
  getSystemHealth(): {
    overallStatus: 'healthy' | 'degraded' | 'critical'
    totalGateways: number
    onlineGateways: number
    offlineGateways: number
    errorGateways: number
    avgResponseTime: number
    totalAgents: number
    totalSessions: number
  } {
    const gateways = this.state.gateways
    const metrics = Array.from(this.state.healthMetrics.values())

    const onlineCount = gateways.filter(g => g.status === 'online').length
    const offlineCount = gateways.filter(g => g.status === 'offline').length
    const errorCount = gateways.filter(g => g.status === 'error').length

    const avgResponseTime = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length
      : 0

    const totalAgents = metrics.reduce((sum, m) => sum + m.activeAgents, 0)
    const totalSessions = metrics.reduce((sum, m) => sum + m.activeSessions, 0)

    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy'
    if (onlineCount === 0) {
      overallStatus = 'critical'
    } else if (errorCount > 0 || offlineCount > onlineCount) {
      overallStatus = 'degraded'
    }

    return {
      overallStatus,
      totalGateways: gateways.length,
      onlineGateways: onlineCount,
      offlineGateways: offlineCount,
      errorGateways: errorCount,
      avgResponseTime,
      totalAgents,
      totalSessions
    }
  }

  /**
   * Perform health check on a specific gateway
   */
  async checkGatewayHealth(gatewayId: string): Promise<GatewayHealthMetrics | null> {
    const gateway = this.getGateway(gatewayId)
    
    if (!gateway) {
      return null
    }

    const startTime = Date.now()
    let metrics: GatewayHealthMetrics

    try {
      // Use health check URL if available, otherwise use status endpoint
      const healthUrl = gateway.healthCheckUrl || `${gateway.url}/api/health`
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${gateway.token}`
        },
        timeout: this.CONNECTION_TIMEOUT
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        
        metrics = {
          gatewayId,
          status: 'online',
          responseTime,
          lastCheck: new Date(),
          errorCount: 0,
          uptime: data.uptime || 0,
          connectedClients: data.connectedClients || 0,
          activeAgents: data.activeAgents || 0,
          activeSessions: data.activeSessions || 0,
          cronJobs: data.cronJobs || 0,
          version: data.version
        }

        // Reset error count on successful check
        gateway.errorCount = 0
        gateway.status = 'online'
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      gateway.errorCount++
      gateway.status = gateway.errorCount >= this.MAX_ERROR_COUNT ? 'error' : 'offline'
      
      metrics = {
        gatewayId,
        status: gateway.status,
        responseTime,
        lastCheck: new Date(),
        errorCount: gateway.errorCount,
        uptime: 0,
        connectedClients: 0,
        activeAgents: 0,
        activeSessions: 0,
        cronJobs: 0
      }

      logger.warn('Gateway health check failed', {
        gatewayId,
        gatewayName: gateway.name,
        error: error instanceof Error ? error.message : String(error),
        errorCount: gateway.errorCount,
        status: gateway.status,
        component: 'MultiGatewayManager'
      })
    }

    // Update metrics and gateway status
    this.state.healthMetrics.set(gatewayId, metrics)
    gateway.lastHealthCheck = metrics.lastCheck
    gateway.responseTime = metrics.responseTime
    gateway.updatedAt = new Date()

    // Handle failover if active gateway goes down
    if (this.state.failoverEnabled && 
        this.state.activeGateway === gatewayId && 
        gateway.status !== 'online') {
      await this.handleFailover()
    }

    return metrics
  }

  /**
   * Handle automatic failover to best available gateway
   */
  private async handleFailover(): Promise<void> {
    const bestGateway = this.getBestGateway()
    
    if (bestGateway && bestGateway.id !== this.state.activeGateway) {
      const previousGateway = this.getActiveGateway()
      this.state.activeGateway = bestGateway.id

      logger.warn('Gateway failover triggered', {
        previousGateway: previousGateway?.name,
        previousGatewayId: previousGateway?.id,
        newGateway: bestGateway.name,
        newGatewayId: bestGateway.id,
        component: 'MultiGatewayManager'
      })

      // Trigger a dashboard refresh to update UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gateway-failover', {
          detail: {
            previousGateway: previousGateway?.id,
            newGateway: bestGateway.id
          }
        }))
      }
    }
  }

  /**
   * Start health monitoring for all gateways
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      this.state.lastHealthCheck = new Date()
      
      // Check all enabled gateways
      const enabledGateways = this.state.gateways.filter(g => g.enabled)
      
      await Promise.allSettled(
        enabledGateways.map(gateway => this.checkGatewayHealth(gateway.id))
      )
      
      logger.debug('Health check cycle completed', {
        gatewayCount: enabledGateways.length,
        onlineCount: enabledGateways.filter(g => g.status === 'online').length,
        component: 'MultiGatewayManager'
      })
    }, this.HEALTH_CHECK_INTERVAL)

    logger.info('Health monitoring started', {
      interval: this.HEALTH_CHECK_INTERVAL,
      component: 'MultiGatewayManager'
    })
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  /**
   * Load gateway configurations from storage
   */
  private loadGatewayConfigs(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('multi-gateway-configs')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.state.gateways = parsed.gateways || []
          this.state.activeGateway = parsed.activeGateway || null
          this.state.loadBalancingEnabled = parsed.loadBalancingEnabled ?? true
          this.state.failoverEnabled = parsed.failoverEnabled ?? true
        }
      }

      // Add default gateway from environment if no gateways configured
      if (this.state.gateways.length === 0) {
        const defaultUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.GATEWAY_URL
        const defaultToken = process.env.NEXT_PUBLIC_GATEWAY_TOKEN || process.env.GATEWAY_TOKEN

        if (defaultUrl && defaultToken) {
          const defaultGateway: GatewayConfig = {
            id: 'default-gateway',
            name: 'Default Gateway',
            url: defaultUrl,
            token: defaultToken,
            type: 'production',
            enabled: true,
            priority: 10,
            status: 'unknown',
            errorCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }

          this.state.gateways.push(defaultGateway)
          this.state.activeGateway = defaultGateway.id
        }
      }
    } catch (error) {
      logger.error('Failed to load gateway configurations', {
        error: error instanceof Error ? error.message : String(error),
        component: 'MultiGatewayManager'
      })
    }
  }

  /**
   * Save gateway configurations to storage
   */
  private saveGatewayConfigs(): void {
    try {
      if (typeof window !== 'undefined') {
        const toSave = {
          gateways: this.state.gateways,
          activeGateway: this.state.activeGateway,
          loadBalancingEnabled: this.state.loadBalancingEnabled,
          failoverEnabled: this.state.failoverEnabled
        }
        localStorage.setItem('multi-gateway-configs', JSON.stringify(toSave))
      }
    } catch (error) {
      logger.error('Failed to save gateway configurations', {
        error: error instanceof Error ? error.message : String(error),
        component: 'MultiGatewayManager'
      })
    }
  }

  /**
   * Enable or disable load balancing
   */
  setLoadBalancing(enabled: boolean): void {
    this.state.loadBalancingEnabled = enabled
    this.saveGatewayConfigs()
  }

  /**
   * Enable or disable failover
   */
  setFailover(enabled: boolean): void {
    this.state.failoverEnabled = enabled
    this.saveGatewayConfigs()
  }

  /**
   * Cleanup - close connections and stop monitoring
   */
  cleanup(): void {
    this.stopHealthMonitoring()
    
    // Close all WebSocket connections
    this.state.connectionStates.forEach(connection => {
      if (connection) {
        connection.close()
      }
    })
    this.state.connectionStates.clear()
  }
}

// Singleton instance
export const multiGatewayManager = MultiGatewayManager.getInstance()

export default multiGatewayManager