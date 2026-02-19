/**
 * Mobile Shortcuts Types and Configurations
 * Shared types and default actions for mobile shortcut system
 */

import React, { ReactNode } from 'react'
import { 
  Search, MessageSquare, Home, ArrowUp
} from 'lucide-react'

export interface ShortcutAction {
  id: string
  label: string
  icon: ReactNode
  description?: string
  action: () => void
  disabled?: boolean
  badge?: string
}

export interface MobileShortcutsProps {
  actions?: ShortcutAction[]
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  theme?: 'dark' | 'light' | 'auto'
  onActionExecute?: (actionId: string) => void
}

/**
 * Default shortcut actions
 */
export const DEFAULT_SHORTCUTS: ShortcutAction[] = [
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