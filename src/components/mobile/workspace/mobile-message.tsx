/**
 * Mobile-optimized message component
 * Individual message display with mobile-friendly layout
 */

import { MobileMessageProps } from './mobile-workspace-types';

export default function MobileMessage({ message }: MobileMessageProps) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-accent/20 rounded-full flex-shrink-0 flex items-center justify-center">
        <span className="text-xs font-medium text-accent">
          {message.role?.[0]?.toUpperCase() || 'A'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-text-primary">
            {message.role || 'Agent'}
          </span>
          <span className="text-xs text-text-muted">
            {new Date(message.time).toLocaleTimeString()}
          </span>
        </div>
        <div className="text-sm text-text-secondary whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}