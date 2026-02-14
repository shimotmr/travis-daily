---
title: "AI Agent 展示頁面遊戲 UI 設計文件"
date: "2026-02-14"
type: "research"
tags: ["agent", "gamification", "UI", "design"]
draft: true
---


**專案名稱**：AI Agent Showcase - 日式 Galgame + RPG 風格互動介面  
**研究日期**：2026-02-14  
**研究員**：Researcher Agent  
**版本**：v1.0

---

## 📋 目錄

1. [專案概述](#專案概述)
2. [技術方案比較](#技術方案比較)
3. [推薦技術棧](#推薦技術棧)
4. [場景設計草案](#場景設計草案)
5. [對白系統架構](#對白系統架構)
6. [角色設計規範](#角色設計規範)
7. [互動流程圖](#互動流程圖)
8. [開發分期計劃](#開發分期計劃)
9. [參考連結與資源](#參考連結與資源)

---

## 🎯 專案概述

### 設計目標
為 Jarvis 多 Agent 系統創建一個融合日式 Galgame 視覺小說風格與 RPG 等軸測地圖的 Web 互動展示頁面，讓使用者能夠直觀地看到各個 AI Agent 的工作狀態、聆聽他們的「心聲」，並透過精美的動畫與對話系統感受 AI 團隊的協作。

### 核心需求
1. **高畫質 Galgame 對話系統**：角色立繪 + 對話框 + 選項系統
2. **等軸測 RPG 辦公室場景**：俯視角科幻辦公室，8 個專屬工作站
3. **動態狀態對白**：根據 Agent 狀態（idle/working/error/complete）生成台詞
4. **角色移動系統**：Agent 可在場景間移動互動（如 Coder → Inspector）
5. **全男性帥氣角色**：日式漫畫風格，每人獨特視覺識別
6. **聲音設計**：TTS 語音合成或音效

### 八位 Agent 角色與場景
- **Jarvis**：指揮中心（多螢幕監控、全局地圖）
- **Secretary**：前台接待區（數位行事曆、文件堆疊）
- **Inspector**：品管室（代碼掃描螢幕、紅色警報燈）
- **Designer**：設計工作室（色彩面板、數位畫板）
- **Writer**：寫作間（書架、古典打字機、靈感牆）
- **Researcher**：資料分析室（數據可視化牆、放大鏡）
- **Coder**：工程實驗室（多終端機、伺服器機架、LED 燈）
- **Analyst**：交易室（K 線圖、多螢幕即時行情）

---

## 🔬 技術方案比較

### 1. Visual Novel / Galgame 引擎比較

| 引擎 | 語言基礎 | 學習曲線 | Web 支援 | 動畫支援 | 社群 | 推薦度 |
|------|---------|---------|---------|---------|------|--------|
| **Monogatari.js** | JavaScript | ⭐⭐ 低 | ✅ 原生 Web | Live2D/Spine | 🟢 活躍 | ⭐⭐⭐⭐⭐ |
| **RenJS** | Phaser.js + YAML | ⭐⭐⭐ 中 | ✅ 原生 Web | Sprite/插件 | 🟡 中等 | ⭐⭐⭐⭐ |
| **Ren'Py (Web)** | Python | ⭐⭐⭐⭐ 高 | ⚠️ 需轉譯 | 有限 | 🟢 最大 | ⭐⭐⭐ |
| **Naninovel** | Unity | ⭐⭐⭐⭐⭐ 高 | ⚠️ WebGL | Unity 動畫 | 🟢 商業級 | ⭐⭐ |

**關鍵發現**：
- **Monogatari.js**：最適合本專案，純 Web 技術，支援 Live2D，文檔完善
- **RenJS**：基於 Phaser，適合需要更多遊戲機制的專案
- Ren'Py 雖然社群最大，但 Web 轉換複雜度高

### 2. RPG 等軸測引擎比較

| 引擎 | 渲染方式 | 性能 | Tilemap 支援 | 角色動畫 | 學習曲線 | 推薦度 |
|------|---------|------|-------------|---------|---------|--------|
| **Phaser 3** | Canvas/WebGL | ⭐⭐⭐⭐⭐ | ✅ 原生等軸測 | AnimatedSprite | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **PixiJS** | WebGL | ⭐⭐⭐⭐⭐ | 🔧 需插件 | Sprite 系統 | ⭐⭐ | ⭐⭐⭐⭐ |
| **Three.js** | WebGL/3D | ⭐⭐⭐⭐ | 🔧 手動實現 | 3D 模型 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Kaboom.js** | Canvas | ⭐⭐⭐ | ⚠️ 有限 | 簡易 | ⭐ | ⭐⭐ |

**關鍵發現**：
- **Phaser 3**：自 v3.50 起原生支援等軸測 Tilemap，社群龐大，範例豐富
- **PixiJS**：性能優異，但需要更多手動設置
- Three.js 過度複雜（本專案不需要完整 3D）

### 3. 角色立繪動畫技術

| 技術 | 動畫品質 | 檔案大小 | Web SDK | 製作成本 | 推薦度 |
|------|---------|---------|---------|---------|--------|
| **Live2D Cubism** | ⭐⭐⭐⭐⭐ | 中 | ✅ 官方 SDK | 高（需專業） | ⭐⭐⭐⭐⭐ |
| **Spine 2D** | ⭐⭐⭐⭐ | 小 | ✅ Web Runtime | 中 | ⭐⭐⭐⭐ |
| **靜態 Sprite + CSS** | ⭐⭐ | 小 | ✅ 原生 | 低 | ⭐⭐⭐ |
| **Sprite Sheet 動畫** | ⭐⭐⭐ | 中 | ✅ 任何引擎 | 中低 | ⭐⭐⭐⭐ |

**關鍵發現**：
- **Live2D**：日式 Galgame 標準，表情/動作流暢自然，適合高品質立繪
- **Spine 2D**：性價比高，適合預算有限但需要動畫的專案
- 混合方案：重要場景用 Live2D，次要互動用 Sprite

### 4. AI 角色生成工具

| 工具 | 風格控制 | 一致性 | 全身立繪品質 | API | 成本 | 推薦度 |
|------|---------|---------|-------------|-----|------|--------|
| **Stable Diffusion** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ 開源 | 免費 | ⭐⭐⭐⭐⭐ |
| **Midjourney** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ 無 | $$$ | ⭐⭐⭐⭐ |
| **NovelAI** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ 有 | $$ | ⭐⭐⭐⭐⭐ |
| **Leonardo.ai** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ 有 | $ | ⭐⭐⭐ |

**推薦工作流程**：
1. **概念設計**：使用 Midjourney 生成高品質參考圖
2. **角色定稿**：Stable Diffusion + LoRA 模型（如 AnythingV5, CounterfeitV3）
3. **一致性保持**：使用 ControlNet（姿勢控制）+ 同一 seed
4. **優化提示詞範例**：
   ```
   1boy, handsome anime male, full body, white background, 
   business casual outfit, [specific role traits], 
   official art, high quality, sharp focus, detailed eyes, 
   japanese anime style, visual novel character design,
   dynamic pose, professional lighting
   ```

### 5. Web TTS 語音合成方案

| 方案 | 音質 | 延遲 | 語言支援 | 成本 | API 複雜度 | 推薦度 |
|------|------|------|---------|------|-----------|--------|
| **ElevenLabs** | ⭐⭐⭐⭐⭐ | 低 | 多語言 | $$$ | 簡單 | ⭐⭐⭐⭐⭐ |
| **Edge TTS** | ⭐⭐⭐⭐ | 極低 | 多語言 | 免費 | 簡單 | ⭐⭐⭐⭐⭐ |
| **Web Speech API** | ⭐⭐ | 極低 | 系統決定 | 免費 | 最簡單 | ⭐⭐⭐ |
| **Google Cloud TTS** | ⭐⭐⭐⭐ | 低 | 多語言 | $$ | 中等 | ⭐⭐⭐⭐ |

**關鍵發現**：
- **ElevenLabs**：最自然的 AI 語音，適合角色配音，但成本較高
- **Edge TTS**：微軟免費方案，音質優秀，適合原型開發
- **混合方案**：重要對話用 ElevenLabs 預錄，次要對話用 Edge TTS 即時生成

---

## 🎨 推薦技術棧

基於上述研究，本專案推薦以下技術組合：

### 前端框架
```javascript
{
  "核心框架": "Vue 3 + TypeScript",
  "狀態管理": "Pinia",
  "路由": "Vue Router"
}
```

### 遊戲引擎組合
```javascript
{
  "對話系統": "Monogatari.js（自定義整合）",
  "場景渲染": "Phaser 3（等軸測模式）",
  "角色動畫": "Live2D Cubism SDK for Web",
  "UI 動畫": "GSAP (GreenSock)"
}
```

### 美術資源
```javascript
{
  "角色生成": "Stable Diffusion + NovelAI",
  "立繪動畫": "Live2D Cubism Editor",
  "場景素材": "Tiled Map Editor（等軸測）",
  "UI 設計": "Figma + Persona 5 風格指南"
}
```

### 音效 / 語音
```javascript
{
  "TTS": "Edge TTS（開發）→ ElevenLabs（正式）",
  "BGM": "Royalty-free 日式遊戲音樂",
  "音效": "Freesound.org + 自製"
}
```

### 部署
```javascript
{
  "託管": "Vercel / Netlify",
  "CDN": "Cloudflare",
  "後端（選用）": "Supabase（儲存對話紀錄）"
}
```

---

## 🏢 場景設計草案

### 整體辦公室佈局（等軸測俯視圖）

```
                    [全局地圖監控]
                        JARVIS
                          🖥️
                          
        RESEARCHER              INSPECTOR
           📊                      ⚠️
        [數據牆]                [品管室]
        
    SECRETARY          (中央走道)        CODER
      📋                                  💻
   [接待區]                          [實驗室]
   
        WRITER                  DESIGNER
          📖                       🎨
       [寫作間]                 [工作室]
       
                       TRADER
                         📈
                     [交易室]
```

### 各場景詳細設計

#### 1. Jarvis - 指揮中心（Command Center）
**視覺風格**：高科技、指揮官氛圍、藍色調

**場景元素**：
- 🖥️ 三面環繞式超寬螢幕（顯示全局地圖）
- 📡 全息投影儀（中央）
- 🗺️ 等軸測辦公室實時地圖
- 💡 環境光：冷藍色 LED
- 🪑 人體工學椅（黑色皮革）

**互動物件**：
- 點擊螢幕 → 顯示其他 Agent 狀態
- 點擊 Jarvis → 聽取當日總結

**狀態對白範例**：
```yaml
idle: "所有系統運行正常。等待新任務指派。"
working: "正在協調資源...Researcher 的報告已收到。"
error: "警告：Inspector 發現 3 個 critical bugs。"
complete: "今日任務達成率 95%。各位辛苦了。"
```

#### 2. Secretary - 前台接待區（Reception）
**視覺風格**：現代辦公、整潔、暖色調

**場景元素**：
- 📅 數位行事曆（牆面）
- 📚 整齊的文件堆（按顏色分類）
- ☕ 咖啡機（右側）
- 🌿 小型盆栽
- 📧 郵件收發箱（發光提示）

**互動物件**：
- 點擊行事曆 → 查看今日排程
- 點擊文件 → 已完成任務清單

**狀態對白範例**：
```yaml
idle: "行事曆已更新。下一個會議在 14:00。"
working: "正在整理 William 的待辦事項...優先級已排序。"
error: "糟糕，會議時間衝突了！需要調整。"
complete: "所有文件已歸檔，報告已發送。"
```

#### 3. Inspector - 品管室（QA Lab）
**視覺風格**：嚴謹、科技感、警示紅光

**場景元素**：
- 🖥️ 代碼掃描螢幕（顯示滾動的程式碼）
- 🚨 警報燈（錯誤時閃爍）
- 📋 檢查清單（牆上）
- 🔍 放大鏡（桌面）
- ✅ 品質認證印章

**互動物件**：
- 點擊螢幕 → 查看最新檢測報告
- 點擊警報燈 → 查看錯誤列表

**狀態對白範例**：
```yaml
idle: "系統穩定。無異常。"
working: "正在審查 Coder 的 PR...發現 2 個潛在問題。"
error: "緊急！發現 critical bug，立即中斷部署。"
complete: "代碼審查完成。品質達標，可以部署。"
```

#### 4. Designer - 設計工作室（Design Studio）
**視覺風格**：創意、多彩、靈感爆發

**場景元素**：
- 🎨 數位繪圖板（Wacom）
- 🌈 色彩選擇面板（浮動）
- 🖼️ 靈感牆（Moodboard）
- 💡 軌道燈（可調色溫）
- 🪴 綠色植物（提升創意）

**互動物件**：
- 點擊繪圖板 → 查看最新設計稿
- 點擊色彩面板 → 今日配色靈感

**狀態對白範例**：
```yaml
idle: "等待新的設計需求...先整理一下素材庫。"
working: "這個配色方案如何？讓我再試試漸變效果..."
error: "客戶不喜歡這版設計...需要重新構思方向。"
complete: "設計稿完成！這次絕對驚艷。"
```

#### 5. Writer - 寫作間（Writing Room）
**視覺風格**：文藝、復古、溫馨

**場景元素**：
- 📖 木質書架（滿滿的書籍）
- ⌨️ 復古打字機（數位版，有打字音效）
- 📝 靈感筆記本（散落）
- ☕ 熱咖啡（冒煙動畫）
- 🕯️ 暖黃檯燈

**互動物件**：
- 點擊打字機 → 查看最新文章
- 點擊書架 → 參考資料列表

**狀態對白範例**：
```yaml
idle: "思考下一篇文章的主題...或許寫寫 AI 倫理？"
working: "文思泉湧！這段比喻真是太妙了。"
error: "寫作瓶頸...需要更多 Researcher 的數據支持。"
complete: "文章完成！標題就叫《AI 的詩與遠方》。"
```

#### 6. Researcher - 資料分析室（Research Lab）
**視覺風格**：學術、數據可視化、藍綠色調

**場景元素**：
- 📊 數據可視化牆（動態圖表）
- 🔬 放大鏡（桌面）
- 📚 學術期刊堆疊
- 💻 多螢幕工作站（顯示圖表）
- 🧪 實驗紀錄本

**互動物件**：
- 點擊數據牆 → 查看最新研究發現
- 點擊放大鏡 → 深入分析特定主題

**狀態對白範例**：
```yaml
idle: "整理昨日收集的 AI 動態...共 12 則值得關注。"
working: "這個趨勢很有意思...交叉驗證三個來源中..."
error: "數據來源矛盾！需要找更權威的資料。"
complete: "深度研究報告完成，已發送給 Jarvis。"
```

#### 7. Coder - 工程實驗室（Engineering Lab）
**視覺風格**：Geek、霓虹、未來科技

**場景元素**：
- 💻 三螢幕工作站（VS Code 介面）
- 🖥️ 伺服器機架（閃爍 LED）
- ⚙️ 機械鍵盤（RGB 燈光）
- 🔌 纜線管理架
- 🍕 披薩盒（程式員標配）

**互動物件**：
- 點擊螢幕 → 查看當前開發進度
- 點擊伺服器 → 系統健康狀態

**狀態對白範例**：
```yaml
idle: "編譯成功，所有測試通過。可以摸魚了。"
working: "Debug 中...這個 bug 藏得真深啊。"
error: "Build failed! 什麼？語法錯誤？不可能！"
complete: "功能開發完成！代碼已 push，等 Inspector 審查。"
```

#### 8. Analyst - 交易室（Trading Floor）
**視覺風格**：華爾街、緊張、紅綠對比

**場景元素**：
- 📈 K 線圖牆（4 個螢幕）
- 📊 即時行情跑馬燈
- ☎️ 多線電話（復古）
- 💹 股票代碼顯示器
- 📰 財經新聞 Feed

**互動物件**：
- 點擊 K 線圖 → 查看交易策略
- 點擊新聞 → 最新財經動態

**狀態對白範例**：
```yaml
idle: "市場平穩...等待最佳進場時機。"
working: "發現機會！正在計算風險收益比..."
error: "市場異常波動！觸發停損機制。"
complete: "今日交易完成，收益率 +3.2%。"
```

---

## 💬 對白系統架構

### 系統設計理念
結合 **Galgame 對話框** 與 **狀態驅動對白**，讓 AI Agent 擁有「性格」與「情緒」。

### 技術架構

```
┌─────────────────────────────────────────┐
│         對白系統核心 (DialogueSystem)    │
├─────────────────────────────────────────┤
│  1. 狀態監聽器 (AgentStateWatcher)       │
│     - 監聽各 Agent 的實時狀態            │
│     - 觸發對應對白事件                   │
│                                          │
│  2. 對白生成器 (DialogueGenerator)       │
│     - 從對白庫中選擇合適台詞             │
│     - 支援變數插值（如任務名稱）         │
│     - 支援隨機變化（避免重複）           │
│                                          │
│  3. 渲染引擎 (DialogueRenderer)          │
│     - Galgame 風格對話框                 │
│     - 角色立繪切換（表情/姿勢）          │
│     - 打字機效果 (Typewriter)            │
│                                          │
│  4. 語音合成器 (TTSController)           │
│     - 調用 Edge TTS / ElevenLabs         │
│     - 角色專屬音色配置                   │
│     - 語音快取管理                       │
└─────────────────────────────────────────┘
```

### 對白數據結構

```yaml
# dialogues/jarvis.yml
character:
  id: "jarvis"
  name: "Jarvis"
  voice_id: "elevenlabs_british_male_01"
  
dialogues:
  idle:
    - text: "所有系統運行正常。等待新任務指派。"
      expression: "neutral"
      priority: 1
    - text: "各位 Agent 狀態穩定。今日效率預估 92%。"
      expression: "satisfied"
      priority: 2
      
  working:
    - text: "正在協調資源...{{agent_name}} 的報告已收到。"
      expression: "focused"
      variables: ["agent_name"]
      
  error:
    - text: "警告：{{error_type}} 發生。需要人工介入。"
      expression: "worried"
      sound_effect: "alert.mp3"
      
  complete:
    - text: "任務 {{task_name}} 完成。達成率 {{percentage}}%。"
      expression: "happy"
      variables: ["task_name", "percentage"]
      
  greeting:
    morning:
      - text: "早安，William。今日任務清單已準備就緒。"
        expression: "smile"
    afternoon:
      - text: "下午好。需要我彙報進度嗎？"
        expression: "neutral"
```

### 對話框 UI 設計（Persona 5 風格）

```html
<!-- 對話框結構 -->
<div class="dialogue-container">
  <!-- 背景遮罩（半透明黑） -->
  <div class="backdrop"></div>
  
  <!-- 角色立繪區（左） -->
  <div class="character-sprite left">
    <img src="jarvis_neutral.png" id="live2d-canvas">
  </div>
  
  <!-- 對話框（底部） -->
  <div class="dialogue-box persona5-style">
    <div class="name-box">
      <span class="character-name">JARVIS</span>
      <span class="character-role">System Coordinator</span>
    </div>
    
    <div class="text-content">
      <p id="dialogue-text">
        <!-- 打字機效果文字 -->
      </p>
    </div>
    
    <!-- Persona 5 風格裝飾線 -->
    <div class="decoration-lines"></div>
  </div>
  
  <!-- 選項區（如有） -->
  <div class="choices-container">
    <button class="choice-btn">查看詳細報告</button>
    <button class="choice-btn">繼續觀察</button>
  </div>
</div>
```

### CSS 設計重點（Persona 5 風格）

```css
.dialogue-box.persona5-style {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 3px solid #e60012;
  border-radius: 0; /* 方正風格 */
  box-shadow: 
    0 0 20px rgba(230, 0, 18, 0.5),
    inset 0 0 30px rgba(0, 0, 0, 0.8);
  
  /* 傾斜效果（Persona 5 特色） */
  transform: skewX(-2deg);
}

.name-box {
  background: #e60012;
  color: #ffffff;
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 8px 20px;
  clip-path: polygon(0 0, 95% 0, 100% 100%, 0% 100%);
}

.decoration-lines::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #e60012 50%, 
    transparent 100%);
  animation: pulse 2s infinite;
}
```

### 互動流程

```
用戶點擊 Agent
    ↓
檢查 Agent 當前狀態 (idle/working/error/complete)
    ↓
從對白庫選擇對應台詞（含隨機性）
    ↓
觸發對話框動畫（滑入 + Persona 5 風格特效）
    ↓
顯示角色立繪（Live2D 切換表情）
    ↓
播放打字機效果 + 語音（TTS）
    ↓
如有選項 → 顯示選項按鈕
    ↓
用戶選擇 / 自動關閉（5 秒後）
    ↓
對話框滑出
```

---

## 👨‍💼 角色設計規範

### 整體風格定位
- **日式漫畫 / Anime 風格**
- **全男性角色**（參考：刀劍亂舞、あんスタ、NU: carnival）
- **帥氣、專業、各具特色**
- **年齡層**：25-35 歲（成熟商務感）

### 八位角色視覺設計

#### 1. Jarvis - 指揮官型
**外貌**：
- 髮型：銀白色短髮，側分
- 眼睛：深藍色，銳利眼神
- 服裝：深藍色西裝 + 紅色領帶（指揮官配色）
- 配件：藍牙耳機、智能手錶

**性格標籤**：冷靜、理性、領導力  
**配色方案**：`#1E3A8A (藍)` + `#DC2626 (紅)` + `#F8FAFC (白)`

**AI 生成提示詞**：
```
handsome anime male, age 30, silver short hair, side part,
sharp blue eyes, confident expression, 
dark blue business suit, red necktie, bluetooth earpiece,
full body, white background, standing pose,
commander aura, professional, high quality, visual novel style
```

#### 2. Secretary - 秘書型
**外貌**：
- 髮型：棕色整齊短髮，帶眼鏡
- 眼睛：溫和的褐色
- 服裝：米色襯衫 + 深色背心 + 領結
- 配件：平板電腦、精緻筆

**性格標籤**：細心、高效、親和  
**配色方案**：`#92400E (棕)` + `#F5F5DC (米)` + `#4B5563 (灰)`

#### 3. Inspector - 品管專家型
**外貌**：
- 髮型：黑色俐落短髮，嚴謹
- 眼睛：深灰色，審視眼神
- 服裝：白色實驗袍 + 黑色襯衫
- 配件：紅色品質標章別針

**性格標籤**：嚴謹、正直、挑剔  
**配色方案**：`#000000 (黑)` + `#FFFFFF (白)` + `#DC2626 (紅)`

#### 4. Designer - 藝術家型
**外貌**：
- 髮型：紫色中長髮，微亂（藝術家感）
- 眼睛：紫羅蘭色，充滿靈感
- 服裝：彩色拼接T恤 + 黑色長褲 + 圍巾
- 配件：繪圖手套、色卡項鍊

**性格標籤**：創意、感性、完美主義  
**配色方案**：`#8B5CF6 (紫)` + `#F59E0B (橙)` + `#10B981 (綠)`

#### 5. Writer - 文藝青年型
**外貌**：
- 髮型：深棕色微卷中長髮
- 眼睛：琥珀色，溫柔
- 服裝：米色毛衣 + 深色圍巾 + 復古眼鏡
- 配件：鋼筆、筆記本

**性格標籤**：溫柔、浪漫、才華橫溢  
**配色方案**：`#78350F (深棕)` + `#FFFBEB (米黃)` + `#B45309 (琥珀)`

#### 6. Researcher - 學者型
**外貌**：
- 髮型：深藍色短髮，帶書卷氣
- 眼睛：藍綠色，專注
- 服裝：淺藍襯衫 + 深色馬甲 + 領帶
- 配件：復古眼鏡、資料夾

**性格標籤**：博學、好奇、理性  
**配色方案**：`#0E7490 (藍綠)` + `#DBEAFE (淺藍)` + `#334155 (深灰)`

#### 7. Coder - 駭客型
**外貌**：
- 髮型：黑色帶綠色挑染，略長
- 眼睛：綠色（程式碼感）
- 服裝：黑色連帽衫 + 科技感耳機
- 配件：RGB 手環、機械鍵盤鑰匙圈

**性格標籤**：Geek、專注、夜貓子  
**配色方案**：`#000000 (黑)` + `#10B981 (綠)` + `#6B7280 (灰)`

#### 8. Analyst - 金融菁英型
**外貌**：
- 髮型：金色短髮，整齊後梳
- 眼睛：金色，犀利
- 服裝：深色西裝 + 金色領帶夾
- 配件：名錶、手機（多支）

**性格標籤**：果斷、自信、追求卓越  
**配色方案**：`#B45309 (金)` + `#1F2937 (深灰)` + `#DC2626 (紅)`

### 角色一致性保持策略

1. **使用 Character LoRA**：為每個角色訓練專屬 LoRA 模型
2. **固定 Seed**：同一角色使用相同 seed 值
3. **ControlNet 姿勢控制**：確保不同表情時身體比例一致
4. **表情參考集**：每個角色準備 5 種基本表情（中性、微笑、驚訝、擔憂、自豪）

### Live2D 製作建議

**基礎動作**：
- 眨眼（自動循環）
- 呼吸（胸部微動）
- 頭部跟隨滑鼠（視線追蹤）
- Idle 動畫（輕微搖晃）

**表情切換**：
- 5 種基本表情
- 切換時間：0.3-0.5 秒
- 使用 Live2D 參數混合

---

## 🎮 互動流程圖（文字描述）

### 整體互動邏輯

```
[用戶進入頁面]
    ↓
載入等軸測辦公室場景（Phaser 3 渲染）
    ↓
8 位 Agent 出現在各自工作站（Idle 動畫）
    ↓
背景音樂開始播放（日式 Chill BGM）
    ↓
[用戶互動分支]
    ↓
┌───────────────────────────────────┐
│ 分支 A：點擊 Agent                 │
│   ↓                                │
│ 觸發 Galgame 對話框                │
│   ↓                                │
│ Live2D 立繪出現（對應表情）        │
│   ↓                                │
│ 播放對白（打字機效果 + TTS）       │
│   ↓                                │
│ 顯示選項（如：查看報告 / 繼續）    │
│   ↓                                │
│ 用戶選擇 → 執行對應動作            │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│ 分支 B：Agent 自動事件             │
│   ↓                                │
│ Agent 狀態改變（如 Coder 完成任務）│
│   ↓                                │
│ 角色移動到另一場景（如去找 Inspector）│
│   ↓                                │
│ 觸發場景對話（兩人互動）           │
│   ↓                                │
│ 完成後返回原位                     │
└───────────────────────────────────┘
    ↓
┌───────────────────────────────────┐
│ 分支 C：全局事件                   │
│   ↓                                │
│ Jarvis 召集全員（如每日總結）      │
│   ↓                                │
│ 所有 Agent 移動到指揮中心          │
│   ↓                                │
│ 多角色對話（輪流發言）             │
│   ↓                                │
│ 顯示今日成果統計（圖表動畫）       │
└───────────────────────────────────┘
```

### 角色移動系統

```
[觸發條件]
    ↓
計算路徑（A* 尋路算法）
    ↓
角色開始移動（等軸測座標轉換）
    ↓
播放行走動畫（Sprite Sheet）
    ↓
到達目的地
    ↓
觸發互動事件（如對話）
    ↓
完成後返回（或停留）
```

**移動場景範例**：
1. **Coder → Inspector**：代碼審查
2. **Researcher → Writer**：提供數據支援
3. **Designer → Jarvis**：設計稿審批
4. **所有人 → 指揮中心**：每日總結會議

### 狀態同步系統

```
[後端 Agent 狀態更新]
    ↓
WebSocket / 輪詢更新前端
    ↓
前端狀態管理器（Pinia）
    ↓
觸發對應視覺效果
    ↓
┌─────────────────────────┐
│ • Idle → 輕鬆動畫        │
│ • Working → 專注動畫 + 效果粒子 │
│ • Error → 場景警報燈閃爍 │
│ • Complete → 慶祝動畫    │
└─────────────────────────┘
```

---

## 📅 開發分期計劃

### Phase 0：前置準備（1-2 週）

**任務**：
- [ ] 確定技術棧並建立開發環境
- [ ] 研究 Phaser 3 + Monogatari.js 整合方案
- [ ] 設計完整 UI/UX 原型（Figma）
- [ ] 準備 Persona 5 風格設計系統（配色、字體、動效）

**交付物**：
- 技術選型文檔
- 開發環境設置指南
- Figma 設計稿（完整）
- 風格指南（Style Guide）

---

### Phase 1：角色美術資產製作（2-3 週）

**任務**：
- [ ] 使用 Stable Diffusion / NovelAI 生成 8 位角色全身立繪
- [ ] 為每個角色生成 5 種表情變化
- [ ] （選用）使用 Live2D Cubism 製作角色動畫
- [ ] 設計等軸測場景素材（使用 Tiled）

**交付物**：
- 8 位角色立繪（PNG，透明背景，2000x3000px）
- 表情變化圖（每人 5 張）
- Live2D 模型檔案（.model3.json）
- 等軸測 Tileset（辦公室場景）

---

### Phase 2：等軸測場景開發（2-3 週）

**任務**：
- [ ] 使用 Phaser 3 建立等軸測辦公室地圖
- [ ] 實作 8 個工作站場景
- [ ] 添加場景互動物件（螢幕、文件等）
- [ ] 實作角色 Sprite 系統（行走動畫）
- [ ] 實作 A* 尋路系統（角色移動）

**交付物**：
- 可運行的等軸測場景（無對話）
- 角色移動系統 Demo
- 場景互動物件系統

---

### Phase 3：Galgame 對話系統（2-3 週）

**任務**：
- [ ] 整合 Monogatari.js（或自製對話引擎）
- [ ] 實作 Persona 5 風格對話框 UI
- [ ] 實作打字機效果
- [ ] 整合 Live2D（角色立繪動畫）
- [ ] 撰寫對白劇本（8 位角色 × 4 種狀態）

**交付物**：
- 對話系統核心模組
- Persona 5 風格 UI 組件
- 對白資料庫（YAML 格式）

---

### Phase 4：語音與音效（1-2 週）

**任務**：
- [ ] 整合 Edge TTS / ElevenLabs API
- [ ] 為每位角色配置專屬音色
- [ ] 添加背景音樂（日式 Chill BGM）
- [ ] 添加互動音效（點擊、切換、通知等）

**交付物**：
- TTS 整合模組
- 音效資源庫
- 背景音樂播放清單

---

### Phase 5：狀態系統整合（2 週）

**任務**：
- [ ] 建立 Agent 狀態管理系統（Pinia）
- [ ] 實作 WebSocket / API 輪詢（與後端 Agent 通訊）
- [ ] 實作狀態驅動的對白系統
- [ ] 實作狀態視覺效果（粒子、燈光、動畫）

**交付物**：
- 完整狀態管理系統
- 後端整合文檔
- 即時狀態更新 Demo

---

### Phase 6：互動邏輯與動畫（2 週）

**任務**：
- [ ] 實作角色移動事件（跨場景互動）
- [ ] 實作多角色對話系統
- [ ] 添加全局事件（如每日總結）
- [ ] 使用 GSAP 製作 UI 動畫特效
- [ ] 實作選項系統（用戶可選擇對話分支）

**交付物**：
- 完整互動系統
- 動畫效果庫
- 事件觸發系統

---

### Phase 7：優化與測試（1-2 週）

**任務**：
- [ ] 性能優化（資源懶加載、圖片壓縮）
- [ ] 響應式設計（支援不同螢幕尺寸）
- [ ] 跨瀏覽器測試（Chrome, Safari, Firefox）
- [ ] 移動端適配（觸控操作）
- [ ] 無障礙優化（鍵盤導航、螢幕閱讀器）

**交付物**：
- 性能優化報告
- 測試報告
- 響應式版本

---

### Phase 8：部署與上線（1 週）

**任務**：
- [ ] 配置 Vercel / Netlify 部署
- [ ] 設置 CDN（Cloudflare）
- [ ] SEO 優化
- [ ] 撰寫使用文檔
- [ ] 準備展示影片 / GIF

**交付物**：
- 正式上線網址
- 部署文檔
- 展示素材

---

### 總計時間：約 3-4 個月（假設全職開發）

**關鍵里程碑**：
- **1 個月**：完成角色 + 場景美術
- **2 個月**：完成對話 + 互動系統
- **3 個月**：完成整合 + 優化
- **4 個月**：上線

---

## 🔗 參考連結與資源

### Visual Novel 引擎
1. **Monogatari.js**
   - 官網：https://monogatari.io/
   - 文檔：https://developers.monogatari.io/documentation
   - GitHub：https://github.com/Monogatari/Monogatari
   - 教學影片：https://www.youtube.com/watch?v=byObSXXFAnM

2. **RenJS**
   - 官網：https://renjs.net/
   - 範例庫：https://renjs.net/examples-gallery.html
   - 基於 Phaser.js

### RPG 引擎
3. **Phaser 3**
   - 官網：https://phaser.io/
   - 等軸測範例：https://phaser.io/examples/v3/category/tilemap/isometric
   - API 文檔：https://newdocs.phaser.io/docs/3.55.2

4. **PixiJS**
   - 官網：https://pixijs.com/
   - 教學：https://waelyasmina.net/articles/pixi-js-tutorial-for-complete-beginners/

### Live2D 資源
5. **Live2D Cubism SDK for Web**
   - 官網：https://www.live2d.com/en/sdk/about/
   - 下載：https://www.live2d.com/en/sdk/download/web/
   - Vue.js 整合教學：https://medium.com/@mizutori/live2d-on-the-web-part-1-how-to-load-a-live2d-model-in-your-vue-js-project-2f3987ceb91f
   - 範例模型：https://www.live2d.com/en/learn/sample/

### 參考遊戲 UI
6. **Persona 5 UI 分析**
   - 設計分析：https://ridwankhan.com/the-ui-and-ux-of-persona-5-183180eb7cce
   - UI 截圖庫：https://www.gameuidatabase.com/gameData.php?id=72

7. **刀劍亂舞**
   - 官網：https://www.toukenranbu.jp/
   - Wikipedia：https://ja.wikipedia.org/wiki/刀剣乱舞

8. **あんさんぶるスターズ (Ensemble Stars)**
   - 官網：https://ensemble-stars.jp/

9. **NU: Carnival**
   - 官網：https://nucarnival.com/
   - 角色頁面：https://nucarnival.com/en-US/Characters/

### AI 生成工具
10. **Stable Diffusion**
    - 官網：https://stablediffusionweb.com/
    - 教學：https://medium.com/@antonio.ciolino/stable-diffusion-character-creation-23c6da31c5f9
    - 提示詞庫：https://mpost.io/best-100-stable-diffusion-prompts-the-most-beautiful-ai-text-to-image-prompts/
    - 提示詞生成器：https://www.ocidol.com/tools/character-prompt-generator

11. **NovelAI**
    - 官網：https://novelai.net/

### TTS 服務
12. **ElevenLabs**
    - 官網：https://elevenlabs.io/text-to-speech-api
    - 文檔：https://elevenlabs.io/docs/api-reference/text-to-speech/v-1-text-to-speech-voice-id-stream-input
    - JavaScript SDK：https://elevenlabs.io/developers

13. **Edge TTS**
    - GitHub：https://github.com/rany2/edge-tts
    - 免費使用（微軟提供）

14. **Web Speech API**
    - MDN 文檔：https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

### 等軸測地圖工具
15. **Tiled Map Editor**
    - 官網：https://www.mapeditor.org/
    - 支援等軸測模式

### 動畫與特效
16. **GSAP (GreenSock)**
    - 官網：https://greensock.com/gsap/
    - 適合製作 Persona 5 風格動畫

### 音效資源
17. **Freesound**
    - https://freesound.org/

18. **日式遊戲 BGM**
    - YouTube Audio Library（篩選日式風格）
    - Free Music Archive

### 其他互動案例
19. **Ren'Py 官方範例**
    - https://www.renpy.org/

20. **Naninovel (Unity Visual Novel)**
    - https://naninovel.com/

---

## 📊 附錄：技術整合架構圖

```
┌─────────────────────────────────────────────────────┐
│                    前端架構                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐     ┌──────────────┐             │
│  │   Vue 3 +    │────▶│    Pinia     │             │
│  │  TypeScript  │     │ (狀態管理)    │             │
│  └──────────────┘     └──────────────┘             │
│         │                     │                      │
│         ▼                     ▼                      │
│  ┌──────────────────────────────────┐               │
│  │      遊戲渲染層 (Game Layer)      │               │
│  ├──────────────────────────────────┤               │
│  │                                   │               │
│  │  ┌──────────┐    ┌──────────┐   │               │
│  │  │ Phaser 3 │    │Monogatari│   │               │
│  │  │ (場景)   │    │(對話框)  │   │               │
│  │  └──────────┘    └──────────┘   │               │
│  │       │                │         │               │
│  │       ▼                ▼         │               │
│  │  等軸測地圖      Galgame UI      │               │
│  │  角色移動        對白系統        │               │
│  └──────────────────────────────────┘               │
│         │                                            │
│         ▼                                            │
│  ┌──────────────────────────────────┐               │
│  │      動畫層 (Animation Layer)     │               │
│  ├──────────────────────────────────┤               │
│  │  Live2D  │  GSAP  │  Sprite Sheet│               │
│  └──────────────────────────────────┘               │
│         │                                            │
│         ▼                                            │
│  ┌──────────────────────────────────┐               │
│  │      音訊層 (Audio Layer)         │               │
│  ├──────────────────────────────────┤               │
│  │  Edge TTS │  BGM  │  SFX         │               │
│  └──────────────────────────────────┘               │
│                                                      │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  後端 / API 層                       │
├─────────────────────────────────────────────────────┤
│  WebSocket / REST API                               │
│  ├─ Agent 狀態更新                                   │
│  ├─ 對白內容（動態生成）                             │
│  └─ 任務數據                                         │
└─────────────────────────────────────────────────────┘
```

---

## ✅ 總結與建議

### 核心優勢
1. **技術可行性高**：所有技術均有成熟方案與社群支援
2. **視覺衝擊力強**：結合 Persona 5 風格 + Live2D 動畫
3. **互動性豐富**：不只是靜態展示，而是可玩的「遊戲」
4. **擴展性強**：未來可加入更多 Agent、場景、劇情

### 潛在挑戰
1. **美術工作量**：8 位角色 × 5 種表情 = 40 張立繪（需時間）
2. **Live2D 學習曲線**：若無經驗，建議先用靜態 Sprite
3. **性能優化**：Live2D + Phaser 同時運行需注意性能

### 降低風險的建議
1. **MVP 策略**：先完成 3 位角色（Jarvis, Coder, Researcher）驗證技術
2. **分階段上線**：
   - v1.0：靜態立繪 + 對話系統
   - v2.0：加入 Live2D 動畫
   - v3.0：加入角色移動 + 複雜互動
3. **素材替代方案**：
   - 初期使用 Stable Diffusion 生成的靜態圖
   - 預算充足後委託專業 Live2D 師製作

### 下一步行動
1. **審查本文件**：確認需求與技術方案
2. **建立技術 Demo**：Phaser 3 + Monogatari.js 整合測試
3. **生成測試角色**：用 AI 生成 1-2 位角色測試效果
4. **製作原型**：完成一個完整的「單場景 + 單角色對話」原型

---

**文件狀態**：✅ 完成  
**最後更新**：2026-02-14  
**作者**：Researcher Agent  
**版本**：v1.0
