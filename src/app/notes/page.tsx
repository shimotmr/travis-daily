'use client'
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit

import { useState, useEffect, useCallback } from 'react'
import { StickyNote, Search, Calendar, User, FileText, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface NoteReport {
  id: number
  title: string
  date: string
  author: string
  type: string
  md_content: string
  doc_url?: string
  pdf_url?: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  /**
   * 載入筆記資料
   */
  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 從 Supabase reports 表篩選 type = '筆記' 或 'notes'
      const { data, error: supabaseError } = await supabase
        .from('reports')
        .select('id, title, date, author, type, md_content, doc_url, pdf_url')
        .in('type', ['筆記', 'notes'])
        .order('date', { ascending: false })

      if (supabaseError) throw supabaseError
      
      setNotes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // 初始載入
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

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
   * 取得摘要文字
   */
  const getExcerpt = (content: string, maxLength = 150) => {
    if (!content) return '無內容摘要'
    // 移除 markdown 標題和多余空白
    const plainText = content
      .replace(/^#.*$/gm, '')
      .replace(/\n{2,}/g, '\n')
      .trim()
    return plainText.length > maxLength 
      ? plainText.slice(0, maxLength) + '...'
      : plainText
  }

  /**
   * 篩選搜尋
   */
  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getExcerpt(note.md_content).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 標題區塊 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <StickyNote className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              筆記
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              學習筆記與心得記錄
            </p>
          </div>
        </div>

        {/* 說明卡片 */}
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-amber-800 dark:text-amber-300 font-medium block mb-1">
                資料來源說明
              </span>
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                筆記資料來自 Supabase reports 表，類型為「筆記」或「notes」的記錄。
              </p>
            </div>
          </div>
        </div>

        {/* 統計資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {notes.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">總計筆記</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {notes.filter(n => n.date && new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">本週新增</div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(notes.map(n => n.author).filter(Boolean)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">作者人數</div>
          </div>
        </div>
      </div>

      {/* 搜尋區塊 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜尋筆記標題、作者或內容..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-800"
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <div className="mt-2 text-gray-600 dark:text-gray-400">載入中...</div>
        </div>
      )}

      {/* 筆記列表 */}
      {!loading && filteredNotes.length > 0 && (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <article 
              key={note.id}
              className="bg-white dark:bg-gray-900 rounded-lg border p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* 內容 */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {note.title || '無標題'}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {getExcerpt(note.md_content)}
                  </p>
                  
                  <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {note.date ? formatDate(note.date) : '無日期'}
                    </div>
                    
                    {note.author && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {note.author}
                      </div>
                    )}
                    
                    {/* 外部連結 */}
                    <div className="flex items-center gap-2">
                      {note.doc_url && (
                        <a
                          href={note.doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          Google Doc
                        </a>
                      )}
                      {note.pdf_url && (
                        <a
                          href={note.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 無資料狀態 */}
      {!loading && filteredNotes.length === 0 && !error && (
        <div className="text-center py-12">
          <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 dark:text-gray-400 mb-2">
            {searchTerm ? '沒有找到符合的筆記' : '尚無筆記資料'}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-amber-600 hover:text-amber-800 text-sm"
            >
              清除搜尋條件
            </button>
          )}
          {!searchTerm && (
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              請先在系統中建立類型為「筆記」或「notes」的報告
            </p>
          )}
        </div>
      )}
    </div>
  )
}
