---
title: "# Markdown for Agents 深度研究報告"
date: "2026-02-15"
type: "research"
tags: ["openclaw"]
---


**日期**：2026-02-15  
**研究員**：Researcher Agent  
**目標**：研究 Cloudflare Markdown for Agents 並設計 Travis Daily 實作方案

---

## 摘要（Executive Summary）

Cloudflare 於 2026-02-12 推出 **Markdown for Agents**，透過 HTTP Content Negotiation（`Accept: text/markdown`）讓 AI 系統直接獲取 Markdown 格式內容，可節省約 **80% token 使用量**。本研究深入分析該技術方案，並針對 Travis Daily（Next.js 14 + Vercel）設計三種實作方案，**建議採用 Edge Middleware + API Route 混合方案**，在不影響現有架構的前提下，為 AI 爬蟲提供最佳化的 Markdown 內容。

---

## 關鍵發現

1. **Token 節省顯著**：同一篇文章，HTML 格式 16,180 tokens，Markdown 僅 3,150 tokens，節省 80%
2. **技術門檻低**：透過 `Accept` header 進行 content negotiation，是標準 HTTP 協定
3. **Content-Signal 規範**：Cloudflare 推動的 `Content-Signal` header 讓內容創作者明確表達 AI 使用權限（ai-train、ai-input、search）
4. **AI 生態系支持**：Claude Code、OpenCode 等現代 AI agent 已開始發送 `Accept: text/markdown` header
5. **Vercel Edge Middleware 完全支援**：Next.js 的 Edge Middleware 可在 edge 處理 Accept header，無需修改原有頁面邏輯

---

## 一、Cloudflare 方案深度解析

### 1.1 核心機制

**Content Negotiation（內容協商）**：
- 客戶端發送 `Accept: text/markdown` header
- Cloudflare Edge 攔截請求，從 origin 拉取 HTML
- **實時轉換** HTML → Markdown（在 Edge 完成）
- 返回 `Content-Type: text/markdown` 回應

```bash
# 請求範例
curl https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/ \
  -H "Accept: text/markdown"
```

**回應 Headers**：
```
HTTP/2 200
content-type: text/markdown; charset=utf-8
vary: accept
x-markdown-tokens: 725
content-signal: ai-train=yes, search=yes, ai-input=yes
```

### 1.2 Content-Signal Header 規範

由 Cloudflare 推動的 [contentsignals.org](https://contentsignals.org) 框架，定義三個信號：

| 信號 | 意義 | 預設值（Cloudflare）|
|------|------|-------------------|
| **search** | 建立搜尋索引、顯示摘要（傳統搜尋） | yes |
| **ai-input** | 用於 RAG、grounding 等即時 AI 答案生成 | yes |
| **ai-train** | 訓練或微調 AI 模型 | yes（Markdown for Agents）<br>no（managed robots.txt）|

**robots.txt 整合範例**：
```
User-Agent: *
Content-Signal: search=yes, ai-train=no, ai-input=yes
Allow: /
```

### 1.3 技術限制

- **僅支援 HTML → Markdown 轉換**（未來可能支援其他格式）
- **不支援壓縮回應**（compressed responses）
- **Zone 級別設定**（子網域需拆分獨立 zone）
- **需要 Pro/Business/Enterprise 方案**（SSL for SaaS 客戶免費）

### 1.4 測試結果

我測試了 Cloudflare 官方網站：

```bash
# ✅ 正常運作（返回 text/markdown）
curl -I -H "Accept: text/markdown" \
  https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/

# ❌ 未啟用（仍返回 text/html）
curl -I -H "Accept: text/markdown" \
  https://blog.cloudflare.com/markdown-for-agents/
```

**發現**：即使 Cloudflare Blog 介紹這功能，他們自己還沒完全啟用（可能是逐步部署中）。

---

## 二、Travis Daily 實作方案設計

### 技術棧現況
- **框架**：Next.js 14 (App Router)
- **部署**：Vercel
- **內容源**：本地 `.md` 檔案（已有 frontmatter）
- **優勢**：內容本身就是 Markdown，無需 HTML → Markdown 轉換！

### 方案 A：Edge Middleware 攔截（推薦 ⭐⭐⭐⭐⭐）

**原理**：在 Vercel Edge 層攔截 `Accept: text/markdown` 請求，直接返回原始 `.md` 檔案

**優點**：
- ✅ **最高效**：在 Edge 處理，延遲最低
- ✅ **不影響現有 UI**：只有 AI agent 看到 markdown，人類仍看 HTML
- ✅ **符合標準**：標準 HTTP Content Negotiation
- ✅ **無額外成本**：Vercel Edge Middleware 免費

**缺點**：
- ⚠️ 需要在 middleware 讀取檔案系統（Edge Runtime 有限制）
- ⚠️ 可能需搭配 API Route

**實作範例**：

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const accept = request.headers.get('accept') || '';
  const pathname = request.nextUrl.pathname;
  
  // 只處理內容頁面
  if (!pathname.startsWith('/content/') && !pathname.startsWith('/posts/')) {
    return NextResponse.next();
  }
  
  // 檢測 Accept: text/markdown
  if (accept.includes('text/markdown')) {
    // Rewrite 到 API route
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown${pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/content/:path*', '/posts/:path*'],
};
```

```javascript
// app/api/markdown/[...slug]/route.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(request, { params }) {
  const slug = params.slug.join('/');
  const filePath = path.join(process.cwd(), 'content', `${slug}.md`);
  
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // 生成 frontmatter
    const frontmatter = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const markdown = `---\n${frontmatter}\n---\n\n${content}`;
    
    // 估算 token 數（粗略：1 token ≈ 4 字元）
    const tokenCount = Math.ceil(markdown.length / 4);
    
    return new Response(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
        'X-Markdown-Tokens': tokenCount.toString(),
        'Vary': 'Accept',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Content not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---

### 方案 B：獨立 API Route（備選 ⭐⭐⭐⭐）

**原理**：提供 `/api/markdown/[...slug]` 端點，明確告訴 AI agent 去哪裡拿 markdown

**優點**：
- ✅ 簡單直接，不需 middleware
- ✅ 可搭配 `Link` header 告知 markdown 版本位置
- ✅ 容易除錯

**缺點**：
- ⚠️ 需要 AI agent 知道這個端點（可透過 `<link>` 標籤或 HTTP header 告知）
- ⚠️ 不符合標準 Content Negotiation（需額外文檔說明）

**實作**：

```javascript
// app/api/markdown/[...slug]/route.js
// （同方案 A 的 API route）
```

```javascript
// 在每個內容頁面的 layout.jsx 加入
export async function generateMetadata({ params }) {
  return {
    other: {
      'Link': `</api/markdown/${params.slug}>; rel="alternate"; type="text/markdown"`,
    },
  };
}
```

---

### 方案 C：Link Header + robots.txt 宣告（最簡單 ⭐⭐⭐）

**原理**：在 HTML `<head>` 加入 `<link>` 標籤，告訴 AI agent 有 markdown 版本

**優點**：
- ✅ 零 backend 改動
- ✅ 符合語義化標準

**缺點**：
- ⚠️ 需要 AI agent 先解析 HTML 才能發現 markdown 版本（效率差）
- ⚠️ 無法完全避免 HTML 解析

**實作**：

```html
<!-- 在每個內容頁面 -->
<link rel="alternate" type="text/markdown" href="/api/markdown/slug">
```

```
# public/robots.txt
User-Agent: *
Allow: /

# Content Signals Policy
Content-Signal: search=yes, ai-input=yes, ai-train=yes
```

---

### 方案比較

| 維度 | 方案 A（Middleware）| 方案 B（API Route）| 方案 C（Link Header）|
|------|-------------------|------------------|-------------------|
| **標準符合度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **效率** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **開發成本** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **維護性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **AI agent 支援** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 三、額外研究發現

### 3.1 非 Cloudflare 用戶如何實作

**選項 1：自建轉換層**
- 使用 Vercel Edge Middleware（如方案 A）
- 使用 Netlify Edge Functions
- 使用 AWS CloudFront Lambda@Edge

**選項 2：利用現有 Markdown 源**
- 如果內容本來就是 Markdown（如 Travis Daily），直接返回即可
- 如果是 CMS（如 Contentful、Strapi），可在 API 層加入 Accept header 處理

**選項 3：使用第三方服務**
- Cloudflare Workers AI 的 `AI.toMarkdown()` API
- Cloudflare Browser Rendering 的 `/markdown` REST API

### 3.2 Vercel Edge Middleware 能力

**確認可行**：
- ✅ 支援讀取 `request.headers`
- ✅ 支援動態 rewrite
- ✅ 可返回自訂 Response（直接在 middleware 返回 markdown）
- ⚠️ **限制**：Edge Runtime 不支援 `fs` 模組，需搭配 API Route（Node.js runtime）

**最佳實踐**：
- Middleware 負責「路由決策」（檢測 Accept header）
- API Route 負責「檔案讀取」（Node.js runtime）

### 3.3 AI 爬蟲現況

根據 Cloudflare Blog 披露，**已知發送 `Accept: text/markdown` 的 AI agent**：

| Agent | User-Agent | 狀態 |
|-------|-----------|------|
| Claude Code | `Claude-Code/*` | ✅ 已支援 |
| OpenCode | `OpenCode/*` | ✅ 已支援 |
| OAI-Searchbot | `OAI-Searchbot/*` | 🟡 可能支援（Cloudflare Radar 有追蹤）|
| GPTBot | `GPTBot/*` | ❓ 待確認 |
| Google-Extended | `Google-Extended/*` | ❓ 待確認 |
| PerplexityBot | `PerplexityBot/*` | ❓ 待確認 |

**Cloudflare Radar 數據**：
- 新增 `content_type` 維度追蹤 AI bot 流量
- 可查看各 bot 對 `text/markdown` 的請求分布
- 數據公開於 [Radar API](https://developers.cloudflare.com/api/resources/radar/)

### 3.4 Content-Signal 生態系支持度

**現況**（截至 2026-02-15）：
- ✅ Cloudflare 全力推動（已整合進 managed robots.txt）
- 🟡 IETF 有草案討論（[aipref working group](https://datatracker.ietf.org/wg/aipref/about/)）
- ❌ 尚未成為正式標準（RFC）
- ❌ 大多數 AI 公司**未公開承諾遵守**

**法律層面**：
- Content-Signal 明確援引 **EU Copyright Directive 2019/790 Article 4**（保留權利條款）
- 在歐盟有法律依據，但在其他地區仍是「君子協定」

**實務建議**：
- **樂觀**：採用 Content-Signal 表達立場，有法律依據
- **現實**：仍需搭配技術手段（WAF、Bot Management）防止惡意抓取

---

## 四、建議採用方案

### 🎯 最終建議：**方案 A（Edge Middleware + API Route）**

**理由**：
1. **符合標準**：遵循 HTTP Content Negotiation，與 Cloudflare 方案一致
2. **最佳效能**：Edge 層決策，API Route 只處理檔案讀取
3. **對用戶透明**：人類訪客完全不受影響，只有 AI agent 獲得優化體驗
4. **未來相容**：當更多 AI agent 支援 `Accept: text/markdown`，無需改動即可受益
5. **SEO 友善**：`Vary: Accept` header 確保搜尋引擎正確索引

### 實作步驟

**第一階段（核心功能）**：
1. 建立 `middleware.js` 攔截 `/content/*` 和 `/posts/*`
2. 建立 `app/api/markdown/[...slug]/route.js` 返回原始 `.md`
3. 加入 `Content-Signal` 和 `X-Markdown-Tokens` headers
4. 測試 `curl -H "Accept: text/markdown" https://travis-daily.vercel.app/content/xxx`

**第二階段（優化）**：
1. 在 `public/robots.txt` 加入 Content Signals Policy
2. 監控 Vercel Analytics，追蹤 `text/markdown` 請求
3. 考慮加入快取機制（Vercel Edge Config 或 KV）

**第三階段（推廣）**：
1. 在首頁 `<head>` 加入 `<link rel="alternate" type="text/markdown" href="/api/markdown/index">`
2. 撰寫部落格文章介紹這功能（吸引 AI agent 開發者關注）
3. 提交網站到 AI crawler 目錄（如 Cloudflare 可能建立的列表）

---

## 五、程式碼範例（完整）

### middleware.js
```javascript
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const accept = request.headers.get('accept') || '';
  const pathname = request.nextUrl.pathname;
  
  // 只處理內容頁面（避免影響其他路由）
  const contentPaths = ['/content/', '/posts/', '/research/', '/digest/'];
  const isContentPage = contentPaths.some(path => pathname.startsWith(path));
  
  if (!isContentPage) {
    return NextResponse.next();
  }
  
  // 檢測 Accept: text/markdown
  if (accept.includes('text/markdown')) {
    const url = request.nextUrl.clone();
    url.pathname = `/api/markdown${pathname}`;
    
    // Rewrite 到 markdown API（對客戶端透明）
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/content/:path*', '/posts/:path*', '/research/:path*', '/digest/:path*'],
};
```

### app/api/markdown/[...slug]/route.js
```javascript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const slug = params.slug.join('/');
  
  // 嘗試多個可能的檔案路徑
  const possiblePaths = [
    path.join(process.cwd(), 'content', `${slug}.md`),
    path.join(process.cwd(), 'content', slug, 'index.md'),
  ];
  
  let filePath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }
  
  if (!filePath) {
    return NextResponse.json(
      { error: 'Content not found', slug },
      { status: 404 }
    );
  }
  
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // 生成 YAML frontmatter
    const frontmatterLines = Object.entries(data).map(([key, value]) => {
      // 處理多行內容或特殊字元
      if (typeof value === 'string' && (value.includes('\n') || value.includes(':'))) {
        return `${key}: |\n  ${value.replace(/\n/g, '\n  ')}`;
      }
      return `${key}: ${value}`;
    });
    
    const markdown = `---\n${frontmatterLines.join('\n')}\n---\n\n${content}`;
    
    // 估算 token 數（使用 GPT tokenizer 的粗略公式）
    const tokenCount = Math.ceil(markdown.length / 4);
    
    const headers = new Headers({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
      'X-Markdown-Tokens': tokenCount.toString(),
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=3600', // 快取 1 小時
    });
    
    return new Response(markdown, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
```

### public/robots.txt
```
User-agent: *
Allow: /

# Cloudflare Content Signals Policy
# https://contentsignals.org/

# As a condition of accessing this website, you agree to abide by the following content signals:
# (a) If a content-signal = yes, you may collect content for the corresponding use.
# (b) If a content-signal = no, you may not collect content for the corresponding use.
# (c) If the website operator does not include a content signal for a corresponding use, 
#     the website operator neither grants nor restricts permission via content signal.

# The content signals and their meanings are:
# - search: building a search index and providing search results
# - ai-input: inputting content into AI models (RAG, grounding, AI search answers)
# - ai-train: training or fine-tuning AI models

Content-Signal: search=yes, ai-input=yes, ai-train=yes

# Travis Daily 歡迎 AI agents 使用我們的內容！
# 請發送 Accept: text/markdown header 以獲得優化的 Markdown 格式。
```

---

## 六、成效預估

### Token 節省

假設 Travis Daily 一篇文章平均：
- **HTML 渲染**：~8,000 tokens（含 UI、導航、Footer）
- **純 Markdown**：~1,500 tokens

**節省比例**：81%（與 Cloudflare 數據一致）

### 對 AI agent 的吸引力

- ✅ **更快**：減少網路傳輸、解析時間
- ✅ **更便宜**：AI 公司節省 API 成本
- ✅ **更準確**：Markdown 結構明確，減少幻覺

### 對 Travis Daily 的好處

1. **SEO 升級**：未來 AI 搜尋引擎（ChatGPT Search、Perplexity）可能優先索引支援 markdown 的網站
2. **品牌形象**：展示技術前瞻性（早期採用者優勢）
3. **數據洞察**：透過 `X-Markdown-Tokens` header 收集 AI agent 訪問數據
4. **內容傳播**：AI agent 更容易引用、摘要、推薦我們的內容

---

## 七、風險與挑戰

### 技術風險

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| Vercel Edge Middleware 限制 | 無法直接讀取檔案 | 使用 API Route（Node.js runtime）|
| 快取策略複雜 | 內容更新不及時 | 設定 `Cache-Control: max-age=3600`，部署時清除快取 |
| 大量 AI bot 請求 | 成本增加 | Vercel 免費 tier 有 100GB 流量，超過可考慮 rate limiting |

### 生態系風險

| 風險 | 可能性 | 因應 |
|------|-------|------|
| Content-Signal 未被 AI 公司遵守 | 高 | 僅作為「表達立場」，不依賴其強制力 |
| AI agent 發送假 Accept header 但仍抓 HTML | 中 | 無影響，middleware 會自動返回 markdown |
| 標準變更（IETF 改規範）| 低 | 持續追蹤 contentsignals.org 更新 |

### 維護成本

- **低**：middleware 和 API route 邏輯簡單，不太需要更新
- **監控**：Vercel Analytics 可追蹤 `Content-Type: text/markdown` 請求

---

## 八、後續行動

### 立即執行（本週）
1. ✅ 完成研究報告（本文件）
2. ⬜ 在 Travis Daily repo 建立 `middleware.js`
3. ⬜ 建立 `app/api/markdown/[...slug]/route.js`
4. ⬜ 測試 `/content/2026-02-15-test` 的 markdown 輸出
5. ⬜ 更新 `public/robots.txt` 加入 Content-Signal

### 短期（二月內）
1. ⬜ 監控 Vercel logs，確認有 AI agent 訪問
2. ⬜ 撰寫部落格文章「Travis Daily 支援 Markdown for Agents」
3. ⬜ 在首頁加入 `<link rel="alternate" type="text/markdown">`

### 長期（三月後）
1. ⬜ 分析 AI agent 訪問數據，了解哪些內容最受歡迎
2. ⬜ 考慮加入 Sitemap for AI agents（如果標準出現）
3. ⬜ 追蹤 IETF aipref working group 進展

---

## 九、參考資料

### 官方文檔
- [Cloudflare Markdown for Agents - Docs](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
- [Cloudflare Blog - Introducing Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/)
- [Content Signals Policy](https://blog.cloudflare.com/content-signals-policy/)
- [Content Signals - Official Site](https://contentsignals.org/)

### 技術標準
- [MDN - HTTP Content Negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation)
- [Robots Exclusion Protocol (RFC 9309)](https://www.rfc-editor.org/rfc/rfc9309.html)
- [IETF aipref Working Group](https://datatracker.ietf.org/wg/aipref/about/)

### 工具與服務
- [Cloudflare Radar - AI Insights](https://radar.cloudflare.com/ai-insights#content-type)
- [Cloudflare Workers AI - toMarkdown()](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

## 附錄：測試命令

### 本地測試
```bash
# 假設本地開發服務在 localhost:3000
curl -v -H "Accept: text/markdown" http://localhost:3000/content/test

# 預期看到：
# < Content-Type: text/markdown; charset=utf-8
# < Content-Signal: ai-train=yes, search=yes, ai-input=yes
# < X-Markdown-Tokens: 123
```

### 生產測試
```bash
# 部署到 Vercel 後
curl -v -H "Accept: text/markdown" https://travis-daily.vercel.app/content/2026-02-15-test

# 比較 token 數
echo "HTML tokens:"
curl -s https://travis-daily.vercel.app/content/test | wc -c | awk '{print $1/4}'

echo "Markdown tokens:"
curl -s -H "Accept: text/markdown" https://travis-daily.vercel.app/content/test | wc -c | awk '{print $1/4}'
```

---

**報告完成時間**：2026-02-15 05:43 GMT+8  
**下一步**：發送摘要給 William，並準備實作 middleware
