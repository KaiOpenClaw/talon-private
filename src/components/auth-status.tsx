'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Loader2, AlertCircle } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useSafeApiCall } from '@/hooks/useSafeApiCall';
import { InlineErrorBoundary } from '@/components/error-boundary';

export function AuthStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const safeApiCall = useSafeApiCall();
  
  async function handleLogout() {
    setLoading(true);
    setLogoutError(null);
    
    const result = await safeApiCall(
      async () => {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (!response.ok) {
          throw new Error(`Logout failed: HTTP ${response.status}`);
        }
        return response;
      },
      {
        errorMessage: 'Failed to logout',
        component: 'AuthStatus',
      }
    );

    if (result.isSuccess) {
      router.push('/login');
      router.refresh();
    } else {
      setLogoutError('Logout failed. Please try again.');
    }
    
    setLoading(false);
  }
  
  return (
    <InlineErrorBoundary name="AuthStatus">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
          <User className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-300">Authenticated</span>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            logoutError 
              ? 'bg-red-800/50 text-red-300 border border-red-500/30' 
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
          }`}
          title={logoutError || "Sign out"}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : logoutError ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span className="text-sm">{logoutError ? 'Retry' : 'Logout'}</span>
        </button>
      </div>
    </InlineErrorBoundary>
  );
}

// Simple logout button for minimal UIs
export function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      logger.error(
        `Logout failed in LogoutButton component: ${(error as Error).message} (endpoint: /api/auth/logout)`,
        { 
          error: error as Error,
          component: 'LogoutButton',
          action: 'handleLogout'
        }
      );
      setLoading(false);
    }
  }
  
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 ${className}`}
      title="Sign out"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>Logout</span>
    </button>
  );
}
