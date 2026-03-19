'use client'

import { useState, useEffect, useCallback } from 'react'
import { Newspaper, Search, Calendar, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getPostsByType } from '@/lib/content'

interface DigestPost {
  slug: string
  title: string
  date: string
  type: string
  tags: string[]
  excerpt: string
  cover?: string
}

export default function DigestPage() {
  const [digests, setDigests] = useState<DigestPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  /**
   * 載入 Digest 資料
   */
  const loadDigests = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch only digest type posts from Supabase
      const posts = await getPostsByType('digest')
      setDigests(posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setDigests([])
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始載入
  useEffect(() => {
    loadDigests()
  }, [loadDigests])

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * 篩選搜尋
   */
  const filteredDigests = digests.filter(digest => 
    digest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    digest.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    digest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 標題區塊 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Daily Digest
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              每日摘要與重點整理
            </p>
          </div>
        </div>

        {/* 說明卡片 */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-blue-800 dark:text-blue-300 font-medium block mb-1">
                資料來源說明
              </span>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                摘要資料來自 Supabase reports 表，類型為 digest 的記錄。
              </p>
            </div>
          </div>
        </div>

        {/* 統計資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {digests.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">總計摘要</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {digests.filter(d => new Date(d.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">本週新增</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(digests.flatMap(d => d.tags)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">標籤種類</div>
          </div>
        </div>
      </div>

      {/* 搜尋區塊 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜尋摘要標題或內容..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="text-red-800 dark:text-red-300">載入錯誤: {error}</div>
        </div>
      )}

      {/* 載入狀態 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="mt-2 text-gray-600 dark:text-gray-400">載入中...</div>
        </div>
      )}

      {/* 摘要列表 */}
      {!loading && filteredDigests.length > 0 && (
        <div className="space-y-4">
          {filteredDigests.map((digest) => (
            <Link 
              key={digest.slug} 
              href={`/digest/${digest.date}`}
              className="block"
            >
              <article className="bg-white dark:bg-gray-900 rounded-lg border p-6 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start gap-4">
                  {/* 封面圖 */}
                  {digest.cover && (
                    <div className="flex-shrink-0 w-32 h-20 overflow-hidden rounded-lg">
                      <img 
                        src={digest.cover} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  )}
                  
                  {/* 內容 */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {digest.title}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {digest.excerpt}
                    </p>
                    
                    <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(digest.date)}
                      </div>
                      
                      {digest.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          {digest.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag} 
                              className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {digest.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{digest.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 箭頭指示器 */}
                  <div className="flex-shrink-0 self-center">
                    <span className="text-gray-400 group-hover:text-blue-600 transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* 無資料狀態 */}
      {!loading && filteredDigests.length === 0 && !error && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 dark:text-gray-400 mb-2">
            {searchTerm ? '沒有找到符合的摘要' : '尚無摘要資料'}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              清除搜尋條件
            </button>
          )}
        </div>
      )}
    </div>
  )
}
