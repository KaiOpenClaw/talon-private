'use client';

import React from 'react';
import Link from 'next/link';
import { Send, Search } from 'lucide-react';
import { ActivePanel, Channel, Message } from '@/hooks/use-workspace';
import MemoryViewer from '@/components/memory-viewer';
import SpawnPanel from '@/components/spawn-panel';

interface WorkspaceMainContentProps {
  workspaceId: string;
  activePanel: ActivePanel;
  selectedChannel: Channel | null;
  messages: Record<string, Message[]>;
  inputValue: string;
  sending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setInputValue: (value: string) => void;
  sendMessage: () => void;
}

export default function WorkspaceMainContent({
  workspaceId,
  activePanel,
  selectedChannel,
  messages,
  inputValue,
  sending,
  messagesEndRef,
  setInputValue,
  sendMessage
}: WorkspaceMainContentProps) {
  const renderChatPanel = () => {
    if (!selectedChannel) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-surface-3 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-ink-muted" />
            </div>
            <h3 className="text-lg font-medium mb-2">No channel selected</h3>
            <p className="text-sm text-ink-muted">Select a channel to start messaging</p>
          </div>
        </div>
      );
    }

    const channelMessages = messages[selectedChannel.id] || [];

    return (
      <>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {channelMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-surface-3 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-ink-muted" />
              </div>
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm text-ink-muted">
                This is the beginning of your conversation in #{selectedChannel.name}
              </p>
            </div>
          ) : (
            channelMessages.map((message) => (
              <div key={message.id} className="flex gap-3 max-w-3xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  message.role === 'user' ? 'bg-terminal-600 text-white' :
                  message.role === 'agent' ? 'bg-blue-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {message.role === 'user' ? 'U' : message.role === 'agent' ? 'A' : 'S'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.role === 'user' ? 'You' : 
                       message.role === 'agent' ? 'Agent' : 'System'}
                    </span>
                    <span className="text-xs text-ink-muted">{message.time}</span>
                  </div>
                  <div className="text-sm text-ink-primary bg-surface-2 rounded-lg p-3">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle p-4 bg-surface-0">
          <div className="flex gap-3 max-w-3xl">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message #${selectedChannel.name}...`}
              className="flex-1 bg-surface-2 border border-border-default rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-terminal-500/50"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || sending}
              className="flex items-center gap-2 px-5 py-3 bg-terminal-600 hover:bg-terminal-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'chat':
        return renderChatPanel();
      
      case 'memory':
        return (
          <div className="flex-1 overflow-hidden">
            <MemoryViewer agentId={workspaceId} />
          </div>
        );
      
      case 'spawn':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl">
              <SpawnPanel currentAgentId={workspaceId} />
            </div>
          </div>
        );
      
      case 'search':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl">
              <div className="text-center py-8">
                <Search className="w-12 h-12 mx-auto mb-4 text-ink-muted opacity-50" />
                <h3 className="text-lg font-medium mb-2">Search this workspace</h3>
                <p className="text-sm text-ink-tertiary mb-4">
                  Search through memory, conversations, and files
                </p>
                <Link
                  href={`/search?scope=workspace&scopeId=${workspaceId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-600 hover:bg-terminal-500 rounded-lg text-sm font-medium"
                >
                  <Search className="w-4 h-4" />
                  Open Full Search
                </Link>
              </div>
            </div>
          </div>
        );
      
      default:
        return renderChatPanel();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-0 overflow-hidden">
      {renderPanel()}
    </div>
  );
}