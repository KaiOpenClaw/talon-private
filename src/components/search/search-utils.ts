/**
 * Utility functions and constants for semantic search
 */

import { FileText, FolderOpen, Brain, Users } from 'lucide-react'

export const FILE_TYPE_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  memory: { icon: Brain, color: 'text-purple-400' },
  soul: { icon: Users, color: 'text-blue-400' },
  tools: { icon: FileText, color: 'text-green-400' },
  agents: { icon: FolderOpen, color: 'text-orange-400' },
  docs: { icon: FileText, color: 'text-cyan-400' },
  other: { icon: FileText, color: 'text-ink-muted' },
}

export const getFileTypeIcon = (fileType: string) => {
  return FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.other
}