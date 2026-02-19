import { Activity, Clock, AlertTriangle, Zap } from 'lucide-react'

interface DashboardStatsProps {
  agentCount: number
  activeSessionCount: number
  totalSessions: number
  blockersCount: number
}

export function DashboardStats({ 
  agentCount, 
  activeSessionCount, 
  totalSessions, 
  blockersCount 
}: DashboardStatsProps) {
  return (
    <div className="p-3 border-b border-border-subtle">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-surface-2 rounded-lg p-2">
          <div className="text-lg font-semibold text-terminal-400">{agentCount}</div>
          <div className="text-xs text-ink-muted">Agents</div>
        </div>
        <div className="bg-surface-2 rounded-lg p-2">
          <div className="text-lg font-semibold text-blue-400">{activeSessionCount}</div>
          <div className="text-xs text-ink-muted">Active</div>
        </div>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div className="bg-surface-2 rounded-lg p-2 relative">
          <Activity className="w-4 h-4 text-green-400 absolute top-1 right-1" />
          <div className="text-lg font-semibold text-green-400">{totalSessions}</div>
          <div className="text-xs text-ink-muted">Sessions</div>
        </div>
        <div className="bg-surface-2 rounded-lg p-2 relative">
          <AlertTriangle className={`w-4 h-4 absolute top-1 right-1 ${blockersCount > 0 ? 'text-red-400' : 'text-gray-400'}`} />
          <div className={`text-lg font-semibold ${blockersCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {blockersCount}
          </div>
          <div className="text-xs text-ink-muted">Blockers</div>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <div className="flex-1 bg-terminal-900/30 rounded p-2 text-center">
          <Clock className="w-4 h-4 text-terminal-400 mx-auto mb-1" />
          <div className="text-xs text-ink-muted">Real-time</div>
        </div>
        <div className="flex-1 bg-blue-900/30 rounded p-2 text-center">
          <Zap className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="text-xs text-ink-muted">Live</div>
        </div>
      </div>
    </div>
  )
}