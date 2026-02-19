import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { logApiError } from '@/lib/logger'
import { Blocker } from '@/lib/hooks'

const BLOCKERS_PATH = process.env.BLOCKERS_PATH || '/root/clawd/BLOCKERS.md'

function parseBlockersFile(content: string): Blocker[] {
  const blockers: Blocker[] = []
  const lines = content.split('\n')
  
  let currentCategory = ''
  let blockerId = 0
  let inTable = false
  let tableHeaders: string[] = []
  
  for (const line of lines) {
    // Track category headers
    const categoryMatch = line.match(/^##\s+(.+)/)
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim()
      inTable = false
      tableHeaders = []
      // Skip "recently cleared" or similar sections
      if (currentCategory.toLowerCase().includes('cleared') || 
          currentCategory.toLowerCase().includes('completed') ||
          currentCategory.toLowerCase().includes('status')) {
        currentCategory = ''
      }
      continue
    }
    
    // Parse table header
    if (line.startsWith('|') && line.includes('Blocker')) {
      tableHeaders = line.split('|').map(h => h.trim().toLowerCase()).filter(Boolean)
      inTable = true
      continue
    }
    
    // Skip table separator
    if (line.match(/^\|[\s-|]+\|$/)) continue
    
    // Parse table rows (skip if we're in a cleared/completed section)
    if (inTable && line.startsWith('|') && currentCategory) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length >= 2) {
        const text = cells[0]
        const status = cells[cells.length - 1]?.toLowerCase() || ''
        
        // Skip completed/cleared items
        if (status.includes('✅') || status.includes('done') || status.includes('cleared')) continue
        
        // Determine priority - Jack's blockers are high priority
        let priority: 'high' | 'medium' | 'low' = 'medium'
        if (currentCategory.toLowerCase().includes('jack') || 
            currentCategory.toLowerCase().includes('human') ||
            text.toLowerCase().includes('critical')) {
          priority = 'high'
        }
        
        // Extract owner from category or table
        let owner: string | undefined
        if (currentCategory.toLowerCase().includes('jack')) owner = 'Jack'
        
        blockers.push({
          id: `blocker-${++blockerId}`,
          text,
          owner,
          status: 'open',
          priority,
          category: currentCategory.replace(/[🚧🤖📊✅🎯]/g, '').trim() || undefined
        })
      }
      continue
    }
    
    // Also parse checkbox lists as fallback
    const blockerMatch = line.match(/^[-*]\s*\[([ xX])\]\s*(.+)$/)
    if (blockerMatch) {
      const isResolved = blockerMatch[1].toLowerCase() === 'x'
      const text = blockerMatch[2].trim()
      
      if (isResolved) continue
      
      const ownerMatch = text.match(/@(\w+)/)
      const owner = ownerMatch ? ownerMatch[1] : undefined
      
      let priority: 'high' | 'medium' | 'low' = 'medium'
      if (text.toLowerCase().includes('critical') || currentCategory.toLowerCase().includes('jack')) {
        priority = 'high'
      }
      
      blockers.push({
        id: `blocker-${++blockerId}`,
        text: text.replace(/@\w+\s*/, '').trim(),
        owner,
        status: 'open',
        priority,
        category: currentCategory.replace(/[🚧🤖📊✅🎯]/g, '').trim() || undefined
      })
    }
  }
  
  return blockers
}

export async function GET() {
  try {
    if (!existsSync(BLOCKERS_PATH)) {
      return NextResponse.json({ blockers: [] })
    }
    
    const content = await readFile(BLOCKERS_PATH, 'utf-8')
    const blockers = parseBlockersFile(content)
    
    return NextResponse.json({ 
      blockers,
      summary: {
        total: blockers.length,
        high: blockers.filter(b => b.priority === 'high').length,
        medium: blockers.filter(b => b.priority === 'medium').length,
        low: blockers.filter(b => b.priority === 'low').length
      }
    })
  } catch (error) {
    logApiError(error, {
      component: 'BlockersAPI',
      action: 'fetch_blockers',
      endpoint: '/api/blockers',
      blockers_path: BLOCKERS_PATH
    })
    return NextResponse.json({ blockers: [], error: 'Failed to load blockers' }, { status: 500 })
  }
}
