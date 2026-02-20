import { z } from 'zod'
import { logger } from './logger'

/**
 * Environment Configuration Schema
 * Centralized environment variable validation and type safety
 */

const serverConfigSchema = z.object({
  // Node.js environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // OpenClaw Gateway Configuration (Server-side only)
  GATEWAY_URL: z.string().url().default('http://localhost:6820'),
  GATEWAY_TOKEN: z.string().min(1, 'GATEWAY_TOKEN is required for authentication'),
  
  // Talon API Configuration (Server-side only)
  TALON_API_URL: z.string().url().optional(),
  TALON_API_TOKEN: z.string().optional(),
  
  // Search & AI Configuration (Server-side only)
  OPENAI_API_KEY: z.string().optional(),
  LANCEDB_ENABLED: z.string().default('false').transform(val => val === 'true'),
  
  // Authentication (Server-side only)
  TALON_AUTH_TOKEN: z.string().optional(),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Build/Package Information
  npm_package_version: z.string().optional(),
})

const clientConfigSchema = z.object({
  // Client-safe configuration only
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // WebSocket configuration (client-safe)
  NEXT_PUBLIC_GATEWAY_URL: z.string().optional(),
  NEXT_PUBLIC_GATEWAY_TOKEN: z.string().optional(),
})

/**
 * Server-side configuration (use only in API routes and server components)
 * Contains sensitive information that should never be exposed to the client
 */
export const serverConfig = (() => {
  try {
    return serverConfigSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter(issue => issue.code === 'too_small' || issue.message.includes('required'))
        .map(issue => issue.path.join('.'))
      
      throw new Error(
        `❌ Environment Configuration Error:\n\n` +
        `Missing required environment variables: ${missingVars.join(', ')}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.\n` +
        `For detailed setup instructions, see the README.md file.`
      )
    }
    throw error
  }
})()

/**
 * Client-side configuration (safe for browser exposure)
 * Only contains non-sensitive configuration
 */
export const clientConfig = (() => {
  try {
    // Only pass safe variables to client
    const safeEnv = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
      NEXT_PUBLIC_GATEWAY_TOKEN: process.env.NEXT_PUBLIC_GATEWAY_TOKEN,
    }
    return clientConfigSchema.parse(safeEnv)
  } catch (error) {
    logger.error('Client configuration error', {
      component: 'ConfigSystem',
      action: 'clientConfigParsing',
      error: error instanceof Error ? error.message : String(error),
      fallback: 'development defaults'
    })
    // Fallback to defaults for client-side
    return {
      NODE_ENV: 'development' as const,
      NEXT_PUBLIC_GATEWAY_URL: undefined,
      NEXT_PUBLIC_GATEWAY_TOKEN: undefined,
    }
  }
})()

/**
 * Get WebSocket URL dynamically based on current environment
 * This approach avoids exposing the gateway URL to the client
 */
export function getWebSocketUrl(request?: Request): string {
  // In development, use localhost
  if (serverConfig.NODE_ENV === 'development') {
    return 'ws://localhost:6820/ws'
  }
  
  // In production, construct from the current host
  if (request) {
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const wsProtocol = protocol === 'https' ? 'wss' : 'ws'
    
    // For production, you might want to use a different WebSocket endpoint
    // This is a fallback that uses the same host
    return `${wsProtocol}://${host}/api/ws`
  }
  
  // Fallback for server-side rendering without request context
  return '/api/ws'
}

/**
 * Validate that all required configuration is present
 * Call this during application startup to fail fast
 */
export function validateConfig(): void {
  // Server config validation already happens during module load
  logger.info('Environment configuration validated successfully', {
    component: 'ConfigSystem',
    action: 'configValidation',
    status: 'success'
  })
  
  // Log non-sensitive config in development
  if (serverConfig.NODE_ENV === 'development') {
    logger.info('Configuration loaded', {
      component: 'ConfigSystem',
      action: 'configLoaded',
      NODE_ENV: serverConfig.NODE_ENV,
      GATEWAY_URL: serverConfig.GATEWAY_URL,
      GATEWAY_TOKEN_SET: !!serverConfig.GATEWAY_TOKEN,
      TALON_API_URL_SET: !!serverConfig.TALON_API_URL,
      OPENAI_API_KEY_SET: !!serverConfig.OPENAI_API_KEY,
      LANCEDB_ENABLED: serverConfig.LANCEDB_ENABLED,
    })
  }
}

/**
 * Type-safe environment variable access
 * Use these getters instead of directly accessing process.env
 */
export const env = {
  // Server-side only - never expose these to the client
  server: serverConfig,
  
  // Client-safe configuration
  client: clientConfig,
  
  // Utility functions
  isDevelopment: () => serverConfig.NODE_ENV === 'development',
  isProduction: () => serverConfig.NODE_ENV === 'production',
  isTest: () => serverConfig.NODE_ENV === 'test',
}

// Validate configuration on module load
validateConfig()