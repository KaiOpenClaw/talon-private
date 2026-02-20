/**
 * Multi-Gesture Component
 * Combines multiple gesture types
 */
'use client'

import { SwipeGestureArea } from './swipe-gesture'
import { PinchZoomArea } from './pinch-zoom'
import { LongPressArea } from './long-press'
import { MultiGestureProps } from './advanced-gesture-types'

export function MultiGestureArea({
  children,
  enableSwipe = true,
  enablePinchZoom = false,
  enableLongPress = false,
  className,
  ...props
}: MultiGestureProps) {
  let component = children

  if (enableLongPress) {
    component = (
      <LongPressArea
        onLongPress={props.onLongPress!}
        delay={props.delay}
        disabled={props.disabled}
      >
        {component}
      </LongPressArea>
    )
  }

  if (enablePinchZoom) {
    component = (
      <PinchZoomArea
        minScale={props.minScale}
        maxScale={props.maxScale}
        disabled={props.disabled}
        onScaleChange={props.onScaleChange}
      >
        {component}
      </PinchZoomArea>
    )
  }

  if (enableSwipe) {
    component = (
      <SwipeGestureArea
        onSwipeLeft={props.onSwipeLeft}
        onSwipeRight={props.onSwipeRight}
        onSwipeUp={props.onSwipeUp}
        onSwipeDown={props.onSwipeDown}
        threshold={props.threshold}
        velocity={props.velocity}
        disabled={props.disabled}
      >
        {component}
      </SwipeGestureArea>
    )
  }

  return <div className={className}>{component}</div>
}