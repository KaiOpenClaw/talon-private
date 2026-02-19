'use client'

import { SystemStatus } from '@/components/system-status';
import PullToRefresh from '@/components/mobile/pull-to-refresh';

export default function SystemPage() {
  const handleRefresh = async () => {
    // SystemStatus component handles its own refresh via fetchSystemHealth
    window.location.reload();
  }

  return (
    <div className="h-screen bg-surface-0">
      {/* Mobile-optimized layout with pull-to-refresh */}
      <div className="lg:hidden h-full">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-accent/20 bg-surface-1">
            <h1 className="text-xl font-bold text-text-primary">System Status</h1>
            <p className="text-sm text-text-secondary">Monitor OpenClaw gateway health</p>
          </div>
          <PullToRefresh onRefresh={handleRefresh} className="flex-1">
            <div className="h-full overflow-auto p-4">
              <SystemStatus />
            </div>
          </PullToRefresh>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}