// ============================================================
// Phase 2: 遊戲化監控 - Agent 工作站即時狀態牆
// 基於 WilliamAIOfficeGame 概念，像素風格辦公室
// ============================================================
'use client'

import {
  RefreshCw, X, Clock, Cpu, Zap, TrendingUp,
  CheckCircle, AlertTriangle, Loader2
} from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'

import { GameNav, PixelCard, StatusDot, PixelProgressBar } from './components/PixelCard'

// =============================================================================
// Types
// =============================================================================
interface AgentWorkstation {
  id: string
  name: string
  emoji: string
  role: string
  description: string
  color: string
  skills: string[]
  status: 'active' | 'idle' | 'offline' | 'executing' | 'error'
  statusText: string
  pulse: boolean
  model: string
  isCoordinator: boolean
  currentTask?: { id: number; title: string; progress?: number }
  stats: {
    completedToday: number
    completedWeek: number
    avgTime: string
    successRate: number
  }
  lastActive: string
}

interface OfficeData {
  agents: AgentWorkstation[]
  taskStats: { executing: number; pending: number; completedToday: number }
  systemHealth: { score: number; level: string }
  lastUpdate: string
}

// =============================================================================
// Agent Desk Sprites (CSS pixel art)
// =============================================================================
const deskItems: Record<string, string[]> = {
  main:       ['🖥️', '☕', '📋'],
  coder:      ['💻', '⌨️', '🔧'],
  secretary:  ['📱', '📅', '✉️'],
  writer:     ['📝', '📚', '🖋️'],
  researcher: ['🔬', '📊', '🔎'],
  designer:   ['🎨', '🖌️', '✨'],
}

// =============================================================================
// Agent Workstation Card
// =============================================================================
function AgentDesk({ agent, onClick }: { agent: AgentWorkstation; onClick: () => void }) {
  const statusBg: Record<string, string> = {
    active: 'from-green-900/40 to-green-950/20',
    executing: 'from-orange-900/40 to-orange-950/20',
    idle: 'from-yellow-900/30 to-yellow-950/10',
    offline: 'from-gray-900/40 to-gray-950/20',
    error: 'from-red-900/40 to-red-950/20',
  }

  const borderColor: Record<string, string> = {
    active: '#22c55e',
    executing: '#f97316',
    idle: '#ca8a04',
    offline: '#4b5563',
    error: '#ef4444',
  }

  const items = deskItems[agent.id] || ['📦']

  return (
    <PixelCard
      glowColor={borderColor[agent.status]}
      onClick={onClick}
      className="overflow-hidden"
    >
      {/* Header bar */}
      <div
        className={`bg-gradient-to-r ${statusBg[agent.status]} px-4 py-3 border-b border-gray-800`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{agent.emoji}</span>
            <div>
              <div className="font-bold text-white text-sm">{agent.name}</div>
              <div className="text-xs text-gray-400">{agent.role}</div>
            </div>
          </div>
          <StatusDot status={agent.status} pulse={agent.pulse} />
        </div>
      </div>

      {/* Desk area - the "game" visual */}
      <div className="px-4 py-3 min-h-[100px]">
        {/* Desk items row */}
        <div className="flex gap-2 mb-3 text-lg">
          {items.map((item, i) => (
            <span key={i} className="opacity-60 hover:opacity-100 transition-opacity cursor-default" title="桌上物品">
              {item}
            </span>
          ))}
        </div>

        {/* Current task */}
        {agent.currentTask ? (
          <div className="bg-gray-800/60 rounded-md px-3 py-2 mb-2 border border-gray-700/50">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              進行中任務
            </div>
            <div className="text-sm text-white truncate mt-0.5">
              #{agent.currentTask.id} {agent.currentTask.title}
            </div>
            {agent.currentTask.progress !== undefined && (
              <PixelProgressBar
                value={agent.currentTask.progress}
                max={100}
                color={borderColor[agent.status]}
              />
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic mb-2">
            {agent.status === 'idle' ? '💤 等待任務中...' :
             agent.status === 'offline' ? '🔌 離線' :
             agent.status === 'active' ? '✨ 待命中' : ''}
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-500">
            <CheckCircle className="w-3 h-3 inline mr-1" />
            今日 <span className="text-green-400 font-mono">{agent.stats.completedToday}</span>
          </div>
          <div className="text-gray-500">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            成功率 <span className="text-blue-400 font-mono">{agent.stats.successRate}%</span>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 border-t border-gray-800 bg-gray-950/50">
        <div className="text-[10px] text-gray-500 truncate">
          {agent.statusText}
        </div>
      </div>
    </PixelCard>
  )
}

// =============================================================================
// Agent Detail Modal
// =============================================================================
function AgentDetailModal({ agent, onClose }: { agent: AgentWorkstation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 border-2 border-gray-600 rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700" style={{ borderTopColor: agent.color }}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{agent.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <p className="text-sm text-gray-400">{agent.role} · {agent.model}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-gray-300 text-sm">{agent.description}</p>

          {/* Skills */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">技能</h3>
            <div className="flex flex-wrap gap-2">
              {agent.skills.map(s => (
                <span key={s} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300">{s}</span>
              ))}
            </div>
          </div>

          {/* Current Task */}
          {agent.currentTask && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">目前任務</h3>
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="text-white font-medium">#{agent.currentTask.id} {agent.currentTask.title}</div>
                {agent.currentTask.progress !== undefined && (
                  <div className="mt-2">
                    <PixelProgressBar value={agent.currentTask.progress} max={100} color={agent.color} label={`${agent.currentTask.progress}%`} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">績效統計</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '今日完成', value: agent.stats.completedToday, icon: '✅' },
                { label: '本週完成', value: agent.stats.completedWeek, icon: '📈' },
                { label: '平均耗時', value: agent.stats.avgTime, icon: '⏱️' },
                { label: '成功率', value: `${agent.stats.successRate}%`, icon: '🎯' },
              ].map(s => (
                <div key={s.label} className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50">
                  <div className="text-xs text-gray-500">{s.icon} {s.label}</div>
                  <div className="text-lg font-bold text-white mt-1">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Last active */}
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            最後活動：{agent.lastActive}
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Main Page
// =============================================================================
export default function GameOfficePage() {
  const [data, setData] = useState<OfficeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<AgentWorkstation | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/agents')
      if (!res.ok) throw new Error('fetch failed')
      const json = await res.json()

      // Transform to office data format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const agents: AgentWorkstation[] = (json.agents || []).map((a: any) => ({
        ...a,
        stats: {
          completedToday: a.stats?.completedToday ?? 0,
          completedWeek: a.stats?.completedWeek ?? 0,
          avgTime: a.stats?.avgTime ?? '-',
          successRate: a.stats?.successRate ?? 0,
        },
        lastActive: a.lastRunAt
          ? new Date(a.lastRunAt as string).toLocaleString('zh-TW', { hour: '2-digit', minute: '2-digit' })
          : '未知',
      }))

      setData({
        agents,
        taskStats: json.taskStats || { executing: 0, pending: 0, completedToday: 0 },
        systemHealth: { score: 85, level: 'good' },
        lastUpdate: new Date().toLocaleString('zh-TW'),
      })
    } catch (err) {
      console.error('Failed to fetch office data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    if (!autoRefresh) return
    const iv = setInterval(fetchData, 15000)
    return () => clearInterval(iv)
  }, [fetchData, autoRefresh])

  // Count by status
  const statusCounts = data?.agents.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Ambient grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🏢 AI 辦公室
            </h1>
            <p className="text-gray-500 text-sm mt-1">Agent 工作站即時狀態牆</p>
          </div>
          <div className="flex items-center gap-4">
            <GameNav active="office" />
            <button
              onClick={() => { setAutoRefresh(!autoRefresh); if (!autoRefresh) fetchData() }}
              className={`p-2 rounded-lg border transition-all ${autoRefresh ? 'border-green-600 text-green-400 bg-green-950/30' : 'border-gray-700 text-gray-500'}`}
              title={autoRefresh ? '自動更新中 (15s)' : '已暫停'}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={autoRefresh ? { animationDuration: '3s' } : {}} />
            </button>
          </div>
        </div>

        {/* System status bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: '活躍', value: statusCounts.active || 0, color: '#22c55e', icon: '🟢' },
            { label: '執行中', value: statusCounts.executing || 0, color: '#f97316', icon: '🔶' },
            { label: '待機', value: statusCounts.idle || 0, color: '#eab308', icon: '🟡' },
            { label: '離線', value: statusCounts.offline || 0, color: '#6b7280', icon: '⚫' },
            { label: '今日完成', value: data?.taskStats.completedToday || 0, color: '#8b5cf6', icon: '✅' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/80 border border-gray-800 rounded-lg px-4 py-3">
              <div className="text-xs text-gray-500">{s.icon} {s.label}</div>
              <div className="text-2xl font-bold font-mono mt-1" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="ml-3 text-gray-400">載入辦公室...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.agents.map(agent => (
              <AgentDesk key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-600">
          {data?.lastUpdate && <>最後更新：{data.lastUpdate}</>}
          {' · '}
          <span className="text-gray-700">Phase 2 遊戲化監控 v1.0</span>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  )
}
