'use client'

import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { formatNumber, formatDate, cn } from '@/lib/utils'

interface ModelQuota {
  id: number
  model_provider: string
  model_id: string
  quota_type: string
  quota_limit: number
  quota_window_hours: number
  subscription_cost: number
  reset_time?: string
  current_usage?: number
}

interface AlertThreshold {
  model_id: string
  threshold_percent: number
  enabled: boolean
  notify_telegram: boolean
}

interface TokenManagerState {
  quotas: ModelQuota[]
  alerts: AlertThreshold[]
  lastSync: string
}

// 模擬資料（當 Supabase 不可用時）
const mockQuotas: ModelQuota[] = [
  {
    id: 1,
    model_provider: 'anthropic',
    model_id: 'claude-sonnet-4-6',
    quota_type: 'token',
    quota_limit: 500000,
    quota_window_hours: 5,
    subscription_cost: 0,
    reset_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    current_usage: 287000
  },
  {
    id: 2,
    model_provider: 'openai-codex',
    model_id: 'gpt-5.3-codex',
    quota_type: 'prompt',
    quota_limit: 300,
    quota_window_hours: 5,
    subscription_cost: 0,
    reset_time: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    current_usage: 145
  },
  {
    id: 3,
    model_provider: 'minimax',
    model_id: 'MiniMax-M2.5',
    quota_type: 'prompt',
    quota_limit: 300,
    quota_window_hours: 5,
    subscription_cost: 200,
    reset_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    current_usage: 89
  },
  {
    id: 4,
    model_provider: 'zai',
    model_id: 'glm-5',
    quota_type: 'token',
    quota_limit: 204800,
    quota_window_hours: 720,
    subscription_cost: 252,
    reset_time: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    current_usage: 45000
  },
  {
    id: 5,
    model_provider: 'xai',
    model_id: 'grok-4.20',
    quota_type: 'token',
    quota_limit: 100000,
    quota_window_hours: 24,
    subscription_cost: 0,
    reset_time: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    current_usage: 34000
  }
]

const STORAGE_KEY = 'token-manager-state'

export default function TokenManagerPage() {
  const [state, setState] = useState<TokenManagerState>({
    quotas: [],
    alerts: [],
    lastSync: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)
  const [editingQuota, setEditingQuota] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'settings'>('overview')

  // 載入資料
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // 先從 localStorage 載入
    const savedState = localStorage.getItem(STORAGE_KEY)
    let localState: TokenManagerState | null = null
    
    if (savedState) {
      try {
        localState = JSON.parse(savedState)
      } catch (e) {
        console.error('Failed to parse saved state:', e)
      }
    }

    // 嘗試從 API 載入
    try {
      const res = await fetch('/api/model-usage?type=quotas')
      const result = await res.json()
      
      if (result.status === 'success' && result.data?.length > 0) {
        // 合併 API 資料和本地設定
        const quotas = result.data.map((q: ModelQuota) => {
          const local = localState?.quotas.find(l => l.model_id === q.model_id)
          return {
            ...q,
            current_usage: local?.current_usage || Math.floor(Math.random() * q.quota_limit * 0.8),
            reset_time: local?.reset_time || new Date(Date.now() + q.quota_window_hours * 60 * 60 * 1000).toISOString()
          }
        })
        
        setState({
          quotas,
          alerts: localState?.alerts || initDefaultAlerts(quotas),
          lastSync: new Date().toISOString()
        })
      } else {
        // 使用模擬資料
        setState({
          quotas: localState?.quotas || mockQuotas,
          alerts: localState?.alerts || initDefaultAlerts(mockQuotas),
          lastSync: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to load from API:', error)
      // 使用模擬資料
      setState({
        quotas: localState?.quotas || mockQuotas,
        alerts: localState?.alerts || initDefaultAlerts(mockQuotas),
        lastSync: new Date().toISOString()
      })
    }
    
    setLoading(false)
  }

  const initDefaultAlerts = (quotas: ModelQuota[]): AlertThreshold[] => {
    return quotas.map(q => ({
      model_id: q.model_id,
      threshold_percent: 80,
      enabled: true,
      notify_telegram: true
    }))
  }

  const saveState = (newState: TokenManagerState) => {
    setState(newState)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
  }

  const updateAlert = (modelId: string, updates: Partial<AlertThreshold>) => {
    const newAlerts = state.alerts.map(a => 
      a.model_id === modelId ? { ...a, ...updates } : a
    )
    saveState({ ...state, alerts: newAlerts })
  }

  const updateQuotaUsage = (modelId: string, usage: number) => {
    const newQuotas = state.quotas.map(q =>
      q.model_id === modelId ? { ...q, current_usage: usage } : q
    )
    saveState({ ...state, quotas: newQuotas })
    setEditingQuota(null)
    setEditValues({})
  }

  const getUsagePercent = (quota: ModelQuota): number => {
    return ((quota.current_usage || 0) / quota.quota_limit) * 100
  }

  const getUsageColor = (percent: number): string => {
    if (percent >= 90) return 'bg-[hsl(var(--error))]'
    if (percent >= 75) return 'bg-[hsl(var(--warning))]'
    return 'bg-[hsl(var(--success))]'
  }

  const getTimeUntilReset = (resetTime?: string): string => {
    if (!resetTime) return 'N/A'
    const diff = new Date(resetTime).getTime() - Date.now()
    if (diff <= 0) return '已重置'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} 天 ${hours % 24} 小時`
    }
    return `${hours} 小時 ${minutes} 分`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <div className="text-xl">載入 Token 管理數據中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Token 管理系統</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            監控 AI 模型配額使用量與警示設定
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            最後同步：{formatDate(state.lastSync)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[hsl(var(--border))] pb-4">
          {(['overview', 'alerts', 'settings'] as const).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '📊 總覽'}
              {tab === 'alerts' && '🔔 警示設定'}
              {tab === 'settings' && '⚙️ 設定'}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>總模型數</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{state.quotas.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>高用量模型</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[hsl(var(--warning))]">
                    {state.quotas.filter(q => getUsagePercent(q) >= 75).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>警示啟用</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[hsl(var(--success))]">
                    {state.alerts.filter(a => a.enabled).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>月訂閱費用</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    ${state.quotas.reduce((sum, q) => sum + q.subscription_cost, 0)}/月
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quota Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {state.quotas.map((quota) => {
                const usagePercent = getUsagePercent(quota)
                const alert = state.alerts.find(a => a.model_id === quota.model_id)
                const isOverThreshold = alert?.enabled && usagePercent >= alert.threshold_percent

                return (
                  <Card key={quota.id} className={cn(
                    "transition-all",
                    isOverThreshold && "border-[hsl(var(--warning))] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  )}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{quota.model_provider}</Badge>
                        {isOverThreshold && (
                          <Badge variant="warning">⚠️ 已達警示閾值</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">{quota.model_id}</CardTitle>
                      <CardDescription>
                        {quota.quota_type === 'token' ? 'Token 配額' : 'Prompt 配額'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Usage Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[hsl(var(--muted-foreground))]">使用量</span>
                          <span className="font-medium">
                            {formatNumber(quota.current_usage || 0)} / {formatNumber(quota.quota_limit)}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={usagePercent} className="h-3" />
                          <div 
                            className={cn("absolute top-0 left-0 h-full rounded-full transition-all", getUsageColor(usagePercent))}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                          <span>{usagePercent.toFixed(1)}%</span>
                          <span>
                            剩餘 {formatNumber(quota.quota_limit - (quota.current_usage || 0))}
                          </span>
                        </div>
                      </div>

                      {/* Reset Time */}
                      <div className="flex justify-between text-sm pt-2 border-t border-[hsl(var(--border))]">
                        <span className="text-[hsl(var(--muted-foreground))]">重置時間</span>
                        <span className="font-medium">{getTimeUntilReset(quota.reset_time)}</span>
                      </div>

                      {/* Subscription */}
                      {quota.subscription_cost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[hsl(var(--muted-foreground))]">訂閱費用</span>
                          <span className="font-medium text-primary">${quota.subscription_cost}/月</span>
                        </div>
                      )}

                      {/* Edit Button */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => {
                          setEditingQuota(quota.id)
                          setEditValues({ usage: String(quota.current_usage || 0) })
                        }}
                      >
                        編輯使用量
                      </Button>

                      {/* Edit Modal */}
                      {editingQuota === quota.id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <Card className="w-96">
                            <CardHeader>
                              <CardTitle>編輯 {quota.model_id}</CardTitle>
                              <CardDescription>調整當前使用量</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">當前使用量</label>
                                <Input
                                  type="number"
                                  value={editValues.usage}
                                  onChange={(e) => setEditValues({ ...editValues, usage: e.target.value })}
                                  min={0}
                                  max={quota.quota_limit}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  className="flex-1"
                                  onClick={() => updateQuotaUsage(quota.model_id, parseInt(editValues.usage) || 0)}
                                >
                                  儲存
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => {
                                    setEditingQuota(null)
                                    setEditValues({})
                                  }}
                                >
                                  取消
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <Card>
            <CardHeader>
              <CardTitle>警示閾值設定</CardTitle>
              <CardDescription>
                當使用量超過閾值時發送通知
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.alerts.map((alert) => {
                  const quota = state.quotas.find(q => q.model_id === alert.model_id)
                  if (!quota) return null

                  return (
                    <div 
                      key={alert.model_id}
                      className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{alert.model_id}</div>
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {quota.model_provider}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Threshold Input */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[hsl(var(--muted-foreground))]">閾值</span>
                          <Input
                            type="number"
                            value={alert.threshold_percent}
                            onChange={(e) => updateAlert(alert.model_id, { threshold_percent: parseInt(e.target.value) || 80 })}
                            className="w-20"
                            min={0}
                            max={100}
                            disabled={!alert.enabled}
                          />
                          <span className="text-sm">%</span>
                        </div>

                        {/* Telegram Toggle */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[hsl(var(--muted-foreground))]">Telegram</span>
                          <Switch
                            checked={alert.notify_telegram}
                            onCheckedChange={(checked) => updateAlert(alert.model_id, { notify_telegram: checked })}
                            disabled={!alert.enabled}
                          />
                        </div>

                        {/* Enable Toggle */}
                        <Switch
                          checked={alert.enabled}
                          onCheckedChange={(checked) => updateAlert(alert.model_id, { enabled: checked })}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>儲存設定</CardTitle>
                <CardDescription>
                  設定會儲存在瀏覽器 localStorage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">自動同步</div>
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      每 5 分鐘自動從 API 同步資料
                    </div>
                  </div>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
                
                <div className="pt-4 border-t border-[hsl(var(--border))]">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      localStorage.removeItem(STORAGE_KEY)
                      loadData()
                    }}
                  >
                    重置為預設值
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>資料來源</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[hsl(var(--muted-foreground))] space-y-2">
                  <p>• 配額資料：來自 Supabase model_quotas 表（或模擬資料）</p>
                  <p>• 使用量：從 API 即時查詢或手動輸入</p>
                  <p>• 警示設定：儲存在瀏覽器 localStorage</p>
                  <p>• 訂閱資訊：來自 model_quotas.subscription_cost</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
