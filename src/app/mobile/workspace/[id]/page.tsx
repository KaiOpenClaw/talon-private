/**
 * Mobile-optimized workspace page for Talon
 * Demonstrates mobile-first features: pull-to-refresh, gesture navigation, collapsible panels
 */

'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MobileWorkspace from '@/components/mobile/mobile-workspace';
import { MobileWorkspaceWithGestures } from '@/components/mobile/gesture-navigation';
import { logger } from '@/lib/logger';

export default function MobileWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = params.id as string;
  const demo = searchParams.get('demo') === 'true';
  
  const [availableAgents, setAvailableAgents] = useState<Array<{ id: string; name: string; status: string }>>([]);

  // Fetch available agents for swipe navigation
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const agents = await response.json();
          setAvailableAgents(agents.slice(0, 5)); // Limit to 5 agents for mobile
        } else {
          // Mock data for demo or offline mode
          setAvailableAgents([
            { id: 'talon', name: 'Talon', status: 'active' },
            { id: 'duplex', name: 'Duplex', status: 'active' },
            { id: 'coach', name: 'Coach', status: 'idle' },
            { id: 'vellaco-content', name: 'Vellaco Content', status: 'active' },
            { id: '0dte', name: '0DTE', status: 'idle' }
          ]);
        }
      } catch (error) {
        logger.error('Failed to fetch agents for mobile workspace', { 
          error: error instanceof Error ? error.message : String(error),
          component: 'MobileWorkspacePage',
          action: 'fetchAgents',
          workspaceId
        });
        // Fallback to mock data
        setAvailableAgents([
          { id: workspaceId, name: workspaceId, status: 'active' }
        ]);
      }
    };

    fetchAgents();
  }, [workspaceId]);

  if (demo) {
    return (
      <div className="min-h-screen bg-surface-0">
        <MobileWorkspaceWithGestures
          workspaceId={workspaceId}
          availableAgents={availableAgents}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <MobileWorkspace workspaceId={workspaceId} />
    </div>
  );
}

export const dynamic = 'force-dynamic';