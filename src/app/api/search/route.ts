import { NextRequest, NextResponse } from 'next/server'
import * as lancedb from '@/lib/lancedb'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logApiError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  // Apply rate limiting for search
  const rateLimited = checkRateLimit(request, RATE_LIMITS.SEARCH)
  if (rateLimited) return rateLimited
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || searchParams.get('query')
  const agentId = searchParams.get('agent') || searchParams.get('agentId')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }
  
  try {
    // Check if LanceDB is available
    const available = await lancedb.isAvailable()
    if (!available) {
      return NextResponse.json({
        error: 'Search not available',
        message: 'LanceDB not configured or OPENAI_API_KEY missing'
      }, { status: 503 })
    }
    
    const results = await lancedb.search(query, {
      agentId: agentId || undefined,
      limit,
      minScore: 0.5,
    })
    
    return NextResponse.json({
      query,
      results,
      count: results.length,
    })
  } catch (error) {
    logApiError(error, {
      component: 'SearchAPI',
      action: 'search_query',
      endpoint: '/api/search',
      params: { query, agentId, limit }
    })
    return NextResponse.json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, agentId, documents } = body
    
    // Apply stricter rate limiting for indexing
    if (action === 'index') {
      const rateLimited = checkRateLimit(request, RATE_LIMITS.INDEX)
      if (rateLimited) return rateLimited
    }
    
    if (action === 'index' && documents) {
      await lancedb.indexDocuments(documents)
      return NextResponse.json({ ok: true, indexed: documents.length })
    }
    
    if (action === 'delete' && agentId) {
      await lancedb.deleteAgentDocuments(agentId)
      return NextResponse.json({ ok: true, deleted: agentId })
    }
    
    if (action === 'stats') {
      const stats = await lancedb.getStats()
      return NextResponse.json(stats)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    logApiError(error, {
      component: 'SearchAPI',
      action: 'search_post',
      endpoint: '/api/search',
      method: 'POST'
    })
    return NextResponse.json({
      error: 'Operation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
