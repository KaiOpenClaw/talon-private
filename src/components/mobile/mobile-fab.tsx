/**
 * Floating Action Button for mobile interfaces
 * Quick access to common actions on mobile devices
 */

'use client'

import { useState } from 'react'
import { Plus, Search, Zap, MessageCircle, X } from 'lucide-react'
import { FloatingActionButton, TouchButton } from './touch-feedback'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface MobileFabProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

export function MobileFab({ 
  className,
  position = 'bottom-right' 
}: MobileFabProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const quickActions = [
    {
      icon: Search,
      label: 'Search',
      href: '/search',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: MessageCircle,
      label: 'New Chat',
      href: '/',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: Zap,
      label: 'Skills',
      href: '/skills', 
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  return (
    <div className={cn("lg:hidden", className)}>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Action buttons */}
      {isExpanded && (
        <div className="fixed z-50 space-y-3" style={{
          bottom: position.includes('bottom') ? '5rem' : 'auto',
          right: position.includes('right') ? '1rem' : 'auto',
          left: position.includes('left') ? '1rem' : 'auto',
          transform: position.includes('center') ? 'translateX(-50%)' : 'none'
        }}>
          {quickActions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setIsExpanded(false)}
            >
              <FloatingActionButton
                size="sm"
                hapticFeedback="light"
                className={cn(
                  action.color,
                  'opacity-0 transform scale-50 animate-in duration-200',
                  // Stagger animation
                  index === 0 && 'delay-75',
                  index === 1 && 'delay-150',
                  index === 2 && 'delay-300'
                )}
                style={{
                  animation: `fadeInUp 200ms ease-out ${index * 75}ms forwards`
                }}
                aria-label={action.label}
              >
                <action.icon className="w-5 h-5" />
              </FloatingActionButton>
            </Link>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <FloatingActionButton
        onClick={toggleExpanded}
        position={position}
        hapticFeedback="medium"
        className="z-50 shadow-xl"
        aria-label={isExpanded ? 'Close quick actions' : 'Open quick actions'}
      >
        <div className="transition-transform duration-300">
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </div>
      </FloatingActionButton>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Simple FAB for specific actions
 */
export function SimpleFab({
  icon: Icon,
  onClick,
  label,
  position = 'bottom-right',
  className
}: {
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  label: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  className?: string
}) {
  return (
    <FloatingActionButton
      onClick={onClick}
      position={position}
      hapticFeedback="medium"
      className={cn("lg:hidden shadow-xl", className)}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
    </FloatingActionButton>
  )
}

export default MobileFab