// ============================================================
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit
// Phase 2: 遊戲化監控 - 即時日誌串流牆
// WebSocket-like polling + 彩色分類 + 搜尋過濾
// ============================================================
'use client'

import {
  Search, Filter, Pause, Play, Trash2, Download,
  AlertTriangle, Info, AlertCircle, Bug, ChevronDown,
  ArrowDown
} from 'lucide-react'
import React, { useState, useEffect, useCallback, useRef } from 'react'

import { GameNav, PixelCard } from '../components/PixelCard'

// =============================================================================
// Types
// =============================================================================
type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  message: string
  details?: string
}

// =============================================================================
// Constants
// =============================================================================
const LEVEL_CONFIG: Record<LogLevel, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  info:    { color: '#60a5fa', bg: 'bg-blue-950/30',   icon: <Info className="w-3.5 h-3.5" />,         label: 'INFO' },
  warn:    { color: '#fbbf24', bg: 'bg-yellow-950/30', icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'WARN' },
  error:   { color: '#f87171', bg: 'bg-red-950/30',    icon: <AlertCircle className="w-3.5 h-3.5" />,  label: 'ERROR' },
  debug:   { color: '#a78bfa', bg: 'bg-purple-950/30', icon: <Bug className="w-3.5 h-3.5" />,          label: 'DEBUG' },
  success: { color: '#4ade80', bg: 'bg-green-950/30',  icon: <Info className="w-3.5 h-3.5" />,         label: 'OK' },
}

const POLL_INTERVAL = 5000

const AGENT_SOURCES = ['travis', 'blake', 'rex', 'oscar', 'warren', 'griffin', 'system']

// =============================================================================
// Log Line Component
// =============================================================================
function LogLine({ entry, expanded, onToggle }: { entry: LogEntry; expanded: boolean; onToggle: () => void }) {
  const config = LEVEL_CONFIG[entry.level] || LEVEL_CONFIG.info
  const ts = new Date(entry.timestamp).toLocaleTimeString('zh-TW', { hour12: false })

  return (
    <div
      className={`group font-mono text-xs border-l-2 px-3 py-1.5 hover:bg-gray-800/40 transition-colors cursor-pointer ${config.bg}`}
      style={{ borderLeftColor: config.color }}
      onClick={onToggle}
    >
      <div className="flex items-start gap-2">
        {/* Timestamp */}
        <span className="text-gray-600 shrink-0 w-[72px]">{ts}</span>

        {/* Level badge */}
        <span
          className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
          style={{ color: config.color, backgroundColor: `${config.color}15` }}
        >
          {config.icon}
          {config.label}
        </span>

        {/* Source */}
        <span className="shrink-0 text-gray-500 w-[72px] truncate">[{entry.source}]</span>

        {/* Message */}
        <span className="text-gray-300 flex-1 break-all">{entry.message}</span>

        {/* Expand indicator */}
        {entry.details && (
          <ChevronDown
            className={`w-3 h-3 text-gray-600 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {/* Expanded details */}
      {expanded && entry.details && (
        <div className="mt-2 ml-[160px] p-2 bg-gray-900 rounded border border-gray-800 text-gray-400 whitespace-pre-wrap text-[11px]">
          {entry.details}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Main Page
// =============================================================================
export default function GameLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [paused, setPaused] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<Set<LogLevel>>(new Set(['info', 'warn', 'error', 'debug', 'success']))
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch logs from API
  const fetchLogs = useCallback(async () => {
    if (paused) return
    try {
      const res = await fetch('/api/game/logs?limit=200')
      if (!res.ok) return
      const json = await res.json()
      setLogs(json.logs || [])
    } catch (err) {
      console.error('Log fetch error:', err)
    }
  }, [paused])

  useEffect(() => {
    fetchLogs()
    const iv = setInterval(fetchLogs, POLL_INTERVAL)
    return () => clearInterval(iv)
  }, [fetchLogs])

  // Auto scroll
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  // Filter logs
  const filtered = logs.filter(l => {
    if (!levelFilter.has(l.level)) return false
    if (sourceFilter !== 'all' && l.source !== sourceFilter) return false
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.source.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Level counts
  const levelCounts = logs.reduce((acc, l) => {
    acc[l.level] = (acc[l.level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const toggleLevel = (level: LogLevel) => {
    setLevelFilter(prev => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  const exportLogs = () => {
    const text = filtered.map(l => `${l.timestamp} [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(96,165,250,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              📜 即時日誌牆
            </h1>
            <p className="text-gray-500 text-sm mt-1">系統日誌即時串流 · {filtered.length} 筆</p>
          </div>
          <GameNav active="logs" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜尋日誌..."
              className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">所有來源</option>
            {AGENT_SOURCES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Level filter buttons */}
          <div className="flex gap-1">
            {(Object.entries(LEVEL_CONFIG) as [LogLevel, typeof LEVEL_CONFIG[LogLevel]][]).map(([level, cfg]) => (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase border transition-all ${
                  levelFilter.has(level)
                    ? 'border-current opacity-100'
                    : 'border-gray-800 opacity-30'
                }`}
                style={{ color: cfg.color }}
              >
                {cfg.label} {levelCounts[level] || 0}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <button
              onClick={() => setPaused(!paused)}
              className={`p-2 rounded-lg border transition-all ${paused ? 'border-yellow-600 text-yellow-400' : 'border-gray-700 text-gray-500 hover:text-white'}`}
              title={paused ? '繼續' : '暫停'}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-2 rounded-lg border transition-all ${autoScroll ? 'border-blue-600 text-blue-400' : 'border-gray-700 text-gray-500'}`}
              title={autoScroll ? '自動捲動中' : '手動捲動'}
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button onClick={exportLogs} className="p-2 rounded-lg border border-gray-700 text-gray-500 hover:text-white transition-all" title="匯出">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setLogs([])} className="p-2 rounded-lg border border-gray-700 text-gray-500 hover:text-red-400 transition-all" title="清除">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Log stream */}
        <PixelCard glowColor="#3b82f6" className="overflow-hidden">
          <div
            ref={containerRef}
            className="h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
          >
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-600">
                <div className="text-center">
                  <div className="text-4xl mb-2">📭</div>
                  <div>尚無日誌{search ? ` (搜尋: "${search}")` : ''}</div>
                </div>
              </div>
            ) : (
              filtered.map(entry => (
                <LogLine
                  key={entry.id}
                  entry={entry}
                  expanded={expandedId === entry.id}
                  onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </PixelCard>

        {/* Status bar */}
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span>{paused ? '⏸ 已暫停' : '▶ 即時更新中'} · 每 {POLL_INTERVAL / 1000}s</span>
          <span>總計 {logs.length} 筆 · 顯示 {filtered.length} 筆</span>
        </div>
      </div>
    </div>
  )
}
