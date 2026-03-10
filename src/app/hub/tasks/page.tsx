'use client'
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { 
  ArrowLeft, RefreshCw, Filter, 
  CheckCircle, Clock, PlayCircle, 
  AlertCircle, Loader2, Search
} from 'lucide-react'
import Link from 'next/link'

// =============================================================================
// Types
// =============================================================================
interface Task {
  id: number
  title: string
  assignee: string | null
  priority: string | null
  status: string | null
  updated_at: string | null
  created_at: string | null
  board: string
}

interface TaskStats {
  total: number
  executing: number
  pending: number
  completed: number
}

// =============================================================================
// Utility Functions
// =============================================================================
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes}分前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小時前`
  
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

function getStatusConfig(status: string | null) {
  switch (status) {
    case '已完成':
      return { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle }
    case '執行中':
      return { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: PlayCircle }
    case '待派發':
    case '待執行':
      return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock }
    case '失敗':
      return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle }
    default:
      return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Clock }
  }
}

function getPriorityConfig(priority: string | null) {
  switch (priority) {
    case 'P0': return { color: 'text-red-400', label: 'P0' }
    case 'P1': return { color: 'text-orange-400', label: 'P1' }
    case 'P2': return { color: 'text-yellow-400', label: 'P2' }
    case 'P3': return { color: 'text-blue-400', label: 'P3' }
    default: return { color: 'text-gray-400', label: '-' }
  }
}

function getAssigneeName(assignee: string | null): string {
  if (!assignee) return '未指派'
  const names: Record<string, string> = {
    'travis': 'Travis',
    'blake': 'Blake',
    'rex': 'Rex',
    'oscar': 'Oscar',
    'warren': 'Warren',
    'griffin': 'Griffin',
    'william': 'William'
  }
  return names[assignee.toLowerCase()] || assignee
}

// =============================================================================
// Main Component
// =============================================================================
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()

  const fetchTasks = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)
    
    try {
      let query = supabase
        .from('board_tasks')
        .select('id, title, assignee, priority, status, updated_at, created_at, board')
        .order('updated_at', { ascending: false })
        .limit(100)

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      
      setTasks(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Calculate stats
  const stats: TaskStats = tasks.reduce((acc, task) => {
    acc.total++
    if (task.status === '執行中') acc.executing++
    else if (task.status === '已完成') acc.completed++
    else if (task.status === '待派發' || task.status === '待執行') acc.pending++
    return acc
  }, { total: 0, executing: 0, pending: 0, completed: 0 })

  // Get unique assignees for filter
  const assignees = [...new Set(tasks.map(t => t.assignee).filter(Boolean))]

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false
    if (assigneeFilter !== 'all' && task.assignee !== assigneeFilter) return false
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading && !tasks.length) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">載入任務中...</p>
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
                  <span className="text-2xl">📋</span>
                  任務總覽
                </h1>
                <p className="text-sm text-gray-400">Board Tasks Dashboard</p>
              </div>
            </div>
            
            <button
              onClick={() => fetchTasks(true)}
              disabled={refreshing}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-gray-500">總任務</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <PlayCircle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.executing}</div>
                <div className="text-xs text-gray-500">執行中</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-xs text-gray-500">待執行</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-xs text-gray-500">已完成</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋任務標題..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">全部狀態</option>
                <option value="執行中">執行中</option>
                <option value="待執行">待執行</option>
                <option value="待派發">待派發</option>
                <option value="已完成">已完成</option>
                <option value="失敗">失敗</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">全部人員</option>
              {assignees.map(a => (
                <option key={a} value={a!}>{getAssigneeName(a)}</option>
              ))}
            </select>

            {/* Results count */}
            <div className="text-sm text-gray-400">
              {filteredTasks.length} / {tasks.length} 任務
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">任務</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">優先級</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">狀態</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">負責人</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">更新時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const statusConfig = getStatusConfig(task.status)
                    const priorityConfig = getPriorityConfig(task.priority)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <tr key={task.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                          #{task.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-white max-w-md truncate">
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.board}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {task.status || '未知'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {getAssigneeName(task.assignee)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {timeAgo(task.updated_at)}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      {tasks.length === 0 ? '尚無任務' : '無符合條件的任務'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
