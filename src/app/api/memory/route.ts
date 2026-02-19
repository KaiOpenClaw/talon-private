import { NextRequest, NextResponse } from 'next/server'
import { logApiError } from '@/lib/logger'

const TALON_API_URL = process.env.TALON_API_URL || 'https://institutions-indicating-limit-were.trycloudflare.com'
const TALON_API_TOKEN = process.env.TALON_API_TOKEN || ''

interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: string
  modified?: string
}

// Standard memory files to list
const STANDARD_FILES = ['MEMORY.md', 'SOUL.md', 'TOOLS.md', 'AGENTS.md', 'USER.md', 'IDENTITY.md', 'HEARTBEAT.md']

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const agentId = searchParams.get('agentId') || searchParams.get('agent')
  const filePath = searchParams.get('file')
  
  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400 })
  }
  
  // If file requested, return file content
  if (filePath) {
    try {
      const res = await fetch(
        `${TALON_API_URL}/agents/${agentId}/file?name=${encodeURIComponent(filePath)}`,
        {
          headers: { 'Authorization': `Bearer ${TALON_API_TOKEN}` },
          cache: 'no-store',
        }
      )
      
      if (!res.ok) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      
      const data = await res.json()
      return NextResponse.json({ content: data.content, size: data.content?.length || 0 })
    } catch (e) {
      logApiError(e, {
        component: 'MemoryAPI',
        action: 'fetch_file',
        endpoint: '/api/memory',
        params: { path: request.nextUrl.searchParams.get('path') }
      })
      return NextResponse.json({ error: 'Failed to load file' }, { status: 500 })
    }
  }
  
  // List memory files - check which standard files exist
  const files: FileInfo[] = []
  
  for (const fileName of STANDARD_FILES) {
    try {
      const res = await fetch(
        `${TALON_API_URL}/agents/${agentId}/file?name=${encodeURIComponent(fileName)}`,
        {
          headers: { 'Authorization': `Bearer ${TALON_API_TOKEN}` },
          cache: 'no-store',
        }
      )
      
      if (res.ok) {
        const data = await res.json()
        files.push({
          name: fileName,
          path: fileName,
          type: 'file',
          size: formatSize(data.content?.length || 0),
        })
      }
    } catch {
      // File doesn't exist, skip
    }
  }
  
  return NextResponse.json({ files, agentId })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, file, content } = body
    
    if (!agentId || !file || content === undefined) {
      return NextResponse.json({ error: 'agentId, file, and content are required' }, { status: 400 })
    }
    
    // Only allow writing to .md files
    if (!file.endsWith('.md')) {
      return NextResponse.json({ error: 'Only .md files can be edited' }, { status: 400 })
    }
    
    const res = await fetch(`${TALON_API_URL}/agents/${agentId}/file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TALON_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: file, content }),
    })
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to write file' }, { status: 500 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    logApiError(e, {
      component: 'MemoryAPI',
      action: 'write_file',
      endpoint: '/api/memory',
      method: 'POST'
    })
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
