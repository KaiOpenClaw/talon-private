import { Terminal, RefreshCw } from 'lucide-react'
import { LogoutButton } from '@/components/auth-status'
import { ConnectionStatus } from '@/components/connection-status'
import { RealtimeStatus, LiveActivityPulse } from '@/components/realtime/RealtimeStatus'

interface DashboardHeaderProps {
  isRefreshing: boolean
  onRefresh: () => void
}

export function DashboardHeader({ isRefreshing, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="h-14 flex items-center gap-2 px-4 border-b border-border-subtle">
      <Terminal className="w-6 h-6 text-terminal-500" />
      <span className="font-semibold text-lg">Talon</span>
      
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-1.5 rounded-lg transition-colors hover:bg-surface-1 ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        
        <ConnectionStatus variant="icon" />
        
        {/* Enhanced WebSocket real-time status */}
        <div className="flex items-center space-x-1">
          <RealtimeStatus variant="minimal" className="hidden sm:block" />
          <LiveActivityPulse size="sm" />
        </div>
        
        <span className="text-xs text-ink-muted hidden sm:block">OpenClaw UI</span>
        
        <LogoutButton />
      </div>
    </div>
  )
}