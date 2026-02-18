/**
 * useMediaQuery hook for responsive design
 * Provides a React hook interface for CSS media queries with SSR support
 */

import { useState, useEffect } from 'react'

/**
 * Hook for listening to CSS media queries
 * @param query - The media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false to avoid hydration mismatches
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Create MediaQueryList object
    const mediaQuery = window.matchMedia(query)
    
    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener function
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    mediaQuery.addEventListener('change', handleMediaQueryChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
    }
  }, [query])

  return matches
}

/**
 * Predefined breakpoint hooks for common responsive patterns
 */
export function useMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

export function useTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

export function useLargeDesktop(): boolean {
  return useMediaQuery('(min-width: 1280px)')
}

/**
 * Device capability hooks
 */
export function useTouch(): boolean {
  return useMediaQuery('(pointer: coarse)')
}

export function useHover(): boolean {
  return useMediaQuery('(hover: hover)')
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)')
}

/**
 * Viewport size hook with debouncing
 */
export function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const updateSize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, 100) // Debounce resize events
    }

    // Set initial size
    updateSize()

    window.addEventListener('resize', updateSize)
    return () => {
      window.removeEventListener('resize', updateSize)
      clearTimeout(timeoutId)
    }
  }, [])

  return size
}

/**
 * Orientation hook
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const isLandscape = useMediaQuery('(orientation: landscape)')
  return isLandscape ? 'landscape' : 'portrait'
}

/**
 * Safe area insets hook for mobile devices with notches
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement)
      
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10), 
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10)
      })
    }

    // Set CSS custom properties for safe area insets
    const root = document.documentElement
    root.style.setProperty('--sat', 'env(safe-area-inset-top)')
    root.style.setProperty('--sar', 'env(safe-area-inset-right)')
    root.style.setProperty('--sab', 'env(safe-area-inset-bottom)')
    root.style.setProperty('--sal', 'env(safe-area-inset-left)')

    updateInsets()

    // Listen for orientation changes that might affect safe areas
    window.addEventListener('orientationchange', updateInsets)
    window.addEventListener('resize', updateInsets)

    return () => {
      window.removeEventListener('orientationchange', updateInsets)
      window.removeEventListener('resize', updateInsets)
    }
  }, [])

  return insets
}

/**
 * Compound hook for comprehensive responsive information
 */
export function useResponsive() {
  const isMobile = useMobile()
  const isTablet = useTablet() 
  const isDesktop = useDesktop()
  const isLargeDesktop = useLargeDesktop()
  const isTouch = useTouch()
  const canHover = useHover()
  const prefersReducedMotion = usePrefersReducedMotion()
  const prefersDark = useDarkMode()
  const prefersHighContrast = usePrefersHighContrast()
  const orientation = useOrientation()
  const viewportSize = useViewportSize()
  const safeAreaInsets = useSafeAreaInsets()

  return {
    // Device type
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // Capabilities
    isTouch,
    canHover,
    
    // Preferences
    prefersReducedMotion,
    prefersDark,
    prefersHighContrast,
    
    // Layout
    orientation,
    viewportSize,
    safeAreaInsets,
    
    // Computed properties
    isSmallScreen: isMobile || isTablet,
    isLargeScreen: isDesktop || isLargeDesktop,
    isMobileDevice: isTouch && isMobile,
    isTabletDevice: isTouch && isTablet
  }
}

export default useMediaQuery