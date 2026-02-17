import { ChannelsDashboard } from '@/components/channels-dashboard';

export default function ChannelsPage() {
  return (
    <div className="h-screen bg-surface-0">
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Channels</h1>
            <p className="text-muted-foreground mt-2">
              Monitor messaging accounts across Telegram, Discord, and other platforms
            </p>
          </div>
          
          <ChannelsDashboard />
        </div>
      </div>
    </div>
  );
}