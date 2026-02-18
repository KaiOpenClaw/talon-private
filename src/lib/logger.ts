/**
 * Structured Logging System for Talon
 * Replaces console.* statements with proper logging
 * 
 * Features:
 * - Environment-aware (dev vs production)
 * - Structured data with metadata
 * - Context tracking for debugging
 * - Production-ready error tracking integration
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  meta?: Record<string, unknown>
  context?: string
  timestamp: string
  userAgent?: string
  sessionId?: string
}

export interface LoggerConfig {
  isDev: boolean
  enableConsole: boolean
  enableRemote: boolean
  minLevel: LogLevel
}

class TalonLogger {
  private config: LoggerConfig
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      isDev: process.env.NODE_ENV === 'development',
      enableConsole: true,
      enableRemote: false, // TODO: Integrate with Sentry/LogRocket
      minLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      ...config
    }
  }

  /**
   * Debug logging - only in development
   */
  debug(message: string, meta?: Record<string, unknown>, context?: string) {
    this.log('debug', message, meta, context)
  }

  /**
   * Info logging - general application flow
   */
  info(message: string, meta?: Record<string, unknown>, context?: string) {
    this.log('info', message, meta, context)
  }

  /**
   * Warning logging - recoverable issues
   */
  warn(message: string, meta?: Record<string, unknown>, context?: string) {
    this.log('warn', message, meta, context)
  }

  /**
   * Error logging - serious issues that need attention
   */
  error(message: string, meta?: Record<string, unknown>, context?: string) {
    this.log('error', message, meta, context)
  }

  /**
   * API logging - specifically for API calls and responses
   */
  api(
    method: string, 
    endpoint: string, 
    status: number, 
    duration?: number, 
    context?: string
  ) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    this.log(level, `API ${method} ${endpoint}`, {
      method,
      endpoint,
      status,
      duration,
      success: status < 400
    }, context || 'API')
  }

  /**
   * Component logging - for React component lifecycle and errors
   */
  component(
    componentName: string,
    action: string,
    meta?: Record<string, unknown>,
    level: LogLevel = 'debug'
  ) {
    this.log(level, `${componentName}: ${action}`, meta, 'Component')
  }

  /**
   * WebSocket logging - for real-time connection events
   */
  ws(event: string, meta?: Record<string, unknown>) {
    this.log('debug', `WebSocket: ${event}`, meta, 'WebSocket')
  }

  private log(
    level: LogLevel, 
    message: string, 
    meta?: Record<string, unknown>, 
    context?: string
  ) {
    // Check if we should log based on minimum level
    if (this.logLevels[level] < this.logLevels[this.config.minLevel]) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      meta: this.sanitizeMeta(meta),
      context,
      timestamp: new Date().toISOString(),
      // Add browser context if available
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    }

    // Console logging (development and enabled production)
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Remote logging (production error tracking)
    if (this.config.enableRemote && level === 'error') {
      this.logToRemote(entry)
    }
  }

  private logToConsole(entry: LogEntry) {
    const { level, message, meta, context, timestamp } = entry
    const prefix = context ? `[${context}]` : ''
    const metaStr = meta ? JSON.stringify(meta, null, 2) : ''
    
    if (this.config.isDev) {
      // Rich development logging
      const style = this.getConsoleStyle(level)
      console.group(`%c${level.toUpperCase()} ${prefix} ${message}`, style)
      console.log(`⏰ ${timestamp}`)
      if (meta && Object.keys(meta).length > 0) {
        console.log('📋 Metadata:', meta)
      }
      console.groupEnd()
    } else {
      // Simple production logging
      const consoleMethod = level === 'debug' ? 'log' : level
      console[consoleMethod](`[${timestamp}] ${level.toUpperCase()} ${prefix} ${message}`, metaStr)
    }
  }

  private logToRemote(entry: LogEntry) {
    // TODO: Integrate with error tracking service
    // Examples: Sentry, LogRocket, DataDog, Custom API
    if (typeof window !== 'undefined') {
      // Browser environment - could send to analytics
      // Example: window.gtag?.('event', 'exception', { description: entry.message })
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #666; font-weight: normal;',
      info: 'color: #2196F3; font-weight: bold;',
      warn: 'color: #FF9800; font-weight: bold;',
      error: 'color: #F44336; font-weight: bold;'
    }
    return styles[level]
  }

  private sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!meta) return undefined

    // Remove sensitive information
    const sanitized = { ...meta }
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization']
    
    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]'
      }
    }

    return sanitized
  }
}

// Singleton logger instance
export const logger = new TalonLogger()

// Convenience functions for common use cases
export const logError = (error: Error, context?: string) => {
  logger.error(error.message, {
    name: error.name,
    stack: error.stack,
    cause: error.cause
  }, context)
}

export const logApiCall = (
  method: string,
  url: string,
  status: number,
  startTime: number,
  context?: string
) => {
  const duration = Date.now() - startTime
  logger.api(method, url, status, duration, context)
}

export const logComponentError = (componentName: string, error: Error) => {
  logger.component(componentName, 'Error occurred', {
    error: error.message,
    stack: error.stack
  }, 'error')
}

// Development helpers
export const debugGroup = (label: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Starting: ${label}`)
    const start = Date.now()
    fn()
    const duration = Date.now() - start
    logger.debug(`Completed: ${label}`, { duration })
  } else {
    fn()
  }
}