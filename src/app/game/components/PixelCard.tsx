'use client'

import React from 'react'

interface PixelCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  onClick?: () => void
}

export function PixelCard({ children, className = '', glowColor, onClick }: PixelCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative bg-gray-900 border-2 border-gray-700 rounded-lg
        ${glowColor ? `shadow-lg shadow-${glowColor}/20` : ''}
        ${onClick ? 'cursor-pointer hover:border-gray-500 transition-all hover:scale-[1.02]' : ''}
        ${className}
      `}
      style={glowColor ? { boxShadow: `0 0 20px ${glowColor}33, inset 0 1px 0 ${glowColor}22` } : {}}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] rounded-lg"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />
      {children}
    </div>
  )
}

export function StatusDot({ status, pulse = false }: { status: string; pulse?: boolean }) {
  const colors: Record<string, string> = {
    active: '#22c55e',
    executing: '#f97316',
    idle: '#eab308',
    offline: '#6b7280',
    error: '#ef4444',
  }
  const color = colors[status] || colors.offline

  return (
    <span className="relative inline-flex h-3 w-3">
      {pulse && (
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-3 w-3"
        style={{ backgroundColor: color }}
      />
    </span>
  )
}

export function PixelProgressBar({ value, max, color = '#22c55e', label }: {
  value: number
  max: number
  color?: string
  label?: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="w-full">
      {label && <div className="text-xs text-gray-400 mb-1">{label}</div>}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export function GameNav({ active }: { active: 'office' | 'logs' | 'tokens' }) {
  const tabs = [
    { key: 'office', label: '🏢 辦公室', href: '/game' },
    { key: 'logs', label: '📜 日誌牆', href: '/game/logs' },
    { key: 'tokens', label: '⚔️ 戰情室', href: '/game/tokens' },
  ] as const

  return (
    <nav className="flex gap-1 bg-gray-900/80 border border-gray-700 rounded-lg p-1 backdrop-blur-sm">
      {tabs.map(t => (
        <a
          key={t.key}
          href={t.href}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            active === t.key
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          {t.label}
        </a>
      ))}
    </nav>
  )
}
