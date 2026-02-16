/**
 * 簡單的 API 測試腳本
 * 驗證 Reports API 是否能正確讀取 work-reports 目錄
 */

const fs = require('fs')
const path = require('path')

const WORK_REPORTS_DIR = path.join(__dirname, 'work-reports')

console.log('🔍 測試 Reports API 功能...')
console.log('📁 工作目錄:', __dirname)
console.log('📁 Reports 目錄:', WORK_REPORTS_DIR)
console.log('📁 目錄存在:', fs.existsSync(WORK_REPORTS_DIR))

if (fs.existsSync(WORK_REPORTS_DIR)) {
  const categories = fs.readdirSync(WORK_REPORTS_DIR)
    .filter(item => fs.statSync(path.join(WORK_REPORTS_DIR, item)).isDirectory())
  
  console.log('📂 發現的分類:', categories)
  
  categories.forEach(category => {
    const categoryPath = path.join(WORK_REPORTS_DIR, category)
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'))
    console.log(`  📄 ${category}: ${files.length} 個報告`)
    files.forEach(file => console.log(`    - ${file}`))
  })
} else {
  console.log('❌ work-reports 目錄不存在')
}

console.log('✅ 測試完成')