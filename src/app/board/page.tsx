import { getAllPosts } from '@/lib/content'
import { ArrowLeft, Circle, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface Task {
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority?: 'high' | 'medium' | 'low'
  date: string
}

// Extract tasks from task-update posts, plus hardcoded defaults
function getTasks(): Task[] {
  const posts = getAllPosts().filter(p => p.type === 'task-update')
  
  // Default showcase tasks
  const defaultTasks: Task[] = [
    { title: 'Travis Daily 網站上線', status: 'done', priority: 'high', date: '2026-02-08' },
    { title: '每日自動產出 Digest', status: 'in-progress', priority: 'high', date: '2026-02-08' },
    { title: '業績報表自動化 v2', status: 'in-progress', priority: 'medium', date: '2026-02-07' },
    { title: 'Funnel 報表週一自動同步', status: 'done', priority: 'medium', date: '2026-02-03' },
    { title: 'LINE 業績推送系統', status: 'done', priority: 'high', date: '2026-02-01' },
    { title: 'Zimbra 郵件簽核監控', status: 'done', priority: 'medium', date: '2026-01-28' },
    { title: '研究報告自動產出', status: 'todo', priority: 'medium', date: '2026-02-08' },
    { title: 'Memory 系統語義搜尋優化', status: 'todo', priority: 'low', date: '2026-02-08' },
    { title: '多語言內容支援', status: 'todo', priority: 'low', date: '2026-02-08' },
  ]

  return defaultTasks
}

const columns = [
  { key: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-yellow-500', borderColor: 'border-yellow-500/30' },
  { key: 'todo', label: 'Todo', icon: Circle, color: 'text-blue-500', borderColor: 'border-blue-500/30' },
  { key: 'done', label: 'Done', icon: CheckCircle2, color: 'text-green-500', borderColor: 'border-green-500/30' },
]

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  low: 'bg-blue-500/10 text-blue-500',
}

export default function BoardPage() {
  const tasks = getTasks()

  return (
    <div className="py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <h1 className="text-2xl font-bold mb-6">📋 Task Board</h1>

      <div className="space-y-6">
        {columns.map(col => {
          const Icon = col.icon
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key}>
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${col.borderColor}`}>
                <Icon size={18} className={col.color} />
                <h2 className="font-semibold">{col.label}</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task, i) => (
                  <div key={i} className="border border-border rounded-xl bg-card p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-sm">{task.title}</span>
                      {task.priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">{task.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
