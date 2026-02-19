import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Wifi, AlertTriangle, TrendingUp } from 'lucide-react'

interface SystemMetrics {
  timestamp: number
  activeConnections: number
  requestsPerMinute: number
  errorRate: number
}

interface SystemMetricsProps {
  systemMetrics: SystemMetrics | null
  loading: boolean
}

export function SystemMetrics({ systemMetrics, loading }: SystemMetricsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-6 bg-surface-2 rounded mb-2"></div>
                <div className="h-4 bg-surface-2 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!systemMetrics) return null

  const formatErrorRate = (rate: number) => `${(rate * 100).toFixed(2)}%`
  
  const getStatusColor = (errorRate: number) => {
    if (errorRate < 0.01) return 'text-green-500'
    if (errorRate < 0.05) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getConnectionStatus = (connections: number) => {
    if (connections > 100) return { color: 'text-green-500', status: 'High' }
    if (connections > 50) return { color: 'text-yellow-500', status: 'Medium' }
    if (connections > 0) return { color: 'text-blue-500', status: 'Low' }
    return { color: 'text-gray-500', status: 'None' }
  }

  const connectionStatus = getConnectionStatus(systemMetrics.activeConnections)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Metrics
          <span className="ml-auto text-xs text-muted-foreground">
            Updated: {new Date(systemMetrics.timestamp).toLocaleTimeString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Active Connections */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Wifi className={`h-6 w-6 ${connectionStatus.color}`} />
            </div>
            <div className={`text-2xl font-bold ${connectionStatus.color}`}>
              {systemMetrics.activeConnections}
            </div>
            <div className="text-xs text-muted-foreground">
              Active Connections
            </div>
            <div className={`text-xs ${connectionStatus.color}`}>
              {connectionStatus.status} Load
            </div>
          </div>

          {/* Requests per Minute */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(systemMetrics.requestsPerMinute)}
            </div>
            <div className="text-xs text-muted-foreground">
              Requests/min
            </div>
            <div className="text-xs text-blue-500">
              {systemMetrics.requestsPerMinute > 100 ? 'High' : 
               systemMetrics.requestsPerMinute > 50 ? 'Medium' : 'Low'} Traffic
            </div>
          </div>

          {/* Error Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className={`h-6 w-6 ${getStatusColor(systemMetrics.errorRate)}`} />
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(systemMetrics.errorRate)}`}>
              {formatErrorRate(systemMetrics.errorRate)}
            </div>
            <div className="text-xs text-muted-foreground">
              Error Rate
            </div>
            <div className={`text-xs ${getStatusColor(systemMetrics.errorRate)}`}>
              {systemMetrics.errorRate < 0.01 ? 'Excellent' :
               systemMetrics.errorRate < 0.05 ? 'Good' : 'Needs Attention'}
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Health</span>
            <div className={`flex items-center gap-2 ${
              systemMetrics.errorRate < 0.01 ? 'text-green-500' :
              systemMetrics.errorRate < 0.05 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                systemMetrics.errorRate < 0.01 ? 'bg-green-500' :
                systemMetrics.errorRate < 0.05 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm">
                {systemMetrics.errorRate < 0.01 ? 'Healthy' :
                 systemMetrics.errorRate < 0.05 ? 'Warning' : 'Critical'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}