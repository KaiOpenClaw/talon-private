import { NextRequest, NextResponse } from 'next/server'
import * as lancedb from '@/lib/lancedb'
import { logApiError } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * Test endpoint for LanceDB search functionality
 * GET /api/search/test
 */
export async function GET(request: NextRequest) {
  try {
    // Test basic availability
    const available = await lancedb.isAvailable()
    
    if (!available) {
      return NextResponse.json({
        success: false,
        message: 'LanceDB not available',
        details: {
          environment: process.env.NODE_ENV,
          lancedbPath: process.env.LANCEDB_PATH || '/root/clawd/talon-private/.lancedb',
          openaiKey: !!process.env.OPENAI_API_KEY
        }
      })
    }
    
    // Test search functionality
    const testResult = await lancedb.testSearch()
    
    if (testResult.success) {
      // Try a real search
      const searchResults = await lancedb.search('agent memory workspace', { 
        limit: 3,
        minScore: 0.3
      })
      
      // Get stats
      const stats = await lancedb.getStats()
      
      return NextResponse.json({
        success: true,
        message: 'LanceDB fully functional',
        testResult,
        searchSample: {
          query: 'agent memory workspace',
          resultsCount: searchResults.length,
          results: searchResults.map(r => ({
            agentId: r.document.agentId,
            filePath: r.document.filePath,
            score: r.score,
            snippet: r.snippet.slice(0, 100) + '...'
          }))
        },
        stats
      })
      
    } else {
      return NextResponse.json({
        success: false,
        message: 'LanceDB available but search failed',
        testResult
      })
    }
    
  } catch (error) {
    logApiError(error, {
      component: 'SearchTestAPI',
      action: 'test_search',
      endpoint: '/api/search/test'
    })
    
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}