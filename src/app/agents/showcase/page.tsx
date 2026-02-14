'use client'

import { useState, useEffect } from 'react'
import { showcaseAgents, type ShowcaseAgent, getAgentImage } from '@/lib/showcase-agents-data'
import Link from 'next/link'
import { ChevronLeft, Sparkles, X } from 'lucide-react'
import Image from 'next/image'

type Gender = 'male' | 'female'

interface GenderConfig {
  [agentId: string]: Gender
}

export default function AgentShowcasePage() {
  const [selectedAgent, setSelectedAgent] = useState<ShowcaseAgent | null>(null)
  const [genderConfig, setGenderConfig] = useState<GenderConfig>({})

  // 從 localStorage 載入性別設定
  useEffect(() => {
    const savedConfig = localStorage.getItem('agent-gender-config')
    if (savedConfig) {
      setGenderConfig(JSON.parse(savedConfig))
    } else {
      // 預設全部為男性
      const defaultConfig: GenderConfig = {}
      showcaseAgents.forEach(agent => {
        defaultConfig[agent.id] = 'male'
      })
      setGenderConfig(defaultConfig)
    }
  }, [])

  const getAgentImageUrl = (agent: ShowcaseAgent) => {
    const gender = genderConfig[agent.id] || 'male'
    return getAgentImage(agent.id, gender) || agent.maleImage
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
      {/* 頁首 */}
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/agents"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>返回 Agents</span>
        </Link>

        {/* 日式標題 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Travis AI 團隊
            </h1>
            <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            ✨ 八位專業 AI Agent，各司其職，攜手協作 ✨
          </p>
        </div>

        {/* 角色卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {showcaseAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              imageUrl={getAgentImageUrl(agent)}
              onClick={() => setSelectedAgent(agent)}
            />
          ))}
        </div>
      </div>

      {/* 角色詳情 Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          imageUrl={getAgentImageUrl(selectedAgent)}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  )
}

// 角色卡片組件
function AgentCard({ 
  agent, 
  imageUrl, 
  onClick 
}: { 
  agent: ShowcaseAgent
  imageUrl?: string
  onClick: () => void 
}) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 cursor-pointer
                 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20
                 transition-all duration-300 border-2 border-transparent hover:border-purple-400"
    >
      {/* 角色立繪 */}
      <div className={`w-full aspect-[3/4] rounded-xl overflow-hidden mb-4
                       group-hover:shadow-lg transition-shadow relative`}
           style={{ boxShadow: `0 8px 24px ${agent.color}20` }}>
        {imageUrl ? (
          <Image 
            src={imageUrl}
            alt={agent.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${agent.gradient} 
                         flex items-center justify-center`}>
            <div className="text-white text-6xl font-black opacity-30">
              {agent.name[0]}
            </div>
          </div>
        )}
      </div>

      {/* 角色資訊 */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {agent.name}
        </h2>
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
          {agent.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {agent.tagline}
        </p>
      </div>

      {/* Hover 發光效果 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 
                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}

// 角色詳情 Modal
function AgentDetailModal({ 
  agent, 
  imageUrl, 
  onClose 
}: { 
  agent: ShowcaseAgent
  imageUrl?: string
  onClose: () => void 
}) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 
                     hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-8">
          {/* 左側：角色立繪 */}
          <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
            {imageUrl ? (
              <Image 
                src={imageUrl}
                alt={agent.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${agent.gradient} 
                              flex items-center justify-center`}>
                <div className="text-white text-9xl font-black opacity-20">
                  {agent.name[0]}
                </div>
              </div>
            )}
          </div>

          {/* 右側：詳細資訊 */}
          <div className="space-y-6">
            {/* 標題 */}
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                {agent.name}
              </h2>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {agent.title}
              </p>
            </div>

            {/* 完整介紹 */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                角色介紹
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* 經典台詞 */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 
                            rounded-xl p-4 border-l-4 border-purple-500">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                經典台詞
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white italic">
                「{agent.quote}」
              </p>
            </div>

            {/* 技能列表（RPG 風格進度條） */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                能力值
              </h3>
              <div className="space-y-3">
                {agent.skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-sm font-bold" style={{ color: agent.color }}>
                        {skill.value}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${skill.value}%`,
                          backgroundColor: agent.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
