/**
 * Security Checklist Component
 * Interactive checklist for security best practices
 */

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { SECURITY_CHECKLIST } from './security-data'

interface SecurityChecklistProps {
  checkedItems: Record<string, boolean>
  onToggleCheck: (item: string) => void
}

export function SecurityChecklist({ checkedItems, onToggleCheck }: SecurityChecklistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Security Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {SECURITY_CHECKLIST.map((category) => (
          <div key={category.category} className="space-y-3">
            <h4 className="font-semibold text-lg">{category.category}</h4>
            <div className="space-y-2">
              {category.items.map((item, index) => {
                const itemKey = `${category.category}-${index}`
                const isChecked = checkedItems[itemKey] || false
                
                return (
                  <div
                    key={itemKey}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => onToggleCheck(itemKey)}
                  >
                    <div className="flex-shrink-0">
                      {isChecked ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className={`${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                        {item.text}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {item.critical && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}