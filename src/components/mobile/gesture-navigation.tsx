/**
 * Gesture navigation for mobile Talon
 * Swipe between agents and workspaces with smooth animations
 */

'use client';

import { ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GestureNavigationProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
  sensitivity?: number;
  className?: string;
}

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.3;

export default function GestureNavigation({
  children,
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft = true,
  canSwipeRight = true,
  sensitivity = SWIPE_THRESHOLD,
  className = ''
}: GestureNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isTransitioning) return;

    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    setCurrentTranslate(0);
  }, [isTransitioning]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart || isTransitioning) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only handle horizontal swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    // Prevent default scrolling during horizontal swipe
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
    }

    // Add resistance at the boundaries
    let translate = deltaX;
    if (deltaX > 0 && !canSwipeRight) {
      translate = deltaX * 0.2; // Reduced movement when can't swipe right
    } else if (deltaX < 0 && !canSwipeLeft) {
      translate = deltaX * 0.2; // Reduced movement when can't swipe left
    }

    setCurrentTranslate(translate);
  }, [touchStart, isTransitioning, canSwipeLeft, canSwipeRight]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart) return;

    const deltaX = currentTranslate;
    const deltaTime = Date.now() - touchStart.time;
    const velocity = Math.abs(deltaX) / deltaTime;

    const shouldSwipe = Math.abs(deltaX) > sensitivity || velocity > VELOCITY_THRESHOLD;

    if (shouldSwipe) {
      setIsTransitioning(true);
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      if (deltaX > 0 && canSwipeRight && onSwipeRight) {
        // Swipe right
        setCurrentTranslate(window.innerWidth);
        setTimeout(() => {
          onSwipeRight();
          setCurrentTranslate(0);
          setIsTransitioning(false);
        }, 200);
      } else if (deltaX < 0 && canSwipeLeft && onSwipeLeft) {
        // Swipe left  
        setCurrentTranslate(-window.innerWidth);
        setTimeout(() => {
          onSwipeLeft();
          setCurrentTranslate(0);
          setIsTransitioning(false);
        }, 200);
      } else {
        // Snap back
        setCurrentTranslate(0);
        setTimeout(() => setIsTransitioning(false), 200);
      }
    } else {
      // Snap back to original position
      setCurrentTranslate(0);
    }

    setTouchStart(null);
  }, [touchStart, currentTranslate, sensitivity, canSwipeLeft, canSwipeRight, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Visual swipe indicators */}
      {canSwipeLeft && currentTranslate > 20 && (
        <div 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-accent/80 text-white rounded-full p-2 transition-opacity duration-200"
          style={{ opacity: Math.min(currentTranslate / 100, 1) }}
        >
          <ChevronRight className="w-6 h-6" />
        </div>
      )}
      
      {canSwipeRight && currentTranslate < -20 && (
        <div 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-accent/80 text-white rounded-full p-2 transition-opacity duration-200"
          style={{ opacity: Math.min(Math.abs(currentTranslate) / 100, 1) }}
        >
          <ChevronLeft className="w-6 h-6" />
        </div>
      )}

      {/* Content with gesture transform */}
      <div 
        className="h-full transition-transform duration-200 ease-out"
        style={{ 
          transform: `translateX(${currentTranslate}px)`,
          transitionDuration: isTransitioning ? '200ms' : '0ms'
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Agent carousel for swipe navigation
interface AgentCarouselProps {
  agents: Array<{ id: string; name: string; status: string }>;
  currentAgentId: string;
  onAgentChange: (agentId: string) => void;
  children: ReactNode;
}

export function AgentCarousel({ 
  agents, 
  currentAgentId, 
  onAgentChange, 
  children 
}: AgentCarouselProps) {
  const currentIndex = agents.findIndex(agent => agent.id === currentAgentId);
  const canSwipeLeft = currentIndex < agents.length - 1;
  const canSwipeRight = currentIndex > 0;

  const handleSwipeLeft = () => {
    if (canSwipeLeft) {
      onAgentChange(agents[currentIndex + 1].id);
    }
  };

  const handleSwipeRight = () => {
    if (canSwipeRight) {
      onAgentChange(agents[currentIndex - 1].id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Agent indicator dots */}
      <div className="flex justify-center items-center gap-2 py-3 bg-surface-1 border-b border-accent/20">
        {agents.map((agent, index) => (
          <button
            key={agent.id}
            onClick={() => onAgentChange(agent.id)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-accent w-6' 
                : 'bg-text-muted hover:bg-text-secondary'
            }`}
            aria-label={`Switch to ${agent.name}`}
          />
        ))}
      </div>

      {/* Gesture-enabled content */}
      <div className="flex-1">
        <GestureNavigation
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          canSwipeLeft={canSwipeLeft}
          canSwipeRight={canSwipeRight}
          className="h-full"
        >
          {children}
        </GestureNavigation>
      </div>

      {/* Agent navigation hint */}
      <div className="flex justify-between items-center px-4 py-2 bg-surface-1 border-t border-accent/20 text-xs text-text-muted">
        <span className={canSwipeRight ? 'opacity-100' : 'opacity-30'}>
          ← {canSwipeRight ? agents[currentIndex - 1]?.name : 'First agent'}
        </span>
        <span className="font-medium text-text-primary">
          {agents[currentIndex]?.name}
        </span>
        <span className={canSwipeLeft ? 'opacity-100' : 'opacity-30'}>
          {canSwipeLeft ? agents[currentIndex + 1]?.name : 'Last agent'} →
        </span>
      </div>
    </div>
  );
}

// Hook for managing swipe state
export function useSwipeNavigation() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const startNavigation = useCallback((dir: 'left' | 'right') => {
    setIsNavigating(true);
    setDirection(dir);
  }, []);

  const finishNavigation = useCallback(() => {
    setTimeout(() => {
      setIsNavigating(false);
      setDirection(null);
    }, 300);
  }, []);

  return {
    isNavigating,
    direction,
    startNavigation,
    finishNavigation
  };
}

// Enhanced mobile workspace with swipe navigation
export function MobileWorkspaceWithGestures({ 
  workspaceId, 
  availableAgents = [] 
}: { 
  workspaceId: string;
  availableAgents?: Array<{ id: string; name: string; status: string }>;
}) {
  const [currentAgentId, setCurrentAgentId] = useState(workspaceId);

  return (
    <AgentCarousel
      agents={availableAgents}
      currentAgentId={currentAgentId}
      onAgentChange={setCurrentAgentId}
    >
      <div className="h-full bg-surface-0">
        {/* Workspace content for current agent */}
        <div className="p-4">
          <h1 className="text-xl font-bold text-text-primary mb-4">
            {availableAgents.find(a => a.id === currentAgentId)?.name || 'Agent Workspace'}
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-surface-1 rounded-lg border border-accent/20">
              <h3 className="font-medium text-text-primary mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-surface-2 rounded-lg text-text-primary font-medium hover:bg-surface-3 active:scale-95 transition-all duration-200">
                  Chat
                </button>
                <button className="p-3 bg-surface-2 rounded-lg text-text-primary font-medium hover:bg-surface-3 active:scale-95 transition-all duration-200">
                  Memory
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-surface-1 rounded-lg border border-accent/20">
              <h3 className="font-medium text-text-primary mb-2">Recent Activity</h3>
              <p className="text-text-secondary text-sm">
                No recent activity for this agent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AgentCarousel>
  );
}