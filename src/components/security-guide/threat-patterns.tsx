/**
 * Threat Patterns Component
 * Displays common threat patterns and attack vectors
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, FileText, Lock } from 'lucide-react'
import { THREAT_PATTERNS } from './security-data'

const getThreatIcon = (type: string) => {
  switch (type) {
    case 'Data Exfiltration':
      return <FileText className="h-5 w-5 text-red-500" />
    case 'File System Scanning':
      return <Eye className="h-5 w-5 text-orange-500" />
    case 'Code Obfuscation':
      return <Lock className="h-5 w-5 text-purple-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

const getThreatColor = (type: string) => {
  switch (type) {
    case 'Data Exfiltration':
      return 'destructive'
    case 'File System Scanning':
      return 'secondary'
    case 'Code Obfuscation':
      return 'outline'
    default:
      return 'secondary'
  }
}

export function ThreatPatterns() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-500" />
          Common Threat Patterns
        </CardTitle>
        <CardDescription>
          Recognize these patterns to identify potentially malicious skills.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {THREAT_PATTERNS.map((threat) => (
          <div key={threat.type} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getThreatIcon(threat.type)}
                <h4 className="font-semibold text-lg">{threat.type}</h4>
              </div>
              <Badge variant={getThreatColor(threat.type) as any}>
                Threat Pattern
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{threat.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2 text-red-600">Detection Patterns:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {threat.patterns.map((pattern, index) => (
                    <li key={index} className="text-sm">{pattern}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium mb-2 text-orange-600">Real Examples:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {threat.examples.map((example, index) => (
                    <li key={index} className="text-sm">{example}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}