'use client';

import React from 'react';
import { Plus, Box, FileText, FolderOpen } from 'lucide-react';
import { Workspace, Project, ActivePanel } from '@/hooks/use-workspace';

interface WorkspaceRightSidebarProps {
  workspace: Workspace | null;
  projects: Project[];
  showRightPanel: boolean;
  setActivePanel: (panel: ActivePanel) => void;
}

export default function WorkspaceRightSidebar({
  workspace,
  projects,
  showRightPanel,
  setActivePanel
}: WorkspaceRightSidebarProps) {
  if (!showRightPanel || !workspace) {
    return null;
  }

  return (
    <aside className="w-64 bg-surface-1 border-l border-border-subtle overflow-y-auto">
      {/* Workspace Stats */}
      <div className="p-4 border-b border-border-subtle">
        <h3 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3">
          Workspace
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-tertiary">Status</span>
            <span className={workspace.status === 'online' ? 'text-green-400' : 'text-ink-muted'}>
              {workspace.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-tertiary">Memory</span>
            <span>{workspace.memorySize || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-tertiary">Model</span>
            <span className="font-mono text-xs">{workspace.model || 'Default'}</span>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="p-4 border-b border-border-subtle">
        <h3 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Projects</span>
          <button className="p-1 hover:bg-surface-3 rounded">
            <Plus className="w-3 h-3" />
          </button>
        </h3>
        {projects.length === 0 ? (
          <p className="text-sm text-ink-muted">No projects</p>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-2 text-sm">
                <Box className="w-4 h-4 text-orange-400" />
                <span className="flex-1 truncate">{project.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files */}
      <div className="p-4">
        <h3 className="text-xs font-medium text-ink-tertiary uppercase tracking-wider mb-3">
          Files
        </h3>
        <div className="space-y-1">
          {['MEMORY.md', 'SOUL.md', 'TOOLS.md', 'memory/'].map((file) => (
            <button
              key={file}
              onClick={() => setActivePanel('memory')}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-surface-2 rounded text-sm text-left"
            >
              {file.endsWith('/') ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <FileText className="w-4 h-4 text-green-400" />
              )}
              <span className="font-mono text-xs">{file}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}