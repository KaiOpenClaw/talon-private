import { useCallback } from 'react'
import { useToast } from '@/components/error-toast'
import { logger } from '@/lib/logger'

interface ApiCallOptions {
  errorMessage?: string
  showToast?: boolean
  retries?: number
  retryDelay?: number
  onError?: (error: Error) => void
}

interface ApiResult<T> {
  data: T | null
  error: Error | null
  success: boolean
}

export function useSafeApiCall() {
  const toast = useToast()

  const safeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: ApiCallOptions = {}
  ): Promise<ApiResult<T>> => {
    const {
      errorMessage = 'Operation failed',
      showToast = true,
      retries = 0,
      retryDelay = 1000,
      onError
    } = options

    let lastError: Error = new Error('Unknown error')

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const data = await apiCall()
        return { data, error: null, success: true }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        logger.error(`API call failed (attempt ${attempt + 1}/${retries + 1})`, {
          error: lastError.message,
          stack: lastError.stack,
          attempt,
          maxAttempts: retries + 1
        })

        if (attempt < retries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }

    // All retries failed
    const finalErrorMessage = `${errorMessage}: ${lastError.message}`
    
    if (showToast) {
      toast.error("Error", finalErrorMessage)
    }

    if (onError) {
      onError(lastError)
    }

    logger.error('API call failed after all retries', {
      error: lastError.message,
      stack: lastError.stack,
      errorMessage,
      retries,
      finalAttempt: true
    })

    return { data: null, error: lastError, success: false }
  }, [toast])

  // Specialized variants
  const safeApiCallWithRetry = useCallback(<T>(
    apiCall: () => Promise<T>,
    errorMessage: string = 'Operation failed',
    retries: number = 2
  ) => {
    return safeApiCall(apiCall, { errorMessage, retries, showToast: true })
  }, [safeApiCall])

  const safeApiCallSilent = useCallback(<T>(
    apiCall: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ) => {
    return safeApiCall(apiCall, { errorMessage, showToast: false })
  }, [safeApiCall])

  return {
    safeApiCall,
    safeApiCallWithRetry,
    safeApiCallSilent
  }
}

// Helper hook for handling component-level errors
export function useComponentError(componentName: string) {
  const toast = useToast()

  const handleError = useCallback((error: Error, context?: string) => {
    const fullContext = context ? `${componentName}.${context}` : componentName
    
    logger.error('Component error', {
      component: fullContext,
      error: error.message,
      stack: error.stack
    })

    toast.error("Something went wrong", `${componentName} encountered an error. Please try again.`)
  }, [componentName, toast])

  const handleAsyncError = useCallback(async (
    asyncOperation: () => Promise<void>,
    context?: string
  ) => {
    try {
      await asyncOperation()
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), context)
    }
  }, [handleError])

  return {
    handleError,
    handleAsyncError
  }
}