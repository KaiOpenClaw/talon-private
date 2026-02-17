/**
 * LanceDB Vector Search Integration
 * 
 * Provides semantic search across agent workspaces using
 * LanceDB for vector storage and OpenAI for embeddings.
 */

import * as lancedb from '@lancedb/lancedb'
import OpenAI from 'openai'

const LANCEDB_PATH = process.env.LANCEDB_PATH || './.lancedb'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIM = 1536

// Lazy initialization
let db: lancedb.Connection | null = null
let openai: OpenAI | null = null

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

/**
 * Initialize LanceDB connection
 */
async function getDb(): Promise<lancedb.Connection> {
  if (!db) {
    db = await lancedb.connect(LANCEDB_PATH)
    console.log('[LanceDB] Connected to:', LANCEDB_PATH)
  }
  return db
}

/**
 * Initialize OpenAI client
 */
function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not set')
    }
    openai = new OpenAI({ apiKey })
  }
  return openai
}

/**
 * Generate embedding for text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAI()
  
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // Limit input size
  })
  
  return response.data[0].embedding
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getOpenAI()
  
  // Batch in groups of 100
  const results: number[][] = []
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100).map(t => t.slice(0, 8000))
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    })
    results.push(...response.data.map(d => d.embedding))
  }
  
  return results
}

/**
 * Get or create the memories table
 */
async function getTable(): Promise<lancedb.Table> {
  const database = await getDb()
  const tableNames = await database.tableNames()
  
  if (tableNames.includes('memories')) {
    return database.openTable('memories')
  }
  
  // Create table with schema
  return database.createTable('memories', [{
    id: 'init',
    content: 'initialization',
    agentId: 'system',
    filePath: '',
    fileType: 'other',
    chunk: 0,
    timestamp: new Date().toISOString(),
    vector: new Array(EMBEDDING_DIM).fill(0),
  }])
}

/**
 * Index a document
 */
export async function indexDocument(doc: Omit<MemoryDocument, 'vector'>): Promise<void> {
  const table = await getTable()
  const vector = await generateEmbedding(doc.content)
  
  await table.add([{ ...doc, vector }])
}

/**
 * Index multiple documents
 */
export async function indexDocuments(docs: Omit<MemoryDocument, 'vector'>[]): Promise<void> {
  if (docs.length === 0) return
  
  const table = await getTable()
  const vectors = await generateEmbeddings(docs.map(d => d.content))
  
  const docsWithVectors = docs.map((doc, i) => ({
    ...doc,
    vector: vectors[i],
  }))
  
  await table.add(docsWithVectors)
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
  const { agentId, limit = 10, minScore = 0.5 } = options
  
  const table = await getTable()
  const queryVector = await generateEmbedding(query)
  
  let searchQuery = table.search(queryVector).limit(limit * 2) // Over-fetch for filtering
  
  // Filter by agent if specified
  if (agentId) {
    searchQuery = searchQuery.where(`agentId = '${agentId}'`)
  }
  
  const results = await searchQuery.toArray()
  
  return results
    .filter((r: any) => r._distance !== undefined && (1 - r._distance) >= minScore)
    .slice(0, limit)
    .map((r: any) => ({
      document: {
        id: r.id,
        content: r.content,
        agentId: r.agentId,
        filePath: r.filePath,
        fileType: r.fileType,
        chunk: r.chunk,
        timestamp: r.timestamp,
      },
      score: 1 - r._distance,
      snippet: r.content.slice(0, 200) + (r.content.length > 200 ? '...' : ''),
    }))
}

/**
 * Delete all documents for an agent
 */
export async function deleteAgentDocuments(agentId: string): Promise<void> {
  const table = await getTable()
  await table.delete(`agentId = '${agentId}'`)
}

/**
 * Get index statistics
 */
export async function getStats(): Promise<{
  totalDocuments: number
  byAgent: Record<string, number>
}> {
  const table = await getTable()
  const allDocs = await table.query().toArray()
  
  const byAgent: Record<string, number> = {}
  for (const doc of allDocs) {
    byAgent[doc.agentId] = (byAgent[doc.agentId] || 0) + 1
  }
  
  return {
    totalDocuments: allDocs.length,
    byAgent,
  }
}

/**
 * Check if LanceDB is available
 */
export async function isAvailable(): Promise<boolean> {
  try {
    await getDb()
    return true
  } catch {
    return false
  }
}
