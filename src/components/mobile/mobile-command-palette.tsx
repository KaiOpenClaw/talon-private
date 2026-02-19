/**
 * Mobile Command Palette
 * Modal interface for mobile shortcut search and execution
 */

'use client'

import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Command, X, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeviceOptimizations } from './mobile-optimized-layout'
import { TouchButton } from './touch-feedback'
import { ShortcutAction, DEFAULT_SHORTCUTS } from './mobile-shortcut-types'

interface MobileCommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  actions?: ShortcutAction[]
}

/**
 * Mobile Command Palette - Alternative keyboard shortcut interface
 */
export function MobileCommandPalette({
  isOpen,
  onClose,
  actions = DEFAULT_SHORTCUTS
}: MobileCommandPaletteProps) {
  const [query, setQuery] = useState('')
  const device = useDeviceOptimizations()

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase()) ||
    action.description?.toLowerCase().includes(query.toLowerCase())
  )

  const handleActionClick = useCallback((action: ShortcutAction) => {
    if (action.disabled) return

    // Provide haptic feedback
    if (device.isTouch && 'vibrate' in navigator) {
      navigator.vibrate?.(25)
    }

    action.action()
    onClose()
  }, [device.isTouch, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-surface-0/95 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16">
      <div className="w-full max-w-lg bg-surface-1 rounded-xl border border-border-subtle shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
          <Smartphone className="w-5 h-5 text-terminal-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions..."
            className="flex-1 bg-transparent text-ink-primary placeholder-ink-muted outline-none text-base"
            autoFocus
          />
          <TouchButton
            onClick={onClose}
            className="p-2 hover:bg-surface-2 rounded-lg text-ink-secondary hover:text-ink-primary"
            hapticFeedback="light"
          >
            <X className="w-4 h-4" />
          </TouchButton>
        </div>

        {/* Actions List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredActions.map((action) => (
            <TouchButton
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              className={cn(
                "w-full flex items-center gap-3 p-4 text-left",
                "hover:bg-surface-2 active:bg-surface-3",
                "transition-colors duration-150 min-h-[60px]",
                action.disabled && "opacity-50 cursor-not-allowed"
              )}
              hapticFeedback="light"
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-terminal-400">
                {action.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink-primary truncate">
                  {action.label}
                </div>
                {action.description && (
                  <div className="text-sm text-ink-muted truncate">
                    {action.description}
                  </div>
                )}
              </div>
              {action.badge && (
                <span className="bg-terminal-500 text-white text-xs px-2 py-1 rounded-full">
                  {action.badge}
                </span>
              )}
            </TouchButton>
          ))}

          {filteredActions.length === 0 && query && (
            <div className="p-8 text-center text-ink-muted">
              <Command className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No actions found for "{query}"</div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default MobileCommandPalette