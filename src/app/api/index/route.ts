import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as lancedb from '@/lib/lancedb'

const AGENTS_ROOT = '/root/clawd/agents'
const CHUNK_SIZE = 1500

interface IndexProgress {
  agent: string
  files: number
  chunks: number
  status: 'pending' | 'indexing' | 'done' | 'error'
}

/**
 * GET /api/index - Get indexing stats
 */
export async function GET() {
  try {
    const available = await lancedb.isAvailable()
    
    if (!available) {
      return NextResponse.json({
        status: 'unavailable',
        message: 'LanceDB not available',
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
 * POST /api/index - Trigger indexing
 */
export async function POST(request: NextRequest) {
  try {
    const available = await lancedb.isAvailable()
    
    if (!available) {
      return NextResponse.json({
        error: 'LanceDB not available',
      }, { status: 503 })
    }

    const body = await request.json().catch(() => ({}))
    const { agentId, action } = body

    if (action === 'stats') {
      const stats = await lancedb.getStats()
      return NextResponse.json(stats)
    }

    // Re-index a specific agent or all agents
    const agents = agentId 
      ? [agentId] 
      : getAgentList()

    const results: IndexProgress[] = []

    for (const agent of agents) {
      try {
        const progress = await indexAgent(agent)
        results.push(progress)
      } catch (e) {
        results.push({
          agent,
          files: 0,
          chunks: 0,
          status: 'error',
        })
      }
    }

    return NextResponse.json({
      ok: true,
      indexed: results.filter(r => r.status === 'done').length,
      results,
    })
  } catch (error) {
    console.error('Index error:', error)
    return NextResponse.json({
      error: 'Indexing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

function getAgentList(): string[] {
  try {
    return fs.readdirSync(AGENTS_ROOT)
      .filter(name => {
        const stat = fs.statSync(path.join(AGENTS_ROOT, name))
        return stat.isDirectory() && !name.startsWith('.')
      })
  } catch {
    return []
  }
}

async function indexAgent(agentId: string): Promise<IndexProgress> {
  const agentPath = path.join(AGENTS_ROOT, agentId)
  
  if (!fs.existsSync(agentPath)) {
    return { agent: agentId, files: 0, chunks: 0, status: 'error' }
  }

  // Delete existing
  await lancedb.deleteAgentDocuments(agentId)

  const patterns = [
    { pattern: 'MEMORY.md', type: 'memory' },
    { pattern: 'SOUL.md', type: 'soul' },
    { pattern: 'TOOLS.md', type: 'tools' },
    { pattern: 'AGENTS.md', type: 'agents' },
  ]

  const docs: Array<{
    id: string
    content: string
    agentId: string
    filePath: string
    fileType: string
    chunk: number
    timestamp: string
  }> = []

  let files = 0

  for (const { pattern, type } of patterns) {
    const filePath = path.join(agentPath, pattern)
    
    if (!fs.existsSync(filePath)) continue

    const content = fs.readFileSync(filePath, 'utf-8')
    if (!content.trim()) continue

    files++
    const chunks = chunkText(content, CHUNK_SIZE)

    for (let i = 0; i < chunks.length; i++) {
      docs.push({
        id: `${agentId}:${pattern}:${i}`,
        content: chunks[i],
        agentId,
        filePath: pattern,
        fileType: type,
        chunk: i,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Also index memory/*.md files
  const memoryDir = path.join(agentPath, 'memory')
  if (fs.existsSync(memoryDir)) {
    const memoryFiles = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'))
    
    for (const file of memoryFiles) {
      const filePath = path.join(memoryDir, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      if (!content.trim()) continue
      
      files++
      const chunks = chunkText(content, CHUNK_SIZE)

      for (let i = 0; i < chunks.length; i++) {
        docs.push({
          id: `${agentId}:memory/${file}:${i}`,
          content: chunks[i],
          agentId,
          filePath: `memory/${file}`,
          fileType: 'memory',
          chunk: i,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  if (docs.length > 0) {
    await lancedb.indexDocuments(docs)
  }

  return {
    agent: agentId,
    files,
    chunks: docs.length,
    status: 'done',
  }
}

function chunkText(text: string, maxChars: number): string[] {
  const chunks: string[] = []
  const lines = text.split('\n')
  let current = ''

  for (const line of lines) {
    if (current.length + line.length + 1 > maxChars && current.length > 0) {
      chunks.push(current.trim())
      current = ''
    }
    current += line + '\n'
  }

  if (current.trim()) {
    chunks.push(current.trim())
  }

  return chunks
}
