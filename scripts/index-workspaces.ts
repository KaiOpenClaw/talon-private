#!/usr/bin/env npx tsx
/**
 * Index Agent Workspaces for Semantic Search
 * 
 * Scans all agent workspaces in /root/clawd/agents and indexes
 * their memory files into LanceDB for semantic search.
 * 
 * Usage:
 *   npx tsx scripts/index-workspaces.ts [--agent=<id>] [--dry-run]
 */

import * as fs from 'fs'
import * as path from 'path'
import * as lancedb from '@lancedb/lancedb'
import OpenAI from 'openai'

const AGENTS_ROOT = '/root/clawd/agents'
const LANCEDB_PATH = process.env.LANCEDB_PATH || '/root/clawd/talon-private/.lancedb'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIM = 1536
const CHUNK_SIZE = 1500 // Characters per chunk

interface Document {
  id: string
  content: string
  agentId: string
  filePath: string
  fileType: string
  chunk: number
  timestamp: string
  vector: number[]
}

// Parse CLI args
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const agentArg = args.find(a => a.startsWith('--agent='))
const targetAgent = agentArg?.split('=')[1]

async function main() {
  console.log('🔍 OpenClaw Workspace Indexer')
  console.log('============================')
  console.log(`LanceDB Path: ${LANCEDB_PATH}`)
  console.log(`Dry Run: ${dryRun}`)
  console.log(`Target Agent: ${targetAgent || 'all'}`)
  console.log('')

  // Initialize OpenAI
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set')
    process.exit(1)
  }

  // Initialize LanceDB
  const db = await lancedb.connect(LANCEDB_PATH)
  console.log('✅ Connected to LanceDB')

  // Get or create table
  const tableNames = await db.tableNames()
  let table: lancedb.Table

  if (tableNames.includes('memories')) {
    table = await db.openTable('memories')
    console.log('📚 Opened existing memories table')
  } else {
    table = await db.createTable('memories', [{
      id: 'init',
      content: 'initialization',
      agentId: 'system',
      filePath: '',
      fileType: 'other',
      chunk: 0,
      timestamp: new Date().toISOString(),
      vector: new Array(EMBEDDING_DIM).fill(0),
    }])
    console.log('📚 Created new memories table')
  }

  // Get list of agents
  const agents = fs.readdirSync(AGENTS_ROOT)
    .filter(name => {
      const stat = fs.statSync(path.join(AGENTS_ROOT, name))
      return stat.isDirectory() && !name.startsWith('.')
    })
    .filter(name => !targetAgent || name === targetAgent)

  console.log(`\n📁 Found ${agents.length} agent workspaces\n`)

  // File patterns to index
  const patterns = [
    { pattern: 'MEMORY.md', type: 'memory' },
    { pattern: 'SOUL.md', type: 'soul' },
    { pattern: 'TOOLS.md', type: 'tools' },
    { pattern: 'AGENTS.md', type: 'agents' },
    { pattern: 'memory/*.md', type: 'memory' },
    { pattern: 'docs/*.md', type: 'docs' },
  ]

  let totalDocs = 0
  let totalChunks = 0
  const docsToIndex: Omit<Document, 'vector'>[] = []

  for (const agentId of agents) {
    const agentPath = path.join(AGENTS_ROOT, agentId)
    console.log(`\n🤖 ${agentId}`)

    // Delete existing documents for this agent (re-index)
    if (!dryRun) {
      try {
        await table.delete(`agentId = '${agentId}'`)
        console.log(`   🗑️  Cleared existing index`)
      } catch (e) {
        // Table might not have data yet
      }
    }

    for (const { pattern, type } of patterns) {
      const files = findFiles(agentPath, pattern)
      
      for (const filePath of files) {
        const relativePath = path.relative(AGENTS_ROOT, filePath)
        const content = fs.readFileSync(filePath, 'utf-8')
        
        if (!content.trim()) continue

        // Chunk the content
        const chunks = chunkText(content, CHUNK_SIZE)
        
        console.log(`   📄 ${path.basename(filePath)} (${chunks.length} chunks)`)
        totalDocs++
        totalChunks += chunks.length

        for (let i = 0; i < chunks.length; i++) {
          docsToIndex.push({
            id: `${agentId}:${relativePath}:${i}`,
            content: chunks[i],
            agentId,
            filePath: relativePath,
            fileType: type,
            chunk: i,
            timestamp: new Date().toISOString(),
          })
        }
      }
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Documents: ${totalDocs}`)
  console.log(`   Chunks: ${totalChunks}`)
  console.log(`   Est. embedding cost: $${(totalChunks * 0.0001).toFixed(4)}`)

  if (dryRun) {
    console.log('\n⚠️  Dry run - no changes made')
    return
  }

  if (docsToIndex.length === 0) {
    console.log('\n✅ Nothing to index')
    return
  }

  // Generate embeddings in batches
  console.log('\n🧠 Generating embeddings...')
  const BATCH_SIZE = 50
  const docsWithVectors: Document[] = []

  for (let i = 0; i < docsToIndex.length; i += BATCH_SIZE) {
    const batch = docsToIndex.slice(i, i + BATCH_SIZE)
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

    const progress = Math.min(100, Math.round((i + batch.length) / docsToIndex.length * 100))
    process.stdout.write(`\r   Progress: ${progress}% (${i + batch.length}/${docsToIndex.length})`)
  }
  console.log('')

  // Add to LanceDB
  console.log('\n💾 Saving to LanceDB...')
  await table.add(docsWithVectors)
  
  console.log('\n✅ Indexing complete!')
  console.log(`   ${docsWithVectors.length} chunks indexed`)
}

function findFiles(basePath: string, pattern: string): string[] {
  const results: string[] = []
  
  if (pattern.includes('*')) {
    // Glob pattern like memory/*.md
    const [dir, ext] = pattern.split('/')
    const dirPath = path.join(basePath, dir)
    
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
      for (const file of files) {
        if (ext === '*.md' && file.endsWith('.md')) {
          results.push(path.join(dirPath, file))
        }
      }
    }
  } else {
    // Direct file
    const filePath = path.join(basePath, pattern)
    if (fs.existsSync(filePath)) {
      results.push(filePath)
    }
  }
  
  return results
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

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
