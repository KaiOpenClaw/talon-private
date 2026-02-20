/**
 * Malicious Skills Component
 * Displays examples of malicious skills and their behaviors
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { MALICIOUS_SKILLS } from './security-data'

interface MaliciousSkillsProps {
  expandedSkill: string | null
  onToggleExpand: (skillName: string) => void
}

export function MaliciousSkills({ expandedSkill, onToggleExpand }: MaliciousSkillsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Known Malicious Skills
        </CardTitle>
        <CardDescription>
          Real-world examples of skills that have been identified as malicious or suspicious.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {MALICIOUS_SKILLS.map((skill) => (
          <Card key={skill.name} className="border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-red-700">{skill.name}</CardTitle>
                  <CardDescription>{skill.description}</CardDescription>
                </div>
                <Badge variant="destructive">Malicious</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleExpand(skill.name)}
                className="mb-4"
              >
                {expandedSkill === skill.name ? 'Hide Details' : 'Show Details'}
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
              
              {expandedSkill === skill.name && (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2 text-red-600">Malicious Behaviors:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {skill.maliciousBehavior.map((behavior, index) => (
                        <li key={index} className="text-sm">{behavior}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2 text-orange-600">Warning Indicators:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {skill.indicators.map((indicator, index) => (
                        <li key={index} className="text-sm">{indicator}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}