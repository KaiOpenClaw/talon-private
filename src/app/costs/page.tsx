/**
 * Cost Tracking Dashboard
 * Comprehensive view of AI model usage costs and analytics
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Clock, 
  Zap,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react'
import { logger } from '@/lib/logger'
import { formatCost, formatTokens } from '@/lib/cost-tracking'

interface CostData {
  success: boolean
  period: string
  summary: {
    totalCost: number
    totalTokens: number
    totalSessions: number
    averageCostPerSession: number
    costByModel: Record<string, number>
    costByAgent: Record<string, number>
    topExpensiveAgents: Array<{
      agentId: string
      agentName: string
      cost: number
      tokens: number
    }>
    period: {
      start: string
      end: string
    }
  }
  metrics: {
    peakHours: Array<{ hour: number; cost: number; usage: number }>
    dailyCosts: Array<{ date: string; cost: number; tokens: number }>
    modelDistribution: Array<{ model: string; percentage: number; cost: number }>
    agentEfficiency: Array<{
      agentId: string
      agentName: string
      costPerMessage: number
      averageResponseTime: number
      completionRate: number
    }>
  }
  efficiency: {
    costPerMessage: number
    tokensPerDollar: number
    averageSessionCost: number
    efficiency: 'excellent' | 'good' | 'average' | 'poor'
  }
  lastUpdated: string
  fallback?: boolean
}

export default function CostsPage() {
  const [costData, setCostData] = useState<CostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('24h')
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  
  useEffect(() => {
    fetchCostData()
  }, [period, selectedAgent])
  
  const fetchCostData = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({ period })
      if (selectedAgent !== 'all') {
        params.append('agentId', selectedAgent)
      }
      
      const response = await fetch(`/api/costs?${params}`)
      const data = await response.json()
      setCostData(data)
      
      logger.debug('Cost data loaded', {
        component: 'CostsPage',
        period,
        selectedAgent,
        fallback: data.fallback,
        totalCost: data.summary?.totalCost
      })
      
    } catch (error) {
      logger.error('Failed to fetch cost data', {
        component: 'CostsPage',
        error: String(error)
      })
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <h1 className="text-2xl font-bold">Loading Cost Analytics...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  
  if (!costData) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-red-600">Failed to Load Cost Data</h1>
        <Button onClick={fetchCostData}>Retry</Button>
      </div>
    )
  }
  
  const { summary, metrics, efficiency } = costData
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Cost Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            AI model usage costs and performance insights
            {costData.fallback && (
              <Badge variant="secondary" className="ml-2">Demo Data</Badge>
            )}
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
            {['24h', '7d', '30d'].map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === '24h' ? 'Last 24h' : p === '7d' ? 'Last 7 days' : 'Last 30 days'}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
            <Button
              variant={selectedAgent === 'all' ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedAgent('all')}
            >
              All Agents
            </Button>
            {summary.topExpensiveAgents.slice(0, 3).map(agent => (
              <Button
                key={agent.agentId}
                variant={selectedAgent === agent.agentId ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedAgent(agent.agentId)}
              >
                {agent.agentName}
              </Button>
            ))}
          </div>
          
          <Button onClick={fetchCostData} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Total Cost</h3>
          </div>
          <p className="text-2xl font-bold">{formatCost(summary.totalCost)}</p>
          <p className="text-sm text-gray-600 mt-1">
            {summary.totalSessions} sessions
          </p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Token Usage</h3>
          </div>
          <p className="text-2xl font-bold">{formatTokens(summary.totalTokens)}</p>
          <p className="text-sm text-gray-600 mt-1">
            {formatCost(summary.averageCostPerSession)} per session
          </p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Efficiency</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={
                efficiency.efficiency === 'excellent' ? 'default' :
                efficiency.efficiency === 'good' ? 'secondary' : 
                efficiency.efficiency === 'average' ? 'outline' : 'destructive'
              }
            >
              {efficiency.efficiency}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {formatCost(efficiency.costPerMessage)} per message
          </p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold">Monthly Est.</h3>
          </div>
          <p className="text-2xl font-bold">
            {formatCost(summary.totalCost * (period === '24h' ? 30 : period === '7d' ? 4.3 : 1))}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Based on current usage
          </p>
        </Card>
      </div>
      
      {/* Detailed Analytics */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Top Agents</TabsTrigger>
          <TabsTrigger value="models">Model Usage</TabsTrigger>
          <TabsTrigger value="trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Expensive Agents</h3>
            <div className="space-y-4">
              {summary.topExpensiveAgents.map((agent, index) => (
                <div key={agent.agentId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <h4 className="font-semibold">{agent.agentName}</h4>
                      <p className="text-sm text-gray-600">{formatTokens(agent.tokens)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCost(agent.cost)}</p>
                    <p className="text-sm text-gray-600">
                      {((agent.cost / summary.totalCost) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="models">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Model Distribution</h3>
            <div className="space-y-4">
              {metrics.modelDistribution.map(model => (
                <div key={model.model} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{model.model}</span>
                    <span>{formatCost(model.cost)} ({model.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${model.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Costs</h3>
              <div className="space-y-2">
                {metrics.dailyCosts.slice(-7).map(day => (
                  <div key={day.date} className="flex justify-between items-center">
                    <span>{new Date(day.date).toLocaleDateString()}</span>
                    <div className="text-right">
                      <span className="font-semibold">{formatCost(day.cost)}</span>
                      <p className="text-xs text-gray-600">{formatTokens(day.tokens)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Peak Usage Hours</h3>
              <div className="space-y-2">
                {metrics.peakHours.slice(0, 8).map(hour => (
                  <div key={hour.hour} className="flex justify-between items-center">
                    <span>{hour.hour}:00</span>
                    <div className="text-right">
                      <span className="font-semibold">{formatCost(hour.cost)}</span>
                      <p className="text-xs text-gray-600">{formatTokens(hour.usage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="efficiency">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Agent Efficiency Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Agent</th>
                    <th className="text-right p-2">Cost/Message</th>
                    <th className="text-right p-2">Avg Response</th>
                    <th className="text-right p-2">Completion</th>
                    <th className="text-right p-2">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.agentEfficiency.map(agent => (
                    <tr key={agent.agentId} className="border-b">
                      <td className="p-2 font-medium">{agent.agentName}</td>
                      <td className="p-2 text-right">{formatCost(agent.costPerMessage)}</td>
                      <td className="p-2 text-right">{agent.averageResponseTime}s</td>
                      <td className="p-2 text-right">{agent.completionRate.toFixed(1)}%</td>
                      <td className="p-2 text-right">
                        <Badge 
                          variant={
                            agent.costPerMessage < 0.01 ? 'default' :
                            agent.costPerMessage < 0.05 ? 'secondary' : 'outline'
                          }
                        >
                          {agent.costPerMessage < 0.01 ? 'Excellent' :
                           agent.costPerMessage < 0.05 ? 'Good' : 'Average'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Footer */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>Last updated: {new Date(costData.lastUpdated).toLocaleString()}</p>
          <p>Period: {new Date(summary.period.start).toLocaleDateString()} - {new Date(summary.period.end).toLocaleDateString()}</p>
        </div>
      </Card>
    </div>
  )
}