'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff, Server, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorContext {
  component?: string
  action?: string
  endpoint?: string
  attempts?: number
  httpStatus?: number
}

interface ErrorStateProps {
  error: Error
  onRetry?: () => void
  onGoHome?: () => void
  context?: ErrorContext
  suggestions?: string[]
  showDetails?: boolean
  variant?: 'card' | 'inline' | 'full'
}

export function ErrorState({
  error,
  onRetry,
  onGoHome,
  context = {},
  suggestions = [],
  showDetails = true,
  variant = 'card'
}: ErrorStateProps) {
  const isNetworkError = error.message.toLowerCase().includes('network') ||
                         error.message.toLowerCase().includes('fetch') ||
                         error.message.toLowerCase().includes('connection')
  
  const isServerError = context.httpStatus && context.httpStatus >= 500
  
  const getErrorIcon = () => {
    if (isNetworkError) return <WifiOff className="h-6 w-6 text-red-500" />
    if (isServerError) return <Server className="h-6 w-6 text-red-500" />
    return <AlertTriangle className="h-6 w-6 text-red-500" />
  }
  
  const getErrorTitle = () => {
    if (isNetworkError) return 'Connection Error'
    if (isServerError) return 'Server Error'
    return 'Something Went Wrong'
  }
  
  const getErrorDescription = () => {
    if (isNetworkError) return 'Unable to connect to the server. Please check your internet connection.'
    if (isServerError) return 'The server is experiencing issues. Please try again later.'
    return error.message || 'An unexpected error occurred.'
  }
  
  const defaultSuggestions = [
    ...(isNetworkError ? [
      'Check your internet connection',
      'Verify OpenClaw Gateway is running'
    ] : []),
    ...(isServerError ? [
      'Try again in a few minutes',
      'Contact support if the problem persists'
    ] : []),
    'Try refreshing the page',
    'Go back to the main dashboard'
  ]
  
  const allSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions
  
  const content = (
    <>
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg">
          {getErrorIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">
            {getErrorTitle()}
          </h3>
          <p className="text-sm text-red-700">
            {getErrorDescription()}
          </p>
          
          {context.component && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              Component: {context.component}
              {context.action && ` • Action: ${context.action}`}
              {context.attempts && context.attempts > 0 && ` • Attempts: ${context.attempts}`}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {onRetry && (
          <Button
            size="sm"
            variant="default"
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
            {context.attempts && context.attempts > 0 && ` (${context.attempts + 1})`}
          </Button>
        )}
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reload Page
        </Button>
        
        {onGoHome ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onGoHome}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        )}
      </div>

      {/* Suggestions */}
      {allSuggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-sm text-red-800 mb-2">Try these steps:</h4>
          <ul className="space-y-1">
            {allSuggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start">
                <span className="text-red-400 mr-2 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Details */}
      {showDetails && (
        <details className="text-xs">
          <summary className="cursor-pointer text-red-600 hover:text-red-800 flex items-center">
            <Bug className="h-3 w-3 mr-1" />
            Show technical details
          </summary>
          <div className="mt-2 p-3 bg-red-50 rounded text-red-800 font-mono">
            <div><strong>Error:</strong> {error.message}</div>
            {error.stack && (
              <div className="mt-1">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap text-xs mt-1">
                  {error.stack.split('\n').slice(0, 5).join('\n')}
                </pre>
              </div>
            )}
            {context.endpoint && (
              <div className="mt-1">
                <strong>Endpoint:</strong> {context.endpoint}
              </div>
            )}
          </div>
        </details>
      )}
    </>
  )
  
  if (variant === 'inline') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        {content}
      </div>
    )
  }
  
  if (variant === 'full') {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-lg p-6 shadow-lg">
          {content}
        </div>
      </div>
    )
  }
  
  // Default card variant
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-red-900 flex items-center space-x-2">
          {getErrorIcon()}
          <span>{getErrorTitle()}</span>
        </CardTitle>
        <CardDescription className="text-red-700">
          {getErrorDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button
                size="sm"
                variant="default"
                onClick={onRetry}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
          </div>

          {/* Context Info */}
          {context.component && (
            <div className="text-xs text-red-600 bg-red-100 px-3 py-2 rounded">
              {context.component}
              {context.action && ` → ${context.action}`}
              {context.attempts && context.attempts > 0 && ` (attempt ${context.attempts})`}
            </div>
          )}

          {/* Suggestions */}
          {allSuggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-red-800 mb-2">Suggestions:</h4>
              <ul className="space-y-1 text-sm text-red-700">
                {allSuggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized error state components
export function NetworkErrorState({ error, onRetry, suggestions }: Omit<ErrorStateProps, 'variant'>) {
  return (
    <ErrorState
      error={error}
      onRetry={onRetry}
      suggestions={suggestions || [
        'Check your internet connection',
        'Verify the server is accessible',
        'Try again in a few seconds'
      ]}
      variant="inline"
    />
  )
}

export function ServerErrorState({ error, onRetry, context }: Omit<ErrorStateProps, 'variant'>) {
  return (
    <ErrorState
      error={error}
      onRetry={onRetry}
      context={context}
      suggestions={[
        'The server is temporarily unavailable',
        'Try again in a few minutes',
        'Contact support if this persists'
      ]}
      variant="card"
    />
  )
}

export function ComponentErrorState({ error, onRetry, context }: Omit<ErrorStateProps, 'variant'>) {
  return (
    <ErrorState
      error={error}
      onRetry={onRetry}
      context={context}
      suggestions={[
        'This component failed to load',
        'Try refreshing or go back to dashboard',
        'Report this issue if it continues'
      ]}
      variant="inline"
      showDetails={false}
    />
  )
}