/**
 * Mobile-optimized workspace view for Talon
 * Addresses Discord mobile pain points with slide-out panels and touch navigation
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  X, 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  Layers3,
  Search,
  MoreHorizontal
} from 'lucide-react';
import PullToRefresh from './pull-to-refresh';
import { useWorkspace } from '@/hooks/use-workspace';

interface MobileWorkspaceProps {
  workspaceId: string;
}

type PanelType = 'channels' | 'settings' | 'search' | null;

export default function MobileWorkspace({ workspaceId }: MobileWorkspaceProps) {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    workspace,
    loading,
    selectedChannel,
    messages,
    setSelectedChannel,
    inputValue,
    sending,
    setInputValue,
    sendMessage,
    messagesEndRef
  } = useWorkspace(workspaceId);

  // Handle panel transitions
  const openPanel = (panel: PanelType) => {
    setIsTransitioning(true);
    setActivePanel(panel);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const closePanel = () => {
    setIsTransitioning(true);
    setActivePanel(null);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle swipe gestures for panel navigation
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Only trigger swipe if horizontal movement is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && startX < 50 && !activePanel) {
          // Swipe right from left edge - open channels
          openPanel('channels');
        } else if (deltaX < 0 && activePanel) {
          // Swipe left when panel is open - close panel
          closePanel();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activePanel]);

  const handleRefresh = async () => {
    // Simulate data refresh - in real implementation, this would refresh workspace data
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="h-screen flex flex-col bg-surface-0 relative overflow-hidden">
      {/* Mobile Header */}
      <header className="flex items-center justify-between p-4 bg-surface-1 border-b border-accent/20 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => openPanel('channels')}
            className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 active:scale-95 transition-all duration-200"
          >
            <Menu className="w-5 h-5 text-text-primary" />
          </button>
          
          <div>
            <h1 className="font-semibold text-text-primary">
              {workspace?.name || workspaceId}
            </h1>
            {selectedChannel && (
              <p className="text-xs text-text-secondary">
                #{selectedChannel.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openPanel('search')}
            className="p-2 rounded-lg hover:bg-surface-2 active:scale-95 transition-all duration-200"
          >
            <Search className="w-5 h-5 text-text-secondary" />
          </button>
          
          <button
            onClick={() => openPanel('settings')}
            className="p-2 rounded-lg hover:bg-surface-2 active:scale-95 transition-all duration-200"
          >
            <MoreHorizontal className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>

      {/* Main Content with Pull-to-Refresh */}
      <div className="flex-1 overflow-hidden">
        <PullToRefresh onRefresh={handleRefresh} className="h-full">
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <MobileMessageSkeleton />
              ) : selectedChannel && messages[selectedChannel.id]?.length > 0 ? (
                <>
                  {messages[selectedChannel.id].map((message, index) => (
                    <MobileMessage key={index} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-16 h-16 text-text-muted mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    No messages yet
                  </h3>
                  <p className="text-text-secondary">
                    Start a conversation with your agent
                  </p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-surface-1 border-t border-accent/20">
              <MobileMessageInput
                value={inputValue}
                onChange={setInputValue}
                onSend={sendMessage}
                disabled={sending || !selectedChannel}
                placeholder={`Message ${selectedChannel?.name || 'channel'}...`}
              />
            </div>
          </div>
        </PullToRefresh>
      </div>

      {/* Slide-out Panels */}
      <div className={`fixed inset-0 z-30 ${activePanel ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            activePanel ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closePanel}
        />

        {/* Panel */}
        <div
          ref={panelRef}
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-surface-1 shadow-xl transition-transform duration-300 ease-out ${
            activePanel ? 'transform translate-x-0' : 'transform -translate-x-full'
          } ${isTransitioning ? 'pointer-events-none' : ''}`}
        >
          {activePanel && (
            <MobilePanelContent
              type={activePanel}
              workspaceId={workspaceId}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              onClose={closePanel}
            />
          )}
        </div>
      </div>

      {/* Swipe indicator for first-time users */}
      {!activePanel && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-accent/30 rounded-r-full" />
      )}
    </div>
  );
}

// Mobile-optimized message component
function MobileMessage({ message }: { message: any }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-accent/20 rounded-full flex-shrink-0 flex items-center justify-center">
        <span className="text-xs font-medium text-accent">
          {message.role?.[0]?.toUpperCase() || 'A'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-text-primary">
            {message.role || 'Agent'}
          </span>
          <span className="text-xs text-text-muted">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="text-sm text-text-secondary whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}

// Mobile message input with touch optimizations
function MobileMessageInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [value]);

  return (
    <div className="flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 resize-none min-h-[44px] max-h-[120px] px-4 py-3 bg-surface-2 border border-accent/20 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="w-11 h-11 bg-accent text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
  );
}

// Panel content switcher
function MobilePanelContent({
  type,
  workspaceId,
  selectedChannel,
  onSelectChannel,
  onClose
}: {
  type: PanelType;
  workspaceId: string;
  selectedChannel: any;
  onSelectChannel: (channel: any) => void;
  onClose: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-accent/20">
        <h2 className="font-semibold text-text-primary capitalize">
          {type === 'channels' ? 'Channels' : type === 'settings' ? 'Settings' : 'Search'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-surface-2 active:scale-95 transition-all duration-200"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {type === 'channels' && (
          <MobileChannelsList
            workspaceId={workspaceId}
            selectedChannel={selectedChannel}
            onSelectChannel={onSelectChannel}
            onClose={onClose}
          />
        )}
        {type === 'settings' && <MobileSettingsPanel />}
        {type === 'search' && <MobileSearchPanel />}
      </div>
    </div>
  );
}

// Mobile channels list
function MobileChannelsList({
  workspaceId,
  selectedChannel,
  onSelectChannel,
  onClose
}: {
  workspaceId: string;
  selectedChannel: any;
  onSelectChannel: (channel: any) => void;
  onClose: () => void;
}) {
  // Mock channels - in real implementation, fetch from API
  const channels = [
    { id: 'general', name: 'general', type: 'text' },
    { id: 'memory', name: 'memory', type: 'files' },
    { id: 'tools', name: 'tools', type: 'api' }
  ];

  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => {
            onSelectChannel(channel);
            onClose();
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors duration-200 ${
            selectedChannel?.id === channel.id
              ? 'bg-accent/20 text-accent'
              : 'hover:bg-surface-2 text-text-primary'
          }`}
        >
          <Layers3 className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">#{channel.name}</span>
        </button>
      ))}
    </div>
  );
}

// Mobile settings panel
function MobileSettingsPanel() {
  return (
    <div className="space-y-4">
      <p className="text-text-secondary">Settings panel coming soon...</p>
    </div>
  );
}

// Mobile search panel  
function MobileSearchPanel() {
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search messages..."
        className="w-full px-4 py-3 bg-surface-2 border border-accent/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <p className="text-text-secondary">Search functionality coming soon...</p>
    </div>
  );
}

// Loading skeleton for messages
function MobileMessageSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 bg-surface-2 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-2 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-surface-2 rounded animate-pulse" />
            <div className="h-4 bg-surface-2 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}