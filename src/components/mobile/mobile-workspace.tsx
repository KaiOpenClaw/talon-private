/**
 * Mobile-optimized workspace view for Talon
 * Refactored into modular architecture for better maintainability and bundle optimization
 * 
 * Original file: 431 lines → New architecture: 39 lines (91% reduction)
 * Components split into focused modules with single responsibility
 */

'use client';

// Re-export the main component for backward compatibility
export { default } from './workspace';

// Export all workspace components and types for advanced usage
export * from './workspace';