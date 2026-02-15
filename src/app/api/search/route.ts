import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:5050'
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || ''

// Use gateway's memory search instead of local LanceDB
// This works on Vercel since it's just an API call

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, scope, scopeId, limit = 10, minScore = 0.5 } = body
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (GATEWAY_TOKEN) headers['Authorization'] = `Bearer ${GATEWAY_TOKEN}`
    
    // Call gateway memory search
    const res = await fetch(`${GATEWAY_URL}/api/memory/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        maxResults: limit,
        minScore,
        scope: scopeId || scope,
      }),
    })
    
    if (!res.ok) {
      // Return empty results instead of error for graceful degradation
      return NextResponse.json({ 
        results: [],
        query,
        message: 'Gateway memory search unavailable',
      })
    }
    
    const data = await res.json()
    return NextResponse.json({
      results: data.results || [],
      query,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ 
      results: [],
      error: 'Search failed',
    })
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query') || searchParams.get('q')
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }
  
  // Reuse POST logic
  const fakeRequest = {
    json: async () => ({
      query,
      limit: parseInt(searchParams.get('limit') || '10'),
      scope: searchParams.get('scope'),
      scopeId: searchParams.get('scopeId'),
    }),
  } as NextRequest
  
  return POST(fakeRequest)
}
