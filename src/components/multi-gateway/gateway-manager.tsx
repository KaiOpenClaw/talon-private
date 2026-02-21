'use client'

import { useState, useEffect } from 'react'
import {
  Server,
  Plus,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Users,
  Clock,
  Activity,
  Globe,
  Shield,
  Database,
  BarChart3
} from 'lucide-react'
import { multiGatewayManager, type GatewayConfig, type GatewayHealthMetrics } from '@/lib/multi-gateway'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface GatewayManagerProps {
  className?: string
  variant?: 'compact' | 'detailed' | 'minimal'
}

export function GatewayManager({ className, variant = 'detailed' }: GatewayManagerProps) {
  const { triggerHaptic } = useHapticFeedback()
  const [gateways, setGateways] = useState<GatewayConfig[]>([])
  const [healthMetrics, setHealthMetrics] = useState<Map<string, GatewayHealthMetrics>>(new Map())
  const [activeGatewayId, setActiveGatewayId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [systemHealth, setSystemHealth] = useState({
    overallStatus: 'healthy' as 'healthy' | 'degraded' | 'critical',
    totalGateways: 0,
    onlineGateways: 0,
    offlineGateways: 0,
    errorGateways: 0,
    avgResponseTime: 0,
    totalAgents: 0,
    totalSessions: 0
  })

  // Refresh data from multi-gateway manager
  const refreshData = () => {
    const gatewayList = multiGatewayManager.getGateways()
    const metrics = multiGatewayManager.getHealthMetrics()
    const activeGateway = multiGatewayManager.getActiveGateway()
    const health = multiGatewayManager.getSystemHealth()

    setGateways(gatewayList)
    setHealthMetrics(metrics)
    setActiveGatewayId(activeGateway?.id || null)
    setSystemHealth(health)
    setIsLoading(false)
  }

  // Initial data load and periodic refresh
  useEffect(() => {
    refreshData()

    const interval = setInterval(refreshData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Handle gateway activation
  const handleActivateGateway = async (gatewayId: string) => {
    const success = multiGatewayManager.setActiveGateway(gatewayId)
    
    if (success) {
      setActiveGatewayId(gatewayId)
      triggerHaptic('success')
      
      logger.info('Gateway activated via UI', {
        gatewayId,
        component: 'GatewayManager'
      })
    } else {
      triggerHaptic('error')
    }
  }

  // Handle gateway removal
  const handleRemoveGateway = async (gatewayId: string) => {
    if (confirm('Are you sure you want to remove this gateway?')) {
      const success = multiGatewayManager.removeGateway(gatewayId)
      
      if (success) {
        refreshData()
        triggerHaptic('success')
      } else {
        triggerHaptic('error')
      }
    }
  }

  // Handle gateway enable/disable
  const handleToggleGateway = (gatewayId: string) => {
    const gateway = gateways.find(g => g.id === gatewayId)
    if (!gateway) return

    multiGatewayManager.updateGateway(gatewayId, { enabled: !gateway.enabled })
    refreshData()
    triggerHaptic(gateway.enabled ? 'warning' : 'success')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'offline':
        return <XCircle className="w-4 h-4 text-gray-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'border-green-400 bg-green-50 dark:bg-green-900/20'
      case 'offline': return 'border-gray-400 bg-gray-50 dark:bg-gray-800'
      case 'error': return 'border-red-400 bg-red-50 dark:bg-red-900/20'
      default: return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('inline-flex items-center space-x-2', className)}>
        <Server className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {systemHealth.onlineGateways}/{systemHealth.totalGateways}
        </span>
        <div className={cn('w-2 h-2 rounded-full', 
          systemHealth.overallStatus === 'healthy' ? 'bg-green-500' :
          systemHealth.overallStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
        )} />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border p-3', className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Gateways</span>
          </div>
          <div className={cn('text-sm font-medium', getHealthColor(systemHealth.overallStatus))}>
            {systemHealth.overallStatus.charAt(0).toUpperCase() + systemHealth.overallStatus.slice(1)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <div className="text-green-600 font-medium">{systemHealth.onlineGateways}</div>
            <div className="text-gray-500">Online</div>
          </div>
          <div>
            <div className="text-gray-600 font-medium">{systemHealth.totalAgents}</div>
            <div className="text-gray-500">Agents</div>
          </div>
          <div>
            <div className="text-blue-600 font-medium">{systemHealth.totalSessions}</div>
            <div className="text-gray-500">Sessions</div>
          </div>
        </div>
      </div>
    )
  }

  // Detailed variant
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border shadow-sm', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Gateway Manager
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage multiple OpenClaw Gateway connections
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Gateway</span>
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={cn('text-2xl font-bold', getHealthColor(systemHealth.overallStatus))}>
              {systemHealth.overallStatus.charAt(0).toUpperCase() + systemHealth.overallStatus.slice(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Overall Status</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {systemHealth.onlineGateways}/{systemHealth.totalGateways}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Gateways Online</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {systemHealth.totalAgents}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Agents</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              {Math.round(systemHealth.avgResponseTime)}ms
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Response</div>
          </div>
        </div>
      </div>

      {/* Gateway List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading gateways...</span>
          </div>
        ) : gateways.length === 0 ? (
          <div className="text-center py-8">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No gateways configured</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Add your first gateway to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {gateways.map((gateway) => {
              const metrics = healthMetrics.get(gateway.id)
              const isActive = activeGatewayId === gateway.id

              return (
                <div
                  key={gateway.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all duration-200',
                    getStatusColor(gateway.status),
                    isActive && 'ring-2 ring-blue-500 ring-opacity-50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(gateway.status)}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {gateway.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              gateway.type === 'production' && 'bg-red-100 text-red-800',
                              gateway.type === 'staging' && 'bg-yellow-100 text-yellow-800',
                              gateway.type === 'development' && 'bg-blue-100 text-blue-800',
                              gateway.type === 'local' && 'bg-gray-100 text-gray-800'
                            )}>
                              {gateway.type}
                            </span>
                            {isActive && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        {metrics && (
                          <>
                            <div className="text-center">
                              <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {Math.round(metrics.responseTime)}ms
                              </div>
                              <div className="text-xs text-gray-500">Response Time</div>
                            </div>

                            <div className="text-center">
                              <Users className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {metrics.connectedClients}
                              </div>
                              <div className="text-xs text-gray-500">Clients</div>
                            </div>

                            <div className="text-center">
                              <Activity className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {metrics.activeAgents}
                              </div>
                              <div className="text-xs text-gray-500">Agents</div>
                            </div>

                            <div className="text-center">
                              <BarChart3 className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {metrics.activeSessions}
                              </div>
                              <div className="text-xs text-gray-500">Sessions</div>
                            </div>
                          </>
                        )}
                      </div>

                      {gateway.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {gateway.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!isActive && gateway.enabled && gateway.status === 'online' && (
                        <button
                          onClick={() => handleActivateGateway(gateway.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleGateway(gateway.id)}
                        className={cn(
                          'px-3 py-1 rounded text-sm transition-colors',
                          gateway.enabled
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        )}
                      >
                        {gateway.enabled ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => handleRemoveGateway(gateway.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-colors"
                        disabled={isActive}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Gateway Form (placeholder) */}
      {showAddForm && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-center py-4">
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Add Gateway Form</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Complete form implementation coming in next phase
            </p>
            <button
              onClick={() => setShowAddForm(false)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GatewayManager