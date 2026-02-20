'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Clock, ChevronLeft, Play, Pause, Calendar, Plus, Edit3, Trash2, History,
  Loader2, CheckCircle, AlertCircle, Zap, BarChart3, Settings, Eye, X,
  Timer, Activity, TrendingUp, AlertTriangle
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
    tz?: string
  }
  payload: {
    kind: 'systemEvent' | 'agentTurn'
    text?: string
    message?: string
    model?: string
    timeoutSeconds?: number
  }
  sessionTarget?: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
  status?: string
  agent?: string
  errorMessage?: string
}

interface JobRun {
  id: string
  jobId: string
  startTime: string
  endTime?: string
  status: 'success' | 'error' | 'running'
  exitCode?: number
  duration?: number
  output?: string
  error?: string
}

interface CreateJobData {
  name: string
  scheduleType: 'cron' | 'every' | 'at'
  cronExpression: string
  intervalMs: number
  scheduledAt: string
  payloadType: 'systemEvent' | 'agentTurn'
  message: string
  sessionTarget: 'main' | 'isolated'
  enabled: boolean
  notify: boolean
}

const INITIAL_JOB_DATA: CreateJobData = {
  name: '',
  scheduleType: 'every',
  cronExpression: '0 0 * * *',
  intervalMs: 3600000, // 1 hour
  scheduledAt: '',
  payloadType: 'agentTurn',
  message: '',
  sessionTarget: 'isolated',
  enabled: true,
  notify: false
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

function formatDuration(ms?: number): string {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export default function EnhancedSchedulePage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [showDisabled, setShowDisabled] = useState(false)
  const [runningJob, setRunningJob] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [jobRuns, setJobRuns] = useState<JobRun[]>([])
  const [createJobData, setCreateJobData] = useState<CreateJobData>(INITIAL_JOB_DATA)
  const [validatingCron, setValidatingCron] = useState(false)
  const [cronValidation, setCronValidation] = useState<{valid: boolean; error?: string; nextRuns?: string[]}>({valid: true})

  useEffect(() => {
    fetchJobs()
  }, [showDisabled])

  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/cron?includeDisabled=${showDisabled}`)
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (e) {
      logger.error('Failed to load cron jobs', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'EnhancedSchedulePage',
        action: 'fetchJobs',
        showDisabled 
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchJobRuns = async (jobId: string) => {
    try {
      const res = await fetch(`/api/cron/jobs/${jobId}/runs?limit=20`)
      const data = await res.json()
      setJobRuns(data.runs || [])
    } catch (e) {
      logger.error('Failed to load job runs', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'EnhancedSchedulePage',
        action: 'fetchJobRuns',
        jobId 
      })
    }
  }

  const triggerJob = async (jobId: string) => {
    setRunningJob(jobId)
    try {
      await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', jobId }),
      })
      await fetchJobs()
    } catch (e) {
      logger.error('Failed to trigger cron job', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'EnhancedSchedulePage',
        action: 'triggerJob',
        jobId 
      })
    } finally {
      setRunningJob(null)
    }
  }

  const toggleJob = async (jobId: string, enabled: boolean) => {
    try {
      await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', jobId, enabled }),
      })
      await fetchJobs()
    } catch (e) {
      logger.error('Failed to toggle job', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'EnhancedSchedulePage',
        action: 'toggleJob',
        jobId,
        enabled 
      })
    }
  }

  const validateCronExpression = async (expr: string) => {
    if (!expr.trim()) {
      setCronValidation({valid: false, error: 'Cron expression is required'})
      return
    }

    setValidatingCron(true)
    try {
      const res = await fetch(`/api/cron/jobs?action=validate-cron&expr=${encodeURIComponent(expr)}`)
      const validation = await res.json()
      setCronValidation(validation)
    } catch (e) {
      setCronValidation({valid: false, error: 'Failed to validate expression'})
    } finally {
      setValidatingCron(false)
    }
  }

  const createJob = async () => {
    try {
      const jobData = {
        name: createJobData.name,
        schedule: {
          kind: createJobData.scheduleType,
          ...(createJobData.scheduleType === 'cron' ? { expr: createJobData.cronExpression } : {}),
          ...(createJobData.scheduleType === 'every' ? { everyMs: createJobData.intervalMs } : {}),
          ...(createJobData.scheduleType === 'at' ? { at: createJobData.scheduledAt } : {}),
        },
        payload: {
          kind: createJobData.payloadType,
          ...(createJobData.payloadType === 'systemEvent' ? { text: createJobData.message } : { message: createJobData.message })
        },
        sessionTarget: createJobData.sessionTarget,
        enabled: createJobData.enabled,
        notify: createJobData.notify
      }

      const res = await fetch('/api/cron/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create job')
      }

      await fetchJobs()
      setShowCreateModal(false)
      setCreateJobData(INITIAL_JOB_DATA)
    } catch (e) {
      alert(`Failed to create job: ${e}`)
    }
  }

  const showJobHistory = (job: CronJob) => {
    setSelectedJob(job)
    setShowHistoryModal(true)
    fetchJobRuns(job.id)
  }

  const enabledJobs = jobs.filter(j => j.enabled)
  const disabledJobs = jobs.filter(j => !j.enabled)
  const totalJobs = jobs.length
  const successRate = jobs.length > 0 ? ((jobs.filter(j => j.status !== 'error').length / jobs.length) * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-1">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-terminal-500" />
                Enhanced Cron Dashboard
              </h1>
              <p className="text-sm text-ink-tertiary">Advanced job management and monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-ink-secondary">
                <input
                  type="checkbox"
                  checked={showDisabled}
                  onChange={(e) => setShowDisabled(e.target.checked)}
                  className="rounded border-border-default"
                />
                Show disabled
              </label>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-terminal-500 hover:bg-terminal-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Job
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-surface-2 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Activity className="w-4 h-4" />
                Total Jobs
              </div>
              <div className="text-lg font-semibold text-ink-base">{totalJobs}</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Enabled
              </div>
              <div className="text-lg font-semibold text-ink-base">{enabledJobs.length}</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <TrendingUp className="w-4 h-4 text-terminal-400" />
                Success Rate
              </div>
              <div className="text-lg font-semibold text-ink-base">{successRate}%</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Errors
              </div>
              <div className="text-lg font-semibold text-ink-base">{jobs.filter(j => j.status === 'error').length}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Job List */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-terminal-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No scheduled jobs</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-terminal-400 hover:text-terminal-300"
            >
              Create your first job
            </button>
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
                    job.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    job.payload.kind === 'agentTurn' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {job.status === 'error' ? <AlertCircle className="w-5 h-5" /> :
                     job.payload.kind === 'agentTurn' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{job.name || job.id}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        job.status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {job.status === 'error' ? 'Error' : 'Enabled'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-ink-secondary mb-2 line-clamp-1">
                      {job.payload.text || job.payload.message || 'No description'}
                    </div>
                    
                    {job.errorMessage && (
                      <div className="text-sm text-red-400 mb-2 line-clamp-1">
                        Error: {job.errorMessage}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-ink-muted">
                      <span className="font-mono">{formatSchedule(job.schedule)}</span>
                      {job.sessionTarget && (
                        <span>→ {job.sessionTarget}</span>
                      )}
                      {job.nextRun && (
                        <span className="text-terminal-400">Next: {formatRelativeTime(job.nextRun)}</span>
                      )}
                      {job.lastRun && (
                        <span>Last: {formatRelativeTime(job.lastRun)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => showJobHistory(job)}
                      className="p-2 hover:bg-surface-3 rounded-lg text-ink-muted hover:text-ink-base"
                      title="View execution history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {setSelectedJob(job); setShowEditModal(true)}}
                      className="p-2 hover:bg-surface-3 rounded-lg text-ink-muted hover:text-ink-base"
                      title="Edit job"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleJob(job.id, !job.enabled)}
                      className="p-2 hover:bg-surface-3 rounded-lg text-yellow-400 hover:text-yellow-300"
                      title={job.enabled ? "Disable job" : "Enable job"}
                    >
                      {job.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
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
                      
                      <button
                        onClick={() => toggleJob(job.id, true)}
                        className="p-2 hover:bg-surface-3 rounded-lg text-green-400 hover:text-green-300"
                        title="Enable job"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-1 rounded-xl border border-border-subtle w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create New Job</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-surface-3 rounded-lg text-ink-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Job Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Job Name</label>
                  <input
                    type="text"
                    value={createJobData.name}
                    onChange={(e) => setCreateJobData({...createJobData, name: e.target.value})}
                    className="w-full p-3 bg-surface-2 border border-border-subtle rounded-lg"
                    placeholder="Enter job name..."
                  />
                </div>

                {/* Schedule Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'every', label: 'Recurring' },
                      { value: 'cron', label: 'Cron Expression' },
                      { value: 'at', label: 'One-time' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setCreateJobData({...createJobData, scheduleType: option.value as any})}
                        className={`p-3 rounded-lg border text-sm ${
                          createJobData.scheduleType === option.value
                            ? 'border-terminal-400 bg-terminal-500/20 text-terminal-400'
                            : 'border-border-subtle bg-surface-2 text-ink-base'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule Configuration */}
                {createJobData.scheduleType === 'cron' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Cron Expression</label>
                    <input
                      type="text"
                      value={createJobData.cronExpression}
                      onChange={(e) => {
                        setCreateJobData({...createJobData, cronExpression: e.target.value})
                        validateCronExpression(e.target.value)
                      }}
                      className={`w-full p-3 font-mono bg-surface-2 border rounded-lg ${
                        cronValidation.valid ? 'border-border-subtle' : 'border-red-400'
                      }`}
                      placeholder="0 0 * * *"
                    />
                    {validatingCron && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-ink-muted">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Validating...
                      </div>
                    )}
                    {!validatingCron && !cronValidation.valid && (
                      <div className="mt-1 text-xs text-red-400">
                        {cronValidation.error}
                      </div>
                    )}
                    {!validatingCron && cronValidation.valid && cronValidation.nextRuns && (
                      <div className="mt-1 text-xs text-green-400">
                        Next runs: {cronValidation.nextRuns.map(r => formatRelativeTime(r)).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {createJobData.scheduleType === 'every' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Interval</label>
                    <select
                      value={createJobData.intervalMs}
                      onChange={(e) => setCreateJobData({...createJobData, intervalMs: parseInt(e.target.value)})}
                      className="w-full p-3 bg-surface-2 border border-border-subtle rounded-lg"
                    >
                      <option value={300000}>5 minutes</option>
                      <option value={900000}>15 minutes</option>
                      <option value={1800000}>30 minutes</option>
                      <option value={3600000}>1 hour</option>
                      <option value={21600000}>6 hours</option>
                      <option value={86400000}>1 day</option>
                      <option value={604800000}>1 week</option>
                    </select>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={createJobData.message}
                    onChange={(e) => setCreateJobData({...createJobData, message: e.target.value})}
                    className="w-full p-3 bg-surface-2 border border-border-subtle rounded-lg"
                    rows={3}
                    placeholder="Enter the message or command..."
                  />
                </div>

                {/* Session Target */}
                <div>
                  <label className="block text-sm font-medium mb-2">Session Target</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'isolated', label: 'Isolated (Agent Turn)' },
                      { value: 'main', label: 'Main (System Event)' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setCreateJobData({
                          ...createJobData, 
                          sessionTarget: option.value as any,
                          payloadType: option.value === 'isolated' ? 'agentTurn' : 'systemEvent'
                        })}
                        className={`p-3 rounded-lg border text-sm ${
                          createJobData.sessionTarget === option.value
                            ? 'border-terminal-400 bg-terminal-500/20 text-terminal-400'
                            : 'border-border-subtle bg-surface-2 text-ink-base'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={createJobData.enabled}
                      onChange={(e) => setCreateJobData({...createJobData, enabled: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={createJobData.notify}
                      onChange={(e) => setCreateJobData({...createJobData, notify: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Send notifications</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-ink-muted hover:text-ink-base"
                >
                  Cancel
                </button>
                <button
                  onClick={createJob}
                  disabled={!createJobData.name || !createJobData.message || (createJobData.scheduleType === 'cron' && !cronValidation.valid)}
                  className="px-4 py-2 bg-terminal-500 hover:bg-terminal-600 text-white rounded-lg disabled:opacity-50"
                >
                  Create Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job History Modal */}
      {showHistoryModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-1 rounded-xl border border-border-subtle w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Execution History</h2>
                  <p className="text-sm text-ink-muted">{selectedJob.name || selectedJob.id}</p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-surface-3 rounded-lg text-ink-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {jobRuns.length === 0 ? (
                <div className="p-8 text-center text-ink-muted">
                  <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No execution history available</p>
                </div>
              ) : (
                <div className="space-y-3 p-6">
                  {jobRuns.map((run) => (
                    <div key={run.id} className="bg-surface-2 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {run.status === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : run.status === 'error' ? (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            )}
                            <span className={`text-sm font-medium ${
                              run.status === 'success' ? 'text-green-400' :
                              run.status === 'error' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                              {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                            </span>
                            <span className="text-xs text-ink-muted">
                              {new Date(run.startTime).toLocaleString()}
                            </span>
                          </div>
                          
                          {run.output && (
                            <div className="text-sm text-ink-base mb-2">{run.output}</div>
                          )}
                          
                          {run.error && (
                            <div className="text-sm text-red-400 mb-2">{run.error}</div>
                          )}
                        </div>
                        
                        <div className="text-right text-xs text-ink-muted">
                          <div>Duration: {formatDuration(run.duration)}</div>
                          {run.exitCode !== undefined && (
                            <div>Exit: {run.exitCode}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}