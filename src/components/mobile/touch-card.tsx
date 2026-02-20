/**
 * TouchCard - Card-specific touchable component with mobile optimizations
 */

'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { TouchableArea } from './touchable-area'
import type { TouchableAreaProps } from './touch-feedback-types'

export interface TouchCardProps extends Omit<TouchableAreaProps, 'as'> {
  className?: string
}

export const TouchCard = forwardRef<HTMLDivElement, TouchCardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <TouchableArea
        ref={ref}
        className={cn(
          'block p-4 rounded-lg border border-border-subtle bg-surface-1',
          'hover:bg-surface-2 focus:bg-surface-2',
          'transition-colors duration-200',
          className
        )}
        hapticFeedback="light"
        pressStyle="scale"
        minTouchSize={true}
        {...props}
      >
        {children}
      </TouchableArea>
    )
  }
)

TouchCard.displayName = 'TouchCard'