/**
 * Mobile panel components for workspace
 * Settings and search panels for mobile interface
 */

// Mobile settings panel
export function MobileSettingsPanel() {
  return (
    <div className="space-y-4">
      <p className="text-text-secondary">Settings panel coming soon...</p>
    </div>
  );
}

// Mobile search panel  
export function MobileSearchPanel() {
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search messages..."
        className="w-full px-4 py-3 bg-surface-2 border border-accent/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <p className="text-text-secondary">Search functionality coming soon...</p>
    </div>
  );
}