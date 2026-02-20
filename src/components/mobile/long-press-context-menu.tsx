/**
 * Long-press context menu for mobile interactions
 * Provides native iOS/Android-style context menus with haptic feedback
 * Part of Issue #217 mobile optimization features
 */

'use client';

import { ReactNode, useRef, useState, useCallback, TouchEventHandler, useEffect } from 'react';
import { X } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  action: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface LongPressContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
  longPressDelay?: number;
  className?: string;
}

const LONG_PRESS_DELAY = 500; // ms
const MOVEMENT_THRESHOLD = 10; // px

export default function LongPressContextMenu({
  children,
  items,
  disabled = false,
  longPressDelay = LONG_PRESS_DELAY,
  className = ''
}: LongPressContextMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  const { trigger: hapticTrigger } = useHapticFeedback();

  const resetState = useCallback(() => {
    setIsPressed(false);
    setStartPosition({ x: 0, y: 0 });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showContextMenu = useCallback((x: number, y: number) => {
    if (items.length === 0) return;

    // Calculate menu position to keep it on screen
    const menuWidth = 200;
    const menuHeight = items.length * 48 + 16; // Estimate based on item height
    const padding = 16;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuWidth > window.innerWidth - padding) {
      adjustedX = window.innerWidth - menuWidth - padding;
    }
    if (adjustedX < padding) {
      adjustedX = padding;
    }

    // Adjust vertical position
    if (y + menuHeight > window.innerHeight - padding) {
      adjustedY = y - menuHeight;
    }
    if (adjustedY < padding) {
      adjustedY = padding;
    }

    setMenuPosition({ x: adjustedX, y: adjustedY });
    setShowMenu(true);
    hapticTrigger('medium'); // Haptic feedback when menu appears
  }, [items.length, hapticTrigger]);

  const hideContextMenu = useCallback(() => {
    setShowMenu(false);
    resetState();
  }, [resetState]);

  const handleItemAction = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return;
    
    hideContextMenu();
    hapticTrigger('selection'); // Haptic feedback for selection
    item.action();
  }, [hideContextMenu, hapticTrigger]);

  const handleTouchStart: TouchEventHandler = useCallback((e) => {
    if (disabled || items.length === 0) return;

    const touch = e.touches[0];
    setIsPressed(true);
    setStartPosition({ x: touch.clientX, y: touch.clientY });

    // Start long press timer
    timeoutRef.current = setTimeout(() => {
      showContextMenu(touch.clientX, touch.clientY);
      hapticTrigger('heavy'); // Strong haptic for long press activation
    }, longPressDelay);
  }, [disabled, items.length, showContextMenu, hapticTrigger, longPressDelay]);

  const handleTouchMove: TouchEventHandler = useCallback((e) => {
    if (!isPressed || !timeoutRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startPosition.x);
    const deltaY = Math.abs(touch.clientY - startPosition.y);

    // Cancel long press if moved too much
    if (deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD) {
      resetState();
    }
  }, [isPressed, startPosition, resetState]);

  const handleTouchEnd: TouchEventHandler = useCallback(() => {
    if (!showMenu) {
      resetState();
    }
  }, [showMenu, resetState]);

  // Handle clicks outside menu to close
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      hideContextMenu();
    };

    // Add slight delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu, hideContextMenu]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={`select-none ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {children}
      </div>

      {/* Context Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          {/* Context Menu */}
          <div
            className="absolute bg-surface-0 rounded-lg shadow-2xl border border-border-primary overflow-hidden min-w-48"
            style={{
              left: menuPosition.x,
              top: menuPosition.y,
            }}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-3 border-b border-border-primary">
              <div className="text-sm font-medium text-text-secondary">
                Actions
              </div>
              <button
                onClick={hideContextMenu}
                className="p-1 rounded-md hover:bg-surface-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemAction(item)}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${item.disabled
                      ? 'text-text-disabled cursor-not-allowed'
                      : item.destructive
                        ? 'text-danger hover:bg-danger/10 active:bg-danger/20'
                        : 'text-text-primary hover:bg-surface-2 active:bg-surface-3'
                    }
                  `}
                >
                  {item.icon && (
                    <div className="w-5 h-5 flex-shrink-0">
                      {item.icon}
                    </div>
                  )}
                  <span className="flex-1 font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}