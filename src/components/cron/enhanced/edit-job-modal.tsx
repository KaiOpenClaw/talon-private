/**
 * Edit Job Modal Component
 * Modal for editing existing cron jobs
 */

import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { CronJob } from '@/lib/types/cron'

interface EditJobModalProps {
  isOpen: boolean
  job: CronJob | null
  onClose: () => void
  onSubmit: (jobId: string, updates: Partial<CronJob>) => Promise<void>
}

export function EditJobModal({ isOpen, job, onClose, onSubmit }: EditJobModalProps) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (job) {
      setName(job.name || '')
      setMessage(job.payload.kind === 'systemEvent' ? job.payload.text || '' : job.payload.message || '')
    }
  }, [job])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) return

    setIsSubmitting(true)
    try {
      const updates: Partial<CronJob> = {
        name,
        payload: {
          ...job.payload,
          [job.payload.kind === 'systemEvent' ? 'text' : 'message']: message
        }
      }
      await onSubmit(job.id, updates)
    } catch (error) {
      // Error handling will be implemented
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-1 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-ink-base">Edit Job</h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-base"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-base mb-2">
              Job Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-2 border border-surface-2 rounded-md text-ink-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter job name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-base mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-surface-2 border border-surface-2 rounded-md text-ink-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter job message"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-muted hover:text-ink-base transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}