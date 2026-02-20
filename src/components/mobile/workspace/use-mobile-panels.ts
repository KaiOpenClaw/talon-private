/**
 * Custom hook for mobile panel state management
 * Handles panel navigation, gestures, and transitions
 */

import { useState, useEffect } from 'react';
import { PanelType, PanelState, SwipeGestureConfig } from './mobile-workspace-types';

const SWIPE_CONFIG: SwipeGestureConfig = {
  threshold: 50,
  edgeSwipeThreshold: 50
};

export function useMobilePanels() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle panel transitions
  const openPanel = (panel: PanelType) => {
    setIsTransitioning(true);
    setActivePanel(panel);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const closePanel = () => {
    setIsTransitioning(true);
    setActivePanel(null);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle swipe gestures for panel navigation
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Only trigger swipe if horizontal movement is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_CONFIG.threshold) {
        if (deltaX > 0 && startX < SWIPE_CONFIG.edgeSwipeThreshold && !activePanel) {
          // Swipe right from left edge - open channels
          openPanel('channels');
        } else if (deltaX < 0 && activePanel) {
          // Swipe left when panel is open - close panel
          closePanel();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activePanel]);

  return {
    activePanel,
    isTransitioning,
    openPanel,
    closePanel
  };
}