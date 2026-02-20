/**
 * Types and interfaces for semantic search components
 */

export interface SearchResult {
  document: {
    id: string
    content: string
    agentId: string
    filePath: string
    fileType: string
    chunk: number
    timestamp: string
  }
  score: number
  snippet: string
}

export interface IndexStats {
  status: string
  totalDocuments: number
  byAgent: Record<string, number>
  lastIndexed?: string
}

export interface SemanticSearchProps {
  defaultAgentId?: string
  onResultClick?: (result: SearchResult) => void
}

export interface SearchInputProps {
  query: string
  onQueryChange: (query: string) => void
  agentFilter: string
  onAgentFilterChange: (agent: string) => void
  agents: string[]
  searching: boolean
  onSearch: () => void
  onShowIndexPanel: () => void
}

export interface SearchResultsProps {
  results: SearchResult[]
  query: string
  onResultClick?: (result: SearchResult) => void
}

export interface IndexPanelProps {
  stats: IndexStats | null
  indexing: boolean
  agentFilter: string
  onClose: () => void
  onTriggerIndex: (agentId?: string) => void
}

export interface SearchErrorBannerProps {
  isStale: boolean
  onRetry: () => void
}