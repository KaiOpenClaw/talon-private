import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile, stat, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

const AGENTS_DIR = process.env.AGENTS_DIR || '/root/clawd/agents'

interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: string
  modified?: string
}

// Get standard memory files for an agent
async function getMemoryFiles(agentId: string): Promise<FileInfo[]> {
  const agentDir = join(AGENTS_DIR, agentId)
  const files: FileInfo[] = []
  
  // Standard files to check
  const standardFiles = ['MEMORY.md', 'SOUL.md', 'TOOLS.md', 'AGENTS.md', 'USER.md']
  
  for (const fileName of standardFiles) {
    const filePath = join(agentDir, fileName)
    if (existsSync(filePath)) {
      try {
        const stats = await stat(filePath)
        files.push({
          name: fileName,
          path: fileName,
          type: 'file',
          size: formatSize(stats.size),
          modified: stats.mtime.toISOString(),
        })
      } catch {}
    }
  }
  
  // Check memory/ directory
  const memoryDir = join(agentDir, 'memory')
  if (existsSync(memoryDir)) {
    try {
      const entries = await readdir(memoryDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const filePath = join(memoryDir, entry.name)
          const stats = await stat(filePath)
          files.push({
            name: `memory/${entry.name}`,
            path: `memory/${entry.name}`,
            type: 'file',
            size: formatSize(stats.size),
            modified: stats.mtime.toISOString(),
          })
        }
      }
    } catch {}
  }
  
  return files
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// Read a specific file
async function readMemoryFile(agentId: string, filePath: string): Promise<{ content: string; size: number } | null> {
  const fullPath = join(AGENTS_DIR, agentId, filePath)
  
  // Security: ensure path doesn't escape agent directory
  const agentDir = join(AGENTS_DIR, agentId)
  if (!fullPath.startsWith(agentDir)) {
    return null
  }
  
  if (!existsSync(fullPath)) {
    return null
  }
  
  try {
    const stats = await stat(fullPath)
    if (stats.isDirectory()) {
      return null
    }
    
    // Limit file size to 1MB
    if (stats.size > 1024 * 1024) {
      return {
        content: '[File too large to display - max 1MB]',
        size: stats.size,
      }
    }
    
    const content = await readFile(fullPath, 'utf-8')
    return { content, size: stats.size }
  } catch {
    return null
  }
}

// Write a file
async function writeMemoryFile(agentId: string, filePath: string, content: string): Promise<boolean> {
  const fullPath = join(AGENTS_DIR, agentId, filePath)
  
  // Security: ensure path doesn't escape agent directory
  const agentDir = join(AGENTS_DIR, agentId)
  if (!fullPath.startsWith(agentDir)) {
    return false
  }
  
  // Only allow writing to .md files
  if (!filePath.endsWith('.md')) {
    return false
  }
  
  try {
    // Ensure directory exists
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, content, 'utf-8')
    return true
  } catch (e) {
    console.error('Failed to write file:', e)
    return false
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const agentId = searchParams.get('agentId') || searchParams.get('agent')
  const filePath = searchParams.get('file')
  
  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400 })
  }
  
  // Check agent exists
  const agentDir = join(AGENTS_DIR, agentId)
  if (!existsSync(agentDir)) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }
  
  // If file requested, return file content
  if (filePath) {
    const result = await readMemoryFile(agentId, filePath)
    if (!result) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    return NextResponse.json({ content: result.content, size: result.size })
  }
  
  // Otherwise, list memory files
  const files = await getMemoryFiles(agentId)
  return NextResponse.json({ files, agentId })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, file, content } = body
    
    if (!agentId || !file || content === undefined) {
      return NextResponse.json({ error: 'agentId, file, and content are required' }, { status: 400 })
    }
    
    const success = await writeMemoryFile(agentId, file, content)
    if (!success) {
      return NextResponse.json({ error: 'Failed to write file' }, { status: 500 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Memory POST error:', e)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
