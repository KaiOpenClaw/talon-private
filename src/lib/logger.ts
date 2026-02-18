/**
 * Structured Logging System
 * Centralized logging with configurable levels and production-ready output
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogContext = string

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  data?: unknown
  timestamp: string
}

interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableStructuredOutput: boolean
  environment: 'development' | 'production'
}

class Logger {
  private config: LoggerConfig

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableStructuredOutput: false,
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
      ...config
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }
    return levels[level] >= levels[this.config.level]
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, context, message, data } = entry
    
    if (this.config.enableStructuredOutput) {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        context,
        message,
        data
      })
    }

    const prefix = context ? `[${context}]` : ''
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''
    return `${timestamp} ${level.toUpperCase()}${prefix}: ${message}${dataStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext, data?: unknown): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString()
    }

    const formattedMessage = this.formatMessage(entry)

    if (this.config.enableConsole) {
      // Use appropriate console method
      switch (level) {
        case 'debug':
          console.debug(formattedMessage)
          break
        case 'info':
          console.info(formattedMessage)
          break
        case 'warn':
          console.warn(formattedMessage)
          break
        case 'error':
          console.error(formattedMessage)
          break
      }
    }

    // In production, you could send to external logging service here
    if (this.config.environment === 'production' && level === 'error') {
      // TODO: Send to Sentry, DataDog, etc.
    }
  }

  debug(message: string, context?: LogContext, data?: unknown): void {
    this.log('debug', message, context, data)
  }

  info(message: string, context?: LogContext, data?: unknown): void {
    this.log('info', message, context, data)
  }

  warn(message: string, context?: LogContext, data?: unknown): void {
    this.log('warn', message, context, data)
  }

  error(message: string, context?: LogContext, data?: unknown): void {
    this.log('error', message, context, data)
  }

  // Convenience method for errors with stack traces
  exception(error: Error, context?: LogContext, additionalData?: Record<string, unknown>): void {
    this.error(
      error.message,
      context,
      {
        stack: error.stack,
        name: error.name,
        ...(additionalData || {})
      }
    )
  }
}

// Create default logger instance
const defaultLogger = new Logger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableStructuredOutput: process.env.NODE_ENV === 'production'
})

// Export both the class and a default instance
export { Logger }
export const logger = defaultLogger

// Convenience exports for common usage
export const { debug, info, warn, error, exception } = defaultLogger