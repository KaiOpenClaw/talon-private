/**
 * LanceDB Vector Search Integration
 * 
 * Provides semantic search across agent workspaces using
 * LanceDB for vector storage and OpenAI for embeddings.
 * 
 * Note: LanceDB requires native modules and only works on Render,
 * not Vercel. This module gracefully degrades on unsupported platforms.
 */

import * as lancedb from '@lancedb/lancedb'
import OpenAI from 'openai'

export interface MemoryDocument {
  id: string
  content: string
  agentId: string
  filePath: string
  fileType: 'memory' | 'soul' | 'tools' | 'agents' | 'user' | 'other'
  chunk: number
  timestamp: string
  vector?: number[]
}

export interface SearchResult {
  document: MemoryDocument
  score: number
  snippet: string
}

// Environment configuration
const LANCEDB_PATH = process.env.LANCEDB_PATH || '/root/clawd/talon-private/.lancedb'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIM = 1536

// Check if we're in a supported environment
const isSupported = (): boolean => {
  try {
    // Check if we have required dependencies
    if (!process.env.OPENAI_API_KEY) return false
    
    // Check if LanceDB can be imported (will fail on Vercel/Edge)
    return typeof lancedb !== 'undefined'
  } catch (error) {
    return false
  }
}

// Initialize OpenAI client (lazy)
let openaiClient: OpenAI | null = null
const getOpenAI = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

// Database connection cache
let dbConnection: lancedb.Connection | null = null
let tableConnection: lancedb.Table | null = null

/**
 * Get database connection (cached)
 */
async function getDB(): Promise<lancedb.Connection> {
  if (!dbConnection) {
    try {
      dbConnection = await lancedb.connect(LANCEDB_PATH)
    } catch (error) {
      throw new Error(`Failed to connect to LanceDB: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  return dbConnection
}

/**
 * Get memories table (cached)
 */
async function getTable(): Promise<lancedb.Table> {
  if (!tableConnection) {
    const db = await getDB()
    const tableNames = await db.tableNames()
    
    if (tableNames.includes('memories')) {
      tableConnection = await db.openTable('memories')
    } else {
      throw new Error('Memories table not found. Run indexing script first.')
    }
  }
  return tableConnection
}

/**
 * Check if LanceDB is available and configured
 */
export async function isAvailable(): Promise<boolean> {
  if (!isSupported()) return false
  
  try {
    const db = await getDB()
    const tableNames = await db.tableNames()
    return tableNames.includes('memories')
  } catch (error) {
    return false
  }
}

/**
 * Generate embedding for a text query
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI()
  
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000), // OpenAI limit
    })
    
    return response.data[0].embedding
  } catch (error) {
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search for similar documents
 */
export async function search(
  query: string,
  options: {
    agentId?: string
    limit?: number
    minScore?: number
  } = {}
): Promise<SearchResult[]> {
  if (!isSupported()) {
    throw new Error('LanceDB not available in this environment')
  }

  const { agentId, limit = 10, minScore = 0.5 } = options

  try {
    // Generate query embedding
    const queryVector = await generateEmbedding(query)
    
    // Get table and search
    const table = await getTable()
    
    // Build the search query
    let searchBuilder = table
      .vectorSearch(queryVector)
      .limit(limit * 2) // Get more results to filter by score
    
    // Add agent filter if specified
    if (agentId) {
      searchBuilder = searchBuilder.where(`agentId = '${agentId}'`)
    }
    
    // Execute search
    const results = await searchBuilder.toArray()
    
    // Convert to SearchResult format and filter by score
    const searchResults: SearchResult[] = results
      .map((row: any) => {
        const score = 1 - (row._distance || 0) // Convert distance to similarity score
        return {
          document: {
            id: row.id,
            content: row.content,
            agentId: row.agentId,
            filePath: row.filePath,
            fileType: row.fileType,
            chunk: row.chunk,
            timestamp: row.timestamp,
          } as MemoryDocument,
          score,
          snippet: generateSnippet(row.content, query),
        }
      })
      .filter(result => result.score >= minScore)
      .slice(0, limit) // Apply final limit
    
    return searchResults
    
  } catch (error) {
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a snippet highlighting relevant parts of the content
 */
function generateSnippet(content: string, query: string, maxLength: number = 200): string {
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  const contentLower = content.toLowerCase()
  
  // Find the best position to center the snippet
  let bestPos = 0
  let bestScore = 0
  
  for (let i = 0; i < content.length - maxLength; i += 50) {
    const chunk = contentLower.slice(i, i + maxLength)
    const score = queryWords.reduce((acc, word) => acc + (chunk.includes(word) ? 1 : 0), 0)
    
    if (score > bestScore) {
      bestScore = score
      bestPos = i
    }
  }
  
  // Extract snippet
  let snippet = content.slice(bestPos, bestPos + maxLength).trim()
  
  // Clean up snippet boundaries
  if (bestPos > 0) snippet = '...' + snippet
  if (bestPos + maxLength < content.length) snippet = snippet + '...'
  
  return snippet
}

/**
 * Index a single document (for real-time updates)
 */
export async function indexDocument(doc: Omit<MemoryDocument, 'vector'>): Promise<void> {
  if (!isSupported()) return

  try {
    // Generate embedding
    const vector = await generateEmbedding(doc.content)
    
    // Add to table
    const table = await getTable()
    await table.add([{ ...doc, vector }] as any[])
    
  } catch (error) {
    throw new Error(`Failed to index document: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Index multiple documents (batch operation)
 */
export async function indexDocuments(docs: Omit<MemoryDocument, 'vector'>[]): Promise<void> {
  if (!isSupported()) return
  if (docs.length === 0) return

  try {
    const openai = getOpenAI()
    
    // Generate embeddings in batches
    const BATCH_SIZE = 50
    const docsWithVectors: MemoryDocument[] = []

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE)
      const texts = batch.map(d => d.content.slice(0, 8000))
      
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
      })

      for (let j = 0; j < batch.length; j++) {
        docsWithVectors.push({
          ...batch[j],
          vector: response.data[j].embedding,
        })
      }
    }

    // Add to table
    const table = await getTable()
    await table.add(docsWithVectors as any[])
    
  } catch (error) {
    throw new Error(`Failed to index documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete all documents for an agent
 */
export async function deleteAgentDocuments(agentId: string): Promise<void> {
  if (!isSupported()) return

  try {
    const table = await getTable()
    await table.delete(`agentId = '${agentId}'`)
  } catch (error) {
    throw new Error(`Failed to delete agent documents: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get index statistics
 */
export async function getStats(): Promise<{
  totalDocuments: number
  byAgent: Record<string, number>
}> {
  if (!isSupported()) {
    return { totalDocuments: 0, byAgent: {} }
  }

  try {
    const table = await getTable()
    
    // Get total count
    const countResult = await table.countRows()
    const totalDocuments = countResult || 0
    
    // Get count by agent (simplified version)
    const byAgent: Record<string, number> = {}
    
    // This is a simplified implementation - in a full version you'd want
    // to use SQL aggregation, but for now we'll return basic stats
    
    return { totalDocuments, byAgent }
    
  } catch (error) {
    throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Test the search functionality with a simple query
 */
export async function testSearch(): Promise<{ success: boolean, message: string, results?: number }> {
  try {
    const available = await isAvailable()
    if (!available) {
      return { success: false, message: 'LanceDB not available or not configured' }
    }
    
    const results = await search('test', { limit: 1 })
    return { 
      success: true, 
      message: `Search working: ${results.length} results found`,
      results: results.length
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Search test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}