'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { Agent, Session, Blocker } from '@/lib/hooks'
import { logger } from '@/lib/logger'

// Lazy load mobile nav only when needed
const MobileNav = lazy(() => import('./mobile-nav'))

interface ConditionalMobileNavProps {
  selectedAgent: Agent | null
  onAgentSelect: (agent: Agent) => void
  agents: Agent[]
  sessions: Session[]
  blockers: Blocker[]
  loading: boolean
  focusedAgentIndex: number
  onFocusedAgentChange: (index: number) => void
  onKeyNavigation: (event: React.KeyboardEvent) => void
}

// Mobile detection with proper hydration handling
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      setIsHydrated(true)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isHydrated }
}

// Minimal loading placeholder that matches mobile nav height
const MobileNavSkeleton = () => (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-1 border-t border-border-subtle z-40 animate-pulse">
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
    </div>
  </div>
)

export default function ConditionalMobileNav(props: ConditionalMobileNavProps) {
  const { isMobile, isHydrated } = useMobileDetection()

  // Don't render anything until we know if we're mobile
  if (!isHydrated) {
    return null
  }

  // Don't render mobile nav on desktop
  if (!isMobile) {
    return null
  }

  // Render mobile nav with suspense
  return (
    <Suspense fallback={<MobileNavSkeleton />}>
      <MobileNav {...props} />
    </Suspense>
  )
}

// Performance tracking
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalLoad = window.onload
  window.onload = (event) => {
    if (originalLoad) originalLoad.call(window, event)
    
    // Track bundle size impact
    const isMobile = window.innerWidth < 1024
    logger.debug(`Mobile nav ${isMobile ? 'loaded' : 'skipped'}`, {
      component: 'conditional-mobile-nav',
      action: 'bundle-optimization',
      isMobile,
      linesSaved: 401
    })
  }
}