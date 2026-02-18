"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HealthDashboard } from '@/components/monitoring/health-dashboard';
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Zap,
  Database,
  MessageCircle,
  Package,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { logApiError } from '@/lib/logger';

interface SystemHealth {
  gateway: {
    status: 'online' | 'offline' | 'degraded';
    version: string;
    uptime: string;
    memory: number;
    cpu: number;
  };
  agents: {
    total: number;
    active: number;
    idle: number;
  };
  sessions: {
    total: number;
    active: number;
    lastHour: number;
  };
  skills: {
    total: number;
    ready: number;
    missingDeps: number;
  };
  cron: {
    total: number;
    running: number;
    errors: number;
    nextJob?: string;
  };
  channels: {
    total: number;
    online: number;
    offline: number;
    errors: number;
  };
  search: {
    indexed: number;
    lastUpdate: string;
  };
}

export function SystemStatus() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/system/health');
      const data = await response.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (error) {
      logApiError(error, {
        component: 'SystemStatus',
        action: 'fetchSystemHealth',
        endpoint: '/api/system/health'
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthBadge = (status: string) => {
    const variants = {
      online: 'default',
      degraded: 'destructive',
      offline: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Unable to fetch system status</p>
        <Button onClick={fetchSystemHealth} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Status</h2>
          <p className="text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchSystemHealth} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Gateway Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Server className={`h-5 w-5 ${getHealthColor(health.gateway.status)}`} />
              <span>OpenClaw Gateway</span>
            </CardTitle>
            {getHealthBadge(health.gateway.status)}
          </div>
          <CardDescription>
            Version {health.gateway.version} • Uptime: {health.gateway.uptime}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Memory Usage</p>
              <Progress value={health.gateway.memory} className="mb-1" />
              <p className="text-xs text-muted-foreground">{health.gateway.memory}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">CPU Usage</p>
              <Progress value={health.gateway.cpu} className="mb-1" />
              <p className="text-xs text-muted-foreground">{health.gateway.cpu}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Agents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Users className="h-4 w-4" />
              <span>Agents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total:</span>
                <span className="font-medium">{health.agents.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Active:</span>
                <span className="font-medium text-green-600">{health.agents.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Idle:</span>
                <span className="font-medium text-gray-600">{health.agents.idle}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Activity className="h-4 w-4" />
              <span>Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total:</span>
                <span className="font-medium">{health.sessions.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Active:</span>
                <span className="font-medium text-blue-600">{health.sessions.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-600">Last Hour:</span>
                <span className="font-medium text-purple-600">{health.sessions.lastHour}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Package className="h-4 w-4" />
              <span>Skills</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total:</span>
                <span className="font-medium">{health.skills.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Ready:</span>
                <span className="font-medium text-green-600">{health.skills.ready}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-yellow-600">Missing Deps:</span>
                <span className="font-medium text-yellow-600">{health.skills.missingDeps}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cron Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Calendar className="h-4 w-4" />
              <span>Cron Jobs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total:</span>
                <span className="font-medium">{health.cron.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Running:</span>
                <span className="font-medium text-blue-600">{health.cron.running}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Errors:</span>
                <span className="font-medium text-red-600">{health.cron.errors}</span>
              </div>
              {health.cron.nextJob && (
                <div className="pt-1 text-xs text-muted-foreground">
                  Next: {health.cron.nextJob}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <MessageCircle className="h-4 w-4" />
              <span>Channels</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total:</span>
                <span className="font-medium">{health.channels.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-600">Online:</span>
                <span className="font-medium text-green-600">{health.channels.online}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Errors:</span>
                <span className="font-medium text-red-600">{health.channels.errors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Index */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Database className="h-4 w-4" />
              <span>Search Index</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Indexed:</span>
                <span className="font-medium">{health.search.indexed.toLocaleString()}</span>
              </div>
              <div className="pt-1 text-xs text-muted-foreground">
                Updated: {health.search.lastUpdate}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              View Logs
            </Button>
            <Button size="sm" variant="outline">
              Restart Services
            </Button>
            <Button size="sm" variant="outline">
              Run Diagnostics
            </Button>
            <Button size="sm" variant="outline">
              Clear Cache
            </Button>
            <Button size="sm" variant="outline">
              Export Config
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Health Monitoring */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Detailed Health Monitoring</h3>
        <HealthDashboard />
      </div>
    </div>
  );
}