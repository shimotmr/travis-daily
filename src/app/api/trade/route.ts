// =============================================================================
// Trade API - Warren Agent Tasks & Status
// =============================================================================
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get Warren's recent tasks (last 20)
    const { data: tasks, error: tasksError } = await supabase
      .from('board_tasks')
      .select('id, title, status, priority, created_at, updated_at, completed_at, result, description')
      .eq('assignee', 'warren')
      .order('updated_at', { ascending: false })
      .limit(20)
    
    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }
    
    // Calculate task statistics
    const taskStats = {
      total: tasks?.length || 0,
      executing: tasks?.filter(t => t.status === '執行中').length || 0,
      pending: tasks?.filter(t => t.status === '待派發' || t.status === '待執行').length || 0,
      completed: tasks?.filter(t => t.status === '已完成').length || 0,
      failed: tasks?.filter(t => t.status === '失敗').length || 0,
    }
    
    // Get today's completed tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCompleted = tasks?.filter(t => {
      if (!t.completed_at) return false
      return new Date(t.completed_at) >= today
    }).length || 0
    
    // Mock Warren Agent status (in production, fetch from Gateway)
    const warrenStatus = {
      name: 'Warren',
      emoji: '📈',
      role: 'Trader',
      status: taskStats.executing > 0 ? 'executing' : 'active',
      statusText: taskStats.executing > 0 ? '交易中' : '待命中',
      lastTradeAt: tasks?.[0]?.updated_at || null,
      activePositions: 3, // Mock - would need a separate positions table
      dailyPnL: 12450, // Mock - would need trade records
      winRate: 68.5, // Mock
    }
    
    // Mock positions data (in production, fetch from trading DB)
    const positions = [
      { symbol: '2330.TW', side: 'long', quantity: 1000, avgPrice: 875, currentPrice: 892, pnl: 17000 },
      { symbol: '2454.TW', side: 'long', quantity: 500, avgPrice: 1820, currentPrice: 1795, pnl: -12500 },
      { symbol: '0050.TW', side: 'long', quantity: 2000, avgPrice: 142.5, currentPrice: 145.2, pnl: 5400 },
    ]
    
    return NextResponse.json({
      warren: warrenStatus,
      tasks: tasks || [],
      taskStats,
      todayCompleted,
      positions,
      lastUpdate: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Trade API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
