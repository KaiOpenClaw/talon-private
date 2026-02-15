'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, Folder, ChevronRight, ChevronDown, 
  ArrowLeft, Loader2, X 
} from 'lucide-react'

interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: string
}

interface MemoryViewerProps {
  agentId: string
  onClose?: () => void
}

function formatSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  
  return date.toLocaleDateString()
}

export default function MemoryViewer({ agentId, onClose }: MemoryViewerProps) {
  const [currentPath, setCurrentPath] = useState('')
  const [files, setFiles] = useState<FileInfo[]>([])
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch directory listing
  useEffect(() => {
    async function fetchFiles() {
      setLoading(true)
      setError(null)
      
      try {
        const res = await fetch(`/api/memory?agent=${agentId}&dir=${encodeURIComponent(currentPath)}`)
        if (!res.ok) throw new Error('Failed to load files')
        
        const data = await res.json()
        setFiles(data.files || [])
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFiles()
  }, [agentId, currentPath])

  // Load file content
  async function loadFile(filePath: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/memory?agent=${agentId}&file=${encodeURIComponent(filePath)}`)
      if (!res.ok) throw new Error('Failed to load file')
      
      const data = await res.json()
      setSelectedFile({ path: filePath, content: data.file.content })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Navigate to directory
  function navigateTo(path: string) {
    setSelectedFile(null)
    setCurrentPath(path)
  }

  // Go up one directory
  function goUp() {
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    navigateTo(parts.join('/'))
  }

  // Breadcrumb parts
  const pathParts = currentPath.split('/').filter(Boolean)

  return (
    <div className="h-full flex flex-col bg-surface-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-terminal-500" />
          <span className="font-medium">Memory Browser</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-surface-3 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-2 text-sm border-b border-border-subtle overflow-x-auto">
        <button 
          onClick={() => navigateTo('')}
          className="text-terminal-400 hover:text-terminal-300 font-mono"
        >
          {agentId}
        </button>
        {pathParts.map((part, i) => (
          <div key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-ink-muted" />
            <button
              onClick={() => navigateTo(pathParts.slice(0, i + 1).join('/'))}
              className="text-ink-secondary hover:text-ink-primary font-mono"
            >
              {part}
            </button>
          </div>
        ))}
        {loading && <Loader2 className="w-3 h-3 animate-spin ml-2 text-terminal-500" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* File list */}
        <div className={`${selectedFile ? 'w-64 border-r border-border-subtle' : 'flex-1'} overflow-y-auto`}>
          {currentPath && (
            <button
              onClick={goUp}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-2 text-left text-ink-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-sm">..</span>
            </button>
          )}
          
          {error ? (
            <div className="p-4">
              <div className="text-amber-400 text-sm mb-2">⚠️ {error}</div>
              <button 
                onClick={() => { setError(null); setLoading(true); }}
                className="text-xs text-terminal-400 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            files.map((file) => (
              <button
                key={file.path}
                onClick={() => file.type === 'directory' ? navigateTo(file.path) : loadFile(file.path)}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-2 text-left transition-colors ${
                  selectedFile?.path === file.path ? 'bg-terminal-500/10 border-l-2 border-terminal-500' : ''
                }`}
              >
                {file.type === 'directory' ? (
                  <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                ) : (
                  <FileText className={`w-4 h-4 flex-shrink-0 ${
                    file.name.endsWith('.md') ? 'text-green-400' : 'text-ink-tertiary'
                  }`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm truncate">{file.name}</div>
                  <div className="text-xs text-ink-muted flex gap-2">
                    {file.size !== undefined && <span>{formatSize(file.size)}</span>}
                    {file.modified && <span>{formatDate(file.modified)}</span>}
                  </div>
                </div>
                {file.type === 'directory' && (
                  <ChevronRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
                )}
              </button>
            ))
          )}
          
          {!loading && !error && files.length === 0 && (
            <div className="p-4 text-ink-muted text-sm text-center">
              No files found
            </div>
          )}
        </div>

        {/* File content */}
        {selectedFile && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 bg-surface-2 border-b border-border-subtle flex items-center justify-between sticky top-0">
              <span className="font-mono text-sm text-ink-secondary">{selectedFile.path}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-surface-3 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap text-ink-secondary leading-relaxed">
              {selectedFile.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
