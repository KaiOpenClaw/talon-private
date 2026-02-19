'use client';

import { useParams } from 'next/navigation';
import { useWorkspace } from '@/hooks/use-workspace';
import WorkspaceHeader from '@/components/workspace/workspace-header';
import WorkspaceMainContent from '@/components/workspace/workspace-main-content';
import WorkspaceRightSidebar from '@/components/workspace/workspace-right-sidebar';
import WorkspaceChannels from '@/components/workspace-channels';

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const {
    messagesEndRef,
    workspace,
    projects,
    loading,
    selectedChannel,
    messages,
    setSelectedChannel,
    activePanel,
    showRightPanel,
    setActivePanel,
    setShowRightPanel,
    inputValue,
    sending,
    setInputValue,
    sendMessage
  } = useWorkspace(workspaceId);

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      <WorkspaceHeader
        workspace={workspace}
        loading={loading}
        showRightPanel={showRightPanel}
        setShowRightPanel={setShowRightPanel}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Channels */}
        <WorkspaceChannels
          workspaceId={workspaceId}
          selectedChannelId={selectedChannel?.id}
          onSelectChannel={setSelectedChannel}
        />

        {/* Main Content */}
        <WorkspaceMainContent
          workspaceId={workspaceId}
          activePanel={activePanel}
          selectedChannel={selectedChannel}
          messages={messages}
          inputValue={inputValue}
          sending={sending}
          messagesEndRef={messagesEndRef}
          setInputValue={setInputValue}
          sendMessage={sendMessage}
        />

        {/* Right Sidebar */}
        <WorkspaceRightSidebar
          workspace={workspace}
          projects={projects}
          showRightPanel={showRightPanel}
          setActivePanel={setActivePanel}
        />
      </div>
    </div>
  );
}