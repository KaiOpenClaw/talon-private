/**
 * Type definitions for Command Palette
 */
import React from 'react'

export interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  category: 'navigation' | 'agents' | 'actions'
  action: () => void
  keywords?: string[]
}

export interface CommandPaletteProps {
  agents?: Array<{ id: string; name: string; status?: string }>
}

export interface CommandRowProps {
  command: CommandItem
  isSelected: boolean
  onClick: () => void
}

export interface CommandGroupedData {
  navigation: CommandItem[]
  agents: CommandItem[]
  actions: CommandItem[]
}