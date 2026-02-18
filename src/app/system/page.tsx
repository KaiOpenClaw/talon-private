'use client'

import { SystemStatus } from '@/components/system-status';
import { MobilePage } from '@/components/mobile/pull-to-refresh';

export default function SystemPage() {
  const handleRefresh = async () => {
    // SystemStatus component handles its own refresh via fetchSystemHealth
    window.location.reload();
  }

  return (
    <div className="h-screen bg-surface-0">
      {/* Mobile-optimized layout with pull-to-refresh */}
      <div className="lg:hidden h-full">
        <MobilePage
          title="System Status"
          subtitle="Monitor OpenClaw gateway health"
          onRefresh={handleRefresh}
        >
          <SystemStatus />
        </MobilePage>
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