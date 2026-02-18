'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Shield, ShieldAlert, Eye, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface SecurityScan {
  skillName: string
  status: 'safe' | 'warning' | 'malicious' | 'unknown'
  threats: SecurityThreat[]
  score: number
  lastScanned: string
}

interface SecurityThreat {
  type: 'data-exfiltration' | 'file-access' | 'network-request' | 'credential-theft' | 'obfuscation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  pattern: string
  line?: number
}

const MALICIOUS_PATTERNS = [
  {
    type: 'data-exfiltration' as const,
    patterns: [
      /POST.*data.*base64/gi,
      /exfil|extract.*data/gi,
      /upload.*personal|private/gi,
      /send.*history|messages/gi
    ],
    severity: 'critical' as const,
    description: 'Potential data exfiltration - uploads personal data to external servers'
  },
  {
    type: 'file-access' as const,
    patterns: [
      /search.*tax|ssn|w2|social.*security/gi,
      /find.*\d{3}-?\d{2}-?\d{4}/gi,
      /scan.*financial|banking/gi,
      /access.*documents|files/gi
    ],
    severity: 'high' as const,
    description: 'Searches for sensitive financial or personal information'
  },
  {
    type: 'credential-theft' as const,
    patterns: [
      /steal.*password|credentials/gi,
      /harvest.*auth|tokens/gi,
      /capture.*login|session/gi
    ],
    severity: 'critical' as const,
    description: 'Attempts to steal passwords or authentication credentials'
  },
  {
    type: 'obfuscation' as const,
    patterns: [
      /base64.*decode|atob/gi,
      /eval\(.*\)/gi,
      /hidden.*logic|code/gi,
      /obfuscate|disguise/gi
    ],
    severity: 'medium' as const,
    description: 'Uses code obfuscation to hide malicious functionality'
  }
]

const KNOWN_MALICIOUS_SKILLS = [
  {
    name: 'Spotify Playlist Organizer',
    threats: ['Searches for tax documents and Social Security Numbers', 'Hidden financial data extraction logic'],
    status: 'malicious' as const
  },
  {
    name: 'Discord Backup Tool', 
    threats: ['Exfiltrates entire Discord message history', 'POSTs data to suspicious endpoints'],
    status: 'malicious' as const
  }
]

export function SecurityScanner() {
  const [scans, setScans] = useState<SecurityScan[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  // Mock security scan
  const runSecurityScan = async () => {
    setIsScanning(true)
    setProgress(0)
    
    // Simulate scanning progress
    const scanSteps = [
      'Loading skills...',
      'Analyzing code patterns...',
      'Checking against malicious database...',
      'Generating security report...'
    ]
    
    for (let i = 0; i < scanSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProgress((i + 1) / scanSteps.length * 100)
    }
    
    // Mock scan results
    const mockScans: SecurityScan[] = [
      {
        skillName: 'Spotify Playlist Organizer',
        status: 'malicious',
        score: 95,
        threats: [
          {
            type: 'file-access',
            severity: 'critical',
            description: 'Searches for files matching tax, SSN, W2 patterns',
            pattern: 'search.*tax|ssn|w2',
            line: 142
          },
          {
            type: 'data-exfiltration',
            severity: 'critical', 
            description: 'Extracts 9-digit numbers (Social Security Numbers)',
            pattern: 'extract.*\\d{3}-?\\d{2}-?\\d{4}',
            line: 156
          }
        ],
        lastScanned: new Date().toISOString()
      },
      {
        skillName: 'Discord Backup Tool',
        status: 'malicious',
        score: 88,
        threats: [
          {
            type: 'data-exfiltration',
            severity: 'critical',
            description: 'POSTs entire message history to external endpoints',
            pattern: 'POST.*messages.*base64',
            line: 89
          }
        ],
        lastScanned: new Date().toISOString()
      },
      {
        skillName: 'Weather Forecast',
        status: 'safe',
        score: 12,
        threats: [],
        lastScanned: new Date().toISOString()
      },
      {
        skillName: 'GitHub Manager',
        status: 'warning',
        score: 35,
        threats: [
          {
            type: 'network-request',
            severity: 'medium',
            description: 'Makes network requests without user consent',
            pattern: 'fetch.*without.*consent',
            line: 67
          }
        ],
        lastScanned: new Date().toISOString()
      }
    ]
    
    setScans(mockScans)
    setIsScanning(false)
  }
  
  const getStatusIcon = (status: SecurityScan['status']) => {
    switch (status) {
      case 'safe': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'malicious': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Eye className="w-4 h-4 text-gray-500" />
    }
  }
  
  const getStatusBadge = (status: SecurityScan['status']) => {
    switch (status) {
      case 'safe': return <Badge variant="default" className="bg-green-100 text-green-800">Safe</Badge>
      case 'warning': return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'malicious': return <Badge variant="destructive">Malicious</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }
  
  const getSeverityColor = (severity: SecurityThreat['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5" />
          <CardTitle>Skills Security Scanner</CardTitle>
        </div>
        <CardDescription>
          Scan installed skills for malicious patterns and security threats
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Security Alert */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">
            <strong>Security Research Alert:</strong> ~15% of OpenClaw skills contain malicious code. 
            Always scan skills before installation. Never expose OpenClaw port 18789 to the internet.
            <a 
              href="https://www.reddit.com/r/hacking/comments/1r30t25/i_scanned_popular_openclaw_skills_heres_what_i/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline font-medium"
            >
              Read Security Report →
            </a>
          </AlertDescription>
        </Alert>

        {/* Scan Controls */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            onClick={runSecurityScan} 
            disabled={isScanning}
            className="flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>{isScanning ? 'Scanning...' : 'Run Security Scan'}</span>
          </Button>
          
          {isScanning && (
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">{progress.toFixed(0)}% complete</p>
            </div>
          )}
        </div>

        {/* Scan Results */}
        {scans.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Scan Results ({scans.length} skills)</h3>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-700">
                  {scans.filter(s => s.status === 'safe').length}
                </div>
                <div className="text-sm text-green-600">Safe</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-yellow-700">
                  {scans.filter(s => s.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-600">Warnings</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-red-700">
                  {scans.filter(s => s.status === 'malicious').length}
                </div>
                <div className="text-sm text-red-600">Malicious</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-gray-700">
                  {scans.filter(s => s.status === 'unknown').length}
                </div>
                <div className="text-sm text-gray-600">Unknown</div>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-2">
              {scans.map((scan, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(scan.status)}
                      <div>
                        <div className="font-medium">{scan.skillName}</div>
                        <div className="text-sm text-muted-foreground">
                          Risk Score: {scan.score}/100 | {scan.threats.length} threats found
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(scan.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(showDetails === scan.skillName ? null : scan.skillName)}
                      >
                        {showDetails === scan.skillName ? 'Hide' : 'Details'}
                      </Button>
                    </div>
                  </div>

                  {/* Threat Details */}
                  {showDetails === scan.skillName && scan.threats.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Security Threats:</h4>
                      <div className="space-y-2">
                        {scan.threats.map((threat, threatIndex) => (
                          <div key={threatIndex} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium capitalize">{threat.type.replace('-', ' ')}</span>
                              <Badge variant="outline" className={getSeverityColor(threat.severity)}>
                                {threat.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{threat.description}</p>
                            <div className="text-xs font-mono bg-gray-100 p-1 rounded">
                              Pattern: {threat.pattern}
                              {threat.line && ` (Line ${threat.line})`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Best Practices */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-800">🔒 Security Best Practices</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Never expose OpenClaw port 18789 to the internet</li>
            <li>• Always scan skills before installation</li>
            <li>• Run OpenClaw in Docker containers with limited permissions</li>
            <li>• Regularly update skills and check for security advisories</li>
            <li>• Report suspicious skills to the community immediately</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}