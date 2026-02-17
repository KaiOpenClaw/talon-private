"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Settings,
  Users,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface Channel {
  platform: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'reconnecting';
  enabled: boolean;
  lastActivity?: string;
  messagesSent?: number;
  messagesReceived?: number;
  connectedSince?: string;
  errorMessage?: string;
  accounts?: string[];
}

export function ChannelsDashboard() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(fetchChannels, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      const data = await response.json();
      setChannels(data.channels || []);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const reconnectChannel = async (platform: string, name: string) => {
    try {
      const response = await fetch('/api/channels/reconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, name })
      });
      
      if (response.ok) {
        fetchChannels(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to reconnect channel:', error);
    }
  };

  const toggleChannel = async (platform: string, name: string, enable: boolean) => {
    try {
      const response = await fetch('/api/channels/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, name, enabled: enable })
      });
      
      if (response.ok) {
        fetchChannels(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to toggle channel:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'reconnecting':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, enabled: boolean) => {
    if (!enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    
    const variants = {
      online: 'default',
      offline: 'secondary',
      error: 'destructive',
      reconnecting: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      discord: 'text-indigo-600',
      telegram: 'text-blue-600',
      whatsapp: 'text-green-600',
      signal: 'text-gray-600',
      slack: 'text-purple-600',
      imessage: 'text-blue-500'
    } as const;
    
    return colors[platform.toLowerCase() as keyof typeof colors] || 'text-gray-600';
  };

  const channelCounts = {
    total: channels.length,
    online: channels.filter(c => c.status === 'online' && c.enabled).length,
    offline: channels.filter(c => c.status === 'offline' || !c.enabled).length,
    error: channels.filter(c => c.status === 'error' && c.enabled).length,
    reconnecting: channels.filter(c => c.status === 'reconnecting').length,
  };

  const totalMessages = {
    sent: channels.reduce((sum, c) => sum + (c.messagesSent || 0), 0),
    received: channels.reduce((sum, c) => sum + (c.messagesReceived || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Channels</p>
                <p className="text-2xl font-bold">{channelCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{channelCounts.online}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-gray-600">{channelCounts.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{channelCounts.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">{totalMessages.sent + totalMessages.received}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{totalMessages.sent.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Messages Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{totalMessages.received.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Channels List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Channel Status</h3>
          <Button onClick={fetchChannels} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="grid gap-4">
          {channels.map((channel) => (
            <Card key={`${channel.platform}-${channel.name}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(channel.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${getPlatformColor(channel.platform)}`}>
                          {channel.platform.charAt(0).toUpperCase() + channel.platform.slice(1)}
                        </h4>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-medium">{channel.name}</span>
                        {getStatusBadge(channel.status, channel.enabled)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {channel.accounts && channel.accounts.length > 0 && (
                          <div className="flex items-center space-x-1 mb-1">
                            <Users className="h-3 w-3" />
                            <span>{channel.accounts.join(', ')}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4">
                          {channel.connectedSince && (
                            <span>Connected: {channel.connectedSince}</span>
                          )}
                          {channel.lastActivity && (
                            <span>Last activity: {channel.lastActivity}</span>
                          )}
                          {channel.messagesSent !== undefined && (
                            <span>Sent: {channel.messagesSent}</span>
                          )}
                          {channel.messagesReceived !== undefined && (
                            <span>Received: {channel.messagesReceived}</span>
                          )}
                        </div>
                      </div>
                      
                      {channel.errorMessage && (
                        <div className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          {channel.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {channel.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reconnectChannel(channel.platform, channel.name)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reconnect
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleChannel(channel.platform, channel.name, !channel.enabled)}
                    >
                      {channel.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {channels.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No channels configured. Set up your messaging accounts in the gateway.
        </div>
      )}
    </div>
  );
}