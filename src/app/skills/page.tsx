'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Search, Package, Play, Square, Download, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

interface Skill {
  id: string
  name: string
  description: string
  status: 'ready' | 'unavailable' | 'error' | 'installing'
  version?: string
  dependencies?: string[]
  missingDeps?: string[]
  category?: string
}

interface SkillsResponse {
  skills: Skill[]
  summary: {
    total: number
    ready: number
    unavailable: number
    error: number
  }
  mock?: boolean
}

const skillCategories = {
  'coding': ['coding-agent', 'github', 'docker', 'kubernetes'],
  'communication': ['gog', 'slack', 'telegram', 'discord'],
  'utilities': ['tmux', 'healthcheck', 'weather', 'skill-creator'],
  'media': ['nano-banana-pro', 'openai-image-gen', 'openai-whisper-api', 'video-frames'],
  'other': []
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [summary, setSummary] = useState({ total: 0, ready: 0, unavailable: 0, error: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      if (!response.ok) throw new Error('Failed to fetch skills')
      
      const data: SkillsResponse = await response.json()
      
      // Categorize skills
      const categorizedSkills = data.skills.map(skill => ({
        ...skill,
        category: getCategoryForSkill(skill.name)
      }))
      
      setSkills(categorizedSkills)
      setSummary(data.summary)
    } catch (error) {
      logger.error('Failed to fetch skills', { 
        error: error instanceof Error ? error.message : String(error),
        component: 'SkillsPage',
        action: 'fetchSkills'
      })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryForSkill = (skillName: string): string => {
    for (const [category, skillNames] of Object.entries(skillCategories)) {
      if (skillNames.includes(skillName)) {
        return category
      }
    }
    return 'other'
  }

  const handleSkillOperation = async (skillId: string, operation: 'enable' | 'disable' | 'install') => {
    setOperationInProgress(skillId)
    
    try {
      const response = await fetch(`/api/skills/${skillId}/${operation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Failed to ${operation} skill`)
      }
      
      // Update skill status locally for immediate feedback
      setSkills(prev => prev.map(skill => 
        skill.id === skillId 
          ? { 
              ...skill, 
              status: operation === 'install' ? 'installing' : 
                      operation === 'enable' ? 'ready' : 'unavailable' 
            }
          : skill
      ))
      
      // Refresh skills data after a short delay
      setTimeout(fetchSkills, 2000)
      
    } catch (error) {
      logger.error(`Failed to ${operation} skill`, { 
        error: error instanceof Error ? error.message : String(error),
        component: 'SkillsPage',
        action: 'handleSkillOperation',
        skillId,
        operation
      })
      alert(`Failed to ${operation} skill: ${error}`)
    } finally {
      setOperationInProgress(null)
    }
  }

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'unavailable': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'installing': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Enabled'
      case 'unavailable': return 'Available'
      case 'error': return 'Error'
      case 'installing': return 'Installing'
      default: return 'Unknown'
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'ready': return `${baseClasses} bg-green-500/20 text-green-400`
      case 'unavailable': return `${baseClasses} bg-yellow-500/20 text-yellow-400`
      case 'error': return `${baseClasses} bg-red-500/20 text-red-400`
      case 'installing': return `${baseClasses} bg-blue-500/20 text-blue-400`
      default: return `${baseClasses} bg-gray-500/20 text-gray-400`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-terminal-400" />
          <p className="text-ink-muted">Loading skills...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <div className="border-b border-border-subtle bg-surface-0 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-ink-base">Skills Management</h1>
              <p className="text-ink-muted mt-1">
                Manage OpenClaw capability packs • {summary.ready} of {summary.total} skills ready
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-terminal-900/30 hover:bg-terminal-900/50 rounded-lg text-terminal-400 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-1 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-ink-muted">Ready</span>
              </div>
              <div className="text-2xl font-bold text-ink-base mt-1">{summary.ready}</div>
            </div>
            <div className="bg-surface-1 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-ink-muted">Available</span>
              </div>
              <div className="text-2xl font-bold text-ink-base mt-1">{summary.unavailable}</div>
            </div>
            <div className="bg-surface-1 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-ink-muted">Error</span>
              </div>
              <div className="text-2xl font-bold text-ink-base mt-1">{summary.error}</div>
            </div>
            <div className="bg-surface-1 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-ink-muted" />
                <span className="text-sm text-ink-muted">Total</span>
              </div>
              <div className="text-2xl font-bold text-ink-base mt-1">{summary.total}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-1 border border-border-subtle rounded-lg text-ink-base placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-terminal-400/50"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-surface-1 border border-border-subtle rounded-lg px-4 py-2 pr-8 text-ink-base focus:outline-none focus:ring-2 focus:ring-terminal-400/50"
              >
                <option value="all">All Categories</option>
                <option value="coding">Coding</option>
                <option value="communication">Communication</option>
                <option value="utilities">Utilities</option>
                <option value="media">Media</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="bg-surface-1 rounded-lg border border-border-subtle p-6 hover:border-border-base transition-colors">
              {/* Skill Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-ink-base truncate">{skill.name}</h3>
                    <span className={getStatusBadge(skill.status)}>
                      {getStatusIcon(skill.status)}
                      {getStatusText(skill.status)}
                    </span>
                  </div>
                  {skill.version && (
                    <p className="text-xs text-ink-muted">v{skill.version}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-ink-muted mb-4 line-clamp-2">
                {skill.description}
              </p>

              {/* Dependencies */}
              {skill.dependencies && skill.dependencies.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-ink-muted mb-2">Dependencies:</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.dependencies.map(dep => (
                      <span key={dep} className="px-2 py-1 bg-surface-2 rounded text-xs text-ink-base">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Dependencies */}
              {skill.missingDeps && skill.missingDeps.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-red-400 mb-2">Missing Dependencies:</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.missingDeps.map(dep => (
                      <span key={dep} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {skill.status === 'ready' && (
                  <button
                    onClick={() => handleSkillOperation(skill.id, 'disable')}
                    disabled={operationInProgress === skill.id}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    <Square className="w-3 h-3" />
                    Disable
                  </button>
                )}
                
                {skill.status === 'unavailable' && (
                  <button
                    onClick={() => handleSkillOperation(skill.id, 'enable')}
                    disabled={operationInProgress === skill.id}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    Enable
                  </button>
                )}

                {skill.status === 'error' && (
                  <button
                    onClick={() => handleSkillOperation(skill.id, 'install')}
                    disabled={operationInProgress === skill.id}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    <Download className="w-3 h-3" />
                    Install
                  </button>
                )}

                {operationInProgress === skill.id && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-surface-2 text-ink-muted rounded text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Working...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-ink-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ink-base mb-2">No skills found</h3>
            <p className="text-ink-muted">
              {searchQuery ? 'Try adjusting your search criteria.' : 'No skills match the selected filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}