/**
 * Cost Tracking System
 * Estimates and tracks AI model usage costs across agents
 */

// Model pricing (per 1K tokens) - Updated as of 2024
export const MODEL_PRICING = {
  // OpenAI GPT Models
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
  
  // Anthropic Claude Models
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 }, // Assumed similar to 3.5-sonnet
  
  // Default fallback
  'default': { input: 0.005, output: 0.015 }
} as const

export type ModelName = keyof typeof MODEL_PRICING

export interface CostData {
  agentId: string
  agentName: string
  model: string
  timestamp: string
  inputTokens: number
  outputTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  sessionKey?: string
  duration: number // seconds
}

export interface CostSummary {
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

export interface UsageMetrics {
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

/**
 * Calculate cost for token usage based on model
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  // Normalize model name to match pricing table
  const normalizedModel = normalizeModelName(model)
  const pricing = MODEL_PRICING[normalizedModel as ModelName] || MODEL_PRICING.default
  
  const inputCost = (inputTokens / 1000) * pricing.input
  const outputCost = (outputTokens / 1000) * pricing.output
  const totalCost = inputCost + outputCost
  
  return {
    inputCost: Number(inputCost.toFixed(6)),
    outputCost: Number(outputCost.toFixed(6)),
    totalCost: Number(totalCost.toFixed(6))
  }
}

/**
 * Normalize model name to match pricing table
 */
function normalizeModelName(model: string): string {
  const normalized = model.toLowerCase().trim()
  
  // Handle common variations
  if (normalized.includes('gpt-4o-mini')) return 'gpt-4o-mini'
  if (normalized.includes('gpt-4o')) return 'gpt-4o'
  if (normalized.includes('gpt-4-turbo')) return 'gpt-4-turbo'
  if (normalized.includes('gpt-4')) return 'gpt-4'
  if (normalized.includes('gpt-3.5')) return 'gpt-3.5-turbo'
  if (normalized.includes('claude-3-5-sonnet')) return 'claude-3-5-sonnet-20241022'
  if (normalized.includes('claude-3-opus')) return 'claude-3-opus'
  if (normalized.includes('claude-3-sonnet')) return 'claude-3-sonnet'
  if (normalized.includes('claude-3-haiku')) return 'claude-3-haiku'
  if (normalized.includes('claude-sonnet-4')) return 'claude-sonnet-4-20250514'
  
  return 'default'
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(2)}¢`
  }
  return `$${cost.toFixed(2)}`
}

/**
 * Format tokens with appropriate units
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) {
    return `${tokens} tokens`
  } else if (tokens < 1000000) {
    return `${(tokens / 1000).toFixed(1)}K tokens`
  } else {
    return `${(tokens / 1000000).toFixed(1)}M tokens`
  }
}

/**
 * Estimate monthly cost based on current usage
 */
export function estimateMonthlyCost(dailyAverage: number): number {
  return dailyAverage * 30.44 // Average days per month
}

/**
 * Calculate cost efficiency metrics
 */
export function calculateEfficiency(costData: CostData[]): {
  costPerMessage: number
  tokensPerDollar: number
  averageSessionCost: number
  efficiency: 'excellent' | 'good' | 'average' | 'poor'
} {
  const totalCost = costData.reduce((sum, data) => sum + data.totalCost, 0)
  const totalTokens = costData.reduce((sum, data) => sum + data.inputTokens + data.outputTokens, 0)
  const sessionCount = new Set(costData.map(d => d.sessionKey)).size
  
  const costPerMessage = sessionCount > 0 ? totalCost / sessionCount : 0
  const tokensPerDollar = totalCost > 0 ? totalTokens / totalCost : 0
  const averageSessionCost = sessionCount > 0 ? totalCost / sessionCount : 0
  
  // Determine efficiency rating
  let efficiency: 'excellent' | 'good' | 'average' | 'poor'
  if (costPerMessage < 0.01) efficiency = 'excellent'
  else if (costPerMessage < 0.05) efficiency = 'good'
  else if (costPerMessage < 0.10) efficiency = 'average'
  else efficiency = 'poor'
  
  return {
    costPerMessage: Number(costPerMessage.toFixed(6)),
    tokensPerDollar: Math.round(tokensPerDollar),
    averageSessionCost: Number(averageSessionCost.toFixed(6)),
    efficiency
  }
}