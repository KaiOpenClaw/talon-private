/**
 * Mobile Bottom Navigation Bar
 * Provides quick access to key actions with thumb-friendly positioning
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Search, MessageSquare, Calendar, Settings, 
  Bot, Activity, Zap, Plus, Command
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TouchButton } from './touch-feedback'
import { useSafeAreaInsets } from '@/hooks/useMediaQuery'

interface BottomNavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  action?: () => void
  badge?: number | string
  showOnMobile?: boolean
}

interface MobileBottomNavProps {
  /** Custom navigation items (defaults to standard items) */
  items?: BottomNavItem[]
  /** Show command palette trigger */
  showCommandPalette?: boolean
  /** Callback for command palette */
  onCommandPalette?: () => void
  /** Current agent for contextual actions */
  currentAgent?: string
  /** Number of active sessions for badge */
  sessionCount?: number
  /** Number of pending notifications */
  notificationCount?: number
}

const defaultNavItems: BottomNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="w-5 h-5" />,
    href: '/',
    showOnMobile: true
  },
  {
    id: 'search',
    label: 'Search',
    icon: <Search className="w-5 h-5" />,
    href: '/search',
    showOnMobile: true
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/command',
    showOnMobile: true
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: <Bot className="w-5 h-5" />,
    href: '/workspaces',
    showOnMobile: true
  },
  {
    id: 'more',
    label: 'More',
    icon: <Settings className="w-5 h-5" />,
    href: '/settings',
    showOnMobile: true
  }
]

export function MobileBottomNav({
  items = defaultNavItems,
  showCommandPalette = true,
  onCommandPalette,
  currentAgent,
  sessionCount,
  notificationCount
}: MobileBottomNavProps) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const safeAreaInsets = useSafeAreaInsets()

  // Auto-hide on scroll (optional behavior)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingDown = currentScrollY > lastScrollY
      const shouldHide = isScrollingDown && currentScrollY > 100

      setIsVisible(!shouldHide)
      setLastScrollY(currentScrollY)
    }

    // Uncomment to enable auto-hide on scroll
    // window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  // Filter items for mobile display
  const mobileItems = items.filter(item => item.showOnMobile !== false)

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-40",
        "bg-surface-1/95 backdrop-blur-lg border-t border-border-subtle",
        "transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      style={{
        paddingBottom: safeAreaInsets?.bottom || 0
      }}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => (
          <BottomNavItem
            key={item.id}
            item={item}
            isActive={pathname === item.href}
            sessionCount={item.id === 'chat' ? sessionCount : undefined}
            notificationCount={item.id === 'home' ? notificationCount : undefined}
          />
        ))}
        
        {/* Command Palette FAB */}
        {showCommandPalette && (
          <TouchButton
            className={cn(
              "relative -mt-6 w-14 h-14 rounded-full shadow-lg",
              "bg-terminal-500 hover:bg-terminal-600 focus:bg-terminal-600",
              "flex items-center justify-center",
              "border-4 border-surface-1"
            )}
            onClick={onCommandPalette}
            hapticFeedback="medium"
            aria-label="Open command palette"
          >
            <Command className="w-6 h-6 text-white" />
            {notificationCount && notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </TouchButton>
        )}
      </div>
    </nav>
  )
}

/**
 * Individual bottom navigation item
 */
function BottomNavItem({
  item,
  isActive,
  sessionCount,
  notificationCount
}: {
  item: BottomNavItem
  isActive: boolean
  sessionCount?: number
  notificationCount?: number
}) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[64px] min-h-[52px]",
        "relative",
        isActive 
          ? "text-terminal-400" 
          : "text-ink-muted hover:text-ink-secondary active:text-terminal-400"
      )}
    >
      {/* Icon */}
      <div className="relative">
        {item.icon}
        
        {/* Badge */}
        {(item.badge || sessionCount || notificationCount) && (
          <span className={cn(
            "absolute -top-2 -right-2 h-5 min-w-[20px] px-1",
            "bg-red-500 text-white text-xs font-bold rounded-full",
            "flex items-center justify-center"
          )}>
            {item.badge || sessionCount || notificationCount}
          </span>
        )}
      </div>

      {/* Label */}
      <span className="text-xs mt-1 font-medium">
        {item.label}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 w-8 h-1 bg-terminal-400 rounded-full" />
      )}
    </div>
  )

  if (item.href) {
    return (
      <Link href={item.href} className="flex-1 flex justify-center">
        {content}
      </Link>
    )
  }

  return (
    <button
      onClick={item.action}
      className="flex-1 flex justify-center focus:outline-none focus:ring-2 focus:ring-terminal-400 rounded-lg"
    >
      {content}
    </button>
  )
}

/**
 * Context-aware bottom navigation that adapts based on current page
 */
export function AdaptiveBottomNav({
  onCommandPalette,
  sessionCount,
  notificationCount,
  currentAgent
}: {
  onCommandPalette?: () => void
  sessionCount?: number
  notificationCount?: number
  currentAgent?: string
}) {
  const pathname = usePathname()

  // Adaptive navigation based on current page
  const getAdaptiveItems = (): BottomNavItem[] => {
    const baseItems = [...defaultNavItems]

    // Add contextual items based on current page
    if (pathname.startsWith('/workspace/') && currentAgent) {
      return [
        {
          id: 'workspace-home',
          label: 'Agent',
          icon: <Bot className="w-5 h-5" />,
          href: `/workspace/${currentAgent}`,
          showOnMobile: true
        },
        {
          id: 'workspace-chat',
          label: 'Chat',
          icon: <MessageSquare className="w-5 h-5" />,
          href: `/workspace/${currentAgent}#chat`,
          showOnMobile: true
        },
        {
          id: 'workspace-memory',
          label: 'Memory',
          icon: <Activity className="w-5 h-5" />,
          href: `/workspace/${currentAgent}#memory`,
          showOnMobile: true
        },
        {
          id: 'home',
          label: 'Home',
          icon: <Home className="w-5 h-5" />,
          href: '/',
          showOnMobile: true
        },
        {
          id: 'search',
          label: 'Search',
          icon: <Search className="w-5 h-5" />,
          href: '/search',
          showOnMobile: true
        }
      ]
    }

    // Add cron-specific items for cron pages
    if (pathname.startsWith('/cron')) {
      baseItems[2] = {
        id: 'cron',
        label: 'Cron',
        icon: <Calendar className="w-5 h-5" />,
        href: '/cron',
        showOnMobile: true
      }
    }

    // Add skills-specific items for skills pages
    if (pathname.startsWith('/skills')) {
      baseItems[3] = {
        id: 'skills',
        label: 'Skills',
        icon: <Zap className="w-5 h-5" />,
        href: '/skills',
        showOnMobile: true
      }
    }

    return baseItems
  }

  return (
    <MobileBottomNav
      items={getAdaptiveItems()}
      onCommandPalette={onCommandPalette}
      sessionCount={sessionCount}
      notificationCount={notificationCount}
      currentAgent={currentAgent}
    />
  )
}

/**
 * Quick Action Bottom Sheet for mobile
 * Provides additional actions accessible via bottom nav
 */
export function QuickActionsSheet({
  isOpen,
  onClose,
  actions
}: {
  isOpen: boolean
  onClose: () => void
  actions: Array<{
    id: string
    label: string
    icon: React.ReactNode
    action: () => void
    destructive?: boolean
  }>
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50",
          "bg-surface-1 rounded-t-xl border-t border-border-subtle",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="p-4">
          {/* Handle */}
          <div className="w-8 h-1 bg-ink-muted rounded-full mx-auto mb-4" />

          {/* Actions */}
          <div className="space-y-2">
            {actions.map((action) => (
              <TouchButton
                key={action.id}
                className={cn(
                  "w-full flex items-center justify-start gap-3 px-4 py-3 text-left",
                  action.destructive
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    : "bg-surface-2 text-ink-secondary hover:bg-surface-3"
                )}
                onClick={() => {
                  action.action()
                  onClose()
                }}
                hapticFeedback="light"
              >
                {action.icon}
                <span className="font-medium">{action.label}</span>
              </TouchButton>
            ))}
          </div>

          {/* Cancel Button */}
          <TouchButton
            className="w-full mt-4 bg-surface-2 text-ink-secondary hover:bg-surface-3"
            onClick={onClose}
          >
            Cancel
          </TouchButton>
        </div>
      </div>
    </>
  )
}

export default MobileBottomNav