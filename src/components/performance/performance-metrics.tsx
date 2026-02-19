import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, CheckCircle, XCircle, Activity, Target } from 'lucide-react'

interface PerformanceStats {
  totalOperations: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  successRate: number
  errorCount: number
  operationsPerMinute: number
}

interface PerformanceMetricsProps {
  stats: PerformanceStats | null
  loading: boolean
}

export function PerformanceMetrics({ stats, loading }: PerformanceMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-surface-2 rounded mb-2"></div>
              <div className="h-6 bg-surface-2 rounded mb-2"></div>
              <div className="h-3 bg-surface-2 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const formatDuration = (ms: number) => ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms/1000).toFixed(1)}s`
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Average Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(stats.averageResponseTime)}</div>
          <p className="text-xs text-muted-foreground">
            P95: {formatDuration(stats.p95ResponseTime)}
          </p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {formatPercentage(stats.successRate)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.errorCount} errors total
          </p>
        </CardContent>
      </Card>

      {/* Operations per Minute */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Operations/min</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.operationsPerMinute.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalOperations} total ops
          </p>
        </CardContent>
      </Card>

      {/* P99 Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">P99 Response Time</CardTitle>
          <Target className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(stats.p99ResponseTime)}
          </div>
          <p className="text-xs text-muted-foreground">
            Worst-case latency
          </p>
        </CardContent>
      </Card>
    </div>
  )
}