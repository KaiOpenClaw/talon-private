import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { logger } from '@/lib/logger'

const PROJECTS_PATH = process.env.PROJECTS_PATH || '/root/clawd/PROJECTS.md'

interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'planning' | 'paused' | 'completed'
  agents: string[]
  target?: string
  deadline?: string
  progress?: number
}

function parseProjectsFile(content: string): Project[] {
  const projects: Project[] = []
  const lines = content.split('\n')
  
  let currentProject: Partial<Project> | null = null
  let projectId = 0
  
  for (const line of lines) {
    // Project header (## Project Name)
    const headerMatch = line.match(/^##\s+(.+)/)
    if (headerMatch) {
      // Save previous project
      if (currentProject?.name) {
        projects.push({
          id: `project-${projectId}`,
          name: currentProject.name,
          description: currentProject.description,
          status: currentProject.status || 'active',
          agents: currentProject.agents || [],
          target: currentProject.target,
          deadline: currentProject.deadline,
          progress: currentProject.progress,
        })
      }
      
      projectId++
      currentProject = { name: headerMatch[1].trim() }
      continue
    }
    
    if (!currentProject) continue
    
    // Parse project fields
    const fieldMatch = line.match(/^[-*]\s*\*\*(.+?):\*\*\s*(.+)$/)
    if (fieldMatch) {
      const [, key, value] = fieldMatch
      const keyLower = key.toLowerCase()
      
      if (keyLower.includes('status')) {
        if (value.toLowerCase().includes('active')) currentProject.status = 'active'
        else if (value.toLowerCase().includes('planning')) currentProject.status = 'planning'
        else if (value.toLowerCase().includes('paused')) currentProject.status = 'paused'
        else if (value.toLowerCase().includes('complete')) currentProject.status = 'completed'
      } else if (keyLower.includes('agent')) {
        currentProject.agents = value.split(',').map(a => a.trim().replace(/`/g, ''))
      } else if (keyLower.includes('target')) {
        currentProject.target = value
      } else if (keyLower.includes('deadline') || keyLower.includes('date')) {
        currentProject.deadline = value
      } else if (keyLower.includes('progress')) {
        const progressMatch = value.match(/(\d+)%?/)
        if (progressMatch) currentProject.progress = parseInt(progressMatch[1])
      } else if (keyLower.includes('description') || keyLower.includes('goal')) {
        currentProject.description = value
      }
    }
    
    // Also check for inline description after header
    if (line.startsWith('> ') && currentProject && !currentProject.description) {
      currentProject.description = line.slice(2).trim()
    }
  }
  
  // Save last project
  if (currentProject?.name) {
    projects.push({
      id: `project-${projectId}`,
      name: currentProject.name,
      description: currentProject.description,
      status: currentProject.status || 'active',
      agents: currentProject.agents || [],
      target: currentProject.target,
      deadline: currentProject.deadline,
      progress: currentProject.progress,
    })
  }
  
  return projects
}

export async function GET() {
  try {
    if (!existsSync(PROJECTS_PATH)) {
      return NextResponse.json({ projects: [] })
    }
    
    const content = await readFile(PROJECTS_PATH, 'utf-8')
    const projects = parseProjectsFile(content)
    
    return NextResponse.json({ 
      projects,
      summary: {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        planning: projects.filter(p => p.status === 'planning').length,
        completed: projects.filter(p => p.status === 'completed').length,
      }
    })
  } catch (error) {
    logger.error('Failed to load projects', {
      component: 'ProjectsAPI',
      action: 'load_projects',
      error: error instanceof Error ? error.message : String(error),
      path: PROJECTS_PATH
    })
    return NextResponse.json({ projects: [], error: 'Failed to load projects' }, { status: 500 })
  }
}
