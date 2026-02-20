/**
 * Enhanced mobile workspace with gesture navigation, haptic feedback, and context menus
 * Integrates all mobile UX improvements from Issue #217
 * Provides native-feeling mobile experience for agent management
 */

'use client';

import { useState, useCallback } from 'react';
import { Edit3, Copy, Share2, Archive, Trash2, RefreshCw, Settings } from 'lucide-react';
import GestureAgentNavigator from './gesture-agent-navigator';
import LongPressContextMenu from './long-press-context-menu';
import PullToRefresh from './pull-to-refresh';
import { useWorkspace } from '@/hooks/use-workspace';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'busy' | 'offline';
}

interface MobileWorkspaceEnhancedProps {
  workspaceId: string;
  agents: Agent[];
  currentAgentId: string;
  onAgentChange: (agentId: string) => void;
}

export default function MobileWorkspaceEnhanced({
  workspaceId,
  agents,
  currentAgentId,
  onAgentChange
}: MobileWorkspaceEnhancedProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { trigger: hapticTrigger } = useHapticFeedback();
  
  const {
    workspace,
    loading,
    messages,
    inputValue,
    sending,
    setInputValue,
    sendMessage,
    messagesEndRef
  } = useWorkspace(workspaceId);

  // Context menu actions for messages
  const getMessageContextItems = useCallback((messageId: string, isOwn: boolean) => [
    {
      id: 'copy',
      label: 'Copy Message',
      icon: <Copy className="w-5 h-5" />,
      action: () => {
        // Copy message to clipboard
        hapticTrigger('selection');
        console.log('Copy message:', messageId);
      }
    },
    {
      id: 'share',
      label: 'Share',
      icon: <Share2 className="w-5 h-5" />,
      action: () => {
        // Share message
        hapticTrigger('selection');
        console.log('Share message:', messageId);
      }
    },
    ...(isOwn ? [
      {
        id: 'edit',
        label: 'Edit',
        icon: <Edit3 className="w-5 h-5" />,
        action: () => {
          // Edit message
          hapticTrigger('selection');
          console.log('Edit message:', messageId);
        }
      }
    ] : []),
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-5 h-5" />,
      action: () => {
        // Archive message
        hapticTrigger('medium');
        console.log('Archive message:', messageId);
      }
    },
    ...(isOwn ? [
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-5 h-5" />,
        destructive: true,
        action: () => {
          // Delete message with confirmation
          hapticTrigger('heavy');
          console.log('Delete message:', messageId);
        }
      }
    ] : [])
  ], [hapticTrigger]);

  // Agent context menu actions
  const getAgentContextItems = useCallback((agentId: string) => [
    {
      id: 'refresh',
      label: 'Refresh Agent',
      icon: <RefreshCw className="w-5 h-5" />,
      action: () => {
        hapticTrigger('medium');
        console.log('Refresh agent:', agentId);
      }
    },
    {
      id: 'settings',
      label: 'Agent Settings',
      icon: <Settings className="w-5 h-5" />,
      action: () => {
        hapticTrigger('selection');
        console.log('Agent settings:', agentId);
      }
    }
  ], [hapticTrigger]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    hapticTrigger('light');
    
    // Simulate refresh - replace with actual data refresh logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
    hapticTrigger('medium'); // Completion feedback
  }, [hapticTrigger]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;
    
    hapticTrigger('selection'); // Feedback for send action
    await sendMessage();
  }, [inputValue, sendMessage, hapticTrigger]);

  const currentAgent = agents.find(agent => agent.id === currentAgentId);

  return (
    <GestureAgentNavigator
      agents={agents}
      currentAgentId={currentAgentId}
      onAgentChange={onAgentChange}
      className="h-screen"
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="h-full flex flex-col bg-surface-0">
          {/* Header with Agent Info */}
          <LongPressContextMenu
            items={getAgentContextItems(currentAgentId)}
            className="border-b border-border-primary"
          >
            <div className="bg-surface-1 p-4 flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentAgent?.status === 'online' ? 'bg-success/20 text-success' :
                  currentAgent?.status === 'busy' ? 'bg-warning/20 text-warning' :
                  'bg-surface-3 text-text-secondary'
                }`}>
                  {currentAgent?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-1 ${
                  currentAgent?.status === 'online' ? 'bg-success' :
                  currentAgent?.status === 'busy' ? 'bg-warning' :
                  'bg-surface-6'
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-text-primary">
                  {currentAgent?.name || 'Unknown Agent'}
                </div>
                <div className="text-sm text-text-secondary capitalize">
                  {currentAgent?.status || 'offline'}
                </div>
              </div>
              <div className="text-xs text-text-secondary bg-surface-2 px-2 py-1 rounded-full">
                {agents.findIndex(a => a.id === currentAgentId) + 1} / {agents.length}
              </div>
            </div>
          </LongPressContextMenu>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center text-text-secondary py-8">
                Loading messages...
              </div>
            ) : messages.length > 0 ? (
              messages.map((message: any, index: number) => (
                <LongPressContextMenu
                  key={message.id || index}
                  items={getMessageContextItems(message.id, message.isOwn)}
                >
                  <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg p-3 ${
                      message.isOwn 
                        ? 'bg-primary text-white ml-4' 
                        : 'bg-surface-2 text-text-primary mr-4'
                    }`}>
                      <div className="text-sm">{message.content}</div>
                      {message.timestamp && (
                        <div className={`text-xs mt-1 ${
                          message.isOwn ? 'text-white/70' : 'text-text-secondary'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </LongPressContextMenu>
              ))
            ) : (
              <div className="text-center text-text-secondary py-8">
                No messages yet. Start a conversation!
              </div>
            )}
            
            {/* Loading indicator for refreshing */}
            {refreshing && (
              <div className="text-center py-4">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-primary" />
                <div className="text-sm text-text-secondary mt-2">Refreshing...</div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border-primary p-4 bg-surface-1">
            <div className="flex gap-3 items-end">
              <div className="flex-1 min-h-[44px] max-h-32">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Message ${currentAgent?.name || 'agent'}...`}
                  className="w-full p-3 bg-surface-0 border border-border-primary rounded-lg resize-none text-text-primary placeholder:text-text-secondary min-h-[44px] max-h-32"
                  rows={1}
                  style={{ 
                    fontSize: '16px', // Prevents zoom on iOS
                    lineHeight: '20px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = '44px';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || sending}
                className="min-w-[44px] h-[44px] bg-primary text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                {sending ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="text-lg">↑</div>
                )}
              </button>
            </div>
          </div>
        </div>
      </PullToRefresh>
    </GestureAgentNavigator>
  );
}