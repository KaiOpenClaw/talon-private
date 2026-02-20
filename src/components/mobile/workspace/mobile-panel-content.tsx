/**
 * Mobile panel content switcher
 * Routes panel content based on type with consistent header
 */

import { X } from 'lucide-react';
import { MobilePanelContentProps } from './mobile-workspace-types';
import MobileChannelsList from './mobile-channels-list';
import { MobileSettingsPanel, MobileSearchPanel } from './mobile-panels';

export default function MobilePanelContent({
  type,
  workspaceId,
  selectedChannel,
  onSelectChannel,
  onClose
}: MobilePanelContentProps) {
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