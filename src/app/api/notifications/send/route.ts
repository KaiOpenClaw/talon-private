import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Configure VAPID keys for push notifications
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@talon.app'
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    vapidKeys.subject,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

interface PushNotificationPayload {
  title: string
  body: string
  type?: 'info' | 'success' | 'warning' | 'error'
  tag?: string
  data?: Record<string, unknown>
  requireInteraction?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { payload, subscriptions } = await request.json()

    if (!payload || !subscriptions || !Array.isArray(subscriptions)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      return NextResponse.json(
        { error: 'Push notifications not configured - missing VAPID keys' },
        { status: 500 }
      )
    }

    const notificationPayload: PushNotificationPayload = {
      title: payload.title,
      body: payload.body,
      type: payload.type || 'info',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.requireInteraction || false
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: unknown) => {
        try {
          await webpush.sendNotification(
            subscription as webpush.PushSubscription,
            JSON.stringify(notificationPayload),
            {
              urgency: 'normal',
              TTL: 24 * 60 * 60, // 24 hours
            }
          )
          return { success: true, endpoint: (subscription as { endpoint?: string }).endpoint }
        } catch (error: unknown) {
          logger.error('Failed to send push notification', {
            endpoint: (subscription as { endpoint?: string }).endpoint,
            error: error instanceof Error ? error.message : String(error),
            component: 'push-notifications',
            api: '/api/notifications/send'
          })
          return { 
            success: false, 
            endpoint: (subscription as { endpoint?: string }).endpoint, 
            error: error instanceof Error ? error.message : String(error)
          }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    logger.info('Push notifications sent', {
      successful,
      failed,
      total: results.length,
      successRate: `${Math.round((successful / results.length) * 100)}%`,
      component: 'push-notifications'
    })

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false })
    })
  } catch (error) {
    logger.error('Failed to send push notifications', {
      error: error instanceof Error ? error.message : String(error),
      component: 'push-notifications',
      api: '/api/notifications/send',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

// Test endpoint for sending a test notification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test')

  if (test === 'true') {
    try {
      // This would normally get subscriptions from database
      // For demo purposes, return a test payload structure
      return NextResponse.json({
        configured: !!(vapidKeys.publicKey && vapidKeys.privateKey),
        vapidPublicKey: vapidKeys.publicKey ? 'configured' : 'missing',
        testPayload: {
          title: 'Talon Test Notification',
          body: 'Push notifications are working correctly!',
          type: 'success',
          tag: 'test-notification'
        }
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Test failed', details: error },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    endpoint: '/api/notifications/send',
    methods: ['POST'],
    description: 'Send push notifications to subscribed users',
    testEndpoint: '?test=true'
  })
}