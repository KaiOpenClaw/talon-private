"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Download, Package, Search, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSafeApiCall, useComponentError } from '@/hooks/useSafeApiCall';
import { InlineErrorBoundary } from '@/components/error-boundary';
import { ErrorState } from '@/components/error-state';

interface Skill {
  name: string;
  description: string;
  status: 'ready' | 'missing-deps' | 'disabled' | 'installing';
  source: string;
  dependencies?: string[];
  missingDeps?: string[];
}

export function SkillsDashboard() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isStale, setIsStale] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const safeApiCall = useSafeApiCall();
  const { error, handleError, clearError } = useComponentError('SkillsDashboard');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    clearError();
    
    const result = await safeApiCall(
      () => fetch('/api/skills').then(res => res.json()),
      {
        component: 'SkillsDashboard',
        errorMessage: 'Failed to load skills dashboard'
      }
    );

    if (result.isSuccess && result.data) {
      setSkills(result.data.skills || []);
      setIsStale(false);
      setRetryCount(0);
    } else if (result.error) {
      handleError(result.error, false); // Don't show toast, already handled by safeApiCall
      setIsStale(true);
    }
    
    setLoading(false);
  }, [safeApiCall, handleError, clearError]);

  const installSkill = useCallback(async (skillName: string) => {
    const result = await safeApiCall(
      () => fetch('/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: skillName })
      }).then(res => res.json()),
      {
        component: 'SkillsDashboard',
        errorMessage: `Failed to install skill: ${skillName}`
      }
    );

    if (result.isSuccess) {
      // Refresh skills list after successful installation
      await fetchSkills();
    }
  }, [safeApiCall, fetchSkills]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchSkills();
  }, [fetchSkills]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missing-deps':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'disabled':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      case 'installing':
        return <Download className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ready: 'default',
      'missing-deps': 'destructive',
      disabled: 'secondary',
      installing: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const filteredSkills = skills.filter(skill => {
    const matchesFilter = filter === 'all' || skill.status === filter;
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const skillCounts = {
    ready: skills.filter(s => s.status === 'ready').length,
    'missing-deps': skills.filter(s => s.status === 'missing-deps').length,
    disabled: skills.filter(s => s.status === 'disabled').length,
    total: skills.length
  };

  // Error state with retry option
  if (error && !loading) {
    return (
      <ErrorState
        error={error}
        onRetry={handleRetry}
        context={{
          component: 'SkillsDashboard',
          action: 'loadSkills',
          attempts: retryCount
        }}
        suggestions={[
          'Check your internet connection',
          'Verify OpenClaw Gateway is running',
          'Try refreshing the page'
        ]}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-muted-foreground">Loading skills...</span>
        </div>
      </div>
    );
  }

  return (
    <InlineErrorBoundary name="Skills Dashboard">
      <div className="space-y-6">
        {/* Connection Status Banner */}
        {isStale && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Using cached data - connection issues detected
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        )}
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold text-green-600">{skillCounts.ready}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Missing Deps</p>
                <p className="text-2xl font-bold text-yellow-600">{skillCounts['missing-deps']}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-muted-foreground">Disabled</p>
                <p className="text-2xl font-bold text-gray-600">{skillCounts.disabled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{skillCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Skills</option>
          <option value="ready">Ready ({skillCounts.ready})</option>
          <option value="missing-deps">Missing Deps ({skillCounts['missing-deps']})</option>
          <option value="disabled">Disabled ({skillCounts.disabled})</option>
        </select>
      </div>

      {/* Skills Grid */}
      <div className="grid gap-4">
        {filteredSkills.map((skill) => (
          <Card key={skill.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(skill.status)}
                  <CardTitle className="text-base">{skill.name}</CardTitle>
                  {getStatusBadge(skill.status)}
                </div>
                
                {skill.status === 'missing-deps' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => installSkill(skill.name)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Install
                  </Button>
                )}
              </div>
              <CardDescription>{skill.description}</CardDescription>
            </CardHeader>
            
            {skill.missingDeps && skill.missingDeps.length > 0 && (
              <CardContent className="pt-0">
                <div className="text-sm text-muted-foreground">
                  <strong>Missing:</strong> {skill.missingDeps.join(', ')}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      {filteredSkills.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No skills found matching your criteria.</p>
          <Button
            variant="outline"
            onClick={handleRetry}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Skills
          </Button>
        </div>
      )}
      </div>
    </InlineErrorBoundary>
  );
}