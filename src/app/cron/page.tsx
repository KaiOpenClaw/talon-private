import { CronDashboard } from '@/components/cron-dashboard';

export default function CronPage() {
  return (
    <div className="h-screen bg-surface-0">
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Cron Jobs</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage 31 scheduled tasks across all agents
            </p>
          </div>
          
          <CronDashboard />
        </div>
      </div>
    </div>
  );
}