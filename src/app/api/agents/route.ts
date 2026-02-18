import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Threshold constants (in milliseconds)
const ACTIVE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes - 綠燈
const IDLE_THRESHOLD_MS = 30 * 60 * 1000;   // 30 minutes - 黃燈
const OFFLINE_THRESHOLD_MS = 60 * 60 * 1000; // 60 minutes - 紅燈

// Status types matching the requirement
type AgentStatus = 'active' | 'idle' | 'offline' | 'executing';

// Agent configuration from openclaw.json
const agentsConfig = [
  {
    id: 'main',
    name: 'Travis',
    emoji: '🤖',
    role: '協調者',
    description: 'William 的 AI 助手，負責任務派發與流水線管理，協調所有執行者',
    color: '#8B5CF6',
    skills: ['任務派發', '流水線管理', '決策', '協調'],
    model: 'claude-sonnet-4-20250514',
    quote: '協調者上線 - 隨時可對話，負責任務派發與流水線管理',
    isCoordinator: true
  },
  {
    id: 'coder',
    name: 'Coder',
    emoji: '💻',
    role: '程式開發',
    description: '專注於程式開發和技術實現',
    color: '#10B981',
    skills: ['程式開發', '重構', '調試', 'Code Review'],
    model: 'minimax/MiniMax-M2.5',
    quote: '程式碼是詩，邏輯是藝術。'
  },
  {
    id: 'secretary',
    name: 'Secretary',
    emoji: '📋',
    role: '行政助理',
    description: '處理日程、郵件和行政事務',
    color: '#EC4899',
    skills: ['日程管理', '郵件處理', '會議安排', '文件整理'],
    model: 'minimax/MiniMax-M2.5',
    quote: '效率是成功的關鍵。'
  },
  {
    id: 'writer',
    name: 'Writer',
    emoji: '✍️',
    role: '內容創作',
    description: '專注於文章、報告和創意寫作',
    color: '#8B5CF6',
    skills: ['寫作', '編輯', '翻譯', '內容策略'],
    model: 'moonshot/moonshot-v1-128k',
    quote: '文字的力量，改變世界的起點。'
  },
  {
    id: 'researcher',
    name: 'Researcher',
    emoji: '🔬',
    role: '研究分析',
    description: '負責市場研究和深度分析',
    color: '#3B82F6',
    skills: ['研究分析', '市場調查', '數據分析', '報告產出'],
    model: 'minimax/MiniMax-M2.5',
    quote: '數據驅動決策，洞見創造價值。'
  },
  {
    id: 'designer',
    name: 'Designer',
    emoji: '🎨',
    role: '設計師',
    description: '負責視覺設計和用戶體驗優化',
    color: '#F59E0B',
    skills: ['UI設計', 'UX優化', '品牌設計', '動效'],
    model: 'minimax/MiniMax-M2.5',
    quote: '設計讓世界更美好。'
  }
];

// Check if OpenClaw gateway is running
async function checkGatewayHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('http://127.0.0.1:18789/api/health', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// Get all agent sessions from sessions.json
async function getAllAgentSessions(): Promise<Record<string, { updatedAt: number; sessionId: string }>> {
  const sessionPath = '/Users/travis/.openclaw/agents/main/sessions/sessions.json';
  
  try {
    if (!existsSync(sessionPath)) return {};
    
    const content = await readFile(sessionPath, 'utf-8');
    const sessions = JSON.parse(content);
    
    const result: Record<string, { updatedAt: number; sessionId: string }> = {};
    
    for (const [key, value] of Object.entries(sessions)) {
      if (key.startsWith('agent:')) {
        const session = value as { updatedAt?: number; sessionId?: string };
        if (session.updatedAt) {
          // Extract agent type from key (e.g., 'agent:main:main' -> 'main')
          const parts = key.split(':');
          const agentType = parts[1];
          const agentId = parts[2] || 'main';
          
          if (agentId === 'main' || agentType === 'subagent') {
            // For main agent sessions, use the key directly
            result[key] = {
              updatedAt: session.updatedAt,
              sessionId: session.sessionId || ''
            };
          }
        }
      }
    }
    
    return result;
  } catch {
    return {};
  }
}

// Get running tasks from runs.json
async function getRunningTasks(): Promise<string[]> {
  const runsPath = '/Users/travis/.openclaw/subagents/runs.json';
  
  try {
    if (!existsSync(runsPath)) return [];
    
    const content = await readFile(runsPath, 'utf-8');
    const data = JSON.parse(content);
    
    const runningTasks: string[] = [];
    const runs = data.runs || {};
    
    for (const [runId, run] of Object.entries(runs)) {
      const r = run as { endedAt?: number; outcome?: { status?: string } };
      // If no endedAt or outcome, task is still running
      if (!r.endedAt && !r.outcome) {
        runningTasks.push(runId);
      }
    }
    
    return runningTasks;
  } catch {
    return [];
  }
}

// Determine agent status based on activity time
function determineStatus(lastActivityMs: number, isGatewayRunning: boolean, isCoordinator: boolean): {
  status: AgentStatus;
  statusText: string;
  statusColor: string;
  pulse: boolean;
} {
  const now = Date.now();
  const diffMs = now - lastActivityMs;
  
  // Gateway not running - show offline (red)
  if (!isGatewayRunning) {
    return {
      status: 'offline',
      statusText: '🔴 系統離線',
      statusColor: 'bg-red-500',
      pulse: false
    };
  }
  
  // No activity data - assume active for coordinator, idle for others
  if (!lastActivityMs) {
    if (isCoordinator) {
      return {
        status: 'active',
        statusText: '🟢 協調者 - 隨時可對話',
        statusColor: 'bg-green-500',
        pulse: true
      };
    }
    return {
      status: 'idle',
      statusText: '🟡 待機中',
      statusColor: 'bg-yellow-500',
      pulse: false
    };
  }
  
  // Active: within 10 minutes (green)
  if (diffMs < ACTIVE_THRESHOLD_MS) {
    if (isCoordinator) {
      return {
        status: 'active',
        statusText: '🟢 協調者 - 隨時可對話',
        statusColor: 'bg-green-500',
        pulse: true
      };
    }
    return {
      status: 'active',
      statusText: '🟢 執行中',
      statusColor: 'bg-green-500',
      pulse: true
    };
  }
  
  // Idle: 10-30 minutes (yellow)
  if (diffMs < IDLE_THRESHOLD_MS) {
    const idleMinutes = Math.floor(diffMs / 60000);
    if (isCoordinator) {
      return {
        status: 'idle',
        statusText: `🟡 協調者 - 待機中（${idleMinutes}分鐘無對話）`,
        statusColor: 'bg-yellow-500',
        pulse: false
      };
    }
    return {
      status: 'idle',
      statusText: `🟡 待機中（${idleMinutes}分鐘無活動）`,
      statusColor: 'bg-yellow-500',
      pulse: false
    };
  }
  
  // Offline: over 30 minutes (red) - but gateway is running
  if (diffMs < OFFLINE_THRESHOLD_MS) {
    const idleMinutes = Math.floor(diffMs / 60000);
    return {
      status: 'offline',
      statusText: `🔴 離線（${idleMinutes}分鐘無活動）`,
      statusColor: 'bg-red-500',
      pulse: false
    };
  }
  
  // Very long time - likely stopped (still show red for offline)
  return {
    status: 'offline',
    statusText: '🔴 系統停止',
    statusColor: 'bg-red-500',
    pulse: false
  };
}

// Get main agent's last activity time
async function getMainAgentLastActivity(): Promise<number | null> {
  const sessionPath = '/Users/travis/.openclaw/agents/main/sessions/sessions.json';
  
  try {
    if (!existsSync(sessionPath)) return null;
    
    const content = await readFile(sessionPath, 'utf-8');
    const sessions = JSON.parse(content);
    
    // Get agent:main:main
    const mainSession = sessions['agent:main:main'];
    if (mainSession && mainSession.updatedAt) {
      return mainSession.updatedAt;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Get subagent status based on session files
async function getSubagentStatus(agentId: string): Promise<{
  lastActivityTime: number | null;
  isExecuting: boolean;
}> {
  // Check runs.json for executing tasks
  const runsPath = '/Users/travis/.openclaw/subagents/runs.json';
  
  try {
    if (!existsSync(runsPath)) {
      return { lastActivityTime: null, isExecuting: false };
    }
    
    const content = await readFile(runsPath, 'utf-8');
    const data = JSON.parse(content);
    
    const runs = data.runs || {};
    let isExecuting = false;
    let latestTime = 0;
    
    for (const [runId, run] of Object.entries(runs)) {
      const r = run as { 
        startedAt?: number; 
        endedAt?: number;
        childSessionKey?: string;
      };
      
      // Check if this run belongs to the agent
      if (r.childSessionKey && r.childSessionKey.includes(`agent:${agentId}:`)) {
        if (r.startedAt) {
          if (latestTime < r.startedAt) {
            latestTime = r.startedAt;
          }
        }
        
        // Task is running if it has startedAt but no endedAt
        if (r.startedAt && !r.endedAt) {
          isExecuting = true;
        }
      }
    }
    
    return {
      lastActivityTime: latestTime > 0 ? latestTime : null,
      isExecuting
    };
  } catch {
    return { lastActivityTime: null, isExecuting: false };
  }
}

// Build dynamic agent data
async function buildAgentsData() {
  const isGatewayRunning = await checkGatewayHealth();
  const mainAgentLastActivity = await getMainAgentLastActivity();
  const runningTasks = await getRunningTasks();
  
  const now = Date.now();
  
  const agents = await Promise.all(agentsConfig.map(async (config) => {
    let lastActivityTime: number | null = null;
    let isExecuting = false;
    
    if (config.id === 'main') {
      // Travis - use main agent session
      lastActivityTime = mainAgentLastActivity;
    } else {
      // Other agents - check subagent runs
      const subagentStatus = await getSubagentStatus(config.id);
      lastActivityTime = subagentStatus.lastActivityTime;
      isExecuting = subagentStatus.isExecuting;
    }
    
    // Determine status based on activity
    const statusInfo = determineStatus(
      lastActivityTime || 0,
      isGatewayRunning,
      config.isCoordinator || false
    );
    
    // Override with executing status if task is running
    let finalStatus = statusInfo.status;
    let finalStatusText = statusInfo.statusText;
    let finalStatusColor = statusInfo.statusColor;
    let finalPulse = statusInfo.pulse;
    
    if (isExecuting) {
      finalStatus = 'executing';
      finalStatusText = '🔶 執行任務中';
      finalStatusColor = 'bg-orange-500';
      finalPulse = true;
    }
    
    return {
      id: config.id,
      name: config.name,
      emoji: config.emoji,
      role: config.role,
      description: config.description,
      color: config.color,
      skills: config.skills,
      status: finalStatus,
      statusText: finalStatusText,
      statusColor: finalStatusColor,
      pulse: finalPulse,
      lastRunAt: lastActivityTime ? new Date(lastActivityTime).toISOString() : new Date().toISOString(),
      lastStatus: finalStatus,
      model: config.model,
      quote: config.quote,
      isCoordinator: config.isCoordinator || false
    };
  }));
  
  return agents;
}

// Get task statistics (simulated based on runs.json)
async function getTaskStats() {
  const runsPath = '/Users/travis/.openclaw/subagents/runs.json';
  
  try {
    if (!existsSync(runsPath)) {
      return {
        executing: 0,
        pending: 0,
        completedToday: 0
      };
    }
    
    const content = await readFile(runsPath, 'utf-8');
    const data = JSON.parse(content);
    
    const runs = data.runs || {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let executing = 0;
    let completedToday = 0;
    
    for (const [runId, run] of Object.entries(runs)) {
      const r = run as { 
        startedAt?: number; 
        endedAt?: number;
        createdAt?: number;
      };
      
      // Executing: has startedAt but no endedAt
      if (r.startedAt && !r.endedAt) {
        executing++;
      }
      
      // Completed today
      if (r.endedAt) {
        const endedDate = new Date(r.endedAt);
        if (endedDate >= today) {
          completedToday++;
        }
      }
    }
    
    return {
      executing,
      pending: Math.max(0, 5 - executing), // Estimate pending tasks
      completedToday
    };
  } catch {
    return {
      executing: 0,
      pending: 0,
      completedToday: 0
    };
  }
}

export async function GET() {
  try {
    const agents = await buildAgentsData();
    const taskStats = await getTaskStats();
    const isGatewayRunning = await checkGatewayHealth();
    
    // Sort: Travis (coordinator) first, then by status
    const sortedAgents = [...agents].sort((a, b) => {
      // Coordinator always first
      if (a.isCoordinator && !b.isCoordinator) return -1;
      if (!a.isCoordinator && b.isCoordinator) return 1;
      
      // Then sort by status
      const statusOrder: Record<AgentStatus, number> = {
        'executing': 0,
        'active': 1,
        'idle': 2,
        'offline': 3
      };
      
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return NextResponse.json({
      agents: sortedAgents,
      taskStats,
      lastUpdate: new Date().toISOString(),
      gatewayRunning: isGatewayRunning,
      // Model usage stats (simulated - in production, read from model_usage table)
      modelUsage: {
        todayTokens: 125000,
        yesterdayTokens: 98000,
        weekTokens: 542000,
        estimatedCost: 2.15,
        quota: 1000000,
        quotaRemaining: 875000
      }
    });
  } catch (error) {
    console.error('Error fetching agents data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents data' },
      { status: 500 }
    );
  }
}
