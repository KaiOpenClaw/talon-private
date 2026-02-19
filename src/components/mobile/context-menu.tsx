/**
 * Mobile Context Menu Component
 * Long-press activated context menus optimized for touch interfaces
 */

'use client'

import { ReactNode, useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useDeviceOptimizations } from './mobile-optimized-layout'

interface ContextMenuItem {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
  destructive?: boolean
  action: () => void
}

interface ContextMenuPosition {
  x: number
  y: number
}

interface MobileContextMenuProps {
  children: ReactNode
  items: ContextMenuItem[]
  disabled?: boolean
  longPressDelay?: number
  hapticFeedback?: boolean
  className?: string
  onOpen?: () => void
  onClose?: () => void
}

/**
 * Hook for managing long-press gesture detection
 */
function useLongPress(
  onLongPress: (position: ContextMenuPosition) => void,
  delay: number = 500,
  enabled: boolean = true
) {
  const [pressing, setPressing] = useState(false)
  const pressTimer = useRef<NodeJS.Timeout>()
  const startPosition = useRef<{ x: number; y: number }>()
  const deviceOptimizations = useDeviceOptimizations()

  const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!enabled) return

    const position = 'touches' in event 
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : { x: event.clientX, y: event.clientY }

    startPosition.current = position
    setPressing(true)

    // Provide immediate haptic feedback on touch devices
    if (deviceOptimizations.isTouch && 'vibrate' in navigator) {
      navigator.vibrate?.(10)
    }

    pressTimer.current = setTimeout(() => {
      if (startPosition.current) {
        onLongPress(startPosition.current)
        
        // Provide success haptic feedback
        if (deviceOptimizations.isTouch && 'vibrate' in navigator) {
          navigator.vibrate?.(50)
        }
      }
    }, delay)
  }, [onLongPress, delay, enabled, deviceOptimizations.isTouch])

  const cancel = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = undefined
    }
    setPressing(false)
    startPosition.current = undefined
  }, [])

  const handleMove = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!startPosition.current) return

    const currentPosition = 'touches' in event 
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : { x: event.clientX, y: event.clientY }

    // Cancel if user moves too far from start position
    const distance = Math.sqrt(
      Math.pow(currentPosition.x - startPosition.current.x, 2) +
      Math.pow(currentPosition.y - startPosition.current.y, 2)
    )

    if (distance > 10) { // 10px threshold
      cancel()
    }
  }, [cancel])

  useEffect(() => {
    return cancel // Cleanup on unmount
  }, [cancel])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: handleMove,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseMove: handleMove,
    onMouseLeave: cancel,
    pressing
  }
}

/**
 * Mobile Context Menu Component
 */
export function MobileContextMenu({
  children,
  items,
  disabled = false,
  longPressDelay = 500,
  hapticFeedback = true,
  className,
  onOpen,
  onClose
}: MobileContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const device = useDeviceOptimizations()

  const handleLongPress = useCallback((pos: ContextMenuPosition) => {
    if (disabled || items.length === 0) return

    setPosition(pos)
    setIsOpen(true)
    onOpen?.()
  }, [disabled, items.length, onOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return

    // Provide haptic feedback for item selection
    if (hapticFeedback && device.isTouch && 'vibrate' in navigator) {
      const vibrationPattern = item.destructive ? [25, 10, 25] : [25]
      navigator.vibrate?.(vibrationPattern)
    }

    item.action()
    handleClose()
  }, [hapticFeedback, device.isTouch, handleClose])

  const longPressHandlers = useLongPress(handleLongPress, longPressDelay, !disabled)

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    // Add event listeners
    document.addEventListener('mousedown', handleOutsideClick, true)
    document.addEventListener('touchstart', handleOutsideClick, true)
    
    // Prevent scrolling when menu is open on mobile
    if (device.isMobile) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true)
      document.removeEventListener('touchstart', handleOutsideClick, true)
      
      if (device.isMobile) {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, handleClose, device.isMobile])

  // Adjust menu position to stay within viewport
  const getAdjustedPosition = useCallback(() => {
    if (!menuRef.current) return position

    const rect = menuRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    let { x, y } = position

    // Adjust horizontal position
    if (x + rect.width > viewport.width - 10) {
      x = viewport.width - rect.width - 10
    }
    if (x < 10) {
      x = 10
    }

    // Adjust vertical position
    if (y + rect.height > viewport.height - 10) {
      y = viewport.height - rect.height - 10
    }
    if (y < 10) {
      y = 10
    }

    return { x, y }
  }, [position])

  const ContextMenuPortal = () => {
    if (!isOpen || typeof window === 'undefined') return null

    const adjustedPosition = getAdjustedPosition()

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={handleClose}
        />
        
        {/* Context Menu */}
        <div
          ref={menuRef}
          className="fixed z-50 bg-surface-1 border border-border-subtle rounded-xl shadow-lg overflow-hidden"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            minWidth: '200px',
            maxWidth: '280px'
          }}
          role="menu"
          aria-label="Context menu"
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                "w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-150",
                "flex items-center gap-3 min-h-[44px]", // Touch-friendly height
                "hover:bg-surface-2 active:bg-surface-3",
                "focus:outline-none focus:bg-surface-2",
                "first:rounded-t-xl last:rounded-b-xl",
                item.disabled && "opacity-50 cursor-not-allowed",
                item.destructive ? [
                  "text-red-400 hover:bg-red-500/10 active:bg-red-500/20",
                  "focus:bg-red-500/10"
                ] : [
                  "text-ink-primary"
                ]
              )}
              role="menuitem"
              tabIndex={0}
            >
              {item.icon && (
                <span className="flex-shrink-0 w-5 h-5">
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </>,
      document.body
    )
  }

  return (
    <>
      <div
        className={cn(
          "relative",
          longPressHandlers.pressing && "opacity-75 scale-95",
          "transition-all duration-150",
          className
        )}
        {...longPressHandlers}
        style={{
          touchAction: 'manipulation', // Prevent unwanted gestures
          userSelect: 'none' // Prevent text selection during long press
        }}
      >
        {children}
      </div>
      
      <ContextMenuPortal />
    </>
  )
}

/**
 * Context Menu Item Builder Helper
 */
export function createContextMenuItem(
  id: string,
  label: string,
  action: () => void,
  options?: {
    icon?: ReactNode
    disabled?: boolean
    destructive?: boolean
  }
): ContextMenuItem {
  return {
    id,
    label,
    action,
    ...options
  }
}

/**
 * Quick Context Menu for common actions
 */
export function QuickActionMenu({
  onCopy,
  onShare,
  onDelete,
  onEdit,
  children,
  className,
  ...props
}: {
  onCopy?: () => void
  onShare?: () => void
  onDelete?: () => void
  onEdit?: () => void
  children: ReactNode
  className?: string
} & Omit<MobileContextMenuProps, 'items' | 'children'>) {
  const items: ContextMenuItem[] = []

  if (onCopy) {
    items.push(createContextMenuItem('copy', 'Copy', onCopy, {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    }))
  }

  if (onEdit) {
    items.push(createContextMenuItem('edit', 'Edit', onEdit, {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    }))
  }

  if (onShare) {
    items.push(createContextMenuItem('share', 'Share', onShare, {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
      </svg>
    }))
  }

  if (onDelete) {
    items.push(createContextMenuItem('delete', 'Delete', onDelete, {
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>,
      destructive: true
    }))
  }

  return (
    <MobileContextMenu
      items={items}
      className={className}
      {...props}
    >
      {children}
    </MobileContextMenu>
  )
}

export default MobileContextMenu