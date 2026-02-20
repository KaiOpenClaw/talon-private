/**
 * Loading skeleton for mobile messages
 * Provides visual feedback during data loading
 */

export default function MobileMessageSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 bg-surface-2 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-2 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-surface-2 rounded animate-pulse" />
            <div className="h-4 bg-surface-2 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}