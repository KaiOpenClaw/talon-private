/**
 * Mobile channels list component
 * Touch-friendly channel selection with visual feedback
 */

import { Layers3 } from 'lucide-react';
import { MobileChannelsListProps, Channel } from './mobile-workspace-types';

export default function MobileChannelsList({
  workspaceId,
  selectedChannel,
  onSelectChannel,
  onClose
}: MobileChannelsListProps) {
  // Mock channels - in real implementation, fetch from API
  const channels: Channel[] = [
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