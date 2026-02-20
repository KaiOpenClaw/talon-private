/**
 * Custom hook for haptic feedback on mobile devices
 * Provides native-like touch feedback for enhanced mobile UX
 * Part of Issue #217 mobile optimization features
 */

'use client';

import { useCallback, useRef } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

interface HapticOptions {
  enabled?: boolean;
  fallbackToVibration?: boolean;
}

interface HapticFeedbackHook {
  trigger: (type?: HapticType, intensity?: number) => void;
  isSupported: boolean;
  isEnabled: boolean;
}

export function useHapticFeedback(options: HapticOptions = {}): HapticFeedbackHook {
  const { enabled = true, fallbackToVibration = true } = options;
  
  // Cache support detection
  const supportRef = useRef<{
    hapticEngine: boolean;
    webkitHaptic: boolean;
    vibration: boolean;
  } | null>(null);

  const detectSupport = useCallback(() => {
    if (supportRef.current) return supportRef.current;

    if (typeof window === 'undefined') {
      supportRef.current = {
        hapticEngine: false,
        webkitHaptic: false,
        vibration: false
      };
      return supportRef.current;
    }

    const support = {
      // iOS Haptic Engine (Safari on iOS 13+)
      hapticEngine: 'DeviceMotionEvent' in window && 'requestPermission' in (DeviceMotionEvent as any),
      
      // WebKit Haptic Feedback (newer WebKit versions)
      webkitHaptic: 'webkitHapticFeedback' in window,
      
      // Generic Vibration API (Android Chrome, some others)
      vibration: 'vibrate' in navigator
    };

    supportRef.current = support;
    return support;
  }, []);

  const trigger = useCallback((type: HapticType = 'light', intensity: number = 1) => {
    if (!enabled) return;

    const support = detectSupport();
    
    try {
      // iOS Haptic Engine (most sophisticated)
      if (support.hapticEngine && (window as any).webkit?.messageHandlers?.haptic) {
        const hapticTypes = {
          light: 'impactLight',
          medium: 'impactMedium', 
          heavy: 'impactHeavy',
          selection: 'selectionChanged',
          impact: 'impactMedium',
          notification: 'notificationSuccess'
        };

        (window as any).webkit.messageHandlers.haptic.postMessage({
          type: hapticTypes[type] || hapticTypes.light,
          intensity: Math.max(0, Math.min(1, intensity))
        });
        return;
      }

      // WebKit Haptic Feedback (newer Safari versions)
      if (support.webkitHaptic && (window as any).webkitHapticFeedback) {
        const webkitTypes = {
          light: 0,
          medium: 1,
          heavy: 2,
          selection: 0,
          impact: 1,
          notification: 2
        };

        (window as any).webkitHapticFeedback(webkitTypes[type] || webkitTypes.light);
        return;
      }

      // Fallback to Vibration API
      if (fallbackToVibration && support.vibration && navigator.vibrate) {
        const vibrationPatterns: Record<HapticType, number | number[]> = {
          light: 10,
          medium: 20,
          heavy: 50,
          selection: [10, 10],
          impact: [20, 10, 10],
          notification: [50, 30, 50]
        };

        const pattern = vibrationPatterns[type];
        const scaledPattern = Array.isArray(pattern) 
          ? pattern.map(duration => Math.round(duration * intensity))
          : Math.round(pattern * intensity);

        navigator.vibrate(scaledPattern);
        return;
      }

      // Audio feedback as last resort (subtle click)
      if (type === 'selection' || type === 'light') {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = type === 'selection' ? 800 : 400;
        gainNode.gain.setValueAtTime(0.1 * intensity, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
      }

    } catch (error) {
      // Silently fail - haptic feedback is enhancement, not critical
      console.debug('Haptic feedback failed:', error);
    }
  }, [enabled, fallbackToVibration, detectSupport]);

  const support = detectSupport();
  const isSupported = support.hapticEngine || support.webkitHaptic || support.vibration;

  return {
    trigger,
    isSupported,
    isEnabled: enabled && isSupported
  };
}

// Convenience hooks for specific haptic patterns
export function useSelectionHaptic(options?: HapticOptions) {
  const { trigger, isSupported, isEnabled } = useHapticFeedback(options);
  
  const triggerSelection = useCallback(() => {
    trigger('selection', 0.7);
  }, [trigger]);
  
  return { trigger: triggerSelection, isSupported, isEnabled };
}

export function useImpactHaptic(options?: HapticOptions) {
  const { trigger, isSupported, isEnabled } = useHapticFeedback(options);
  
  const triggerImpact = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    trigger(intensity, 1);
  }, [trigger]);
  
  return { trigger: triggerImpact, isSupported, isEnabled };
}

export function useNotificationHaptic(options?: HapticOptions) {
  const { trigger, isSupported, isEnabled } = useHapticFeedback(options);
  
  const triggerNotification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    const intensityMap = { success: 0.8, warning: 0.6, error: 1.0 };
    trigger('notification', intensityMap[type]);
  }, [trigger]);
  
  return { trigger: triggerNotification, isSupported, isEnabled };
}