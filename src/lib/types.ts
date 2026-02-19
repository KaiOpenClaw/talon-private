// Centralized TypeScript Interfaces for Talon
// Issue: #213 - Complete TypeScript Type Safety
// Created: 2026-02-19T16:58Z

// ============================================================================
// CORE OPENCLAW TYPES
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'idle' | 'busy';
  avatar: string;
  workdir: string;
  memorySize: string | null;
  lastActivity: string | null;
  tags?: string[];
  capabilities?: string[];
}

export interface Session {
  id: string;
  agentId: string;
  agentName?: string;
  status: 'active' | 'idle' | 'completed' | 'error';
  startTime: string;
  lastActivity: string;
  messageCount: number;
  model?: string;
  kind?: string;
  label?: string;
  thinking?: 'on' | 'off' | 'low' | 'high';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  sessionId?: string;
  agentId?: string;
  metadata?: Record<string, unknown>;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  status: 'active' | 'disabled' | 'error' | 'running';
  description?: string;
  agent?: string;
  successCount?: number;
  errorCount?: number;
  lastError?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'ready' | 'disabled' | 'error' | 'missing-deps';
  category: 'coding' | 'communication' | 'productivity' | 'media' | 'system' | 'other';
  dependencies?: string[];
  capabilities?: string[];
}

export interface Channel {
  id: string;
  type: 'discord' | 'telegram' | 'slack' | 'email' | 'sms';
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  accounts?: ChannelAccount[];
  lastActivity?: string;
}

export interface ChannelAccount {
  id: string;
  name: string;
  status: 'enabled' | 'disabled' | 'error';
  avatar?: string;
}

// ============================================================================
// SYSTEM & HEALTH TYPES
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
  components: HealthComponent[];
  lastCheck: string;
}

export interface HealthComponent {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage';
  status: 'good' | 'warning' | 'critical';
}

// ============================================================================
// API & GATEWAY TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface GatewayConfig {
  url: string;
  token: string;
  timeout: number;
  retryAttempts: number;
  websocketUrl?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  agentId?: string;
  score: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SearchQuery {
  query: string;
  agentId?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
}

// ============================================================================
// UI & COMPONENT TYPES
// ============================================================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface CommandItem {
  id: string;
  label: string;
  value: string;
  category: 'navigation' | 'agents' | 'actions' | 'search';
  icon?: string;
  description?: string;
  shortcut?: string;
  action: () => void;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  active?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface DashboardStats {
  agents: {
    total: number;
    online: number;
    offline: number;
  };
  sessions: {
    active: number;
    total: number;
  };
  cron: {
    running: number;
    total: number;
    errors: number;
  };
  skills: {
    ready: number;
    total: number;
  };
}

// ============================================================================
// MEMORY & WORKSPACE TYPES
// ============================================================================

export interface MemoryFile {
  path: string;
  name: string;
  content: string;
  size: number;
  modified: string;
  type: 'markdown' | 'text' | 'json' | 'other';
  agentId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  agentId: string;
  path: string;
  files: MemoryFile[];
  lastModified: string;
  size: string;
}

// ============================================================================
// BROWSER & DEVICE API TYPES
// ============================================================================

export interface BatteryInfo {
  charging: boolean;
  level: number;
  chargingTime: number;
  dischargingTime: number;
}

export interface NetworkInfo {
  online: boolean;
  type: string;
  downlink?: number;
  effectiveType?: string;
  saveData?: boolean;
}

export interface DeviceMemoryInfo {
  deviceMemory?: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface GeolocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface PWAInstallPrompt {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ============================================================================
// FORM & INPUT TYPES
// ============================================================================

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  value: string | boolean | number;
  required?: boolean;
  placeholder?: string;
  options?: FormOption[];
  validation?: FormValidation;
  error?: string;
}

export interface FormOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FormValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: unknown) => boolean | string;
}

// ============================================================================
// ERROR & LOADING TYPES
// ============================================================================

export interface AppError {
  id: string;
  type: 'network' | 'validation' | 'authentication' | 'authorization' | 'server' | 'unknown';
  message: string;
  details?: string;
  timestamp: string;
  stack?: string;
  component?: string;
  userId?: string;
}

export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
  message?: string;
}

export interface EmptyState {
  title: string;
  description: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================================================
// WEBSOCKET & REAL-TIME TYPES
// ============================================================================

export interface WebSocketMessage {
  type: 'session_update' | 'agent_status' | 'system_alert' | 'cron_result' | 'health_check';
  data: unknown;
  timestamp: string;
  id?: string;
}

export interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastConnected?: string;
  reconnectAttempts?: number;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid' | 'table';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'in';
  value: unknown;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// ENVIRONMENT & CONFIG TYPES
// ============================================================================

export interface AppConfig {
  apiUrl: string;
  gatewayUrl: string;
  websocketUrl: string;
  environment: 'development' | 'production' | 'test';
  version: string;
  features: Record<string, boolean>;
}

export interface UserPreferences {
  theme: ThemeMode;
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultView: ViewMode;
  compactMode: boolean;
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface ErrorInfo {
  componentStack: string;
}

export interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

// ============================================================================
// TYPE GUARDS & UTILITIES
// ============================================================================

export function isAgent(obj: unknown): obj is Agent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Agent).id === 'string' &&
    typeof (obj as Agent).name === 'string' &&
    typeof (obj as Agent).status === 'string'
  );
}

export function isSession(obj: unknown): obj is Session {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Session).id === 'string' &&
    typeof (obj as Session).agentId === 'string' &&
    typeof (obj as Session).status === 'string'
  );
}

export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ApiResponse).success === 'boolean' &&
    typeof (obj as ApiResponse).timestamp === 'string'
  );
}

export function isWebSocketMessage(obj: unknown): obj is WebSocketMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as WebSocketMessage).type === 'string' &&
    typeof (obj as WebSocketMessage).timestamp === 'string'
  );
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface IconProps extends BaseComponentProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  // Re-export React types for consistency
  React,
} from 'react';

// Default export for easy importing
const Types = {
  isAgent,
  isSession,
  isApiResponse,
  isWebSocketMessage,
};

export default Types;