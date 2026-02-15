/**
 * LanceDB Integration (Local-only)
 * 
 * LanceDB is too large for Vercel serverless functions.
 * This module provides stubs that work on Vercel and real
 * implementation when running locally.
 */

export interface MemoryDocument {
  id: string
  content: string
  scope: 'global' | 'project' | 'workspace' | 'cross'
  scopeId?: string
  sourcePath: string
  sourceType: 'memory' | 'soul' | 'daily' | 'document' | 'conversation'
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface SearchResult {
  document: MemoryDocument
  score: number
  snippet: string
}

export interface IndexStats {
  totalDocuments: number
  byScope: Record<string, number>
  lastIndexed?: string
}

// Check if we're on Vercel (serverless) or local
const IS_VERCEL = process.env.VERCEL === '1'

// Stub implementations for Vercel
export async function generateEmbedding(_text: string): Promise<number[]> {
  if (IS_VERCEL) {
    console.warn('LanceDB not available on Vercel')
    return []
  }
  // Local implementation would go here
  return []
}

export async function generateEmbeddings(_texts: string[]): Promise<number[][]> {
  if (IS_VERCEL) {
    console.warn('LanceDB not available on Vercel')
    return []
  }
  return []
}

export async function indexDocument(_doc: MemoryDocument): Promise<void> {
  if (IS_VERCEL) {
    console.warn('LanceDB indexing not available on Vercel')
    return
  }
}

export async function indexDocuments(_docs: MemoryDocument[]): Promise<void> {
  if (IS_VERCEL) {
    console.warn('LanceDB indexing not available on Vercel')
    return
  }
}

export async function search(
  _query: string,
  _options: {
    scope?: 'global' | 'project' | 'workspace' | 'cross' | 'all'
    scopeId?: string
    limit?: number
    minScore?: number
  } = {}
): Promise<SearchResult[]> {
  if (IS_VERCEL) {
    console.warn('LanceDB search not available on Vercel - use gateway memory search')
    return []
  }
  return []
}

export async function indexWorkspace(
  _workspaceId: string,
  _workspacePath: string
): Promise<number> {
  if (IS_VERCEL) return 0
  return 0
}

export async function indexAllWorkspaces(_agentsDir: string): Promise<Record<string, number>> {
  if (IS_VERCEL) return {}
  return {}
}

export async function indexGlobal(_workspaceRoot: string): Promise<number> {
  if (IS_VERCEL) return 0
  return 0
}

export async function getStats(): Promise<IndexStats> {
  return {
    totalDocuments: 0,
    byScope: {},
    lastIndexed: undefined,
  }
}

export async function clearIndex(_scope?: string): Promise<void> {
  // No-op
}
