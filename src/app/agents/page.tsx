'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  description: string;
  color: string;
  skills: string[];
  status: 'active' | 'idle' | 'offline' | 'executing';
  statusText: string;
  statusColor: string;
  pulse: boolean;
  lastRunAt: string;
  lastStatus: string;
  model: string;
  quote: string;
  isCoordinator?: boolean;
}

interface TaskStats {
  executing: number;
  pending: number;
  completedToday: number;
}

interface ModelUsage {
  todayTokens: number;
  yesterdayTokens: number;
  weekTokens: number;
  estimatedCost: number;
  quota: number;
  quotaRemaining: number;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return '剛剛';
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  return date.toLocaleDateString('zh-TW');
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Status Indicator with unified light logic
// 🟢 Green: Active (within 10 min)
// 🟡 Yellow: Idle (10-30 min no activity but system OK)
// 🔴 Red: Offline (system issue or >30 min no activity)
// 🔶 Orange: Executing (running a task)
function StatusIndicator({ status, statusText, pulse }: { status: string; statusText?: string; pulse?: boolean }) {
  const colorMap: Record<string, { bg: string; ping: string }> = {
    'active': { bg: 'bg-green-500', ping: 'bg-green-500' },
    'idle': { bg: 'bg-yellow-500', ping: 'bg-yellow-500' },
    'offline': { bg: 'bg-red-500', ping: 'bg-red-500' },
    'executing': { bg: 'bg-orange-500', ping: 'bg-orange-500' }
  };
  
  const colors = colorMap[status] || colorMap.offline;
  
  return (
    <div className="flex items-center space-x-2">
      <span className="relative flex h-3 w-3">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.ping}`} />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${colors.bg}`} />
      </span>
      <span className="text-sm font-medium text-gray-600">{statusText || status}</span>
    </div>
  );
}

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const isCoordinator = agent.isCoordinator;
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isCoordinator ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        borderLeft: `4px solid ${agent.color}`
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${isCoordinator ? 'relative' : ''}`}
              style={{ backgroundColor: `${agent.color}20` }}
            >
              {agent.emoji}
              {isCoordinator && (
                <span className="absolute -top-1 -right-1 text-lg" title="協調者">👑</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                {isCoordinator && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                    協調者
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{agent.role}</p>
            </div>
          </div>
          <StatusIndicator status={agent.status} statusText={agent.statusText} pulse={agent.pulse} />
        </div>

        <p className="mt-4 text-gray-600 text-sm">{agent.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {agent.skills.map((skill) => (
            <span 
              key={skill}
              className="px-3 py-1 text-xs font-medium rounded-full"
              style={{ 
                backgroundColor: `${agent.color}15`,
                color: agent.color
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              最後活動: {formatTimeAgo(agent.lastRunAt)}
            </span>
            <span className="text-gray-400 text-xs truncate max-w-[150px]">
              {agent.model}
            </span>
          </div>
        </div>

        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 italic">"{agent.quote}"</p>
        </div>
      </div>
    </div>
  );
}

function CoordinatorCard({ agent }: { agent: Agent }) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ring-2 ring-purple-500 ring-offset-4"
      style={{ 
        borderLeft: `6px solid ${agent.color}`,
        animation: 'fadeInUp 0.5s ease-out'
      }}
    >
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Avatar and Name */}
          <div className="flex items-center space-x-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl relative bg-gradient-to-br from-purple-100 to-purple-50"
            >
              {agent.emoji}
              <span className="absolute -top-2 -right-2 text-3xl" title="協調者">👑</span>
            </div>
            <div>
              <div className="flex items-center space-x-3 flex-wrap">
                <h2 className="text-3xl font-bold text-gray-900">{agent.name}</h2>
                <span className="px-3 py-1 text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-md">
                  系統協調者
                </span>
              </div>
              <p className="text-lg text-gray-500 mt-1">{agent.role}</p>
            </div>
          </div>

          {/* Right: Status */}
          <div className="flex flex-col items-start md:items-end space-y-3">
            <StatusIndicator status={agent.status} statusText={agent.statusText} pulse={agent.pulse} />
            <p className="text-sm text-gray-500">負責任務派發與流水線管理，隨時可對話</p>
          </div>
        </div>

        {/* Skills and Info Row */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {agent.skills.map((skill) => (
                <span 
                  key={skill}
                  className="px-4 py-1.5 text-sm font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>最後活動: {formatTimeAgo(agent.lastRunAt)}</span>
              <span className="hidden md:inline">|</span>
              <span className="truncate">{agent.model}</span>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-gray-50 rounded-xl">
          <p className="text-base text-gray-700 italic">"{agent.quote}"</p>
        </div>
      </div>
    </div>
  );
}

function TaskStatsCard({ stats }: { stats: TaskStats }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">📊 任務統計</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-orange-500">{stats.executing}</div>
          <div className="text-xs text-gray-500">執行中</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-500">{stats.pending}</div>
          <div className="text-xs text-gray-500">待執行</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-500">{stats.completedToday}</div>
          <div className="text-xs text-gray-500">今日完成</div>
        </div>
      </div>
    </div>
  );
}

function ModelUsageCard({ usage }: { usage: ModelUsage }) {
  const usagePercent = ((usage.quota - usage.quotaRemaining) / usage.quota) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">💰 模型額度</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">額度使用</span>
            <span className="font-medium">{usagePercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatNumber(usage.quotaRemaining)} / {formatNumber(usage.quota)} tokens 剩餘
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
          <div>
            <div className="text-sm font-medium">{formatNumber(usage.todayTokens)}</div>
            <div className="text-xs text-gray-500">今日</div>
          </div>
          <div>
            <div className="text-sm font-medium">{formatNumber(usage.yesterdayTokens)}</div>
            <div className="text-xs text-gray-500">昨日</div>
          </div>
          <div>
            <div className="text-sm font-medium">{formatNumber(usage.weekTokens)}</div>
            <div className="text-xs text-gray-500">本週</div>
          </div>
        </div>
        
        <div className="text-center pt-2 border-t">
          <span className="text-sm text-gray-600">預估成本: </span>
          <span className="text-sm font-bold text-green-600">${usage.estimatedCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityLog({ lastUpdate, gatewayRunning }: { lastUpdate: string; gatewayRunning?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">即時動態</h3>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${gatewayRunning ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            OpenClaw {gatewayRunning ? '運行中' : '已停止'}
          </span>
          <span className="text-xs text-gray-400">
            • 更新於 {formatTimeAgo(lastUpdate)}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-gray-600">即時同步中...</span>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats>({ executing: 0, pending: 0, completedToday: 0 });
  const [modelUsage, setModelUsage] = useState<ModelUsage | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [gatewayRunning, setGatewayRunning] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data.agents);
      setTaskStats(data.taskStats);
      setModelUsage(data.modelUsage);
      setLastUpdate(data.lastUpdate);
      setGatewayRunning(data.gatewayRunning);
      setError(null);
    } catch (err) {
      setError('無法載入 Agent 資料');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchAgents, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">載入 Agent 資料中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchAgents}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  // Count by status with unified logic
  const activeCount = agents.filter(a => a.status === 'active').length;
  const executingCount = agents.filter(a => a.status === 'executing').length;
  const idleCount = agents.filter(a => a.status === 'idle').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

  // Sort: Travis (coordinator) first, then by status
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.isCoordinator && !b.isCoordinator) return -1;
    if (!a.isCoordinator && b.isCoordinator) return 1;
    
    const statusOrder: Record<string, number> = {
      'executing': 0,
      'active': 1,
      'idle': 2,
      'offline': 3
    };
    
    return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
  });

  // Separate coordinator from other agents
  const coordinator = sortedAgents.find(a => a.isCoordinator);
  const workerAgents = sortedAgents.filter(a => !a.isCoordinator);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI Agent 團隊
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            即時查看 AI 團隊成員的狀態與活動
          </p>
          
          {/* Status Summary - Unified light logic */}
          <div className="flex justify-center space-x-6 flex-wrap">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-700">
                <strong className="text-xl">{activeCount}</strong> 活躍
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="text-gray-700">
                <strong className="text-xl">{executingCount}</strong> 執行中
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-700">
                <strong className="text-xl">{idleCount}</strong> 待機
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-700">
                <strong className="text-xl">{offlineCount}</strong> 離線
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              <span className="text-gray-700">
                <strong className="text-xl">{agents.length}</strong> 總計
              </span>
            </div>
          </div>
          
          {/* Light legend */}
          <div className="mt-4 text-xs text-gray-500 flex justify-center space-x-4">
            <span>🟢 活躍（10分鐘內）</span>
            <span>🟡 待機（10-30分鐘）</span>
            <span>🔶 執行中</span>
            <span>🔴 離線（30分鐘以上）</span>
          </div>
        </div>

        {/* Activity Log & Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ActivityLog lastUpdate={lastUpdate} gatewayRunning={gatewayRunning} />
          <TaskStatsCard stats={taskStats} />
          {modelUsage && <ModelUsageCard usage={modelUsage} />}
        </div>

        {/* Coordinator Section - Travis in dedicated top row */}
        {coordinator && (
          <div className="mb-10">
            <CoordinatorCard agent={coordinator} />
          </div>
        )}

        {/* Divider */}
        {coordinator && workerAgents.length > 0 && (
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-4 text-sm font-medium text-gray-400">執行團隊</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        )}

        {/* Agent Grid - Workers only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workerAgents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>資料每 30 秒自動更新</p>
          <p className="mt-1">Powered by OpenClaw Gateway</p>
        </div>
      </div>
    </div>
  );
}
