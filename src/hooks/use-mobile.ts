/**
 * Mobile detection hook for responsive Talon experience
 */

'use client';

import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useMobile(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    screenWidth: 1920,
    screenHeight: 1080
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < MOBILE_BREAKPOINT;
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      const isDesktop = width >= TABLET_BREAKPOINT;
      const orientation = height > width ? 'portrait' : 'landscape';

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        screenWidth: width,
        screenHeight: height
      });
    };

    // Initial detection
    updateDetection();

    // Listen for resize events
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
}

// Hook for mobile-specific behavior
export function useMobileBehavior() {
  const { isMobile } = useMobile();
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [supportsTouchGestures, setSupportsTouchGestures] = useState(false);
  const [supportsHaptics, setSupportsHaptics] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(userAgent);
    const android = /Android/.test(userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(android);

    // Check for touch support
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setSupportsTouchGestures(touchSupported);

    // Check for haptic feedback support
    const hapticSupported = 'vibrate' in navigator;
    setSupportsHaptics(hapticSupported);
  }, []);

  return {
    isMobile,
    isIOS,
    isAndroid,
    supportsTouchGestures,
    supportsHaptics
  };
}

// PWA installation detection
export function usePWA() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isWebApp = 'standalone' in (navigator as any) && (navigator as any).standalone;
    setIsInstalled(isStandalone || isWebApp);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
      return true;
    }
    
    return false;
  };

  return {
    canInstall,
    isInstalled,
    promptInstall
  };
}