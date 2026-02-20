/**
 * Gesture-based agent navigation for mobile
 * Implements swipe gestures to navigate between agents on touch devices
 * Addresses mobile UX improvement for Issue #217
 */

'use client';

import { ReactNode, useRef, useState, useEffect, TouchEventHandler, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'busy' | 'offline';
}

interface GestureAgentNavigatorProps {
  children: ReactNode;
  agents: Agent[];
  currentAgentId: string;
  onAgentChange: (agentId: string) => void;
  disabled?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 50; // Minimum distance to trigger navigation
const SWIPE_VELOCITY_THRESHOLD = 0.5; // Minimum velocity to trigger navigation
const VISUAL_FEEDBACK_THRESHOLD = 30; // Distance before showing visual feedback

export default function GestureAgentNavigator({
  children,
  agents,
  currentAgentId,
  onAgentChange,
  disabled = false,
  className = ''
}: GestureAgentNavigatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'left' | 'right' | null>(null);
  
  const { trigger: hapticTrigger } = useHapticFeedback();

  // Get current agent index and adjacent agents
  const currentIndex = agents.findIndex(agent => agent.id === currentAgentId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < agents.length - 1;
  const previousAgent = hasPrevious ? agents[currentIndex - 1] : null;
  const nextAgent = hasNext ? agents[currentIndex + 1] : null;

  const resetState = useCallback(() => {
    setTouchStart(null);
    setTouchCurrent(null);
    setIsNavigating(false);
    setShowFeedback(null);
  }, []);

  const handleTouchStart: TouchEventHandler = useCallback((e) => {
    if (disabled || agents.length <= 1) return;

    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  }, [disabled, agents.length]);

  const handleTouchMove: TouchEventHandler = useCallback((e) => {
    if (!touchStart || disabled) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // If vertical movement is more prominent, don't intercept
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      resetState();
      return;
    }

    // Prevent vertical scrolling during horizontal gesture
    if (Math.abs(deltaX) > VISUAL_FEEDBACK_THRESHOLD) {
      e.preventDefault();
    }

    setTouchCurrent({ x: touch.clientX, y: touch.clientY });

    // Show visual feedback based on swipe direction and availability
    if (Math.abs(deltaX) > VISUAL_FEEDBACK_THRESHOLD) {
      if (deltaX > 0 && hasPrevious) {
        if (showFeedback !== 'right') {
          setShowFeedback('right'); // Swiping right to go to previous
          hapticTrigger('light'); // Light haptic when feedback appears
        }
      } else if (deltaX < 0 && hasNext) {
        if (showFeedback !== 'left') {
          setShowFeedback('left'); // Swiping left to go to next
          hapticTrigger('light'); // Light haptic when feedback appears
        }
      } else {
        setShowFeedback(null);
      }
    } else {
      setShowFeedback(null);
    }
  }, [touchStart, disabled, hasPrevious, hasNext, resetState]);

  const handleTouchEnd: TouchEventHandler = useCallback(() => {
    if (!touchStart || !touchCurrent || disabled) {
      resetState();
      return;
    }

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    const velocity = Math.abs(deltaX) / deltaTime;

    // Check if this is a horizontal swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      resetState();
      return;
    }

    // Check if swipe meets threshold requirements
    const meetsDistance = Math.abs(deltaX) > SWIPE_THRESHOLD;
    const meetsVelocity = velocity > SWIPE_VELOCITY_THRESHOLD;

    if (meetsDistance || meetsVelocity) {
      setIsNavigating(true);

      // Determine direction and navigate
      if (deltaX > 0 && hasPrevious) {
        // Swipe right - go to previous agent
        hapticTrigger('selection'); // Selection haptic for navigation
        onAgentChange(previousAgent!.id);
      } else if (deltaX < 0 && hasNext) {
        // Swipe left - go to next agent  
        hapticTrigger('selection'); // Selection haptic for navigation
        onAgentChange(nextAgent!.id);
      }

      // Reset after animation
      setTimeout(() => {
        resetState();
      }, 150);
    } else {
      resetState();
    }
  }, [
    touchStart, 
    touchCurrent, 
    disabled, 
    hasPrevious, 
    hasNext, 
    previousAgent, 
    nextAgent, 
    onAgentChange,
    resetState
  ]);

  // Reset on agent change from external source
  useEffect(() => {
    resetState();
  }, [currentAgentId, resetState]);

  // Calculate visual feedback position
  const getTransformStyle = () => {
    if (!touchStart || !touchCurrent || !showFeedback) return {};

    const deltaX = touchCurrent.x - touchStart.x;
    const maxTransform = 20; // Maximum transform in pixels
    const transform = Math.max(-maxTransform, Math.min(maxTransform, deltaX * 0.1));
    
    return {
      transform: `translateX(${transform}px)`,
      transition: isNavigating ? 'transform 0.15s ease-out' : 'none'
    };
  };

  return (
    <div 
      ref={containerRef}
      className={`relative touch-pan-y select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Visual feedback indicators */}
      {showFeedback === 'left' && hasNext && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-3 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <div className="text-sm font-medium text-primary">
              {nextAgent?.name}
            </div>
          </div>
        </div>
      )}
      
      {showFeedback === 'right' && hasPrevious && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-3 flex items-center gap-2">
            <div className="text-sm font-medium text-primary">
              {previousAgent?.name}
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      )}

      {/* Agent navigation hints at bottom */}
      {agents.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-surface-3/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1">
              {agents.map((agent, index) => (
                <div
                  key={agent.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    agent.id === currentAgentId 
                      ? 'bg-primary' 
                      : 'bg-surface-6'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-text-secondary ml-2">
              Swipe to navigate
            </div>
          </div>
        </div>
      )}

      {/* Main content with gesture transform */}
      <div style={getTransformStyle()}>
        {children}
      </div>
    </div>
  );
}