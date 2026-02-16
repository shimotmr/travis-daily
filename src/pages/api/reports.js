/**
 * William Hub Reports API - 基於檔案系統的實作
 * 讀取 /work-reports/ 目錄中的 Markdown 檔案
 */

import fs from 'fs'
import path from 'path'

const WORK_REPORTS_DIR = path.join(process.cwd(), '../work-reports')

/**
 * 讀取並解析 Markdown 檔案的 frontmatter 和內容
 */
function parseMarkdownFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 簡單的 frontmatter 解析
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
          frontmatter[match[1]] = match[2]
        }
      }
    }
    
    const bodyContent = lines.slice(contentStart).join('\n')
    
    // 提取標題（第一個 # 標題）
    const titleMatch = bodyContent.match(/^#\s+(.+)$/m)
    const title = frontmatter.title || (titleMatch ? titleMatch[1] : path.basename(filePath, '.md'))
    
    // 生成摘要（前 200 字符）
    const summary = bodyContent.replace(/^#.+$/gm, '').trim().substring(0, 200)
    
    return {
      title,
      summary: summary + (summary.length >= 200 ? '...' : ''),
      content: bodyContent,
      frontmatter,
      fileSize: content.length
    }
  } catch (error) {
    console.error(`解析檔案 ${filePath} 失敗:`, error)
    return null
  }
}

/**
 * 掃描報告目錄並建立報告清單
 */
function scanReportsDirectory() {
  const reports = []
  
  try {
    if (!fs.existsSync(WORK_REPORTS_DIR)) {
      console.warn('work-reports 目錄不存在:', WORK_REPORTS_DIR)
      return reports
    }
    
    const categories = fs.readdirSync(WORK_REPORTS_DIR)
      .filter(item => fs.statSync(path.join(WORK_REPORTS_DIR, item)).isDirectory())
    
    categories.forEach(category => {
      const categoryPath = path.join(WORK_REPORTS_DIR, category)
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.md'))
      
      files.forEach(file => {
        const filePath = path.join(categoryPath, file)
        const stats = fs.statSync(filePath)
        const parsedFile = parseMarkdownFile(filePath)
        
        if (parsedFile) {
          reports.push({
            id: `${category}-${path.basename(file, '.md')}`,
            title: parsedFile.title,
            summary: parsedFile.summary,
            category,
            source: 'work-reports',
            file_path: file,
            created_at: stats.mtime.toISOString(),
            updated_at: stats.mtime.toISOString(),
            author: parsedFile.frontmatter.author || 'Travis AI Agent',
            tags: parsedFile.frontmatter.tags ? parsedFile.frontmatter.tags.split(',') : [category],
            is_work_output: true,
            file_size: parsedFile.fileSize
          })
        }
      })
    })
    
    // 按創建時間排序
    reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
  } catch (error) {
    console.error('掃描報告目錄失敗:', error)
  }
  
  return reports
}

/**
 * 過濾報告
 */
function filterReports(reports, query) {
  let filtered = [...reports]
  
  // 關鍵字搜尋
  if (query.search) {
    const searchTerm = query.search.toLowerCase()
    filtered = filtered.filter(report => 
      report.title.toLowerCase().includes(searchTerm) ||
      report.summary.toLowerCase().includes(searchTerm) ||
      report.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }
  
  // 分類過濾
  if (query.category) {
    filtered = filtered.filter(report => report.category === query.category)
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
  
  reports.forEach(report => {
    // 按分類統計
    stats.by_category[report.category] = (stats.by_category[report.category] || 0) + 1
    
    // 按來源統計
    stats.by_source[report.source] = (stats.by_source[report.source] || 0) + 1
    
    // 最近一週統計
    if (new Date(report.created_at) > oneWeekAgo) {
      stats.recent_count++
    }
  })
  
  return stats
}

/**
 * 主要 API 處理函數
 */
export default async function handler(req, res) {
  const { method, query } = req
  
  // 設定 CORS
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
    // 掃描報告目錄
    const allReports = scanReportsDirectory()
    
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
      debug: {
        work_reports_dir: WORK_REPORTS_DIR,
        directory_exists: fs.existsSync(WORK_REPORTS_DIR),
        total_scanned: allReports.length,
        after_filter: filteredReports.length
      }
    })
    
  } catch (error) {
    console.error('API 錯誤:', error)
    return res.status(500).json({
      success: false,
      error: '內部伺服器錯誤',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: {
        work_reports_dir: WORK_REPORTS_DIR,
        directory_exists: fs.existsSync(WORK_REPORTS_DIR)
      }
    })
  }
}