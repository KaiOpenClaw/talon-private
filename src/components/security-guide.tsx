'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  FileText,
  Container,
  Network,
  Lock,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

const MALICIOUS_SKILLS = [
  {
    name: 'Spotify Playlist Organizer',
    description: 'Music playlist management tool',
    maliciousBehavior: [
      'Searches for files matching tax, SSN, W2 patterns',
      'Extracts 9-digit Social Security Numbers', 
      'Hidden financial data harvesting logic',
      'Disguised as innocent music tool'
    ],
    indicators: [
      'File system scanning beyond music directories',
      'Regex patterns for sensitive documents',
      'Network requests to unknown endpoints',
      'Base64 encoded data transmission'
    ]
  },
  {
    name: 'Discord Backup Tool',
    description: 'Discord message history backup utility',
    maliciousBehavior: [
      'POSTs entire message history to external servers',
      'Uses base64 encoding to hide data exfiltration',
      'Sends private conversations to untrusted endpoints',
      'No user consent for data transmission'
    ],
    indicators: [
      'Network POST requests with large payloads',
      'Base64 encoded message content',
      'External domain connections',
      'No local storage of backups'
    ]
  }
]

const SECURITY_CHECKLIST = [
  {
    category: 'Installation Security',
    items: [
      { text: 'Never install skills from untrusted sources', critical: true },
      { text: 'Review skill code before installation', critical: true },
      { text: 'Check skill permissions and access requirements', critical: false },
      { text: 'Verify skill author reputation and reviews', critical: false },
      { text: 'Test skills in isolated environment first', critical: true }
    ]
  },
  {
    category: 'Network Security', 
    items: [
      { text: 'Never expose OpenClaw port 18789 to the internet', critical: true },
      { text: 'Use firewall rules to block external access', critical: true },
      { text: 'Run OpenClaw behind VPN or private network only', critical: false },
      { text: 'Monitor network traffic for suspicious activity', critical: false },
      { text: 'Disable unnecessary network features', critical: false }
    ]
  },
  {
    category: 'Container Security',
    items: [
      { text: 'Run OpenClaw in Docker with limited privileges', critical: true },
      { text: 'Mount only necessary directories as read-only', critical: true },
      { text: 'Use non-root user inside containers', critical: true },
      { text: 'Implement resource limits (CPU, memory, disk)', critical: false },
      { text: 'Regular security updates for base images', critical: false }
    ]
  },
  {
    category: 'Data Protection',
    items: [
      { text: 'Keep sensitive files outside OpenClaw workspace', critical: true },
      { text: 'Use encrypted storage for personal documents', critical: true },
      { text: 'Regular backups of important data', critical: false },
      { text: 'Monitor file access patterns', critical: false },
      { text: 'Implement data loss prevention tools', critical: false }
    ]
  }
]

const THREAT_PATTERNS = [
  {
    type: 'Data Exfiltration',
    description: 'Skills that secretly upload personal data to external servers',
    patterns: [
      'POST requests with base64 encoded data',
      'File uploads to unknown domains',
      'Bulk data transmission patterns',
      'Hidden network activity'
    ],
    examples: ['Discord message history uploads', 'Document scanning and upload', 'Credential harvesting']
  },
  {
    type: 'File System Scanning',
    description: 'Skills that search for sensitive files beyond their stated purpose',
    patterns: [
      'Regex patterns for SSN, tax documents',
      'Directory traversal outside workspace',
      'Searching for financial keywords',
      'Password file enumeration'
    ],
    examples: ['Tax document searches', 'Social Security number extraction', 'Banking file access']
  },
  {
    type: 'Code Obfuscation',
    description: 'Skills that hide their true functionality using code obfuscation',
    patterns: [
      'Base64 encoded strings',
      'Dynamic code execution (eval)',
      'Encrypted or compressed code blocks',
      'Variable name obfuscation'
    ],
    examples: ['Hidden malicious functions', 'Disguised network requests', 'Concealed file operations']
  }
]

export function SecurityGuide() {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))
  }

  return (
    <div className="space-y-6">
      {/* Critical Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-800">
          <strong>🚨 CRITICAL SECURITY ALERT:</strong> Security researchers have identified malicious skills 
          in the OpenClaw ecosystem. ~15% of community skills contain hidden malicious code designed to 
          steal personal data, financial information, and private conversations.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="threats" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="threats">Known Threats</TabsTrigger>
          <TabsTrigger value="patterns">Threat Patterns</TabsTrigger>
          <TabsTrigger value="checklist">Security Checklist</TabsTrigger>
          <TabsTrigger value="setup">Secure Setup</TabsTrigger>
        </TabsList>

        {/* Known Threats Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <CardTitle>Confirmed Malicious Skills</CardTitle>
              </div>
              <CardDescription>
                Skills confirmed to contain malicious code by security researchers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MALICIOUS_SKILLS.map((skill, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-red-800">{skill.name}</h3>
                        <p className="text-sm text-red-600">{skill.description}</p>
                      </div>
                      <Badge variant="destructive">MALICIOUS</Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSkill(expandedSkill === skill.name ? null : skill.name)}
                      className="mb-3"
                    >
                      {expandedSkill === skill.name ? 'Hide Details' : 'Show Details'}
                    </Button>

                    {expandedSkill === skill.name && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">Malicious Behavior:</h4>
                          <ul className="space-y-1">
                            {skill.maliciousBehavior.map((behavior, i) => (
                              <li key={i} className="text-sm text-red-700 flex items-start space-x-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{behavior}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">Detection Indicators:</h4>
                          <ul className="space-y-1">
                            {skill.indicators.map((indicator, i) => (
                              <li key={i} className="text-sm text-red-700 flex items-start space-x-2">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{indicator}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Source:</strong> Security research findings from Reddit community analysis.
                    <a 
                      href="https://www.reddit.com/r/hacking/comments/1r30t25/i_scanned_popular_openclaw_skills_heres_what_i/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center text-blue-600 hover:underline"
                    >
                      Read Full Report <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <CardTitle>Malicious Pattern Detection</CardTitle>
              </div>
              <CardDescription>
                Learn to identify suspicious patterns in OpenClaw skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {THREAT_PATTERNS.map((pattern, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{pattern.type}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Detection Patterns:</h4>
                        <ul className="space-y-1">
                          {pattern.patterns.map((p, i) => (
                            <li key={i} className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Examples:</h4>
                        <ul className="space-y-1">
                          {pattern.examples.map((example, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <CardTitle>Security Checklist</CardTitle>
              </div>
              <CardDescription>
                Essential security practices for OpenClaw users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {SECURITY_CHECKLIST.map((category, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-3">{category.category}</h3>
                    <div className="space-y-2">
                      {category.items.map((item, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={`${category.category}-${i}`}
                            checked={checkedItems[`${category.category}-${i}`] || false}
                            onChange={() => toggleCheck(`${category.category}-${i}`)}
                            className="mt-1"
                          />
                          <label 
                            htmlFor={`${category.category}-${i}`}
                            className={`text-sm cursor-pointer flex-1 ${
                              checkedItems[`${category.category}-${i}`] ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item.text}
                            {item.critical && (
                              <Badge variant="destructive" className="ml-2 text-xs">CRITICAL</Badge>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Secure Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Container className="w-5 h-5" />
                <CardTitle>Secure OpenClaw Setup</CardTitle>
              </div>
              <CardDescription>
                Step-by-step guide for maximum security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <Container className="w-4 h-4" />
                    <span>Docker Security Configuration</span>
                  </h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="mb-2 text-gray-400"># Secure Docker run configuration</div>
                    <div>docker run -d \</div>
                    <div>  --name openclaw-secure \</div>
                    <div>  --user 1000:1000 \</div>
                    <div>  --read-only \</div>
                    <div>  --tmpfs /tmp \</div>
                    <div>  --tmpfs /var/cache \</div>
                    <div>  --network none \</div>
                    <div>  -v /safe/workspace:/workspace:ro \</div>
                    <div>  -v /safe/config:/config:ro \</div>
                    <div>  --security-opt no-new-privileges \</div>
                    <div>  --cap-drop ALL \</div>
                    <div>  openclaw:latest</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <Network className="w-4 h-4" />
                    <span>Network Security</span>
                  </h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="mb-2 text-gray-400"># Firewall rules (iptables)</div>
                    <div>iptables -A INPUT -p tcp --dport 18789 -s 127.0.0.1 -j ACCEPT</div>
                    <div>iptables -A INPUT -p tcp --dport 18789 -j DROP</div>
                    <div className="mt-3 mb-2 text-gray-400"># Or use ufw</div>
                    <div>ufw deny 18789</div>
                    <div>ufw allow from 127.0.0.1 to any port 18789</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>File System Protection</span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>• Store sensitive documents outside the OpenClaw workspace</p>
                    <p>• Use encrypted partitions for personal files</p>
                    <p>• Implement file access monitoring</p>
                    <p>• Regular security audits of skill permissions</p>
                    <p>• Backup critical data before installing new skills</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}