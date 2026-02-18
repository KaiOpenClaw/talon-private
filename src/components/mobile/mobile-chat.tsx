/**
 * Mobile-optimized chat interface for Talon
 * Optimized for touch interactions, mobile keyboards, and responsive design
 */

'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Paperclip, Mic, MicOff, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TouchButton } from './touch-feedback'
import { MobileOptimizedLayout, useDeviceOptimizations } from './mobile-optimized-layout'
import { useSafeAreaInsets } from '@/hooks/useMediaQuery'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface MobileChatProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  agentName?: string
  agentAvatar?: string
  className?: string
}

/**
 * Mobile-optimized chat input with enhanced touch features
 */
function MobileChatInput({
  onSend,
  isLoading = false,
  placeholder = "Type a message...",
  className
}: {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const device = useDeviceOptimizations()
  const safeAreaInsets = useSafeAreaInsets()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage('')
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement voice recording
  }

  return (
    <MobileOptimizedLayout enableOptimizations={true}>
      <div 
        className={cn(
          "border-t border-border-subtle bg-surface-1",
          className
        )}
        style={{
          paddingBottom: Math.max(safeAreaInsets.bottom, 16)
        }}
      >
        {/* Attachment Panel */}
        {showAttachments && (
          <div className="p-3 border-b border-border-subtle">
            <div className="flex items-center gap-3 overflow-x-auto">
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-2 text-ink-secondary min-w-[64px]">
                <Paperclip className="w-5 h-5" />
                <span className="text-xs">File</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-2 text-ink-secondary min-w-[64px]">
                <span className="text-xl">📷</span>
                <span className="text-xs">Photo</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-2 text-ink-secondary min-w-[64px]">
                <span className="text-xl">📁</span>
                <span className="text-xs">Files</span>
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3">
          <div className="flex items-end gap-3">
            {/* Attachment Button */}
            <TouchButton
              onClick={() => setShowAttachments(!showAttachments)}
              variant="ghost"
              size="small"
              className={cn(
                "flex-shrink-0 w-10 h-10 p-0",
                showAttachments && "bg-surface-2"
              )}
              hapticFeedback="light"
            >
              {showAttachments ? (
                <X className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </TouchButton>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                rows={1}
                className={cn(
                  "w-full resize-none rounded-lg border border-border-subtle",
                  "bg-surface-0 text-ink-primary placeholder-ink-muted",
                  "px-4 py-3 pr-12", // Extra right padding for voice button
                  "focus:outline-none focus:ring-2 focus:ring-terminal-400 focus:border-terminal-400",
                  "transition-all duration-200",
                  "min-h-[44px] max-h-32 overflow-y-auto",
                  // Mobile-specific optimizations
                  device.isMobile && [
                    "text-base", // Prevents zoom on iOS
                    "-webkit-appearance-none", // Remove iOS styling
                    "touch-manipulation"
                  ],
                  isLoading && "opacity-50"
                )}
                style={{
                  // Ensure proper sizing
                  lineHeight: '1.4',
                  // iOS-specific fixes
                  WebkitAppearance: 'none',
                  borderRadius: '12px'
                }}
                autoCorrect="off"
                autoCapitalize="sentences"
                spellCheck="true"
              />

              {/* Voice Input Button */}
              <button
                onClick={toggleRecording}
                className={cn(
                  "absolute right-2 bottom-2 w-8 h-8 rounded-full",
                  "flex items-center justify-center",
                  "transition-colors duration-200",
                  isRecording 
                    ? "bg-red-500 text-white" 
                    : "text-ink-muted hover:bg-surface-2"
                )}
                type="button"
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Send Button */}
            <TouchButton
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
              variant="primary"
              size="small"
              className="flex-shrink-0 w-10 h-10 p-0"
              hapticFeedback="medium"
            >
              <Send className="w-4 h-4" />
            </TouchButton>
          </div>

          {/* Voice Recording Indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-600">Recording...</span>
              <button
                onClick={() => setIsRecording(false)}
                className="ml-auto text-red-600 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileOptimizedLayout>
  )
}

/**
 * Mobile-optimized message bubble
 */
function MobileMessageBubble({ 
  message, 
  className 
}: { 
  message: Message
  className?: string 
}) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={cn(
      "flex gap-3 p-4",
      message.isUser ? "justify-end" : "justify-start",
      className
    )}>
      {/* Avatar for agent messages */}
      {!message.isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
          🤖
        </div>
      )}
      
      {/* Message Content */}
      <div className={cn(
        "max-w-[85%] min-w-[64px]",
        message.isUser ? "order-last" : "order-first"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3 break-words",
          message.isUser 
            ? "bg-terminal-500 text-white ml-auto" 
            : "bg-surface-1 text-ink-primary border border-border-subtle"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
        
        {/* Message Status and Time */}
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs text-ink-muted",
          message.isUser ? "justify-end" : "justify-start"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {message.isUser && message.status && (
            <span className={cn(
              "w-1 h-1 rounded-full",
              message.status === 'sending' && "bg-yellow-400 animate-pulse",
              message.status === 'sent' && "bg-green-400",
              message.status === 'error' && "bg-red-400"
            )} />
          )}
        </div>
      </div>
      
      {/* User avatar placeholder */}
      {message.isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-terminal-500 flex items-center justify-center text-white text-sm">
          👤
        </div>
      )}
    </div>
  )
}

/**
 * Main mobile chat component
 */
export function MobileChat({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder,
  agentName,
  agentAvatar,
  className
}: MobileChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle keyboard appearance on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      // Delay scroll to ensure keyboard is fully open
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={cn("flex flex-col h-full bg-surface-0", className)}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border-subtle bg-surface-1">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
          {agentAvatar || '🤖'}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-ink-primary">
            {agentName || 'AI Assistant'}
          </h2>
          <p className="text-xs text-ink-muted">
            {isLoading ? 'Typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          // Smooth scrolling for better mobile experience
          WebkitOverflowScrolling: 'touch',
          // Prevent momentum scrolling from interfering with UI
          overscrollBehavior: 'contain'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-2 flex items-center justify-center text-2xl">
                {agentAvatar || '🤖'}
              </div>
              <h3 className="font-medium text-ink-primary mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-ink-muted max-w-sm">
                Ask me anything or say hello to get started!
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-4">
            {messages.map((message) => (
              <MobileMessageBubble
                key={message.id}
                message={message}
              />
            ))}
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                  {agentAvatar || '🤖'}
                </div>
                <div className="bg-surface-1 border border-border-subtle rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-ink-muted rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <MobileChatInput
        onSend={onSendMessage}
        isLoading={isLoading}
        placeholder={placeholder}
      />
    </div>
  )
}

export default MobileChat