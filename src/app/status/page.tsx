import { Activity, CheckCircle, Clock, Loader2, ListTodo } from 'lucide-react'
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit

export const revalidate = 30

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface Task {
  id: number
  title: string
  assignee: string
  status: string
  priority: string
  updated_at: string
  completed_at: string | null
}

interface AgentInfo {
  id: string
  name: string
  emoji: string
  role: string
}

const AGENTS: AgentInfo[] = [
  { id: 'travis', name: 'Travis', emoji: '🤖', role: 'Manager' },
  { id: 'blake',  name: 'Blake',  emoji: '🔨', role: 'Builder' },
  { id: 'rex',    name: 'Rex',    emoji: '🧠', role: 'Thinker' },
  { id: 'oscar',  name: 'Oscar',  emoji: '📋', role: 'Operator' },
  { id: 'warren', name: 'Warren', emoji: '📈', role: 'Trader' },
  { id: 'griffin',name: 'Griffin',emoji: '🛡️', role: 'Guardian' },
]

async function fetchTasks(): Promise<Task[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/board_tasks?select=id,title,assignee,status,priority,updated_at,completed_at&order=updated_at.desc&limit=200`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 30 },
      }
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

function todayStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '剛剛'
  if (mins < 60) return `${mins} 分鐘前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} 小時前`
  const days = Math.floor(hrs / 24)
  return `${days} 天前`
}

function statusDot(status: string): { dot: string; label: string } {
  if (status === '🟢') return { dot: '🟢', label: '活躍' }
  if (status === '🟡') return { dot: '🟡', label: '待命' }
  return { dot: '🔴', label: '離線' }
}

const STATUS_LABEL: Record<string, string> = {
  '已完成': '已完成',
  '執行中': '執行中',
  '待執行': '待執行',
  '待派發': '待派發',
  '失敗': '失敗',
}

export default async function StatusPage() {
  const allTasks = await fetchTasks()
  const today = todayStart()

  // Global stats
  const completedToday = allTasks.filter(
    t => t.status === '已完成' && t.completed_at && new Date(t.completed_at) >= today
  ).length
  const executing = allTasks.filter(t => t.status === '執行中').length
  const pending = allTasks.filter(t => t.status === '待執行' || t.status === '待派發').length

  // Per-agent stats
  const agentStats = AGENTS.map(agent => {
    const agentTasks = allTasks.filter(t => t.assignee === agent.id)
    const doneToday = agentTasks.filter(
      t => t.status === '已完成' && t.completed_at && new Date(t.completed_at) >= today
    ).length
    const isExecuting = agentTasks.some(t => t.status === '執行中')
    const lastTask = agentTasks[0]

    let statusEmoji: string
    if (isExecuting) {
      statusEmoji = '🟢'
    } else if (agentTasks.some(t => t.status === '待執行' || t.status === '待派發')) {
      statusEmoji = '🟡'
    } else if (doneToday > 0) {
      statusEmoji = '🟢'
    } else {
      statusEmoji = '🟡'
    }

    return {
      ...agent,
      doneToday,
      isExecuting,
      lastActive: lastTask?.updated_at ?? null,
      statusEmoji,
    }
  })

  // Recent 10 tasks
  const recentTasks = allTasks.slice(0, 10)

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-[#e2e8f0]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-[#e2e8f0]">SAGI Agent 狀態</h1>
          <p className="text-sm text-[#64748b]">AI 代理團隊即時狀態 · 每 30 秒自動更新</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<CheckCircle size={16} className="text-[#4ade80]" />}
            label="今日完成"
            value={completedToday}
            color="text-[#4ade80]"
          />
          <StatCard
            icon={<Loader2 size={16} className="text-[#60a5fa]" />}
            label="執行中"
            value={executing}
            color="text-[#60a5fa]"
          />
          <StatCard
            icon={<ListTodo size={16} className="text-[#94a3b8]" />}
            label="待執行"
            value={pending}
            color="text-[#94a3b8]"
          />
        </div>

        {/* Agent Cards */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Agent 團隊</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {agentStats.map(agent => (
              <div
                key={agent.id}
                className="rounded-xl border border-[#1e2635] bg-[#111318] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg" aria-hidden="true">{agent.emoji}</span>
                  <span className="text-sm" title={statusDot(agent.statusEmoji).label}>
                    {agent.statusEmoji}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#e2e8f0]">{agent.name}</p>
                  <p className="text-xs text-[#64748b]">{agent.role}</p>
                </div>
                <div className="space-y-1 text-xs text-[#94a3b8]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={11} className="text-[#4ade80] shrink-0" />
                    <span>今日完成 <span className="text-[#e2e8f0] font-medium">{agent.doneToday}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="shrink-0" />
                    <span className="truncate">{formatRelative(agent.lastActive)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Task Flow */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-[#64748b] uppercase tracking-wider">最近任務流</h2>
          <div className="rounded-xl border border-[#1e2635] bg-[#111318] divide-y divide-[#1e2635]">
            {recentTasks.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#64748b]">暫無任務資料</p>
            ) : (
              recentTasks.map(task => (
                <div key={task.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="mt-0.5 text-sm shrink-0" title={task.assignee}>
                      {AGENTS.find(a => a.id === task.assignee)?.emoji ?? '❓'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-[#cbd5e1] truncate">{task.title}</p>
                      <p className="text-xs text-[#64748b]">{formatRelative(task.updated_at)}</p>
                    </div>
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Footer */}
        <p className="text-center text-xs text-[#334155]">
          資料來源：SAGI board_tasks · revalidate 30s
        </p>
      </div>
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-xl border border-[#1e2635] bg-[#111318] px-4 py-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

function TaskStatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    '已完成': { text: '完成', cls: 'text-[#4ade80] bg-[#4ade80]/10' },
    '執行中': { text: '執行中', cls: 'text-[#60a5fa] bg-[#60a5fa]/10' },
    '待執行': { text: '待執行', cls: 'text-[#94a3b8] bg-[#94a3b8]/10' },
    '待派發': { text: '待派發', cls: 'text-[#94a3b8] bg-[#94a3b8]/10' },
    '失敗': { text: '失敗', cls: 'text-red-400 bg-red-400/10' },
  }
  const { text, cls } = map[status] ?? { text: status, cls: 'text-[#94a3b8] bg-[#94a3b8]/10' }
  return (
    <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {text}
    </span>
  )
}
