'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Box, ChevronLeft, Users, Calendar, Target, 
  Loader2, CheckCircle, Clock, Pause, AlertCircle
} from 'lucide-react'
import { logger } from '@/lib/logger'

interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'planning' | 'paused' | 'completed'
  agents: string[]
  target?: string
  deadline?: string
  progress?: number
}

const STATUS_CONFIG = {
  active: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Active' },
  planning: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Planning' },
  paused: { icon: Pause, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Paused' },
  completed: { icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Completed' },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all')

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects')
        const data = await res.json()
        setProjects(data.projects || [])
      } catch (e) {
        logger.error('Failed to load projects', { 
          error: e instanceof Error ? e.message : String(e),
          component: 'ProjectsPage',
          action: 'fetchProjects'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter)

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-1">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Box className="w-5 h-5 text-terminal-500" />
                Projects
              </h1>
              <p className="text-sm text-ink-tertiary">Track progress across all your initiatives</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2">
          {(['all', 'active', 'planning', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-terminal-500/20 text-terminal-400 border border-terminal-500/30' 
                  : 'bg-surface-2 text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="ml-2 text-xs opacity-60">
                  {projects.filter(p => p.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-terminal-500" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const config = STATUS_CONFIG[project.status]
              const StatusIcon = config.icon
              
              return (
                <div 
                  key={project.id}
                  className="bg-surface-1 rounded-xl p-5 border border-border-subtle hover:border-border-default transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-ink-secondary mb-4">{project.description}</p>
                  )}
                  
                  {/* Progress bar */}
                  {project.progress !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-ink-muted mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-terminal-500 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Meta info */}
                  <div className="space-y-2 text-sm">
                    {project.agents.length > 0 && (
                      <div className="flex items-center gap-2 text-ink-tertiary">
                        <Users className="w-4 h-4" />
                        <span className="font-mono text-xs">{project.agents.join(', ')}</span>
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex items-center gap-2 text-ink-tertiary">
                        <Calendar className="w-4 h-4" />
                        <span>{project.deadline}</span>
                      </div>
                    )}
                    {project.target && (
                      <div className="flex items-center gap-2 text-ink-tertiary">
                        <Target className="w-4 h-4" />
                        <span>{project.target}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
