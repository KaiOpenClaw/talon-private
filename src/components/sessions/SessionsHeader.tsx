'use client'

import { RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WebSocketStatus } from '@/components/websocket-status'

interface SessionsHeaderProps {
  loading: boolean
  error: string | null
  sessionCount: number
  wsConnected: boolean
  onRefresh: () => void
}

export function SessionsHeader({ 
  loading, 
  error, 
  sessionCount, 
  wsConnected, 
  onRefresh 
}: SessionsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold">Active Sessions</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {sessionCount} active session{sessionCount !== 1 ? 's' : ''}
          </span>
          
          {/* WebSocket status indicator */}
          <div className="flex items-center space-x-1">
            {wsConnected ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-gray-500">
              {wsConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <WebSocketStatus />
        
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}