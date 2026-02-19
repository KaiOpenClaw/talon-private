/**
 * Mobile Keyboard Shortcuts & Quick Actions
 * Touch-friendly shortcut system optimized for mobile interfaces
 */

'use client'

import { ReactNode, useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { 
  Search, MessageSquare, Plus, Settings, Home, 
  Command, Zap, ArrowUp, X, Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeviceOptimizations } from './mobile-optimized-layout'
import { TouchButton } from './touch-feedback'

interface ShortcutAction {
  id: string
  label: string
  icon: ReactNode
  description?: string
  action: () => void
  disabled?: boolean
  badge?: string
}

interface MobileShortcutsProps {
  actions?: ShortcutAction[]
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  theme?: 'dark' | 'light' | 'auto'
  onActionExecute?: (actionId: string) => void
}

/**
 * Default shortcut actions
 */
const DEFAULT_SHORTCUTS: ShortcutAction[] = [
  {
    id: 'search',
    label: 'Search',
    icon: <Search className="w-5 h-5" />,
    description: 'Global search',
    action: () => {
      // Focus search input or open command palette
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      } else {
        // Trigger command palette
        window.dispatchEvent(new KeyboardEvent('keydown', { 
          key: 'k', 
          metaKey: true, 
          bubbles: true 
        }))
      }
    }
  },
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="w-5 h-5" />,
    description: 'Go to dashboard',
    action: () => {
      window.location.href = '/'
    }
  },
  {
    id: 'chat',
    label: 'New Chat',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Start new conversation',
    action: () => {
      // Look for chat input or new chat button
      const chatInput = document.querySelector('textarea[placeholder*="message" i], input[placeholder*="message" i]') as HTMLElement
      if (chatInput) {
        chatInput.focus()
      }
    }
  },
  {
    id: 'refresh',
    label: 'Refresh',
    icon: <ArrowUp className="w-5 h-5" />,
    description: 'Pull to refresh',
    action: () => {
      window.location.reload()
    }
  }
]

/**
 * Floating Action Button with shortcuts
 */
export function MobileShortcutsFAB({
  actions = DEFAULT_SHORTCUTS,
  position = 'bottom-right',
  theme = 'auto',
  onActionExecute
}: MobileShortcutsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 })
  const fabRef = useRef<HTMLDivElement>(null)
  const device = useDeviceOptimizations()

  // Initialize FAB position based on preference
  useEffect(() => {
    if (!device.isMobile) return

    const savedPosition = localStorage.getItem('talon-fab-position')
    if (savedPosition) {
      try {
        setFabPosition(JSON.parse(savedPosition))
        return
      } catch {
        // Invalid saved position, use default
      }
    }

    // Set default position based on prop
    const padding = 20
    const fabSize = 56

    switch (position) {
      case 'bottom-right':
        setFabPosition({
          x: window.innerWidth - fabSize - padding,
          y: window.innerHeight - fabSize - padding - 100 // Account for mobile nav
        })
        break
      case 'bottom-left':
        setFabPosition({
          x: padding,
          y: window.innerHeight - fabSize - padding - 100
        })
        break
      case 'bottom-center':
        setFabPosition({
          x: (window.innerWidth - fabSize) / 2,
          y: window.innerHeight - fabSize - padding - 100
        })
        break
    }
  }, [position, device.isMobile])

  const handleActionClick = useCallback((action: ShortcutAction) => {
    if (action.disabled) return

    // Provide haptic feedback
    if (device.isTouch && 'vibrate' in navigator) {
      navigator.vibrate?.(25)
    }

    action.action()
    onActionExecute?.(action.id)
    setIsExpanded(false)
  }, [device.isTouch, onActionExecute])

  const handleFABClick = useCallback(() => {
    setIsExpanded(!isExpanded)
    
    // Provide haptic feedback
    if (device.isTouch && 'vibrate' in navigator) {
      navigator.vibrate?.(50)
    }
  }, [isExpanded, device.isTouch])

  // Handle drag functionality for FAB repositioning
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!device.isMobile) return
    
    const touch = e.touches[0]
    const rect = fabRef.current?.getBoundingClientRect()
    if (!rect) return

    setIsDragging(true)
    
    const offsetX = touch.clientX - rect.left
    const offsetY = touch.clientY - rect.top

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0]
      const newX = moveTouch.clientX - offsetX
      const newY = moveTouch.clientY - offsetY

      // Keep within viewport bounds
      const maxX = window.innerWidth - 56
      const maxY = window.innerHeight - 56
      
      setFabPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      
      // Save position to localStorage
      localStorage.setItem('talon-fab-position', JSON.stringify(fabPosition))
      
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    
    // Prevent default to avoid scrolling during drag
    e.preventDefault()
  }, [device.isMobile, fabPosition])

  // Close shortcuts when clicking outside
  useEffect(() => {
    if (!isExpanded) return

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick, true)
    document.addEventListener('touchstart', handleOutsideClick, true)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true)
      document.removeEventListener('touchstart', handleOutsideClick, true)
    }
  }, [isExpanded])

  // Don't render on desktop
  if (!device.isMobile) {
    return null
  }

  const ShortcutsPortal = () => {
    if (typeof window === 'undefined') return null

    return createPortal(
      <div
        ref={fabRef}
        className="fixed z-50"
        style={{
          left: fabPosition.x,
          top: fabPosition.y,
          touchAction: 'none' // Prevent scrolling during interactions
        }}
      >
        {/* Expanded shortcuts */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 mb-2">
            <div className="flex flex-col-reverse gap-3">
              {actions.map((action, index) => (
                <TouchButton
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className={cn(
                    "flex items-center gap-3 min-w-[120px] px-4 py-3 rounded-full",
                    "bg-surface-1 border border-border-subtle shadow-lg",
                    "text-ink-primary hover:bg-surface-2",
                    "transform transition-all duration-200 ease-out",
                    action.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInUp 200ms ease-out forwards'
                  }}
                  hapticFeedback="light"
                >
                  <span className="flex-shrink-0">
                    {action.icon}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {action.label}
                  </span>
                  {action.badge && (
                    <span className="ml-auto bg-terminal-500 text-white text-xs px-2 py-1 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </TouchButton>
              ))}
            </div>
          </div>
        )}

        {/* Main FAB */}
        <TouchButton
          onClick={handleFABClick}
          onTouchStart={handleTouchStart}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg",
            "flex items-center justify-center",
            "bg-terminal-500 text-white",
            "hover:bg-terminal-600 active:bg-terminal-700",
            "transform transition-all duration-200",
            "ring-2 ring-surface-0 ring-offset-2",
            isDragging && "scale-110 shadow-2xl",
            isExpanded && "rotate-45 bg-red-500 hover:bg-red-600"
          )}
          hapticFeedback="medium"
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Zap className="w-6 h-6" />
          )}
        </TouchButton>

        {/* Ripple effect on tap */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full pointer-events-none",
            "bg-white/20 scale-0 transition-transform duration-300",
            isDragging && "scale-150"
          )}
        />
      </div>,
      document.body
    )
  }

  return <ShortcutsPortal />
}

/**
 * Quick Action Bar - Alternative to FAB
 */
export function QuickActionBar({
  actions = DEFAULT_SHORTCUTS.slice(0, 4),
  onActionExecute
}: {
  actions?: ShortcutAction[]
  onActionExecute?: (actionId: string) => void
}) {
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

/**
 * Mobile Command Palette - Alternative keyboard shortcut interface
 */
export function MobileCommandPalette({
  isOpen,
  onClose,
  actions = DEFAULT_SHORTCUTS
}: {
  isOpen: boolean
  onClose: () => void
  actions?: ShortcutAction[]
}) {
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

// CSS animations for mobile shortcuts
if (typeof window !== 'undefined') {
  const styleSheet = document.styleSheets[0] || document.createElement('style').sheet

  if (styleSheet && !document.querySelector('#mobile-shortcuts-styles')) {
    const styles = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `
    
    const styleElement = document.createElement('style')
    styleElement.id = 'mobile-shortcuts-styles'
    styleElement.textContent = styles
    document.head.appendChild(styleElement)
  }
}

export default MobileShortcutsFAB