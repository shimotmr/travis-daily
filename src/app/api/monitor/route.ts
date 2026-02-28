import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    }

    // 并行获取三张表的数据
    const [agentJobsRes, boardTasksRes, incidentLogRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/agent_jobs?select=id,status,job_type,model,spawned_at,completed_at`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/board_tasks?select=id,status,priority,board,created_at,completed_at`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/incident_log?select=id,title,severity,category,occurred_at,resolved_at,agent,task_id&order=occurred_at.desc&limit=20`, { headers }),
    ])

    if (!agentJobsRes.ok || !boardTasksRes.ok || !incidentLogRes.ok) {
      throw new Error('Failed to fetch data from Supabase')
    }

    const agentJobs = await agentJobsRes.json()
    const boardTasks = await boardTasksRes.json()
    const incidentLogs = await incidentLogRes.json()

    // Agent Jobs 统计
    const agentJobsStatusCounts: Record<string, number> = {}
    const agentJobsModelCounts: Record<string, number> = {}
    agentJobs.forEach((job: any) => {
      agentJobsStatusCounts[job.status] = (agentJobsStatusCounts[job.status] || 0) + 1
      if (job.model) {
        agentJobsModelCounts[job.model] = (agentJobsModelCounts[job.model] || 0) + 1
      }
    })

    const agentJobsTotal = agentJobs.length
    const agentJobsCompleted = agentJobs.filter((j: any) => j.status === 'completed').length
    const agentJobsFailed = agentJobs.filter((j: any) => j.status === 'failed').length
    const agentJobsRunning = agentJobs.filter((j: any) => j.status === 'running').length

    // Board Tasks 统计
    const boardTasksStatusCounts: Record<string, number> = {}
    const boardTasksPriorityCounts: Record<string, number> = {}
    boardTasks.forEach((task: any) => {
      boardTasksStatusCounts[task.status] = (boardTasksStatusCounts[task.status] || 0) + 1
      if (task.priority) {
        boardTasksPriorityCounts[task.priority] = (boardTasksPriorityCounts[task.priority] || 0) + 1
      }
    })

    const boardTasksTotal = boardTasks.length
    const boardTasksCompleted = boardTasks.filter((t: any) => t.status === '已完成').length
    const boardTasksFailed = boardTasks.filter((t: any) => t.status === '失敗').length
    const boardTasksInProgress = boardTasks.filter((t: any) => t.status === '執行中').length
    const boardTasksPending = boardTasks.filter((t: any) => t.status === '待派發' || t.status === '待執行').length

    // 最近 Incident Log 统计
    const incidentLogTotal = incidentLogs.length
    const incidentLogUnresolved = incidentLogs.filter((i: any) => !i.resolved_at).length
    const incidentLogBySeverity: Record<string, number> = {}
    const incidentLogByCategory: Record<string, number> = {}
    incidentLogs.forEach((log: any) => {
      if (log.severity) {
        incidentLogBySeverity[log.severity] = (incidentLogBySeverity[log.severity] || 0) + 1
      }
      if (log.category) {
        incidentLogByCategory[log.category] = (incidentLogByCategory[log.category] || 0) + 1
      }
    })

    return NextResponse.json({
      agent_jobs: {
        total: agentJobsTotal,
        completed: agentJobsCompleted,
        failed: agentJobsFailed,
        running: agentJobsRunning,
        completionRate: agentJobsTotal > 0 ? Math.round((agentJobsCompleted / agentJobsTotal) * 100) : 0,
        failureRate: agentJobsTotal > 0 ? Math.round((agentJobsFailed / agentJobsTotal) * 100) : 0,
        statusCounts: agentJobsStatusCounts,
        modelCounts: agentJobsModelCounts,
      },
      board_tasks: {
        total: boardTasksTotal,
        completed: boardTasksCompleted,
        failed: boardTasksFailed,
        in_progress: boardTasksInProgress,
        pending: boardTasksPending,
        completionRate: boardTasksTotal > 0 ? Math.round((boardTasksCompleted / boardTasksTotal) * 100) : 0,
        statusCounts: boardTasksStatusCounts,
        priorityCounts: boardTasksPriorityCounts,
      },
      incident_log: {
        total: incidentLogTotal,
        unresolved: incidentLogUnresolved,
        recent: incidentLogs.slice(0, 10),
        bySeverity: incidentLogBySeverity,
        byCategory: incidentLogByCategory,
      },
      lastUpdate: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching monitor data:', error)
    return NextResponse.json({ error: 'Failed to fetch monitor data' }, { status: 500 })
  }
}
