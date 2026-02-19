/**
 * Comprehensive TypeScript Interfaces for Talon
 * Issue #198 - Replace 27+ 'any' types with proper TypeScript interfaces
 * Generated: 2026-02-19T15:44Z
 */

import { ComponentType, ReactNode, TouchEventHandler } from 'react'

// ============================================================================
// CORE DATA STRUCTURES
// ============================================================================

export interface Agent {
  id: string
  name: string
  status: 'active' | 'inactive' | 'error'
  workspace: string
  lastActive?: string
  description?: string
  capabilities?: string[]
  memory?: AgentMemory
  metadata?: Record<string, unknown>
}

export interface Session {
  id: string
  agentId: string
  status: 'active' | 'completed' | 'failed'
  startTime: string
  endTime?: string
  messageCount: number
  lastMessage?: string
  metadata?: SessionMetadata
}

export interface SessionMetadata {
  channel?: string
  user?: string
  model?: string
  tokens?: number
  cost?: number
  [key: string]: unknown
}

export interface AgentMemory {
  files: MemoryFile[]
  totalSize: number
  lastUpdated: string
}

export interface MemoryFile {
  name: string
  path: string
  size: number
  lastModified: string
  content?: string
}

export interface CronJob {
  id: string
  name: string
  schedule: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
  status: 'success' | 'failed' | 'running'
  description?: string
  metadata?: CronJobMetadata
}

export interface CronJobMetadata {
  agent?: string
  command?: string
  environment?: Record<string, string>
  retries?: number
  timeout?: number
  [key: string]: unknown
}

// ============================================================================
// PERFORMANCE & MONITORING
// ============================================================================

export interface PerformanceMetric {
  id: string
  timestamp: number
  type: 'api' | 'render' | 'navigation' | 'resource'
  duration: number
  path?: string
  status?: number
  size?: number
  metadata?: PerformanceMetadata
}

export interface PerformanceMetadata {
  method?: string
  userAgent?: string
  connectionType?: string
  deviceMemory?: number
  hardwareConcurrency?: number
  [key: string]: unknown
}

export interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: NetworkMetrics
  timestamp: number
}

export interface NetworkMetrics {
  downlink?: number
  effectiveType?: string
  rtt?: number
  saveData?: boolean
}

export interface BatteryMetrics {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  language: string
  cookieEnabled: boolean
  onLine: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
  connection?: NetworkMetrics
  battery?: BatteryMetrics
}

export interface ErrorInfo {
  componentStack: string
  errorBoundary?: string
  eventType?: string
  [key: string]: unknown
}

// ============================================================================
// UI COMPONENT INTERFACES
// ============================================================================

export interface TouchFeedbackProps {
  children: ReactNode
  className?: string
  disabled?: boolean
  hapticStrength?: 'light' | 'medium' | 'heavy'
  onTouchStart?: TouchEventHandler<HTMLElement>
  onTouchEnd?: TouchEventHandler<HTMLElement>
}

export interface LazyComponentProps {
  loading?: ReactNode
  error?: ReactNode
  fallback?: ReactNode
  [key: string]: unknown
}

export interface SearchResult {
  id: string
  title: string
  content: string
  score: number
  path: string
  agent?: string
  metadata?: SearchResultMetadata
}

export interface SearchResultMetadata {
  fileType?: string
  lastModified?: string
  size?: number
  highlighted?: string[]
  [key: string]: unknown
}

export interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: NotificationMetadata
}

export interface NotificationMetadata {
  url?: string
  action?: string
  timestamp?: number
  [key: string]: unknown
}

// ============================================================================
// API & WEBSOCKET INTERFACES
// ============================================================================

export interface WebSocketMessage {
  type: string
  data: WebSocketMessageData
  timestamp: number
  id?: string
}

export interface WebSocketMessageData {
  event?: string
  payload?: Record<string, unknown>
  error?: WebSocketError
  [key: string]: unknown
}

export interface WebSocketError {
  code: number
  message: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ApiResponseMetadata
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  stack?: string
}

export interface ApiResponseMetadata {
  requestId?: string
  timestamp?: number
  duration?: number
  cached?: boolean
  [key: string]: unknown
}

// ============================================================================
// LOGGING & MONITORING
// ============================================================================

export interface LogContext {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  requestId?: string
  timestamp?: number
  [key: string]: unknown
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: LogContext
  timestamp: number
  source: string
}

export interface MonitoringEvent {
  type: 'performance' | 'error' | 'user_action' | 'system'
  name: string
  value?: number
  labels?: Record<string, string>
  timestamp: number
  metadata?: MonitoringMetadata
}

export interface MonitoringMetadata {
  environment?: string
  version?: string
  userId?: string
  sessionId?: string
  [key: string]: unknown
}

// ============================================================================
// BIOMETRIC & SECURITY
// ============================================================================

export interface BiometricCredential {
  id: string
  type: 'fingerprint' | 'face' | 'voice' | 'passkey'
  name: string
  created: string
  lastUsed?: string
}

export interface SecurityScanResult {
  score: number
  threats: SecurityThreat[]
  recommendations: string[]
  timestamp: number
}

export interface SecurityThreat {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  pattern?: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ComponentWithProps<T = Record<string, unknown>> = ComponentType<T>

export type AsyncComponentLoader<T = Record<string, unknown>> = () => Promise<{
  default: ComponentType<T>
}>

export type EventHandler<T = Event> = (event: T) => void | Promise<void>

export type DataFetcher<T = unknown> = () => Promise<T>

export type CacheEntry<T = unknown> = {
  data: T
  timestamp: number
  ttl: number
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type LayoutMode = 'desktop' | 'tablet' | 'mobile'

// ============================================================================
// REACT COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
  'data-testid'?: string
}

export interface LoadingComponentProps extends BaseComponentProps {
  loading: boolean
  error?: Error | null
  retry?: () => void | Promise<void>
}

export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  isolate?: boolean
}

// ============================================================================
// GENERIC UTILITY INTERFACES
// ============================================================================

export interface WithMetadata<T = Record<string, unknown>> {
  metadata?: T
}

export interface WithTimestamp {
  timestamp: number
  createdAt?: string
  updatedAt?: string
}

export interface WithStatus<T extends string = string> {
  status: T
  statusMessage?: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface Sortable {
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface Filterable<T = Record<string, unknown>> {
  filters?: T
}

// Export all types for easy importing
export type * from './types'