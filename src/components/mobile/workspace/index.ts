/**
 * Mobile workspace module exports
 * Backward compatibility and component access
 */

// Main component
export { default as MobileWorkspace } from './mobile-workspace-main';

// Individual components
export { default as MobileMessage } from './mobile-message';
export { default as MobileMessageInput } from './mobile-message-input';
export { default as MobileChannelsList } from './mobile-channels-list';
export { default as MobilePanelContent } from './mobile-panel-content';
export { default as MobileMessageSkeleton } from './mobile-message-skeleton';

// Panel components
export { MobileSettingsPanel, MobileSearchPanel } from './mobile-panels';

// Hooks and utilities
export { useMobilePanels } from './use-mobile-panels';

// Types
export * from './mobile-workspace-types';

// Default export for backward compatibility
export { default } from './mobile-workspace-main';