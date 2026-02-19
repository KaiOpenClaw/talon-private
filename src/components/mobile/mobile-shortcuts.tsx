/**
 * Mobile Keyboard Shortcuts & Quick Actions
 * Touch-friendly shortcut system optimized for mobile interfaces
 * 
 * Re-exports focused components for backward compatibility
 */

// Re-export types and constants
export type { ShortcutAction, MobileShortcutsProps } from './mobile-shortcut-types'
export { DEFAULT_SHORTCUTS } from './mobile-shortcut-types'

// Re-export components
export { MobileShortcutsFAB } from './mobile-shortcuts-fab'
export { QuickActionBar } from './mobile-quick-action-bar'  
export { MobileCommandPalette } from './mobile-command-palette'

// Default export for backward compatibility
export { default } from './mobile-shortcuts-fab'