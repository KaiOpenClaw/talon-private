// Performance monitoring and instrumentation library
// For Talon Performance Metrics & Analytics Dashboard

export interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  agent?: string;
  metadata?: Record<string, unknown>;
}

export interface SystemMetrics {
  timestamp: number;
  cpu?: number;
  memory?: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

export interface PerformanceStats {
  totalOperations: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  successRate: number;
  errorCount: number;
  operationsPerMinute: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 10000; // Keep last 10k metrics in memory
  private listeners: ((metric: PerformanceMetric) => void)[] = [];
  
  // Track performance of an async operation
  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    agent?: string,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    
    try {
      const result = await fn();
      success = true;
      return result;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      throw e;
    } finally {
      const duration = Date.now() - startTime;
      
      const metric: PerformanceMetric = {
        timestamp: startTime,
        operation,
        duration,
        success,
        error,
        agent,
        metadata
      };
      
      this.addMetric(metric);
    }
  }
  
  // Track sync operation timing
  trackSync(
    operation: string,
    duration: number,
    success: boolean,
    error?: string,
    agent?: string,
    metadata?: Record<string, unknown>
  ) {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      operation,
      duration,
      success,
      error,
      agent,
      metadata
    };
    
    this.addMetric(metric);
  }
  
  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(metric));
  }
  
  // Subscribe to real-time metrics
  subscribe(listener: (metric: PerformanceMetric) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  // Get performance statistics
  getStats(
    timeRange?: { start: number; end: number },
    operation?: string,
    agent?: string
  ): PerformanceStats {
    let filteredMetrics = this.metrics;
    
    // Filter by time range
    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    // Filter by operation
    if (operation) {
      filteredMetrics = filteredMetrics.filter(m => m.operation === operation);
    }
    
    // Filter by agent
    if (agent) {
      filteredMetrics = filteredMetrics.filter(m => m.agent === agent);
    }
    
    if (filteredMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        successRate: 0,
        errorCount: 0,
        operationsPerMinute: 0
      };
    }
    
    const durations = filteredMetrics.map(m => m.duration).sort((a, b) => a - b);
    const successCount = filteredMetrics.filter(m => m.success).length;
    const errorCount = filteredMetrics.length - successCount;
    
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    
    // Calculate operations per minute
    const timeSpanMinutes = timeRange
      ? (timeRange.end - timeRange.start) / (1000 * 60)
      : 10; // Default to 10 minutes if no range
    
    return {
      totalOperations: filteredMetrics.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: durations[p95Index] || 0,
      p99ResponseTime: durations[p99Index] || 0,
      successRate: successCount / filteredMetrics.length,
      errorCount,
      operationsPerMinute: filteredMetrics.length / timeSpanMinutes
    };
  }
  
  // Get metrics for specific time range
  getMetrics(
    timeRange?: { start: number; end: number },
    operation?: string,
    agent?: string
  ): PerformanceMetric[] {
    let filteredMetrics = this.metrics;
    
    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    if (operation) {
      filteredMetrics = filteredMetrics.filter(m => m.operation === operation);
    }
    
    if (agent) {
      filteredMetrics = filteredMetrics.filter(m => m.agent === agent);
    }
    
    return filteredMetrics;
  }
  
  // Get system health metrics
  getSystemMetrics(): SystemMetrics {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;
    const recentMetrics = this.metrics.filter(m => m.timestamp >= last5Minutes);
    
    const errorCount = recentMetrics.filter(m => !m.success).length;
    const errorRate = recentMetrics.length > 0 ? errorCount / recentMetrics.length : 0;
    
    return {
      timestamp: now,
      activeConnections: this.listeners.length,
      requestsPerMinute: recentMetrics.length / 5,
      errorRate
    };
  }
  
  // Clear all metrics (for testing)
  clear() {
    this.metrics = [];
  }
  
  // Get recent errors for debugging
  getRecentErrors(limit = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => !m.success && m.error)
      .slice(-limit)
      .reverse();
  }
  
  // Get slowest operations
  getSlowestOperations(limit = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for common tracking patterns
export const trackApiCall = async <T>(
  endpoint: string,
  fn: () => Promise<T>,
  agent?: string
): Promise<T> => {
  return performanceMonitor.trackOperation(
    `api:${endpoint}`,
    fn,
    agent,
    { endpoint }
  );
};

export const trackGatewayCall = async <T>(
  operation: string,
  fn: () => Promise<T>,
  agent?: string
): Promise<T> => {
  return performanceMonitor.trackOperation(
    `gateway:${operation}`,
    fn,
    agent,
    { gateway: true }
  );
};

export const trackUserAction = (
  action: string,
  duration: number,
  success = true,
  metadata?: Record<string, unknown>
) => {
  performanceMonitor.trackSync(
    `user:${action}`,
    duration,
    success,
    undefined,
    undefined,
    metadata
  );
};

// React hook for real-time performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([]);
  const [stats, setStats] = React.useState<PerformanceStats | null>(null);
  
  React.useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((metric) => {
      setMetrics(current => [...current.slice(-99), metric]); // Keep last 100
    });
    
    const updateStats = () => {
      const now = Date.now();
      const last10Minutes = now - 10 * 60 * 1000;
      setStats(performanceMonitor.getStats({ start: last10Minutes, end: now }));
    };
    
    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30s
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);
  
  return {
    metrics,
    stats,
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor)
  };
};

// Note: React import will be available in components
declare const React: typeof import('react');