import React from 'react'
import { AlertTriangle, RefreshCw, WifiOff, ServerCrash, Bug, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorStateProps {
  error?: Error | string
  title?: string
  description?: string
  onRetry?: () => void
  onReset?: () => void
  showDetails?: boolean
  suggestions?: string[]
  type?: 'network' | 'server' | 'component' | 'generic'
  compact?: boolean
}

export function ErrorState({
  error,
  title,
  description,
  onRetry,
  onReset,
  showDetails = false,
  suggestions = [],
  type = 'generic',
  compact = false
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unknown error occurred'

  // Determine icon and styling based on error type
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return WifiOff
      case 'server':
        return ServerCrash
      case 'component':
        return Bug
      default:
        return AlertTriangle
    }
  }

  const getErrorTitle = () => {
    if (title) return title
    
    switch (type) {
      case 'network':
        return 'Connection Error'
      case 'server':
        return 'Server Error'
      case 'component':
        return 'Component Error'
      default:
        return 'Something went wrong'
    }
  }

  const getErrorDescription = () => {
    if (description) return description
    
    switch (type) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection.'
      case 'server':
        return 'The server encountered an error. Please try again later.'
      case 'component':
        return 'This component failed to load. Try refreshing or contact support.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  const getSuggestions = () => {
    if (suggestions.length > 0) return suggestions
    
    switch (type) {
      case 'network':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact your network administrator if the problem persists'
        ]
      case 'server':
        return [
          'Try again in a few minutes',
          'Check the system status page',
          'Contact support if the problem continues'
        ]
      case 'component':
        return [
          'Try refreshing the page',
          'Clear your browser cache',
          'Report this issue if it continues'
        ]
      default:
        return [
          'Try refreshing the page',
          'Contact support if the problem persists'
        ]
    }
  }

  const Icon = getErrorIcon()

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <Icon className="w-5 h-5 text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-300 truncate">
            {getErrorTitle()}
          </p>
          {showDetails && (
            <p className="text-xs text-red-400 truncate mt-1">
              {errorMessage}
            </p>
          )}
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="shrink-0 border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="border-red-500/30 bg-red-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Icon className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <CardTitle className="text-red-300">{getErrorTitle()}</CardTitle>
            <CardDescription className="text-red-400/80">
              {getErrorDescription()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showDetails && errorMessage && (
          <div className="p-3 bg-red-500/10 rounded border border-red-500/20">
            <p className="text-sm font-mono text-red-300 break-words">
              {errorMessage}
            </p>
          </div>
        )}

        {getSuggestions().length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-yellow-300">
              <Lightbulb className="w-4 h-4" />
              Suggestions
            </div>
            <ul className="space-y-1">
              {getSuggestions().map((suggestion, index) => (
                <li key={index} className="text-sm text-zinc-400 flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          {onReset && (
            <Button
              onClick={onReset}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-zinc-300"
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized error states for common scenarios
export function NetworkErrorState(props: Omit<ErrorStateProps, 'type'>) {
  return <ErrorState {...props} type="network" />
}

export function ServerErrorState(props: Omit<ErrorStateProps, 'type'>) {
  return <ErrorState {...props} type="server" />
}

export function ComponentErrorState(props: Omit<ErrorStateProps, 'type'>) {
  return <ErrorState {...props} type="component" />
}