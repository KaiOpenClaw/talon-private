'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Save, Loader2, RefreshCw, Check, X, FolderOpen } from 'lucide-react'
import { logger, logApiError } from '@/lib/logger'

interface MemoryFile {
  path: string
  name: string
  content?: string
  size?: string
}

interface MemoryEditorProps {
  agentId: string
  onClose?: () => void
}

export default function MemoryEditor({ agentId, onClose }: MemoryEditorProps) {
  const [files, setFiles] = useState<MemoryFile[]>([])
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(null)
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  // Load file list
  const loadFiles = useCallback(async () => {
    setLoading(true)
    const startTime = Date.now()
    try {
      logger.debug('Loading memory files', { agentId })
      const res = await fetch(`/api/memory?agentId=${encodeURIComponent(agentId)}`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files || [])
        // Auto-select MEMORY.md if exists
        const memoryFile = data.files?.find((f: MemoryFile) => f.name === 'MEMORY.md')
        if (memoryFile && !selectedFile) {
          loadFile(memoryFile)
        }
        
        logger.info('Memory files loaded successfully', {
          agentId,
          fileCount: data.files?.length || 0,
          duration: Date.now() - startTime
        })
      }
    } catch (error) {
      logApiError(error, {
        component: 'MemoryEditor',
        action: 'loadFiles',
        agentId
      })
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // Load file content
  const loadFile = async (file: MemoryFile) => {
    setSelectedFile(file)
    setLoading(true)
    const startTime = Date.now()
    try {
      logger.debug('Loading file content', { agentId, filePath: file.path })
      const res = await fetch(`/api/memory?agentId=${encodeURIComponent(agentId)}&file=${encodeURIComponent(file.path)}`)
      if (res.ok) {
        const data = await res.json()
        setContent(data.content || '')
        setOriginalContent(data.content || '')
        setSaveStatus('idle')
        
        logger.info('File loaded successfully', {
          agentId,
          filePath: file.path,
          contentLength: data.content?.length || 0,
          duration: Date.now() - startTime
        })
      }
    } catch (error) {
      logApiError(error, {
        component: 'MemoryEditor',
        action: 'loadFile',
        agentId,
        filePath: file.path
      })
    } finally {
      setLoading(false)
    }
  }

  // Save file
  const saveFile = async () => {
    if (!selectedFile || content === originalContent) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          file: selectedFile.path,
          content,
        }),
      })
      
      if (res.ok) {
        setOriginalContent(content)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
        
        logger.info('File saved successfully', {
          agentId,
          filePath: selectedFile.path,
          contentLength: content.length
        })
      } else {
        setSaveStatus('error')
        logger.error('Failed to save file - HTTP error', {
          agentId,
          filePath: selectedFile.path,
          status: res.status,
          statusText: res.statusText
        })
      }
    } catch (error) {
      logApiError(error, {
        component: 'MemoryEditor',
        action: 'saveFile',
        agentId,
        filePath: selectedFile?.path
      })
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = content !== originalContent

  return (
    <div className="flex flex-col h-full bg-surface-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-1">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-400" />
          <h2 className="font-medium">Memory Editor</h2>
          {selectedFile && (
            <span className="text-sm text-ink-muted font-mono">
              {selectedFile.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-400 text-sm">
              <X className="w-4 h-4" /> Error
            </span>
          )}
          <button
            onClick={saveFile}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              hasChanges 
                ? 'bg-terminal-600 hover:bg-terminal-500 text-white' 
                : 'bg-surface-3 text-ink-muted cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-3 rounded-lg text-ink-tertiary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File List */}
        <aside className="w-48 border-r border-border-subtle overflow-y-auto bg-surface-1">
          <div className="p-2">
            <div className="text-xs font-medium text-ink-tertiary uppercase tracking-wider px-2 py-1 mb-1">
              Files
            </div>
            {loading && files.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-ink-muted" />
              </div>
            ) : (
              <div className="space-y-0.5">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => loadFile(file)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors ${
                      selectedFile?.path === file.path
                        ? 'bg-terminal-500/15 text-terminal-400'
                        : 'hover:bg-surface-2 text-ink-secondary'
                    }`}
                  >
                    {file.name.endsWith('/') ? (
                      <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                    <span className="truncate font-mono text-xs">{file.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 p-4 bg-surface-0 text-sm font-mono resize-none focus:outline-none text-ink-primary"
              placeholder="File content..."
              spellCheck={false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-ink-muted">
              <p>Select a file to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      {selectedFile && (
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-1 text-xs text-ink-muted flex items-center justify-between">
          <span className="font-mono">{selectedFile.path}</span>
          <span>
            {content.split('\n').length} lines, {content.length} chars
            {hasChanges && <span className="ml-2 text-yellow-400">• Modified</span>}
          </span>
        </div>
      )}
    </div>
  )
}
