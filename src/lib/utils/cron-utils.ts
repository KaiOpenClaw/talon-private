/**
 * Utility functions for Cron job formatting and processing
 * Extracted from schedule/enhanced/page.tsx for better maintainability
 */

import { CronJob } from '@/lib/types/cron'

export function formatSchedule(schedule: CronJob['schedule']): string {
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

export function formatRelativeTime(iso?: string): string {
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

export function formatDuration(ms?: number): string {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function getJobStatusColor(job: CronJob): string {
  if (!job.enabled) return 'text-ink-muted'
  if (job.status === 'error') return 'text-red-400'
  if (job.status === 'running') return 'text-blue-400'
  return 'text-green-400'
}

export function getJobStatusIcon(job: CronJob): 'success' | 'error' | 'running' | 'disabled' {
  if (!job.enabled) return 'disabled'
  if (job.status === 'error') return 'error'
  if (job.status === 'running') return 'running'
  return 'success'
}

export function parseCronExpression(expr: string): { valid: boolean; error?: string; nextRuns?: string[] } {
  // Basic cron validation - in production, use a proper cron parser
  const parts = expr.trim().split(/\s+/)
  
  if (parts.length < 5 || parts.length > 6) {
    return { valid: false, error: 'Cron expression must have 5 or 6 parts' }
  }
  
  // Very basic validation - would use a proper library in production
  const cronRegex = /^([0-9\-\*\/,]+)\s+([0-9\-\*\/,]+)\s+([0-9\-\*\/,]+)\s+([0-9\-\*\/,]+)\s+([0-9\-\*\/,]+)(\s+([0-9\-\*\/,]+))?$/
  
  if (!cronRegex.test(expr)) {
    return { valid: false, error: 'Invalid cron expression format' }
  }
  
  return { valid: true, nextRuns: [] }
}

export function calculateNextRuns(schedule: CronJob['schedule'], count: number = 3): Date[] {
  const now = new Date()
  const results: Date[] = []
  
  if (schedule.kind === 'every' && schedule.everyMs) {
    let next = new Date(now.getTime() + schedule.everyMs)
    for (let i = 0; i < count; i++) {
      results.push(new Date(next))
      next = new Date(next.getTime() + schedule.everyMs)
    }
  } else if (schedule.kind === 'at' && schedule.at) {
    const scheduledDate = new Date(schedule.at)
    if (scheduledDate > now) {
      results.push(scheduledDate)
    }
  }
  // TODO: Implement proper cron parsing for 'cron' type
  
  return results
}

export function isJobOverdue(job: CronJob): boolean {
  if (!job.nextRun || !job.enabled) return false
  return new Date(job.nextRun) < new Date()
}

export function getJobPriority(job: CronJob): 'high' | 'medium' | 'low' {
  if (job.errorMessage || isJobOverdue(job)) return 'high'
  if (job.schedule.kind === 'at') return 'medium'
  return 'low'
}