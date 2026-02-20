/**
 * Command Palette Provider
 * Fetches agents data and provides it to the command palette
 */
'use client'

import React, { useState, useEffect } from 'react'
import { CommandPalette } from './command-palette'

interface CommandPaletteProviderProps {
  children: React.ReactNode
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.ok ? res.json() : [])
      .then(data => setAgents(data.agents || data || []))
      .catch(() => setAgents([]))
  }, [])

  return (
    <>
      {children}
      <CommandPalette agents={agents} />
    </>
  )
}