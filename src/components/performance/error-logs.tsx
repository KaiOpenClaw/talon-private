import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock } from 'lucide-react'

interface PerformanceMetric {
  timestamp: number
  operation: string
  duration: number
  success: boolean
  error?: string
  agent?: string
  metadata?: Record<string, any>
}

interface ErrorLogsProps {
  recentErrors: PerformanceMetric[]
  loading: boolean
}

export function ErrorLogs({ recentErrors, loading }: ErrorLogsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-surface-2 rounded mb-2"></div>
                <div className="h-3 bg-surface-2 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getSeverityColor = (error: string) => {
    if (error.toLowerCase().includes('critical') || error.toLowerCase().includes('fatal')) {
      return 'destructive'
    }
    if (error.toLowerCase().includes('timeout') || error.toLowerCase().includes('connection')) {
      return 'secondary'
    }
    return 'outline'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Recent Errors
          <Badge variant="outline" className="ml-auto">
            {recentErrors.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentErrors.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-500 text-xl">✓</span>
              </div>
              <p className="text-sm text-muted-foreground">No recent errors</p>
              <p className="text-xs text-muted-foreground">System is running smoothly</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentErrors.slice(0, 10).map((error, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(error.error || '')}>
                        {error.operation}
                      </Badge>
                      {error.agent && (
                        <Badge variant="outline" className="text-xs">
                          {error.agent}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-destructive font-medium">
                      {error.error}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(error.timestamp)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Duration: {error.duration.toFixed(0)}ms</span>
                  {error.metadata && Object.keys(error.metadata).length > 0 && (
                    <details className="cursor-pointer">
                      <summary>Metadata</summary>
                      <pre className="mt-1 text-xs bg-muted rounded p-2 overflow-auto">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}