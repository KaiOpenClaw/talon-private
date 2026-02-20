import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// In production, this would store subscriptions in a database
const subscriptions = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()
    
    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      )
    }

    // Store subscription (in production, save to database with user ID)
    const subscriptionKey = subscription.endpoint
    subscriptions.add(subscriptionKey)

    logger.info('Push notification subscription added', {
      component: 'NotificationSubscribeAPI',
      action: 'subscribe',
      endpoint: subscriptionKey.substring(0, 50) + '...' // Truncate for privacy
    })

    return NextResponse.json({ 
      success: true,
      message: 'Subscription saved successfully' 
    })
  } catch (error) {
    logger.error('Failed to save push subscription', {
      component: 'NotificationSubscribeAPI',
      action: 'subscribe',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    count: subscriptions.size,
    vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY || 'not-configured'
  })
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json()
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      )
    }

    subscriptions.delete(endpoint)
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription removed successfully' 
    })
  } catch (error) {
    logger.error('Failed to remove push subscription', {
      component: 'NotificationSubscribeAPI', 
      action: 'unsubscribe',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}