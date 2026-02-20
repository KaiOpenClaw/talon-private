/**
 * Security Guide Main Component
 * Orchestrates all security guide sections
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  Container,
  Network
} from 'lucide-react'

import { SecurityChecklist } from './security-checklist'
import { MaliciousSkills } from './malicious-skills'
import { ThreatPatterns } from './threat-patterns'

export function SecurityGuideMain() {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))
  }

  const toggleSkillExpand = (skillName: string) => {
    setExpandedSkill(prev => prev === skillName ? null : skillName)
  }

  return (
    <div className="space-y-6">
      {/* Critical Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-800">
          <strong>Security Warning:</strong> OpenClaw skills run with full system access. 
          Installing untrusted skills poses significant security risks including data theft, 
          system compromise, and privacy violations.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            OpenClaw Security Guide
          </CardTitle>
          <CardDescription>
            Essential security practices for using OpenClaw skills safely. This guide covers 
            threat identification, security best practices, and examples of malicious skills.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Checklist
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Threat Patterns
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Malicious Examples
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="flex items-center gap-2">
            <Container className="h-4 w-4" />
            Infrastructure
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <SecurityChecklist 
            checkedItems={checkedItems}
            onToggleCheck={toggleCheck}
          />
        </TabsContent>

        <TabsContent value="threats">
          <ThreatPatterns />
        </TabsContent>

        <TabsContent value="examples">
          <MaliciousSkills
            expandedSkill={expandedSkill}
            onToggleExpand={toggleSkillExpand}
          />
        </TabsContent>

        <TabsContent value="infrastructure">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Container className="h-5 w-5 text-green-500" />
                Infrastructure Security
              </CardTitle>
              <CardDescription>
                Secure deployment and infrastructure recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Network Security
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Never expose OpenClaw directly to the internet</li>
                    <li>• Use VPN or private network access only</li>
                    <li>• Implement firewall rules for port 18789</li>
                    <li>• Monitor network traffic for anomalies</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Container className="h-4 w-4" />
                    Container Security
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Run in Docker with limited privileges</li>
                    <li>• Mount directories as read-only when possible</li>
                    <li>• Use non-root user inside containers</li>
                    <li>• Implement resource limits and quotas</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Best Practice:</strong> Always review skill code before installation, 
                  run OpenClaw in isolated environments, and keep sensitive data outside the 
                  workspace directory.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}