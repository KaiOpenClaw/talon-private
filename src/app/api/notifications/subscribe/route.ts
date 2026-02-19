import { NextRequest, NextResponse } from 'next/server'

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

    console.log(`New push notification subscription: ${subscriptionKey}`)

    return NextResponse.json({ 
      success: true,
      message: 'Subscription saved successfully' 
    })
  } catch (error) {
    console.error('Failed to save push subscription:', error)
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
    console.error('Failed to remove push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}