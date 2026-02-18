'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Loader2 } from 'lucide-react';
import { logger, logError } from '@/lib/logger';

export function AuthStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      logError(error as Error, 'AuthStatus.handleLogout');
      logger.error('Logout failed in AuthStatus component', { 
        endpoint: '/api/auth/logout',
        error: (error as Error).message 
      }, 'AuthStatus');
      setLoading(false);
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
        <User className="w-4 h-4 text-zinc-400" />
        <span className="text-sm text-zinc-300">Authenticated</span>
      </div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
        title="Sign out"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        <span className="text-sm">Logout</span>
      </button>
    </div>
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
      logError(error as Error, 'LogoutButton.handleLogout');
      logger.error('Logout failed in LogoutButton component', { 
        endpoint: '/api/auth/logout',
        error: (error as Error).message 
      }, 'LogoutButton');
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
