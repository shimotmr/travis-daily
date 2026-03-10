/**
// 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit
 * William Hub Reports API - 支援 Supabase 和檔案系統
 * 優先從 Supabase 獲取，若失敗則使用本地檔案
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Supabase client (server-side)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Support both work-reports and content/reports directories
const WORK_REPORTS_DIR = path.join(process.cwd(), 'work-reports')
const CONTENT_REPORTS_DIR = path.join(process.cwd(), 'content', 'reports')

/**
 * 從 Supabase 獲取報告
 */
async function fetchReportsFromSupabase() {
  if (!supabase) return null
  
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('Supabase error:', error.message)
      return null
    }
    
    return data || []
  } catch (error) {
    console.log('Supabase fetch error:', error)
    return null
  }
}

/**
 * 讀取並解析 Markdown 檔案
 */
function parseMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const stats = fs.statSync(filePath)
    
    // 解析 frontmatter
    const lines = content.split('\n')
    let frontmatter = {}
    let contentStart = 0
    
    if (lines[0] === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '---') {
          contentStart = i + 1
          break
        }
        const match = lines[i].match(/^(\w+):\s*(.+)$/)
        if (match) {
          frontmatter[match[1]] = match[2].trim()
        }
      }
    }
    
    const bodyContent = lines.slice(contentStart).join('\n')
    
    // 提取標題
    const titleMatch = bodyContent.match(/^#\s+(.+)$/m)
    const title = frontmatter.title || (titleMatch ? titleMatch[1] : path.basename(filePath, '.md'))
    
    // 生成摘要
    const summary = bodyContent.replace(/^#.+$/gm, '').trim().substring(0, 200).trim()
    
    // 解析標籤 - 支援陣列格式 [tag1, tag2] 和逗號分隔格式 tag1, tag2
    let tags = ['grok']
    if (frontmatter.tags) {
      if (frontmatter.tags.startsWith('[')) {
        // 陣列格式: [grok, ai-breakthrough]
        tags = frontmatter.tags.slice(1, -1).split(',').map(t => t.trim())
      } else {
        // 逗號分隔格式
        tags = frontmatter.tags.split(',').map(t => t.trim())
      }
    }
    
    return {
      id: path.basename(filePath, '.md'),
      title,
      summary: summary + (summary.length >= 200 ? '...' : ''),
      content: bodyContent,
      category: frontmatter.category || 'council',
      source: 'grok-council',
      tags,
      author: frontmatter.author || 'William Hub',
      created_at: stats.mtime.toISOString(),
      updated_at: stats.mtime.toISOString()
    }
  } catch (error) {
    console.error(`解析檔案失敗: ${filePath}`, error)
    return null
  }
}

/**
 * 從檔案系統獲取報告
 */
function fetchReportsFromFilesystem() {
  const reports = []
  
  // 嘗試多個可能的目錄
  const directories = [WORK_REPORTS_DIR, CONTENT_REPORTS_DIR]
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      console.log(`目錄不存在: ${dir}`)
      continue
    }
    
    console.log(`掃描目錄: ${dir}`)
    
    try {
      const stats = fs.statSync(dir)
      
      if (stats.isDirectory()) {
        // 子目錄結構 (work-reports/council/*.md)
        const categories = fs.readdirSync(dir).filter(item => {
          const itemPath = path.join(dir, item)
          return fs.statSync(itemPath).isDirectory()
        })
        
        for (const category of categories) {
          const categoryPath = path.join(dir, category)
          const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'))
          
          for (const file of files) {
            const filePath = path.join(categoryPath, file)
            const parsedFile = parseMarkdownFile(filePath)
            if (parsedFile) {
              parsedFile.category = category // 強制使用目錄名作為分類
              reports.push(parsedFile)
            }
          }
        }
      } else if (stats.isFile() && dir.endsWith('reports')) {
        // 直接在 reports 目錄下 (content/reports/*.md)
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))
        
        for (const file of files) {
          const filePath = path.join(dir, file)
          const parsedFile = parseMarkdownFile(filePath)
          if (parsedFile) {
            reports.push(parsedFile)
          }
        }
      }
    } catch (error) {
      console.error(`掃描目錄失敗 ${dir}:`, error)
    }
  }
  
  // 去重 (基於 id)
  const uniqueReports = Array.from(
    new Map(reports.map(r => [r.id, r])).values()
  )
  
  // 按創建時間排序
  uniqueReports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  
  console.log(`總共找到 ${uniqueReports.length} 個報告`)
  return uniqueReports
}

/**
 * 過濾報告
 */
function filterReports(reports, query) {
  let filtered = [...reports]
  
  // 關鍵字搜尋
  if (query.search) {
    const searchTerm = query.search.toLowerCase()
    filtered = filtered.filter(report => {
      const title = (report.title || '').toLowerCase()
      const summary = (report.summary || '').toLowerCase()
      const content = (report.content || '').toLowerCase()
      const tags = Array.isArray(report.tags) ? report.tags.join(' ').toLowerCase() : ''
      
      return title.includes(searchTerm) || 
             summary.includes(searchTerm) || 
             content.includes(searchTerm) ||
             tags.includes(searchTerm)
    })
  }
  
  // 分類過濾
  if (query.category) {
    filtered = filtered.filter(report => report.category === query.category)
  }
  
  // 來源過濾
  if (query.source) {
    filtered = filtered.filter(report => report.source === query.source)
  }
  
  // 日期範圍過濾
  if (query.from_date) {
    filtered = filtered.filter(report => new Date(report.created_at) >= new Date(query.from_date))
  }
  
  if (query.to_date) {
    filtered = filtered.filter(report => new Date(report.created_at) <= new Date(query.to_date))
  }
  
  return filtered
}

/**
 * 生成統計資訊
 */
function generateStatistics(reports) {
  const stats = {
    total: reports.length,
    by_category: {},
    by_source: {},
    recent_count: 0
  }
  
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  for (const report of reports) {
    const category = report.category || 'uncategorized'
    stats.by_category[category] = (stats.by_category[category] || 0) + 1
    
    const source = report.source || 'unknown'
    stats.by_source[source] = (stats.by_source[source] || 0) + 1
    
    if (new Date(report.created_at) > oneWeekAgo) {
      stats.recent_count++
    }
  }
  
  return stats
}

/**
 * API 處理函數
 */
export default async function handler(req, res) {
  const { method, query } = req
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `方法 ${method} 不被允許`
    })
  }
  
  try {
    // 優先從 Supabase 獲取，失敗則使用檔案系統
    let allReports = await fetchReportsFromSupabase()
    
    if (!allReports || allReports.length === 0) {
      console.log('使用檔案系統獲取報告')
      allReports = fetchReportsFromFilesystem()
    } else {
      console.log(`從 Supabase 獲取 ${allReports.length} 個報告`)
    }
    
    // 統計資訊請求
    if (query.stats === 'true') {
      const statistics = generateStatistics(allReports)
      return res.status(200).json({
        success: true,
        data: statistics
      })
    }
    
    // 過濾報告
    const filteredReports = filterReports(allReports, query)
    
    // 分頁處理
    const limit = parseInt(query.limit) || 20
    const offset = parseInt(query.offset) || 0
    const paginatedReports = filteredReports.slice(offset, offset + limit)
    
    return res.status(200).json({
      success: true,
      data: paginatedReports,
      pagination: {
        offset,
        limit,
        total: filteredReports.length
      },
      source: allReports.length > 0 ? 'database' : 'filesystem'
    })
    
  } catch (error) {
    console.error('API 錯誤:', error)
    return res.status(500).json({
      success: false,
      error: '內部伺服器錯誤',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
