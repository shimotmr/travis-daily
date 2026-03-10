// ============================================================
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit
// Phase 2: 遊戲化監控 - Token 戰情室
// 即時 Token 消耗監控 + 趨勢圖 + 異常告警
// ============================================================
'use client'

import {
  RefreshCw, AlertTriangle, TrendingUp, TrendingDown,
  Zap, DollarSign, Clock, Shield, Loader2, ArrowUp, ArrowDown
} from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'

import { GameNav, PixelCard, PixelProgressBar } from '../components/PixelCard'

// =============================================================================
// Types
// =============================================================================
interface TokenData {
  summary: {
    todayTokens: number
    yesterdayTokens: number
    weekTokens: number
    monthTokens: number
    estimatedCost: number
    dailyBudget: number
    monthlyBudget: number
    burnRate: number // tokens per hour
  }
  byAgent: Array<{
    agent: string
    emoji: string
    tokens: number
    cost: number
    tasks: number
    efficiency: number // tokens per task
    trend: 'up' | 'down' | 'flat'
  }>
  byModel: Array<{
    model: string
    tokens: number
    cost: number
    percentage: number
  }>
  hourly: Array<{
    hour: string
    tokens: number
    cost: number
  }>
  alerts: Array<{
    id: string
    level: 'warning' | 'critical'
    message: string
    timestamp: string
    value: number
    threshold: number
  }>
}

// =============================================================================
// Mini Bar Chart (pure CSS)
// =============================================================================
function MiniBarChart({ data, maxValue, color, height = 60 }: {
  data: number[]
  maxValue: number
  color: string
  height?: number
}) {
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((v, i) => {
        const h = maxValue > 0 ? (v / maxValue) * 100 : 0
        return (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-300 min-w-[3px] group relative"
            style={{ height: `${Math.max(h, 2)}%`, backgroundColor: color, opacity: 0.5 + (h / 200) }}
          >
            <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
              {v.toLocaleString()}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// =============================================================================
// Gauge Component
// =============================================================================
function TokenGauge({ used, budget, label, color }: {
  used: number
  budget: number
  label: string
  color: string
}) {
  const pct = budget > 0 ? Math.min((used / budget) * 100, 100) : 0
  const isWarning = pct > 70
  const isCritical = pct > 90
  const displayColor = isCritical ? '#ef4444' : isWarning ? '#fbbf24' : color

  return (
    <div className="text-center">
      {/* Circular gauge */}
      <div className="relative w-24 h-24 mx-auto mb-2">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={displayColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.64} ${264 - pct * 2.64}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <div className="text-lg font-bold font-mono" style={{ color: displayColor }}>
              {pct.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-[10px] text-gray-600">
        {(used / 1000).toFixed(0)}K / {(budget / 1000).toFixed(0)}K
      </div>
    </div>
  )
}

// =============================================================================
// Agent Token Row
// =============================================================================
function AgentTokenRow({ agent }: { agent: TokenData['byAgent'][0] }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-gray-800/30 rounded-lg transition-colors">
      <span className="text-xl">{agent.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{agent.agent}</span>
          {agent.trend === 'up' && <ArrowUp className="w-3 h-3 text-red-400" />}
          {agent.trend === 'down' && <ArrowDown className="w-3 h-3 text-green-400" />}
        </div>
        <div className="text-[10px] text-gray-500">
          {agent.tasks} 任務 · {agent.efficiency.toLocaleString()} tokens/任務
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono text-white">{(agent.tokens / 1000).toFixed(1)}K</div>
        <div className="text-[10px] text-gray-500">${agent.cost.toFixed(2)}</div>
      </div>
    </div>
  )
}

// =============================================================================
// Alert Banner
// =============================================================================
function AlertBanner({ alerts }: { alerts: TokenData['alerts'] }) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
            alert.level === 'critical'
              ? 'bg-red-950/30 border-red-800 text-red-300'
              : 'bg-yellow-950/30 border-yellow-800 text-yellow-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <div className="flex-1 text-sm">{alert.message}</div>
          <div className="text-xs opacity-60">
            {new Date(alert.timestamp).toLocaleTimeString('zh-TW', { hour12: false })}
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// Main Page
// =============================================================================
export default function GameTokensPage() {
  const [data, setData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/game/tokens')
      if (!res.ok) throw new Error('fetch failed')
      setData(await res.json())
    } catch (err) {
      console.error('Token data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    if (!autoRefresh) return
    const iv = setInterval(fetchData, 30000)
    return () => clearInterval(iv)
  }, [fetchData, autoRefresh])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        <span className="ml-3 text-gray-400">載入戰情室...</span>
      </div>
    )
  }

  const s = data?.summary
  const hourlyTokens = data?.hourly?.map(h => h.tokens) || []
  const maxHourly = Math.max(...hourlyTokens, 1)

  // Day-over-day change
  const dayChange = s && s.yesterdayTokens > 0
    ? ((s.todayTokens - s.yesterdayTokens) / s.yesterdayTokens * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              ⚔️ Token 戰情室
            </h1>
            <p className="text-gray-500 text-sm mt-1">即時消耗監控 · 趨勢分析 · 異常告警</p>
          </div>
          <div className="flex items-center gap-4">
            <GameNav active="tokens" />
            <button
              onClick={() => { setAutoRefresh(!autoRefresh); if (!autoRefresh) fetchData() }}
              className={`p-2 rounded-lg border transition-all ${autoRefresh ? 'border-orange-600 text-orange-400 bg-orange-950/30' : 'border-gray-700 text-gray-500'}`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={autoRefresh ? { animationDuration: '3s' } : {}} />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {data?.alerts && <AlertBanner alerts={data.alerts} />}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: '今日消耗',
              value: `${((s?.todayTokens || 0) / 1000).toFixed(0)}K`,
              sub: dayChange !== 0 ? `${dayChange > 0 ? '+' : ''}${dayChange.toFixed(0)}% vs 昨日` : '同昨日',
              color: '#f97316',
              icon: <Zap className="w-4 h-4" />,
              trend: dayChange > 10 ? 'up' : dayChange < -10 ? 'down' : 'flat'
            },
            {
              label: '預估成本',
              value: `$${(s?.estimatedCost || 0).toFixed(2)}`,
              sub: `燃燒率 ${((s?.burnRate || 0) / 1000).toFixed(1)}K/hr`,
              color: '#22c55e',
              icon: <DollarSign className="w-4 h-4" />,
              trend: 'flat'
            },
            {
              label: '本週累計',
              value: `${((s?.weekTokens || 0) / 1000).toFixed(0)}K`,
              sub: `本月 ${((s?.monthTokens || 0) / 1000).toFixed(0)}K`,
              color: '#8b5cf6',
              icon: <TrendingUp className="w-4 h-4" />,
              trend: 'flat'
            },
            {
              label: '安全等級',
              value: s && s.dailyBudget > 0 && (s.todayTokens / s.dailyBudget) > 0.9 ? '🔴 危險' :
                     s && s.dailyBudget > 0 && (s.todayTokens / s.dailyBudget) > 0.7 ? '🟡 警戒' : '🟢 安全',
              sub: `日預算 ${((s?.dailyBudget || 0) / 1000).toFixed(0)}K`,
              color: s && s.dailyBudget > 0 && (s.todayTokens / s.dailyBudget) > 0.9 ? '#ef4444' :
                     s && s.dailyBudget > 0 && (s.todayTokens / s.dailyBudget) > 0.7 ? '#fbbf24' : '#22c55e',
              icon: <Shield className="w-4 h-4" />,
              trend: 'flat'
            },
          ].map(c => (
            <PixelCard key={c.label} glowColor={c.color} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: c.color }}>{c.icon}</span>
                <span className="text-xs text-gray-500">{c.label}</span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: c.color }}>{c.value}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {c.trend === 'up' && <ArrowUp className="w-3 h-3 text-red-400" />}
                {c.trend === 'down' && <ArrowDown className="w-3 h-3 text-green-400" />}
                {c.sub}
              </div>
            </PixelCard>
          ))}
        </div>

        {/* Budget gauges + Hourly chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Gauges */}
          <PixelCard glowColor="#f97316" className="p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 預算使用率
            </h3>
            <div className="flex justify-around">
              <TokenGauge
                used={s?.todayTokens || 0}
                budget={s?.dailyBudget || 500000}
                label="日預算"
                color="#f97316"
              />
              <TokenGauge
                used={s?.monthTokens || 0}
                budget={s?.monthlyBudget || 10000000}
                label="月預算"
                color="#8b5cf6"
              />
            </div>
          </PixelCard>

          {/* Hourly trend */}
          <PixelCard glowColor="#3b82f6" className="p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> 24 小時趨勢
            </h3>
            <MiniBarChart data={hourlyTokens} maxValue={maxHourly} color="#3b82f6" height={80} />
            <div className="flex justify-between mt-2 text-[10px] text-gray-600">
              {data?.hourly?.map((h, i) => (
                i % 4 === 0 ? <span key={i}>{h.hour}</span> : <span key={i} />
              ))}
            </div>
          </PixelCard>
        </div>

        {/* Agent + Model breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* By Agent */}
          <PixelCard glowColor="#8b5cf6" className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              👥 Agent 消耗排行
            </h3>
            <div className="space-y-1">
              {data?.byAgent?.map(agent => (
                <AgentTokenRow key={agent.agent} agent={agent} />
              ))}
              {(!data?.byAgent || data.byAgent.length === 0) && (
                <div className="text-center text-gray-600 py-4">尚無數據</div>
              )}
            </div>
          </PixelCard>

          {/* By Model */}
          <PixelCard glowColor="#22c55e" className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              🤖 模型消耗分佈
            </h3>
            <div className="space-y-3">
              {data?.byModel?.map(model => (
                <div key={model.model} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">{model.model}</span>
                    <span className="text-gray-500">{(model.tokens / 1000).toFixed(0)}K · ${model.cost.toFixed(2)}</span>
                  </div>
                  <PixelProgressBar
                    value={model.percentage}
                    max={100}
                    color={model.percentage > 50 ? '#f97316' : model.percentage > 25 ? '#eab308' : '#22c55e'}
                  />
                </div>
              ))}
              {(!data?.byModel || data.byModel.length === 0) && (
                <div className="text-center text-gray-600 py-4">尚無數據</div>
              )}
            </div>
          </PixelCard>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-600">
          {autoRefresh ? '每 30 秒更新' : '已暫停更新'} · Token 戰情室 v1.0
        </div>
      </div>
    </div>
  )
}
