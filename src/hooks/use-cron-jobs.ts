/**
 * Custom hook for managing cron job state and API operations
 * Extracted from schedule/enhanced/page.tsx for better maintainability
 */

import { useState, useEffect } from 'react'
import { CronJob, JobRun, CreateJobData, CronValidation, CronStats } from '@/lib/types/cron'
import { logger } from '@/lib/logger'

export function useCronJobs(showDisabled: boolean = false) {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)
  const [runningJob, setRunningJob] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [showDisabled])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/cron?includeDisabled=${showDisabled}`)
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (e) {
      logger.error('Failed to load cron jobs', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'useCronJobs',
        action: 'fetchJobs',
        showDisabled 
      })
    } finally {
      setLoading(false)
    }
  }

  const runJob = async (jobId: string): Promise<void> => {
    try {
      setRunningJob(jobId)
      const res = await fetch(`/api/cron/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      })
      
      if (!res.ok) {
        throw new Error(`Failed to run job: ${res.statusText}`)
      }
      
      // Refresh jobs to get updated status
      setTimeout(fetchJobs, 1000)
    } catch (e) {
      logger.error('Failed to run cron job', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'useCronJobs',
        action: 'runJob',
        jobId 
      })
      throw e
    } finally {
      setRunningJob(null)
    }
  }

  const toggleJob = async (jobId: string, enabled: boolean): Promise<void> => {
    try {
      const res = await fetch(`/api/cron/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      
      if (!res.ok) {
        throw new Error(`Failed to ${enabled ? 'enable' : 'disable'} job: ${res.statusText}`)
      }
      
      fetchJobs()
    } catch (e) {
      logger.error('Failed to toggle cron job', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'useCronJobs',
        action: 'toggleJob',
        jobId,
        enabled
      })
      throw e
    }
  }

  const deleteJob = async (jobId: string): Promise<void> => {
    try {
      const res = await fetch(`/api/cron/jobs/${jobId}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        throw new Error(`Failed to delete job: ${res.statusText}`)
      }
      
      fetchJobs()
    } catch (e) {
      logger.error('Failed to delete cron job', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'useCronJobs',
        action: 'deleteJob',
        jobId
      })
      throw e
    }
  }

  const createJob = async (jobData: CreateJobData): Promise<void> => {
    try {
      const schedule = buildScheduleFromData(jobData)
      const payload = buildPayloadFromData(jobData)
      
      const res = await fetch('/api/cron/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: jobData.name,
          schedule,
          payload,
          sessionTarget: jobData.sessionTarget,
          enabled: jobData.enabled,
          notify: jobData.notify
        })
      })
      
      if (!res.ok) {
        throw new Error(`Failed to create job: ${res.statusText}`)
      }
      
      fetchJobs()
    } catch (e) {
      logger.error('Failed to create cron job', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'useCronJobs',
        action: 'createJob',
        jobData
      })
      throw e
    }
  }

  const updateJob = async (jobId: string, updates: Partial<CronJob>): Promise<void> => {
    try {
      const res = await fetch(`/api/cron/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) {
        throw new Error(`Failed to update job: ${res.statusText}`)
      }
      
      fetchJobs()
    } catch (e) {
      logger.error('Failed to update cron job', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'useCronJobs',
        action: 'updateJob',
        jobId,
        updates
      })
      throw e
    }
  }

  return {
    jobs,
    loading,
    runningJob,
    fetchJobs,
    runJob,
    toggleJob,
    deleteJob,
    createJob,
    updateJob
  }
}

export function useJobRuns(jobId: string | null) {
  const [runs, setRuns] = useState<JobRun[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRuns = async (id: string) => {
    if (!id) return
    
    try {
      setLoading(true)
      const res = await fetch(`/api/cron/jobs/${id}/runs`)
      const data = await res.json()
      setRuns(data.runs || [])
    } catch (e) {
      logger.error('Failed to fetch job runs', { 
        error: e instanceof Error ? e.message : String(e),
        component: 'useJobRuns',
        action: 'fetchRuns',
        jobId: id
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (jobId) {
      fetchRuns(jobId)
    } else {
      setRuns([])
    }
  }, [jobId])

  return { runs, loading, fetchRuns }
}

export function useCronValidation() {
  const [validating, setValidating] = useState(false)

  const validateCronExpression = async (expr: string): Promise<CronValidation> => {
    if (!expr) return { valid: false, error: 'Expression cannot be empty' }
    
    try {
      setValidating(true)
      
      // Basic client-side validation
      const parts = expr.trim().split(/\s+/)
      if (parts.length < 5 || parts.length > 6) {
        return { valid: false, error: 'Cron expression must have 5 or 6 parts' }
      }
      
      // In production, you'd call a server endpoint for proper validation
      return { valid: true, nextRuns: [] }
    } finally {
      setValidating(false)
    }
  }

  return { validateCronExpression, validating }
}

function buildScheduleFromData(data: CreateJobData): CronJob['schedule'] {
  switch (data.scheduleType) {
    case 'cron':
      return { kind: 'cron', expr: data.cronExpression }
    case 'every':
      return { kind: 'every', everyMs: data.intervalMs }
    case 'at':
      return { kind: 'at', at: data.scheduledAt }
    default:
      throw new Error(`Unknown schedule type: ${data.scheduleType}`)
  }
}

function buildPayloadFromData(data: CreateJobData): CronJob['payload'] {
  return {
    kind: data.payloadType,
    [data.payloadType === 'systemEvent' ? 'text' : 'message']: data.message,
    timeoutSeconds: 30
  }
}