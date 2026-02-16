/**
 * William Hub 重構後的報告系統組件
 * 功能: 只顯示工作產出報告，提供過濾和搜尋功能
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Calendar, FileText, Tag, AlertCircle } from 'lucide-react'

const ReportSystem = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statistics, setStatistics] = useState({})
  
  // 篩選狀態
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    source: '',
    from_date: '',
    to_date: ''
  })
  
  // 分頁狀態
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    total: 0
  })

  /**
   * 載入報告資料
   */
  const loadReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset,
        sort_by: 'created_at',
        sort_order: 'desc'
      })
      
      // 移除空值
      for (const [key, value] of params.entries()) {
        if (!value) params.delete(key)
      }
      
      const response = await fetch(`/api/reports?${params}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '載入失敗')
      }
      
      setReports(result.data)
      setPagination(prev => ({
        ...prev,
        total: result.pagination?.total || result.data.length
      }))
      
    } catch (err) {
      setError(err.message)
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.offset, pagination.limit])

  /**
   * 載入統計資料
   */
  const loadStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/reports?stats=true')
      const result = await response.json()
      
      if (result.success) {
        setStatistics(result.data)
      }
    } catch (err) {
      console.error('統計資料載入失敗:', err)
    }
  }, [])

  // 初始載入
  useEffect(() => {
    loadReports()
    loadStatistics()
  }, [loadReports, loadStatistics])

  /**
   * 處理篩選變更
   */
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({
      ...prev,
      offset: 0  // 重置到第一頁
    }))
  }

  /**
   * 清除所有篩選
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      source: '',
      from_date: '',
      to_date: ''
    })
    setPagination(prev => ({
      ...prev,
      offset: 0
    }))
  }

  /**
   * 分頁控制
   */
  const handlePageChange = (newOffset) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset
    }))
  }

  /**
   * 格式化日期
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 標題和統計 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          工作報告系統
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">系統已優化</span>
          </div>
          <p className="text-blue-700 text-sm">
            已過濾外部資料，只顯示工作產出報告。普渡爬蟲等外部資料已被排除。
          </p>
        </div>

        {/* 統計卡片 */}
        {Object.keys(statistics).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-gray-900">
                {statistics.total || 0}
              </div>
              <div className="text-sm text-gray-600">總計報告</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {statistics.recent_count || 0}
              </div>
              <div className="text-sm text-gray-600">最近一週</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(statistics.by_category || {}).length}
              </div>
              <div className="text-sm text-gray-600">報告分類</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(statistics.by_source || {}).length}
              </div>
              <div className="text-sm text-gray-600">資料來源</div>
            </div>
          </div>
        )}
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 搜尋框 */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜尋報告標題或內容..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* 分類篩選 */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">所有分類</option>
              <option value="work-output">工作產出</option>
              <option value="project-analysis">專案分析</option>
              <option value="weekly-summary">週報</option>
              <option value="monthly-report">月報</option>
            </select>
          </div>

          {/* 開始日期 */}
          <div>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.from_date}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
            />
          </div>

          {/* 結束日期 */}
          <div>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.to_date}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
            />
          </div>
        </div>

        {/* 篩選控制按鈕 */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {Object.values(filters).some(v => v) && (
              <span>已套用篩選條件</span>
            )}
          </div>
          
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            清除篩選
          </button>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800">載入錯誤: {error}</div>
        </div>
      )}

      {/* 載入狀態 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="mt-2 text-gray-600">載入中...</div>
        </div>
      )}

      {/* 報告列表 */}
      {!loading && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {report.title}
                  </h3>
                  
                  {report.summary && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {report.summary}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(report.created_at)}
                    </div>
                    
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      {report.category}
                    </div>
                    
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {report.source}
                    </div>
                  </div>
                  
                  {/* 標籤 */}
                  {report.tags && report.tags.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {report.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    查看詳情
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 無資料狀態 */}
      {!loading && reports.length === 0 && !error && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 mb-2">沒有找到符合條件的報告</div>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            清除篩選條件
          </button>
        </div>
      )}

      {/* 分頁控制 */}
      {!loading && reports.length > 0 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            顯示 {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} 
            ，共 {pagination.total} 筆
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
              disabled={pagination.offset === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一頁
            </button>
            
            <button
              onClick={() => handlePageChange(pagination.offset + pagination.limit)}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportSystem