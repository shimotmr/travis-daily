// ============================================================
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit
// API: /api/game/tokens - Token 戰情室數據
// 讀取 model-usage 數據 + 計算趨勢 + 生成告警
// ============================================================
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'

import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eznawjbgzmcnkxcisrjj.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Token cost estimates per 1K tokens
const MODEL_COSTS: Record<string, number> = {
  'claude-sonnet-4': 0.003,
  'claude-opus-4': 0.015,
  'claude-3.5-sonnet': 0.003,
  'claude-3-opus': 0.015,
  'minimax-m2.5': 0.0001,
  'glm-5': 0.0005,
  'moonshot-v1-128k': 0.001,
  'grok-3': 0.005,
  'default': 0.002,
}

// Agent emoji mapping
const AGENT_EMOJI: Record<string, string> = {
  travis: '🤖', main: '🤖',
  blake: '💻', coder: '💻',
  rex: '🔬', researcher: '🔬',
  oscar: '📋', secretary: '📋',
  warren: '📈', trader: '📈',
  griffin: '🛡️', guardian: '🛡️',
  writer: '✍️',
  designer: '🎨',
}

// Budget settings
const DAILY_BUDGET = 500000  // 500K tokens
const MONTHLY_BUDGET = 10000000  // 10M tokens

interface UsageRecord {
  model: string
  agent?: string
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  timestamp?: string
  created_at?: string
}

async function getModelUsageFromFile(): Promise<UsageRecord[]> {
  const homeDir = process.env.HOME || '/Users/travis'
  const usagePath = join(homeDir, 'clawd', 'data', 'model_usage.json')

  if (!existsSync(usagePath)) return []

  try {
    const content = await readFile(usagePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function getModelUsageFromDB(): Promise<UsageRecord[]> {
  if (!SUPABASE_KEY) return []

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    // Get last 7 days
    const since = new Date()
    since.setDate(since.getDate() - 7)
    const sinceStr = since.toISOString()

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/model_usage?select=*&created_at=gte.${sinceStr}&order=created_at.desc&limit=1000`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

function getCost(model: string, tokens: number): number {
  const key = Object.keys(MODEL_COSTS).find(k => model.toLowerCase().includes(k))
  const rate = key ? MODEL_COSTS[key] : MODEL_COSTS.default
  return (tokens / 1000) * rate
}

export async function GET() {
  // Gather usage data from both sources
  const [fileRecords, dbRecords] = await Promise.all([
    getModelUsageFromFile(),
    getModelUsageFromDB(),
  ])

  const allRecords = [...fileRecords, ...dbRecords]
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Aggregate
  let todayTokens = 0, yesterdayTokens = 0, weekTokens = 0, monthTokens = 0
  const agentMap: Record<string, { tokens: number; cost: number; tasks: number }> = {}
  const modelMap: Record<string, { tokens: number; cost: number }> = {}
  const hourlyMap: Record<number, number> = {}

  // Initialize 24 hours
  for (let h = 0; h < 24; h++) hourlyMap[h] = 0

  for (const r of allRecords) {
    const tokens = r.total_tokens || (r.input_tokens || 0) + (r.output_tokens || 0)
    if (!tokens) continue

    const ts = new Date(r.timestamp || r.created_at || now)
    const model = r.model || 'unknown'
    const agent = r.agent || 'system'
    const cost = getCost(model, tokens)

    // Time buckets
    if (ts >= todayStart) {
      todayTokens += tokens
      hourlyMap[ts.getHours()] = (hourlyMap[ts.getHours()] || 0) + tokens
    }
    if (ts >= yesterdayStart && ts < todayStart) yesterdayTokens += tokens
    if (ts >= weekStart) weekTokens += tokens
    if (ts >= monthStart) monthTokens += tokens

    // Agent aggregation
    const agentKey = agent.toLowerCase()
    if (!agentMap[agentKey]) agentMap[agentKey] = { tokens: 0, cost: 0, tasks: 0 }
    agentMap[agentKey].tokens += tokens
    agentMap[agentKey].cost += cost
    agentMap[agentKey].tasks += 1

    // Model aggregation
    if (!modelMap[model]) modelMap[model] = { tokens: 0, cost: 0 }
    modelMap[model].tokens += tokens
    modelMap[model].cost += cost
  }

  // Compute burn rate (tokens per hour, based on today)
  const hoursElapsed = Math.max((now.getTime() - todayStart.getTime()) / 3600000, 0.5)
  const burnRate = Math.round(todayTokens / hoursElapsed)

  // Estimated cost
  const estimatedCost = Object.values(modelMap).reduce((sum, m) => sum + m.cost, 0)

  // Build agent array sorted by tokens
  const totalTokens = Object.values(agentMap).reduce((s, a) => s + a.tokens, 0) || 1
  const byAgent = Object.entries(agentMap)
    .map(([agent, data]) => ({
      agent,
      emoji: AGENT_EMOJI[agent] || '🔧',
      tokens: data.tokens,
      cost: data.cost,
      tasks: data.tasks,
      efficiency: data.tasks > 0 ? Math.round(data.tokens / data.tasks) : 0,
      trend: (data.tokens / totalTokens > 0.3 ? 'up' : data.tokens / totalTokens < 0.1 ? 'down' : 'flat') as 'up' | 'down' | 'flat',
    }))
    .sort((a, b) => b.tokens - a.tokens)

  // Build model array
  const byModel = Object.entries(modelMap)
    .map(([model, data]) => ({
      model,
      tokens: data.tokens,
      cost: data.cost,
      percentage: Math.round((data.tokens / (totalTokens || 1)) * 100),
    }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 8)

  // Build hourly array
  const hourly = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, '0')}:00`,
    tokens: hourlyMap[h] || 0,
    cost: getCost('default', hourlyMap[h] || 0),
  }))

  // Generate alerts
  const alerts: Array<{
    id: string; level: 'warning' | 'critical'; message: string;
    timestamp: string; value: number; threshold: number
  }> = []

  const dailyPct = todayTokens / DAILY_BUDGET
  if (dailyPct > 0.9) {
    alerts.push({
      id: 'daily-critical',
      level: 'critical',
      message: `🚨 日預算已使用 ${(dailyPct * 100).toFixed(0)}%！剩餘 ${((DAILY_BUDGET - todayTokens) / 1000).toFixed(0)}K tokens`,
      timestamp: now.toISOString(),
      value: todayTokens,
      threshold: DAILY_BUDGET,
    })
  } else if (dailyPct > 0.7) {
    alerts.push({
      id: 'daily-warning',
      level: 'warning',
      message: `⚠️ 日預算已使用 ${(dailyPct * 100).toFixed(0)}%，燃燒率 ${(burnRate / 1000).toFixed(1)}K/hr`,
      timestamp: now.toISOString(),
      value: todayTokens,
      threshold: DAILY_BUDGET,
    })
  }

  // High burn rate alert
  if (burnRate > DAILY_BUDGET / 8) {
    alerts.push({
      id: 'burn-rate-high',
      level: 'warning',
      message: `🔥 燃燒率偏高：${(burnRate / 1000).toFixed(1)}K/hr，按此速度 ${(DAILY_BUDGET / burnRate).toFixed(1)} 小時耗盡日預算`,
      timestamp: now.toISOString(),
      value: burnRate,
      threshold: DAILY_BUDGET / 8,
    })
  }

  return NextResponse.json({
    summary: {
      todayTokens,
      yesterdayTokens,
      weekTokens,
      monthTokens,
      estimatedCost,
      dailyBudget: DAILY_BUDGET,
      monthlyBudget: MONTHLY_BUDGET,
      burnRate,
    },
    byAgent,
    byModel,
    hourly,
    alerts,
    lastUpdate: now.toISOString(),
  })
}
