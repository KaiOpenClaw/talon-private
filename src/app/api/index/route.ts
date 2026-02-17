import { NextRequest, NextResponse } from 'next/server'
import * as lancedb from '@/lib/lancedb'

/**
 * GET /api/index - Get indexing stats
 */
export async function GET() {
  try {
    const available = await lancedb.isAvailable()
    
    if (!available) {
      return NextResponse.json({
        status: 'unavailable',
        message: 'LanceDB not enabled. Set LANCEDB_ENABLED=true on Render.',
      })
    }

    const stats = await lancedb.getStats()
    
    return NextResponse.json({
      status: 'ready',
      ...stats,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * POST /api/index - Trigger indexing (placeholder)
 */
export async function POST(request: NextRequest) {
  const available = await lancedb.isAvailable()
  
  if (!available) {
    return NextResponse.json({
      error: 'LanceDB not enabled',
      message: 'Deploy to Render with LANCEDB_ENABLED=true for indexing.',
    }, { status: 503 })
  }

  return NextResponse.json({
    ok: true,
    message: 'Indexing triggered (implementation pending)',
  })
}
