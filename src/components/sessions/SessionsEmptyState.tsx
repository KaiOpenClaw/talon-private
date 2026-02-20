'use client'

import { MessageSquare, Zap } from 'lucide-react'

export function SessionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex space-x-2 mb-4">
        <MessageSquare className="w-12 h-12 text-gray-300" />
        <Zap className="w-12 h-12 text-gray-300" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Active Sessions
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-md">
        There are currently no active sessions. Sessions will appear here when agents 
        are actively processing messages or when new conversations are started.
      </p>
      
      <div className="space-y-2 text-sm text-gray-400">
        <p>• <strong>Main sessions</strong> handle ongoing conversations</p>
        <p>• <strong>Isolated sessions</strong> run background tasks</p>
        <p>• Sessions auto-expire after periods of inactivity</p>
      </div>
    </div>
  )
}