import { SystemStatus } from '@/components/system-status';

export default function SystemPage() {
  return (
    <div className="h-screen bg-surface-0">
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}