import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

export interface ToastActionElement {
  altText?: string
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove after duration (default 5 seconds)
    const duration = toast.duration ?? 5000
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
    
    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id)),
      update: (updates: Partial<Toast>) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
      }
    }
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    setToasts(prev => toastId ? prev.filter(t => t.id !== toastId) : [])
  }, [])

  return {
    toast,
    dismiss,
    toasts
  }
}