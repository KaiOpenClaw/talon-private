'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Clock, ChevronLeft, Play, Pause, Calendar,
  Loader2, CheckCircle, AlertCircle, Zap
} from 'lucide-react'
import { logger } from '@/lib/logger'

interface CronJob {
  id: string
  name?: string
  schedule: {
    kind: 'at' | 'every' | 'cron'
    expr?: string
    at?: string
    everyMs?: number
  }
  payload: {
    kind: 'systemEvent' | 'agentTurn'
    text?: string
    message?: string
  }
  sessionTarget?: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) {
    return schedule.expr
  }
  if (schedule.kind === 'every' && schedule.everyMs) {
    const hours = schedule.everyMs / 3600000
    if (hours >= 24) return `Every ${Math.round(hours / 24)}d`
    if (hours >= 1) return `Every ${Math.round(hours)}h`
    return `Every ${Math.round(schedule.everyMs / 60000)}m`
  }
  if (schedule.kind === 'at' && schedule.at) {
    return new Date(schedule.at).toLocaleString()
  }
  return 'Unknown'
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return 'Never'
  const date = new Date(iso)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const absDiff = Math.abs(diff)
  
  const isPast = diff < 0
  
  if (absDiff < 60000) return isPast ? 'Just now' : 'In < 1m'
  if (absDiff < 3600000) return `${isPast ? '' : 'In '}${Math.floor(absDiff / 60000)}m${isPast ? ' ago' : ''}`
  if (absDiff < 86400000) return `${isPast ? '' : 'In '}${Math.floor(absDiff / 3600000)}h${isPast ? ' ago' : ''}`
  return `${isPast ? '' : 'In '}${Math.floor(absDiff / 86400000)}d${isPast ? ' ago' : ''}`
}

export default function SchedulePage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [showDisabled, setShowDisabled] = useState(false)
  const [runningJob, setRunningJob] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(`/api/cron?includeDisabled=${showDisabled}`)
        const data = await res.json()
        setJobs(data.jobs || [])
      } catch (e) {
        logger.error('Failed to load cron jobs', { 
          error: e instanceof Error ? e.message : String(e),
          component: 'SchedulePage',
          action: 'fetchJobs',
          showDisabled 
        })
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [showDisabled])

  async function triggerJob(jobId: string) {
    setRunningJob(jobId)
    try {
      await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', jobId }),
      })
      // Refresh list
      const res = await fetch(`/api/cron?includeDisabled=${showDisabled}`)
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (e) {
      logger.error('Failed to trigger cron job', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'SchedulePage',
        action: 'triggerJob',
        jobId 
      })
    } finally {
      setRunningJob(null)
    }
  }

  const enabledJobs = jobs.filter(j => j.enabled)
  const disabledJobs = jobs.filter(j => !j.enabled)

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-1">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-terminal-500" />
                Schedule
              </h1>
              <p className="text-sm text-ink-tertiary">Automated tasks and cron jobs</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-secondary">
              <input
                type="checkbox"
                checked={showDisabled}
                onChange={(e) => setShowDisabled(e.target.checked)}
                className="rounded border-border-default"
              />
              Show disabled
            </label>
          </div>
        </div>
      </header>

      {/* Job List */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-terminal-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled jobs</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enabledJobs.map((job) => (
              <div 
                key={job.id}
                className="bg-surface-1 rounded-xl p-4 border border-border-subtle hover:border-border-default transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    job.payload.kind === 'agentTurn' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {job.payload.kind === 'agentTurn' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{job.name || job.id}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                        Enabled
                      </span>
                    </div>
                    
                    <div className="text-sm text-ink-secondary mb-2 line-clamp-1">
                      {job.payload.text || job.payload.message || 'No description'}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-ink-muted">
                      <span className="font-mono">{formatSchedule(job.schedule)}</span>
                      {job.sessionTarget && (
                        <span>→ {job.sessionTarget}</span>
                      )}
                      {job.nextRun && (
                        <span className="text-terminal-400">Next: {formatRelativeTime(job.nextRun)}</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => triggerJob(job.id)}
                    disabled={runningJob === job.id}
                    className="p-2 hover:bg-surface-3 rounded-lg text-terminal-400 hover:text-terminal-300 disabled:opacity-50"
                    title="Run now"
                  >
                    {runningJob === job.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
            
            {showDisabled && disabledJobs.length > 0 && (
              <>
                <div className="text-xs font-medium text-ink-muted uppercase tracking-wider pt-4">
                  Disabled ({disabledJobs.length})
                </div>
                {disabledJobs.map((job) => (
                  <div 
                    key={job.id}
                    className="bg-surface-1 rounded-xl p-4 border border-border-subtle opacity-50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-3 text-ink-muted">
                        <Pause className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-ink-secondary">{job.name || job.id}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-3 text-ink-muted">
                            Disabled
                          </span>
                        </div>
                        
                        <div className="text-sm text-ink-muted line-clamp-1">
                          {job.payload.text || job.payload.message || 'No description'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
