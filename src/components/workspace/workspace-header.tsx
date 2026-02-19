'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Activity, EyeOff, Eye, Loader2 } from 'lucide-react';
import { Workspace } from '@/hooks/use-workspace';

interface WorkspaceHeaderProps {
  workspace: Workspace | null;
  loading: boolean;
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
}

export default function WorkspaceHeader({
  workspace,
  loading,
  showRightPanel,
  setShowRightPanel
}: WorkspaceHeaderProps) {
  if (loading) {
    return (
      <header className="bg-surface-1 border-b border-border-subtle h-16 flex items-center px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-surface-2 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Loader2 className="w-6 h-6 animate-spin text-terminal-400" />
          <div className="animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </header>
    );
  }

  if (!workspace) {
    return (
      <header className="bg-surface-1 border-b border-border-subtle h-16 flex items-center px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-surface-2 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="text-red-400">Workspace not found</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-surface-1 border-b border-border-subtle h-16 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-surface-2 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={workspace.avatar} 
              alt={workspace.name}
              className="w-8 h-8 rounded-full"
            />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface-1 ${
              workspace.status === 'online' ? 'bg-green-500' : 
              workspace.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
            }`} />
          </div>
          
          <div>
            <h1 className="font-semibold">{workspace.name}</h1>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Activity className="w-3 h-3" />
              <span>
                {workspace.lastActivity ? `Active ${workspace.lastActivity}` : 'Active now'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowRightPanel(!showRightPanel)}
          className="p-2 hover:bg-surface-2 rounded-lg text-ink-muted hover:text-ink-primary"
          title={showRightPanel ? 'Hide sidebar' : 'Show sidebar'}
        >
          {showRightPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}