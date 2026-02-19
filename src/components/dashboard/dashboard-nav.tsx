import { MessageSquare, Users, Activity, Plus, Settings, Search, BarChart3, Shield, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface DashboardNavProps {
  view: 'chat' | 'agents' | 'sessions'
  onViewChange: (view: 'chat' | 'agents' | 'sessions') => void
}

export function DashboardNav({ view, onViewChange }: DashboardNavProps) {
  const navItems = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
    { id: 'agents' as const, icon: Users, label: 'Agents' },
    { id: 'sessions' as const, icon: Activity, label: 'Sessions' },
  ]

  const quickActions = [
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/costs', icon: DollarSign, label: 'Costs' },
    { href: '/schedule', icon: BarChart3, label: 'Schedule' },
    { href: '/security', icon: Shield, label: 'Security' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {/* Main Navigation */}
      <div className="border-b border-border-subtle">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`flex-1 flex items-center justify-center gap-2 p-3 transition-colors ${
                view === item.id
                  ? 'bg-terminal-900/30 text-terminal-400 border-b-2 border-terminal-400'
                  : 'hover:bg-surface-1 text-ink-muted'
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border-subtle">
        <div className="text-xs text-ink-muted mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2 p-2 rounded-lg bg-surface-1 hover:bg-surface-2 transition-colors"
            >
              <action.icon className="w-4 h-4 text-ink-muted" />
              <span className="text-xs text-ink-base">{action.label}</span>
            </Link>
          ))}
        </div>
        
        <Link
          href="/spawn"
          className="w-full mt-2 flex items-center justify-center gap-2 p-2 bg-terminal-900/30 hover:bg-terminal-900/50 rounded-lg text-terminal-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">New Session</span>
        </Link>
      </div>
    </>
  )
}