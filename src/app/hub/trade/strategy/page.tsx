// =============================================================================
// Travis Daily - Trade Strategy Page
// =============================================================================
'use client'

import { 
  ArrowLeft, Target, TrendingUp, Clock, 
  BarChart3, Zap, Settings, Shield
} from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'

// =============================================================================
// Types
// =============================================================================
interface Strategy {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'backtest'
  performance: {
    totalReturn: number
    winRate: number
    maxDrawdown: number
    sharpeRatio: number
  }
  config: {
    maxPositionSize: number
    stopLoss: number
    takeProfit: number
    riskPerTrade: number
  }
}

interface TradeHistory {
  id: number
  date: string
  symbol: string
  side: 'long' | 'short'
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPercent: number
}

// =============================================================================
// Main Component
// =============================================================================
export default function TradeStrategyPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [history, setHistory] = useState<TradeHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in production, fetch from API
    setStrategies([
      {
        id: '1',
        name: '趨勢追蹤策略',
        description: '依據移動平均線判斷趨勢方向進行交易',
        status: 'active',
        performance: {
          totalReturn: 34.5,
          winRate: 62.3,
          maxDrawdown: -12.4,
          sharpeRatio: 1.85,
        },
        config: {
          maxPositionSize: 30,
          stopLoss: 5,
          takeProfit: 15,
          riskPerTrade: 2,
        },
      },
      {
        id: '2',
        name: '均值回歸策略',
        description: '價格偏離均值時進行反向交易',
        status: 'active',
        performance: {
          totalReturn: 18.2,
          winRate: 58.7,
          maxDrawdown: -8.9,
          sharpeRatio: 1.42,
        },
        config: {
          maxPositionSize: 20,
          stopLoss: 3,
          takeProfit: 8,
          riskPerTrade: 1.5,
        },
      },
      {
        id: '3',
        name: '突破策略',
        description: '價格突破關鍵阻力位時進場',
        status: 'backtest',
        performance: {
          totalReturn: 45.8,
          winRate: 55.2,
          maxDrawdown: -18.6,
          sharpeRatio: 1.65,
        },
        config: {
          maxPositionSize: 25,
          stopLoss: 4,
          takeProfit: 12,
          riskPerTrade: 2,
        },
      },
    ])

    setHistory([
      { id: 1, date: '2026-02-28', symbol: '2330.TW', side: 'long', entryPrice: 875, exitPrice: 892, pnl: 17000, pnlPercent: 9.71 },
      { id: 2, date: '2026-02-27', symbol: '2454.TW', side: 'long', entryPrice: 1780, exitPrice: 1795, pnl: 7500, pnlPercent: 4.21 },
      { id: 3, date: '2026-02-27', symbol: '0050.TW', side: 'long', entryPrice: 142.5, exitPrice: 144.8, pnl: 4600, pnlPercent: 1.61 },
      { id: 4, date: '2026-02-26', symbol: '2317.TW', side: 'short', entryPrice: 125, exitPrice: 122, pnl: 9000, pnlPercent: 7.2 },
      { id: 5, date: '2026-02-25', symbol: '2308.TW', side: 'long', entryPrice: 215, exitPrice: 210, pnl: -5000, pnlPercent: -2.33 },
    ])

    setLoading(false)
  }, [])

  const formatPercent = (num: number) => `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
  const formatCurrency = (num: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(num)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">啟用中</span>
      case 'paused': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">已暫停</span>
      case 'backtest': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">回測中</span>
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">載入策略資料中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/hub/trade" 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                交易策略
              </h1>
              <p className="text-sm text-gray-400">Warren Agent 策略配置與歷史</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <div 
              key={strategy.id}
              className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">{strategy.name}</h3>
                {getStatusBadge(strategy.status)}
              </div>
              <p className="text-sm text-gray-400 mb-4">{strategy.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">總報酬</div>
                  <div className={`font-bold ${strategy.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(strategy.performance.totalReturn)}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">勝率</div>
                  <div className="font-bold">{strategy.performance.winRate}%</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">最大回撤</div>
                  <div className="font-bold text-red-400">{formatPercent(strategy.performance.maxDrawdown)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                  <div className="text-xs text-gray-500">夏普比率</div>
                  <div className="font-bold">{strategy.performance.sharpeRatio}</div>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-3">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>倉位: {strategy.config.maxPositionSize}%</span>
                  <span>止損: {strategy.config.stopLoss}%</span>
                  <span>止盈: {strategy.config.takeProfit}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trade History */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              交易歷史
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 text-gray-400 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">日期</th>
                  <th className="px-4 py-3 text-left">標的</th>
                  <th className="px-4 py-3 text-left">方向</th>
                  <th className="px-4 py-3 text-right">進場價</th>
                  <th className="px-4 py-3 text-right">出場價</th>
                  <th className="px-4 py-3 text-right">損益</th>
                  <th className="px-4 py-3 text-right">報酬率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {history.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm">{trade.date}</td>
                    <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${trade.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {trade.side === 'long' ? '多' : '空'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{trade.entryPrice}</td>
                    <td className="px-4 py-3 text-right">{trade.exitPrice}</td>
                    <td className={`px-4 py-3 text-right font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(trade.pnl)}
                    </td>
                    <td className={`px-4 py-3 text-right ${trade.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(trade.pnlPercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
