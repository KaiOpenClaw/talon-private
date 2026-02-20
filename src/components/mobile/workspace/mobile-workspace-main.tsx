/**
 * Main mobile workspace component
 * Orchestrates mobile workspace layout and interactions
 */

'use client';

import { 
  Menu, 
  MessageSquare, 
  Search,
  MoreHorizontal
} from 'lucide-react';
import PullToRefresh from '../pull-to-refresh';
import { useWorkspace } from '@/hooks/use-workspace';
import { useMobilePanels } from './use-mobile-panels';
import { MobileWorkspaceProps } from './mobile-workspace-types';
import MobileMessage from './mobile-message';
import MobileMessageInput from './mobile-message-input';
import MobilePanelContent from './mobile-panel-content';
import MobileMessageSkeleton from './mobile-message-skeleton';

export default function MobileWorkspace({ workspaceId }: MobileWorkspaceProps) {
  const {
    activePanel,
    isTransitioning,
    openPanel,
    closePanel
  } = useMobilePanels();

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