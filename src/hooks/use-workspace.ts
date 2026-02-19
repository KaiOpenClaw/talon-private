'use client';

import { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  memorySize?: string;
  lastActivity?: string;
  model?: string;
  workdir: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  sessionKey?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  time: string;
  channelId: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  progress?: number;
}

export type ActivePanel = 'chat' | 'memory' | 'spawn' | 'search';

export function useWorkspace(workspaceId: string) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Data state
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Channel state
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  
  // UI state
  const [activePanel, setActivePanel] = useState<ActivePanel>('chat');
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // Chat state
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch workspace details
        const agentsRes = await fetch('/api/agents');
        const agentsData = await agentsRes.json();
        const ws = agentsData.agents?.find((a: Workspace) => a.id === workspaceId);
        if (ws) setWorkspace(ws);
        
        // Fetch projects
        const projectsRes = await fetch('/api/projects');
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects?.slice(0, 5) || []);
        
        // Set default channel
        const storedChannels = localStorage.getItem(`talon_channels_${workspaceId}`);
        if (storedChannels) {
          const channels = JSON.parse(storedChannels);
          if (channels.length > 0 && !selectedChannel) {
            setSelectedChannel(channels[0]);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch workspace data', {
          component: 'useWorkspace',
          action: 'fetchData',
          workspaceId,
          error: error instanceof Error ? error.message : String(error)
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [workspaceId, selectedChannel]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedChannel || sending) return;
    
    setSending(true);
    const content = inputValue;
    setInputValue('');
    
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        time: new Date().toLocaleTimeString(),
        channelId: selectedChannel.id
      };
      
      // Add message to local state
      setMessages(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMessage]
      }));
      
      // Send to API
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          agentId: workspaceId,
          sessionKey: selectedChannel.sessionKey
        })
      });
      
      if (!response.ok) {
        throw new Error(`Send failed: ${response.status}`);
      }
      
      // Add response message
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'Message sent successfully',
        time: new Date().toLocaleTimeString(),
        channelId: selectedChannel.id
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), responseMessage]
      }));
      
    } catch (error) {
      logger.error('Failed to send message', {
        component: 'useWorkspace',
        action: 'sendMessage',
        workspaceId,
        channelId: selectedChannel.id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Failed to send message. Please try again.',
        time: new Date().toLocaleTimeString(),
        channelId: selectedChannel.id
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), errorMessage]
      }));
    } finally {
      setSending(false);
    }
  };

  return {
    // Refs
    messagesEndRef,
    
    // Data
    workspace,
    projects,
    loading,
    
    // Channel state
    selectedChannel,
    messages,
    setSelectedChannel,
    
    // UI state
    activePanel,
    showRightPanel,
    setActivePanel,
    setShowRightPanel,
    
    // Chat state
    inputValue,
    sending,
    setInputValue,
    sendMessage
  };
}