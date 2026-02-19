'use client'

import Link from 'next/link'
import { ChevronLeft, Search as SearchIcon, Brain } from 'lucide-react'
import { LazySemanticSearch } from '@/components/lazy-dashboard-components'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface-1">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary hover:text-ink-primary">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Semantic Search
              </h1>
              <p className="text-sm text-ink-tertiary">
                Search across all memory, projects, and workspaces with AI embeddings
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <LazySemanticSearch />
        
        {/* Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
              <SearchIcon className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-medium mb-1">Global Search</h3>
            <p className="text-sm text-ink-tertiary">
              Search PROJECTS.md, BLOCKERS.md, CONTACTS.md across the entire gateway
            </p>
          </div>
          
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
              <SearchIcon className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-medium mb-1">Workspace Search</h3>
            <p className="text-sm text-ink-tertiary">
              Search MEMORY.md, SOUL.md, and daily logs within each agent workspace
            </p>
          </div>
          
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
              <SearchIcon className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="font-medium mb-1">Cross-Workspace</h3>
            <p className="text-sm text-ink-tertiary">
              Find related context across multiple agent workspaces
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
