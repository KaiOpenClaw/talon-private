/**
 * Centralized logging utility for Talon
 * 
 * Provides structured logging with different levels and context information.
 * In production, logs are formatted as JSON for monitoring systems.
 * In development, logs are formatted for readability.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, any>;

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: LogContext;
  source: string;
  requestId?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;
  private source = 'talon-web';

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.logLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    if (['debug', 'info', 'warn', 'error'].includes(envLevel)) {
      return envLevel;
    }
    return this.isDevelopment ? 'debug' : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
      source: this.source,
      requestId: this.getRequestId()
    };

    if (this.isDevelopment) {
      // Development: Human-readable format
      const levelColors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m'  // Red
      };
      const reset = '\x1b[0m';
      
      console.log(
        `${levelColors[level]}[${level.toUpperCase()}]${reset} ${message}`,
        context ? context : ''
      );
    } else {
      // Production: JSON format for monitoring
      console.log(JSON.stringify(entry));
    }
  }

  private getRequestId(): string | undefined {
    // Try to get request ID from various sources
    if (typeof window !== 'undefined') {
      // Client-side: Use session ID or generate one
      const sessionId = sessionStorage.getItem('talon-session-id');
      if (sessionId) return sessionId;
    }
    
    // Server-side: Could be passed via context in the future
    return undefined;
  }

  /**
   * Log debug information (only shown in development)
   */
  debug(message: string, context?: LogContext): void {
    this.formatLog('debug', message, context);
  }

  /**
   * Log general information
   */
  info(message: string, context?: LogContext): void {
    this.formatLog('info', message, context);
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    this.formatLog('warn', message, context);
  }

  /**
   * Log errors with full context
   */
  error(message: string, context?: LogContext): void {
    this.formatLog('error', message, context);
  }

  /**
   * Log API calls for debugging
   */
  apiCall(method: string, url: string, duration?: number, status?: number): void {
    this.info('API call', {
      method,
      url: url.replace(/\/api\/.*\//, '/api/[redacted]/'), // Hide sensitive parts
      duration,
      status,
      timestamp: Date.now()
    });
  }

  /**
   * Log user actions for analytics
   */
  userAction(action: string, context?: LogContext): void {
    this.info('User action', {
      action,
      ...context,
      timestamp: Date.now()
    });
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit = 'ms'): void {
    this.info('Performance metric', {
      metric,
      value,
      unit,
      timestamp: Date.now()
    });
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalFormatLog = childLogger.formatLog.bind(childLogger);
    
    childLogger.formatLog = (level: LogLevel, message: string, additionalContext?: LogContext) => {
      const mergedContext = { ...context, ...additionalContext };
      originalFormatLog(level, message, mergedContext);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export utility functions for common patterns
export const logApiError = (error: Error | unknown, context?: LogContext) => {
  logger.error('API Error', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : 'UnknownError',
    ...context
  });
};

export const logPerformance = (name: string, startTime: number) => {
  const duration = Date.now() - startTime;
  logger.performance(name, duration);
  return duration;
};

export const withLogging = <T extends any[], R>(
  fn: (...args: T) => R | Promise<R>,
  name: string
) => {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    try {
      logger.debug(`Starting ${name}`, { args: args.length });
      const result = await fn(...args);
      logPerformance(name, startTime);
      return result;
    } catch (error) {
      logApiError(error, { function: name, args: args.length });
      throw error;
    }
  };
};

// Development helper to track component renders
export const useLogRender = (componentName: string, props?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`${componentName} rendered`, { props });
  }
};

export default logger;