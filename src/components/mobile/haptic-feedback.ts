/**
 * Haptic feedback utilities for mobile devices
 * Provides cross-platform haptic feedback with fallbacks
 */

export type HapticFeedbackType = 'light' | 'medium' | 'heavy'

/**
 * Trigger haptic feedback on supported devices
 * Falls back to vibration API if native haptic feedback is unavailable
 */
export function triggerHapticFeedback(type: HapticFeedbackType = 'light') {
  if (typeof window === 'undefined') return

  // For iOS devices with Haptic Feedback API (if available)
  if ('HapticFeedback' in window) {
    const feedbackTypes = {
      light: 'impactLight',
      medium: 'impactMedium', 
      heavy: 'impactHeavy'
    }
    try {
      // @ts-ignore - HapticFeedback API is not in TypeScript definitions
      window.HapticFeedback?.impact(feedbackTypes[type])
      return
    } catch (error) {
      // Fall through to vibration API
    }
  }
  
  // Use Vibration API as fallback for haptic feedback
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    }
    navigator.vibrate(patterns[type])
  }
}

/**
 * Check if haptic feedback is available on the current device
 */
export function isHapticFeedbackSupported(): boolean {
  if (typeof window === 'undefined') return false
  
  return 'HapticFeedback' in window || 'vibrate' in navigator
}

/**
 * Get the appropriate haptic feedback type from a boolean or string
 */
export function getHapticType(haptic: boolean | HapticFeedbackType): HapticFeedbackType | null {
  if (haptic === false) return null
  if (haptic === true) return 'light'
  return haptic
}