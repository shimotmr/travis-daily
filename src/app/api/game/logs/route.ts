// ============================================================
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit
// API: /api/game/logs - 即時日誌串流
// 讀取系統日誌檔案，提供彩色分類的日誌條目
// ============================================================
import { existsSync } from 'fs'
import { readFile, readdir } from 'fs/promises'
import { join, basename } from 'path'

import { NextResponse } from 'next/server'

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  message: string
  details?: string
}

// Detect log level from message content
function detectLevel(line: string): LogLevel {
  const lower = line.toLowerCase()
  if (lower.includes('error') || lower.includes('fail') || lower.includes('exception') || lower.includes('❌')) return 'error'
  if (lower.includes('warn') || lower.includes('⚠️') || lower.includes('warning')) return 'warn'
  if (lower.includes('debug') || lower.includes('🐛')) return 'debug'
  if (lower.includes('✅') || lower.includes('success') || lower.includes('完成') || lower.includes('ok')) return 'success'
  return 'info'
}

// Detect source agent from log content
function detectSource(line: string, filename: string): string {
  if (filename.includes('heartbeat') || line.includes('heartbeat')) return 'system'
  if (filename.includes('pipeline') || line.includes('pipeline')) return 'system'
  if (line.includes('Travis') || line.includes('T:') || line.includes('travis')) return 'travis'
  if (line.includes('Blake') || line.includes('B:') || line.includes('coder')) return 'blake'
  if (line.includes('Rex') || line.includes('R:') || line.includes('researcher')) return 'rex'
  if (line.includes('Oscar') || line.includes('O:') || line.includes('secretary')) return 'oscar'
  if (line.includes('Warren') || line.includes('W:') || line.includes('trader')) return 'warren'
  if (line.includes('Griffin') || line.includes('G:') || line.includes('guardian')) return 'griffin'
  return 'system'
}

// Parse timestamp from log line if present (ISO or common formats)
function parseTimestamp(line: string): string | null {
  // ISO format
  const isoMatch = line.match(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/)
  if (isoMatch) return new Date(isoMatch[0]).toISOString()

  // HH:MM:SS format
  const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/)
  if (timeMatch) {
    const today = new Date().toISOString().slice(0, 10)
    return new Date(`${today}T${timeMatch[1]}`).toISOString()
  }

  return null
}

// Read log entries from a file (tail N lines)
async function readLogFile(filePath: string, maxLines: number): Promise<LogEntry[]> {
  try {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.split('\n').filter(l => l.trim().length > 0)
    const tail = lines.slice(-maxLines)
    const fname = basename(filePath)

    return tail.map((line, i) => {
      const ts = parseTimestamp(line) || new Date().toISOString()
      return {
        id: `${fname}-${i}-${Date.now()}`,
        timestamp: ts,
        level: detectLevel(line),
        source: detectSource(line, fname),
        message: line.replace(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\s]*\s*/, '').trim() || line,
        details: undefined,
      }
    })
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500)

  const homeDir = process.env.HOME || '/Users/travis'
  const logSources: { path: string; maxLines: number }[] = []

  // 1. Gateway logs
  const gatewayLog = join(homeDir, '.openclaw', 'logs', 'gateway.log')
  if (existsSync(gatewayLog)) logSources.push({ path: gatewayLog, maxLines: 50 })

  // 2. Heartbeat logs
  const heartbeatLog = '/tmp/heartbeat_execution.log'
  if (existsSync(heartbeatLog)) logSources.push({ path: heartbeatLog, maxLines: 30 })

  // 3. Pipeline logs
  const pipelineLog = '/tmp/pipeline_engine.log'
  if (existsSync(pipelineLog)) logSources.push({ path: pipelineLog, maxLines: 30 })

  // 4. Vercel watch
  const vercelLog = '/tmp/vercel_watch.log'
  if (existsSync(vercelLog)) logSources.push({ path: vercelLog, maxLines: 20 })

  // 5. Daily memory files (today)
  const today = new Date().toISOString().slice(0, 10)
  const dailyLog = join(homeDir, 'clawd', 'memory', 'daily', `${today}.md`)
  if (existsSync(dailyLog)) logSources.push({ path: dailyLog, maxLines: 30 })

  // 6. Check /tmp for recent log files
  try {
    const tmpFiles = await readdir('/tmp')
    const logFiles = tmpFiles
      .filter(f => f.endsWith('.log') && (f.includes('gateway') || f.includes('agent') || f.includes('task') || f.includes('cron')))
      .slice(0, 5)
    for (const f of logFiles) {
      const p = join('/tmp', f)
      if (!logSources.find(s => s.path === p)) {
        logSources.push({ path: p, maxLines: 20 })
      }
    }
  } catch { /* ignore */ }

  // Collect all entries
  const allEntries: LogEntry[] = []
  for (const src of logSources) {
    const entries = await readLogFile(src.path, src.maxLines)
    allEntries.push(...entries)
  }

  // Sort by timestamp (newest last) and trim
  allEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  const result = allEntries.slice(-limit)

  // Assign unique IDs
  result.forEach((e, i) => { e.id = `log-${i}-${Date.now()}` })

  return NextResponse.json({
    logs: result,
    totalSources: logSources.length,
    lastUpdate: new Date().toISOString(),
  })
}
