import { SkillsDashboard } from '@/components/skills-dashboard';

export default function SkillsPage() {
  return (
    <div className="h-screen bg-surface-0">
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Skills Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage capability packs and dependencies for your agents
            </p>
          </div>
          
          <SkillsDashboard />
        </div>
      </div>
    </div>
  );
}