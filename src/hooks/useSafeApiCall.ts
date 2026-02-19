import React, { useCallback, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'

export interface SafeApiOptions {
  /** Custom error message to show to user */
  errorMessage?: string
  /** Whether to show toast notification on error */
  showToast?: boolean
  /** Whether to log error details */
  logError?: boolean
  /** Custom retry delay in milliseconds */
  retryDelay?: number
  /** Maximum number of automatic retries */
  maxRetries?: number
  /** Component name for logging context */
  component?: string
}

export interface SafeApiResult<T> {
  data: T | null
  error: Error | null
  isSuccess: boolean
  retry: () => Promise<SafeApiResult<T>>
}

/**
 * Custom hook for safe API calls with consistent error handling
 * Provides standardized error handling, logging, and user feedback
 */
export function useSafeApiCall() {
  const { toast } = useToast()

  const safeApiCall = useCallback(<T>(
    apiCall: () => Promise<T>,
    options: SafeApiOptions = {}
  ): Promise<SafeApiResult<T>> => {
    const {
      errorMessage = 'Operation failed',
      showToast = true,
      logError = true,
      component = 'UnknownComponent'
    } = options

    return new Promise<SafeApiResult<T>>((resolve) => {
      const executeCall = async (): Promise<SafeApiResult<T>> => {
        try {
          const data = await apiCall()
          
          if (logError) {
            logger.info('API call successful', {
              component,
              action: 'apiCall',
              operation: 'success'
            })
          }

          return {
            data,
            error: null,
            isSuccess: true,
            retry: () => executeCall()
          }
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error))
          
          if (logError) {
            logger.error('API call failed', {
              component,
              action: 'apiCall',
              operation: 'failed',
              error: errorObj.message,
              stack: errorObj.stack
            })
          }

          if (showToast) {
            toast({
              title: 'Error',
              description: `${errorMessage}: ${errorObj.message}`,
              variant: 'destructive',
            })
          }

          return {
            data: null,
            error: errorObj,
            isSuccess: false,
            retry: () => executeCall()
          }
        }
      }

      resolve(executeCall())
    })
  }, [toast])

  return safeApiCall
}

/**
 * Hook for safe API calls with built-in retry mechanism
 */
export function useSafeApiCallWithRetry() {
  const safeApiCall = useSafeApiCall()

  const safeApiCallWithRetry = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: SafeApiOptions & { maxRetries?: number; retryDelay?: number } = {}
  ): Promise<SafeApiResult<T>> => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      ...safeOptions
    } = options

    let lastResult: SafeApiResult<T> | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      lastResult = await safeApiCall(apiCall, {
        ...safeOptions,
        showToast: attempt === maxRetries, // Only show toast on final attempt
        component: `${safeOptions.component} (attempt ${attempt + 1}/${maxRetries + 1})`
      })

      if (lastResult.isSuccess) {
        return lastResult
      }

      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt))) // Exponential backoff
      }
    }

    return lastResult!
  }, [safeApiCall])

  return safeApiCallWithRetry
}

/**
 * Utility type for components using safe API calls
 */
export type ApiState<T> = {
  data: T | null
  loading: boolean
  error: Error | null
  retry: () => void
}

/**
 * Hook that combines safe API calls with React state management
 */
export function useApiState<T>(
  apiCall: () => Promise<T>,
  options: SafeApiOptions = {}
): ApiState<T> & { refresh: () => Promise<void> } {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: false,
    error: null
  })

  const safeApiCall = useSafeApiCall()

  const executeCall = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await safeApiCall(apiCall, options)
    
    setState({
      data: result.data,
      loading: false,
      error: result.error
    })
  }, [apiCall, safeApiCall, options])

  const retry = useCallback(() => {
    executeCall()
  }, [executeCall])

  return {
    ...state,
    retry,
    refresh: executeCall
  }
}