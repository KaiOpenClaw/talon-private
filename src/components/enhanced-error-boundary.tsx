'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { logger } from '@/lib/logger'
import type { ErrorInfo } from '@/lib/types'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  isRetrying: boolean
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  /** Component name for error logging */
  component?: string
  /** Maximum number of automatic retries before showing error UI */
  maxAutoRetries?: number
  /** Whether to show detailed error information (dev mode) */
  showErrorDetails?: boolean
  /** Custom error message */
  errorMessage?: string
  /** Whether this boundary should catch all errors or just specific types */
  catchAllErrors?: boolean
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo | null) => void
}

/**
 * Enhanced Error Boundary with retry mechanisms and better user experience
 * Provides graceful error handling with recovery options
 */
export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { component = 'UnknownComponent', maxAutoRetries = 2, onError } = this.props
    
    // Log error with context
    logger.error('Component error boundary caught error', {
      component: `ErrorBoundary-${component}`,
      action: 'componentError',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    })

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo)
      } catch (handlerError) {
        logger.error('Error handler threw error', {
          component: `ErrorBoundary-${component}`,
          action: 'errorHandlerFailed',
          error: handlerError instanceof Error ? handlerError.message : String(handlerError)
        })
      }
    }

    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1
    })

    // Auto-retry if we haven't exceeded max retries
    if (this.state.retryCount < maxAutoRetries) {
      this.scheduleAutoRetry()
    }
  }

  scheduleAutoRetry = () => {
    this.setState({ isRetrying: true })
    
    // Exponential backoff: 1s, 2s, 4s...
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 5000)
    
    this.retryTimeout = setTimeout(() => {
      this.handleRetry(true)
    }, delay)
  }

  handleRetry = (isAutoRetry = false) => {
    const { component = 'UnknownComponent' } = this.props
    
    logger.info('Error boundary retry attempted', {
      component: `ErrorBoundary-${component}`,
      action: isAutoRetry ? 'autoRetry' : 'manualRetry',
      retryCount: this.state.retryCount
    })

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false
    })

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
      this.retryTimeout = null
    }
  }

  handleReload = () => {
    const { component = 'UnknownComponent' } = this.props
    
    logger.info('Error boundary page reload triggered', {
      component: `ErrorBoundary-${component}`,
      action: 'pageReload'
    })

    window.location.reload()
  }

  handleGoHome = () => {
    const { component = 'UnknownComponent' } = this.props
    
    logger.info('Error boundary navigation to home', {
      component: `ErrorBoundary-${component}`,
      action: 'navigateHome'
    })

    window.location.href = '/'
  }

  handleReportError = () => {
    const { error, errorInfo } = this.state
    const { component = 'UnknownComponent' } = this.props
    
    // Create error report data
    const errorReport = {
      timestamp: new Date().toISOString(),
      component,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Copy to clipboard for now (could be enhanced to send to error reporting service)
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      // Could show toast notification here
      logger.info('Error report copied to clipboard', {
        component: `ErrorBoundary-${component}`,
        action: 'errorReportCopied'
      })
    })
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    const { 
      children, 
      fallback, 
      component = 'UnknownComponent',
      errorMessage = 'Something went wrong',
      showErrorDetails = process.env.NODE_ENV === 'development' 
    } = this.props
    
    const { hasError, error, errorInfo, isRetrying, retryCount } = this.state

    if (hasError) {
      // Return custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Auto-retry UI
      if (isRetrying) {
        return (
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 animate-spin text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Recovering...</h3>
                <p className="text-sm text-yellow-600">
                  Attempting to recover from error (attempt {retryCount})
                </p>
              </div>
            </div>
          </Card>
        )
      }

      // Error UI with recovery options
      return (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-800 mb-2">
                {errorMessage}
              </h3>
              
              <p className="text-sm text-red-600 mb-4">
                The <strong>{component}</strong> component encountered an error. 
                You can try the following options:
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  onClick={() => this.handleRetry()}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>

                <Button
                  onClick={this.handleReportError}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Copy Error Details
                </Button>
              </div>

              {showErrorDetails && error && (
                <details className="mt-4">
                  <summary className="text-sm text-red-700 cursor-pointer hover:text-red-800">
                    Show technical details
                  </summary>
                  <div className="mt-2 p-3 bg-red-100 rounded border text-xs font-mono text-red-800 overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </Card>
      )
    }

    return children
  }
}

/**
 * Lightweight inline error boundary for specific components
 */
export function InlineErrorBoundary({ 
  children, 
  component, 
  fallback 
}: { 
  children: ReactNode
  component?: string
  fallback?: ReactNode 
}) {
  return (
    <EnhancedErrorBoundary
      component={component}
      maxAutoRetries={1}
      fallback={fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">
            Component temporarily unavailable. 
            <button 
              onClick={() => window.location.reload()} 
              className="ml-1 underline hover:no-underline"
            >
              Try refreshing the page.
            </button>
          </p>
        </div>
      )}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}