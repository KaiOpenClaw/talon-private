/**
 * WebSocket Test Page
 * Demonstrates real-time functionality and connection status
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, Wifi, WifiOff, Zap, MessageSquare, 
  Clock, CheckCircle, AlertCircle, RefreshCw 
} from 'lucide-react'
import { 
  WebSocketStatus, 
  LiveActivityPulse, 
  ConnectionHealthBadge,
  RealtimeEventLog 
} from '@/components/websocket-status'
import { 
  useWebSocketStatus, 
  useSessionUpdates, 
  useCronUpdates, 
  useLiveActivity,
  useWebSocketEvent,
  useAllWebSocketEvents
} from '@/hooks/useWebSocket'
import type { WebSocketEvent } from '@/lib/websocket'

export default function WebSocketTestPage() {
  const [eventLog, setEventLog] = useState<Array<{
    id: string
    type: string
    timestamp: Date
    data: unknown
  }>>([])
  const [testResults, setTestResults] = useState<{
    connectionTest: 'pending' | 'success' | 'failed'
    eventReceiveTest: 'pending' | 'success' | 'failed'
    reconnectionTest: 'pending' | 'success' | 'failed'
  }>({
    connectionTest: 'pending',
    eventReceiveTest: 'pending',
    reconnectionTest: 'pending'
  })

  // WebSocket status and activity
  const { connected, reconnecting, lastConnected, errorCount, reconnect } = useWebSocketStatus()
  const { lastUpdate, sessionUpdateCount } = useSessionUpdates()
  const { lastCronUpdate, cronTriggerCount } = useCronUpdates()
  const { isActive, lastActivity, activityType } = useLiveActivity()

  // Log all WebSocket events
  useAllWebSocketEvents((event: WebSocketEvent) => {
    const logEntry = {
      id: Date.now().toString(),
      type: event.type,
      timestamp: new Date(),
      data: event.data
    }
    
    setEventLog(prev => [...prev.slice(-19), logEntry]) // Keep last 20 events
    
    // Update test results
    if (event.type !== 'agent_status') {
      setTestResults(prev => ({ ...prev, eventReceiveTest: 'success' }))
    }
  })

  // Test connection status
  useEffect(() => {
    if (connected) {
      setTestResults(prev => ({ ...prev, connectionTest: 'success' }))
    } else {
      setTestResults(prev => ({ ...prev, connectionTest: 'failed' }))
    }
  }, [connected])

  // Test reconnection capability
  useEffect(() => {
    if (reconnecting) {
      setTestResults(prev => ({ ...prev, reconnectionTest: 'success' }))
    }
  }, [reconnecting])

  const testWebSocketConnection = async () => {
    // Trigger a manual reconnection to test reconnection logic
    reconnect()
    
    // Reset test results
    setTestResults({
      connectionTest: 'pending',
      eventReceiveTest: 'pending',
      reconnectionTest: 'pending'
    })
  }

  const clearEventLog = () => {
    setEventLog([])
  }

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-base mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            WebSocket Test Dashboard
            <LiveActivityPulse />
          </h1>
          <p className="text-ink-muted">
            Real-time connection testing and event monitoring for Talon WebSocket integration
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {/* Connection Status */}
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-base">Connection</h3>
              {connected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            
            <WebSocketStatus showDetails className="mb-4" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Status:</span>
                <span className={connected ? 'text-green-600' : 'text-red-600'}>
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {lastConnected && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Since:</span>
                  <span className="text-ink-secondary">
                    {lastConnected.toLocaleTimeString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-muted">Errors:</span>
                <span className={errorCount > 0 ? 'text-orange-600' : 'text-green-600'}>
                  {errorCount}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Monitor */}
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-base">Live Activity</h3>
              <Activity className={`w-5 h-5 ${isActive ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Active:</span>
                <span className={isActive ? 'text-green-600' : 'text-gray-600'}>
                  {isActive ? 'Yes' : 'No'}
                </span>
              </div>
              {activityType && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Type:</span>
                  <span className="text-ink-secondary">
                    {activityType.replace('_', ' ')}
                  </span>
                </div>
              )}
              {lastActivity && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Last:</span>
                  <span className="text-ink-secondary">
                    {lastActivity.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Session Updates */}
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-base">Session Updates</h3>
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Count:</span>
                <span className="text-blue-600 font-medium">
                  {sessionUpdateCount}
                </span>
              </div>
              {lastUpdate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Last Type:</span>
                    <span className="text-ink-secondary">
                      {lastUpdate.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Time:</span>
                    <span className="text-ink-secondary">
                      {new Date(lastUpdate.data.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cron Updates */}
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-base">Cron Events</h3>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Count:</span>
                <span className="text-purple-600 font-medium">
                  {cronTriggerCount}
                </span>
              </div>
              {lastCronUpdate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Job ID:</span>
                    <span className="text-ink-secondary font-mono text-xs">
                      {lastCronUpdate.data.cronJobId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Time:</span>
                    <span className="text-ink-secondary">
                      {new Date(lastCronUpdate.data.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Test Controls and Results */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Test Controls */}
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-6">
            <h3 className="font-semibold text-ink-base mb-4">Connection Tests</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Connection Test</span>
                <div className="flex items-center gap-2">
                  {testResults.connectionTest === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : testResults.connectionTest === 'failed' ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${
                    testResults.connectionTest === 'success' ? 'text-green-600' :
                    testResults.connectionTest === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {testResults.connectionTest === 'pending' ? 'Pending' :
                     testResults.connectionTest === 'success' ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Event Reception</span>
                <div className="flex items-center gap-2">
                  {testResults.eventReceiveTest === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : testResults.eventReceiveTest === 'failed' ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${
                    testResults.eventReceiveTest === 'success' ? 'text-green-600' :
                    testResults.eventReceiveTest === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {testResults.eventReceiveTest === 'pending' ? 'Pending' :
                     testResults.eventReceiveTest === 'success' ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Reconnection</span>
                <div className="flex items-center gap-2">
                  {testResults.reconnectionTest === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : testResults.reconnectionTest === 'failed' ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${
                    testResults.reconnectionTest === 'success' ? 'text-green-600' :
                    testResults.reconnectionTest === 'failed' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {testResults.reconnectionTest === 'pending' ? 'Pending' :
                     testResults.reconnectionTest === 'success' ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={testWebSocketConnection}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Test Connection
              </button>
              
              <button
                onClick={clearEventLog}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Clear Log
              </button>
            </div>
          </div>

          {/* Connection Health */}
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-6">
            <h3 className="font-semibold text-ink-base mb-4">Health Status</h3>
            
            <div className="space-y-4">
              <ConnectionHealthBadge />
              
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Reconnecting:</span>
                  <span className={reconnecting ? 'text-yellow-600' : 'text-gray-600'}>
                    {reconnecting ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-ink-muted">Events Logged:</span>
                  <span className="text-blue-600 font-medium">
                    {eventLog.length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-ink-muted">Real-time Updates:</span>
                  <span className={connected ? 'text-green-600' : 'text-red-600'}>
                    {connected ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-base">Real-time Event Log</h3>
            <span className="text-xs text-ink-muted">Last {eventLog.length} events</span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {eventLog.length === 0 ? (
              <div className="text-center py-8 text-ink-muted">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No events logged yet</p>
                <p className="text-xs">WebSocket events will appear here when they occur</p>
              </div>
            ) : (
              <div className="space-y-2">
                {eventLog.map((event) => (
                  <div key={event.id} className="bg-surface-2 rounded-lg p-3 text-sm font-mono">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-blue-600 font-medium">{event.type}</span>
                      <span className="text-ink-muted text-xs">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {Object.keys(event.data).length > 0 && (
                      <pre className="text-xs text-ink-muted overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}