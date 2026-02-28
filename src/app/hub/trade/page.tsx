// =============================================================================
// Travis Daily - Trade Dashboard (Warren Agent)
// =============================================================================
'use client'

import { 
  ArrowLeft, Activity, TrendingUp, TrendingDown, 
  RefreshCw, Clock, Target, Zap, DollarSign, 
  BarChart3, PieChart, Calendar, AlertCircle,
  CheckCircle, Loader2, Wallet, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect, useCallback } from 'react'

// =============================================================================
// Types
// =============================================================================
interface WarrenStatus {
  name: string
  emoji: string
  role: string
  status: 'executing' | 'active' | 'idle' | 'offline'
  statusText: string
  lastTradeAt: string | null
  activePositions: number
  dailyPnL: number
  winRate: number
}

interface Task {
  id: number
  title: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  completed_at: string | null
  result: string | null
  description: string | null
}

interface Position {
  symbol: string
  side: 'long' | 'short'
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
}

interface TradeData {
  warren: WarrenStatus
  tasks: Task[]
  taskStats: {
    total: number
    executing: number
    pending: number
    completed: number
    failed: number
  }
  todayCompleted: number
  positions: Position[]
  lastUpdate: string
}

// =============================================================================
// Utility Functions
// =============================================================================
function timeAgo(dateStr: string): string {
  if (!dateStr) return 'N/A'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatPercent(num: number): string {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
}

function getStatusColor(status: string): string {
  switch (status) {
    case '已完成': return 'bg-green-500/20 text-green-400'
    case '執行中': return 'bg-orange-500/20 text-orange-400'
    case '待派發': 
    case '待執行': return 'bg-yellow-500/20 text-yellow-400'
    case '失敗': return 'bg-red-500/20 text-red-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

function getPriorityIcon(priority: string) {
  switch (priority) {
    case 'P0': return <AlertCircle className="w-3 h-3 text-red-500" />
    case 'P1': return <AlertCircle className="w-3 h-3 text-orange-500" />
    case 'P2': return <AlertCircle className="w-3 h-3 text-yellow-500" />
    default: return null
  }
}

// =============================================================================
// Main Component
// =============================================================================
export default function TradeDashboardPage() {
  const [data, setData] = useState<TradeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)
    
    try {
      const response = await fetch('/api/trade', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const responseData: TradeData = await response.json()
      setData(responseData)
      setError(null)
    } catch (err) {
      console.error('Error fetching trade data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Calculate total P&L from positions
  const totalPnL = data?.positions.reduce((sum, p) => sum + p.pnl, 0) || 0

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">載入交易資料中...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            重試
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/board" 
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  交易中心
                </h1>
                <p className="text-sm text-gray-400">Warren Agent Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="text-xs text-gray-500">
                更新於 {data?.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString('zh-TW') : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Warren Agent Status Card */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center text-3xl">
                {data?.warren.emoji}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{data?.warren.name}</h2>
                <p className="text-gray-400">{data?.warren.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${data?.warren.status === 'executing' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-sm text-gray-400">{data?.warren.statusText}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(data?.warren.dailyPnL || 0)}
                </div>
                <div className="text-xs text-gray-500">今日損益</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{data?.warren.activePositions}</div>
                <div className="text-xs text-gray-500">持倉數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{data?.warren.winRate}%</div>
                <div className="text-xs text-gray-500">勝率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {data?.taskStats.executing || 0}
                </div>
                <div className="text-xs text-gray-500">執行中</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data?.taskStats.total || 0}</div>
                <div className="text-xs text-gray-500">總任務</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data?.todayCompleted || 0}</div>
                <div className="text-xs text-gray-500">今日完成</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data?.taskStats.pending || 0}</div>
                <div className="text-xs text-gray-500">待執行</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(totalPnL)}
                </div>
                <div className="text-xs text-gray-500">總損益</div>
              </div>
            </div>
          </div>
        </div>

        {/* Positions & Recent Tasks */}
        <div className="grid grid-cols-2 gap-6">
          {/* Positions */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                持倉狀況
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {data?.positions && data.positions.length > 0 ? (
                data.positions.map((position, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        position.side === 'long' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {position.side === 'long' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold">{position.symbol}</div>
                        <div className="text-xs text-gray-500">
                          {position.quantity}股 @ {position.avgPrice}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(position.currentPrice)}</div>
                      <div className={`text-xs ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(position.pnl)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  無持倉資料
                </div>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                近期任務
              </h3>
              <Link 
                href="/board?assignee=warren" 
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                查看全部
              </Link>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {data?.tasks && data.tasks.length > 0 ? (
                data.tasks.slice(0, 8).map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getPriorityIcon(task.priority)}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="text-xs text-gray-500">
                          {timeAgo(task.updated_at)}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  無任務記錄
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Strategy Link */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
          <Link 
            href="/hub/trade/strategy"
            className="flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                交易策略
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                查看 Warren 的交易策略配置與歷史表現
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  )
}
