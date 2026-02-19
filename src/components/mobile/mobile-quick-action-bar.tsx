/**
 * Mobile Quick Action Bar
 * Alternative bottom bar interface for mobile shortcuts
 */

'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useDeviceOptimizations } from './mobile-optimized-layout'
import { TouchButton } from './touch-feedback'
import { ShortcutAction, DEFAULT_SHORTCUTS } from './mobile-shortcut-types'

interface QuickActionBarProps {
  actions?: ShortcutAction[]
  onActionExecute?: (actionId: string) => void
}

/**
 * Quick Action Bar - Alternative to FAB
 */
export function QuickActionBar({
  actions = DEFAULT_SHORTCUTS.slice(0, 4),
  onActionExecute
}: QuickActionBarProps) {
  const device = useDeviceOptimizations()

  const handleActionClick = useCallback((action: ShortcutAction) => {
    if (action.disabled) return

    // Provide haptic feedback
    if (device.isTouch && 'vibrate' in navigator) {
      navigator.vibrate?.(25)
    }

    action.action()
    onActionExecute?.(action.id)
  }, [device.isTouch, onActionExecute])

  // Don't render on desktop
  if (!device.isMobile) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-1 border-t border-border-subtle p-4 z-40">
      <div className="flex justify-around gap-2 max-w-md mx-auto">
        {actions.map((action) => (
          <TouchButton
            key={action.id}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl flex-1",
              "bg-surface-0 border border-border-subtle",
              "text-ink-secondary hover:text-ink-primary hover:bg-surface-2",
              "min-h-[60px] transition-all duration-200",
              action.disabled && "opacity-50 cursor-not-allowed"
            )}
            hapticFeedback="light"
          >
            <span className="flex-shrink-0">
              {action.icon}
            </span>
            <span className="text-xs font-medium text-center truncate max-w-full">
              {action.label}
            </span>
            {action.badge && (
              <span className="absolute -top-1 -right-1 bg-terminal-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </TouchButton>
        ))}
      </div>
    </div>
  )
}

export default QuickActionBar