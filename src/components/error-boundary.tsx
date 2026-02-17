'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
  componentName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showStack: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, showStack: false }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log to console for debugging
    console.error('ErrorBoundary caught error:', error)
    console.error('Component stack:', errorInfo.componentStack)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Could send to error tracking service here
    // sendToErrorTracking(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showStack: false })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  toggleStack = () => {
    this.setState(prev => ({ showStack: !prev.showStack }))
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, showStack } = this.state
      const { showDetails = true, componentName } = this.props

      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-zinc-900 border border-red-500/30 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
                {componentName && (
                  <p className="text-sm text-zinc-400">in {componentName}</p>
                )}
              </div>
            </div>

            {showDetails && error && (
              <div className="mb-4">
                <p className="text-sm text-red-300 bg-red-500/10 px-3 py-2 rounded font-mono">
                  {error.message || 'Unknown error'}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {showDetails && errorInfo && (
              <div>
                <button
                  onClick={this.toggleStack}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  {showStack ? 'Hide' : 'Show'} technical details
                </button>
                
                {showStack && (
                  <pre className="mt-3 p-3 bg-zinc-950 rounded text-xs text-zinc-400 overflow-auto max-h-40 font-mono">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Smaller inline error boundary for widgets
interface InlineErrorProps {
  children: ReactNode
  name?: string
}

export function InlineErrorBoundary({ children, name }: InlineErrorProps) {
  return (
    <ErrorBoundary
      componentName={name}
      showDetails={false}
      fallback={
        <div className="p-4 bg-zinc-900/50 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{name ? `${name} failed to load` : 'Component error'}</span>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Hook for async error handling
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`[${context || 'Error'}]:`, error)
    // Could integrate with global error state or notification system
  }, [])

  return { handleError }
}
