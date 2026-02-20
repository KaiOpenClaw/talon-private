/**
 * Command Palette Data Generation
 * Creates command items for navigation, agents, and actions
 */
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import {
  Search,
  Home,
  Bot,
  Calendar,
  Zap,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react'
import { CommandItem } from './command-palette-types'

export function useCommandData(agents: Array<{ id: string; name: string; status?: string }> = []) {
  const router = useRouter()

  const commands = useMemo(() => {
    const navCommands: CommandItem[] = [
      {
        id: 'home',
        title: 'Go to Dashboard',
        description: 'Main mission control view',
        icon: <Home className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/'),
        keywords: ['home', 'dashboard', 'main'],
      },
      {
        id: 'search',
        title: 'Semantic Search',
        description: 'Search across all agent memories',
        icon: <Search className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/search'),
        keywords: ['search', 'find', 'query', 'memory'],
      },
      {
        id: 'skills',
        title: 'Skills Dashboard',
        description: 'Manage capability packs',
        icon: <Zap className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/skills'),
        keywords: ['skills', 'capabilities', 'tools'],
      },
      {
        id: 'cron',
        title: 'Cron Dashboard',
        description: 'Scheduled jobs & automation',
        icon: <Calendar className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/cron'),
        keywords: ['cron', 'schedule', 'jobs', 'automation', 'tasks'],
      },
      {
        id: 'channels',
        title: 'Channels Dashboard',
        description: 'Multi-platform messaging',
        icon: <MessageSquare className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/channels'),
        keywords: ['channels', 'messaging', 'discord', 'telegram'],
      },
      {
        id: 'status',
        title: 'System Status',
        description: 'Health & performance metrics',
        icon: <Activity className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/status'),
        keywords: ['status', 'health', 'system', 'metrics'],
      },
      {
        id: 'sessions',
        title: 'Sessions',
        description: 'View active sessions',
        icon: <FileText className="w-4 h-4" />,
        category: 'navigation',
        action: () => router.push('/sessions'),
        keywords: ['sessions', 'conversations', 'history'],
      },
    ]

    const agentCommands: CommandItem[] = agents.map(agent => ({
      id: `agent-${agent.id}`,
      title: agent.name || agent.id,
      description: `Open ${agent.id} workspace`,
      icon: <Bot className="w-4 h-4" />,
      category: 'agents',
      action: () => router.push(`/workspace/${agent.id}`),
      keywords: [agent.id, agent.name || '', 'agent', 'workspace'],
    }))

    const actionCommands: CommandItem[] = [
      {
        id: 'new-chat',
        title: 'New Chat',
        description: 'Start a new conversation',
        icon: <MessageSquare className="w-4 h-4" />,
        category: 'actions',
        action: () => {
          // Focus chat input on main page
          router.push('/')
          setTimeout(() => {
            const chatInput = document.querySelector('textarea[placeholder*="Send"]')
            if (chatInput instanceof HTMLTextAreaElement) {
              chatInput.focus()
            }
          }, 100)
        },
        keywords: ['chat', 'message', 'send', 'new'],
      },
      {
        id: 'refresh',
        title: 'Refresh Data',
        description: 'Reload all dashboard data',
        icon: <Activity className="w-4 h-4" />,
        category: 'actions',
        action: () => window.location.reload(),
        keywords: ['refresh', 'reload', 'update'],
      },
      {
        id: 'logout',
        title: 'Sign Out',
        description: 'End your session',
        icon: <LogOut className="w-4 h-4" />,
        category: 'actions',
        action: () => router.push('/api/auth/logout'),
        keywords: ['logout', 'signout', 'exit'],
      },
    ]

    return [...navCommands, ...agentCommands, ...actionCommands]
  }, [agents, router])

  return commands
}