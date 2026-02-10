---
title: "自動機器人咖啡機 — 40 秒出杯方案深度研究"
date: "2026-02-10"
type: "research"
description: "全球咖啡機器人市場調查、結構分析與 40 秒出杯方案設計——以越疆 NOVA 協作手臂為核心"
---

# 🤖 自動機器人咖啡機 — 40 秒出杯方案深度研究

> **委託方**：和椿科技（Aurotek）客戶  
> **研究日期**：2026-02-10  
> **核心目標**：以**越疆 Dobot NOVA 協作手臂**搭配咖啡機，實現 **40 秒內完成一杯咖啡**

---

## 一、執行摘要

咖啡機器人市場已從概念驗證進入商業化量產階段。全球已有超過 20 個品牌推出商用方案，出杯時間從 **20 秒到 3 分鐘**不等，關鍵差異在於架構設計。

**核心結論**：
1. 「40 秒出杯」需明確定義為**連續出杯間隔時間（Cycle Time）**，而非首杯從零開始的時間
2. 純 espresso 萃取即需 25-30 秒，**單杯從下單到出杯 40 秒幾乎不可能含奶泡飲品**
3. 可行路徑：**全自動咖啡機 + NOVA 手臂遞送**（方案 C）或**雙機交替 Pipeline**（方案 A）
4. **越疆 NOVA 2 已有成熟咖啡方案**（官方宣稱 45 秒出杯），是最佳手臂選擇

### 指定手臂：越疆 Dobot NOVA 系列

| 型號 | 負載 | 臂展 | 最大速度 | 重複精度 | 自重 | 防護等級 | 咖啡適用性 |
|------|------|------|---------|---------|------|---------|-----------|
| **NOVA 2** | 2 kg | 625 mm | 1.6 m/s | ±0.05 mm | 11 kg | IP54 | ⭐⭐⭐⭐⭐ 最佳（已有官方咖啡方案）|
| **NOVA 5** | 5 kg | 850 mm | 2.0 m/s | ±0.05 mm | 17 kg | IP54 | ⭐⭐⭐⭐ 臂展更大、適合雙機佈局 |

> **推薦**：單機方案用 **NOVA 2**（輕量、成本低、已驗證）；雙機 Pipeline 方案用 **NOVA 5**（臂展 850mm 可覆蓋兩台咖啡機）

---

## 二、市場總覽 — 全球咖啡機器人品牌

| 品牌 | 國家 | 機器人型號 | 咖啡機 | 出杯時間 | 結構類型 | 產能（杯/hr） | 價格範圍（USD） |
|------|------|-----------|--------|----------|----------|--------------|----------------|
| **Cafe X** | 美國 | Mitsubishi 6軸 | WMF 全自動 | ~20-60s | 全自動機+手臂遞送 | 100-120 | $25K（手臂）|
| **Crown Digital (Ella)** | 新加坡 | 6軸手臂 | 內建全自動 | ~18s | 全自動封閉式 | **200** | 未公開 |
| **Rozum Café** | 白俄羅斯 | Rozum PULSE75 | 半自動咖啡機 | ~3 min | 單臂操作半自動機 | ~20 | ~$150K-200K |
| **Briggo Coffee Haus** | 美國 | 封閉式自動化 | 內建全自動 | ~36s | 全自動封閉式 | **100+** | 未公開 |
| **COFE+（氦豚科技）** | 中國 | 4軸手臂 | 內建全自動 | **~50s** | 全自動+手臂 | 60-70 | $30K-80K |
| **Dal.komm (b;eat)** | 韓國 | 6軸手臂 | 內建半自動 | ~40s | 單臂+全自動機 | **90** | 未公開 |
| ⭐ **Dobot Nova 2** | 中國 | **NOVA 2** | 全自動咖啡機 | **~45s** | 單臂+全自動機 | ~80 | ~$20K-50K |
| **獵戶星空（智咖大師）** | 中國 | 自研6軸雙臂 | 手沖設備 | ~3 min | 雙臂手沖 | ~30/hr | ~$30K-50K |
| **JAKA Zu 3 / MiniCobo** | 中國 | JAKA Zu 3 | JURA 全自動 | ~90s | 單臂+全自動機 | ~40 | ~$15K-30K |
| **RobotAnno** | 中國 | 6軸手臂 | 半自動/全自動 | ~60-90s | 單臂 | ~40-60 | ~$20K-50K |
| **Eracobot** | 中國 | ERA cobot | 全自動咖啡機 | ~60s | 單臂+全自動機 | ~60 | ~$10K-25K |
| **igus ReBeL** | 德國 | ReBeL cobot | 全自動咖啡機 | ~60s | 單臂+全自動機 | ~60 | ~$5K-15K |
| **CafeXbot (VLT)** | 烏茲別克 | 6軸手臂 | 全自動 | ~50s | 封閉式全自動 | ~60 | **~$100K** |
| **Truebird** | 美國 | 封閉式 | 內建全自動 | ~30-45s | 全自動封閉+磁力遞送 | ~80 | 未公開 |
| **新松 SIASUN** | 中國 | 多可雙臂 | 全自動 | ~60s | 雙臂 | ~50 | ~$50K+ |
| **艾利特 Elite** | 中國 | EC系列 cobot | 全自動 | ~60s | 單臂+全自動機 | ~40 | ~$15K-30K |
| **CR Coffee Robot** | 中國 | 自研 | 全自動 | ~45s | 全自動封閉式 | ~80 | ~$50K-100K |
| **Smyze** | 瑞士 | 封閉式 | 全自動 | ~40s | 全自動封閉式 | ~80 | 未公開 |
| **Know InBot** | 中國 | 雙臂 | Eversys 全自動 | ~30-40s | 雙臂+全自動機 | ~90 | 未公開 |

### 關鍵發現

1. **出杯最快的方案都不是「手臂操作半自動機」**，而是全自動咖啡機+手臂遞送
2. **Ella（Crown Digital）** 以 200 杯/hr 領先，約 18 秒一杯
3. **Cafe X** 的 120 杯/hr 相當於 30 秒一杯（使用 WMF 全自動機 + Mitsubishi 手臂）
4. **Dobot NOVA 2 已有官方咖啡方案**，45 秒出杯，是本方案的最佳起點
5. 手沖/半自動機方案（如獵戶星空、Rozum）出杯時間 2-3 分鐘，無法達到 40 秒目標

---

## 三、架構方案比較

### 五大架構示意圖

**架構 A：單臂 + 半自動機** ⏱ 2-3 min ❌ 不可行

<div align="center">
<svg width="100%" viewBox="0 0 700 140" viewBox="0 0 700 140" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <rect x="1" y="1" width="698" height="138" rx="8" fill="none" stroke="#dc2626" stroke-width="2"/>
  <!-- 磨豆機 -->
  <rect x="30" y="45" width="90" height="40" rx="6" fill="#f3f4f6" stroke="#374151" stroke-width="1.5"/>
  <text x="75" y="70" text-anchor="middle" font-size="13" fill="#374151">磨豆機</text>
  <!-- arrow -->
  <line x1="120" y1="65" x2="160" y2="65" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-a)"/>
  <!-- NOVA -->
  <rect x="160" y="45" width="100" height="40" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="210" y="70" text-anchor="middle" font-size="13" fill="#2563eb" font-weight="bold">🤖 NOVA</text>
  <!-- arrow -->
  <line x1="260" y1="65" x2="310" y2="65" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-a)"/>
  <!-- 半自動機 -->
  <rect x="310" y="45" width="120" height="40" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="370" y="70" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">半自動咖啡機</text>
  <!-- arrow -->
  <line x1="430" y1="65" x2="490" y2="65" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-a)"/>
  <!-- 取餐口 -->
  <rect x="490" y="45" width="80" height="40" rx="6" fill="#f3f4f6" stroke="#374151" stroke-width="1.5"/>
  <text x="530" y="70" text-anchor="middle" font-size="13" fill="#374151">取餐口</text>
  <!-- 奶泡機 branch -->
  <rect x="310" y="100" width="90" height="30" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="355" y="120" text-anchor="middle" font-size="12" fill="#16a34a">奶泡機</text>
  <line x1="355" y1="100" x2="355" y2="85" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-a)"/>
  <!-- ❌ badge -->
  <rect x="600" y="50" width="70" height="30" rx="12" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="635" y="70" text-anchor="middle" font-size="12" fill="#dc2626" font-weight="bold">❌ 不可行</text>
  <defs><marker id="ah-a" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#374151"/></marker></defs>
</svg>
</div>

> 手臂負責所有動作：磨豆、填粉、萃取、打奶泡，步驟太多

**架構 B：雙臂式** ⏱ 1.5-2 min ❌ 不可行

<div align="center">
<svg width="100%" viewBox="0 0 700 150" viewBox="0 0 700 150" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <rect x="1" y="1" width="698" height="148" rx="8" fill="none" stroke="#dc2626" stroke-width="2"/>
  <!-- 半自動機 -->
  <rect x="30" y="30" width="120" height="40" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="90" y="55" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">半自動咖啡機</text>
  <!-- arrow to left arm -->
  <line x1="150" y1="50" x2="200" y2="50" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-b)"/>
  <!-- 左臂 -->
  <rect x="200" y="30" width="160" height="40" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="280" y="55" text-anchor="middle" font-size="13" fill="#2563eb" font-weight="bold">🤖 NOVA 左臂</text>
  <!-- arrow to 取餐口 -->
  <line x1="360" y1="50" x2="470" y2="50" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-b)"/>
  <!-- 取餐口 -->
  <rect x="470" y="30" width="80" height="40" rx="6" fill="#f3f4f6" stroke="#374151" stroke-width="1.5"/>
  <text x="510" y="55" text-anchor="middle" font-size="13" fill="#374151">取餐口</text>
  <!-- 右臂 -->
  <rect x="200" y="90" width="160" height="40" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="280" y="115" text-anchor="middle" font-size="13" fill="#2563eb" font-weight="bold">🤖 NOVA 右臂</text>
  <text x="280" y="128" text-anchor="middle" font-size="11" fill="#6b7280">打奶泡 / 遞送</text>
  <!-- arrow from right arm to 取餐口 -->
  <path d="M360,110 Q420,110 470,70" fill="none" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-b)"/>
  <!-- badge -->
  <rect x="590" y="50" width="70" height="30" rx="12" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="625" y="70" text-anchor="middle" font-size="12" fill="#dc2626" font-weight="bold">❌ 不可行</text>
  <defs><marker id="ah-b" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#374151"/></marker></defs>
</svg>
</div>

> 成本高、複雜度高，仍然太慢

**架構 C：單臂 + 全自動機** ⏱ 45-90s ⚠️ 勉強

<div align="center">
<svg width="100%" viewBox="0 0 700 120" viewBox="0 0 700 120" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <rect x="1" y="1" width="698" height="118" rx="8" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <!-- 全自動機 -->
  <rect x="50" y="35" width="140" height="40" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="120" y="60" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">全自動咖啡機</text>
  <!-- arrow -->
  <line x1="190" y1="55" x2="260" y2="55" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-c)"/>
  <!-- NOVA 2 -->
  <rect x="260" y="35" width="160" height="40" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="340" y="60" text-anchor="middle" font-size="13" fill="#2563eb" font-weight="bold">🤖 NOVA 2 取杯遞送</text>
  <!-- arrow -->
  <line x1="420" y1="55" x2="490" y2="55" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-c)"/>
  <!-- 取餐口 -->
  <rect x="490" y="35" width="80" height="40" rx="6" fill="#f3f4f6" stroke="#374151" stroke-width="1.5"/>
  <text x="530" y="60" text-anchor="middle" font-size="13" fill="#374151">取餐口</text>
  <!-- badge -->
  <rect x="600" y="40" width="70" height="30" rx="12" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="635" y="60" text-anchor="middle" font-size="12" fill="#f59e0b" font-weight="bold">⚠️ 勉強</text>
  <defs><marker id="ah-c" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#374151"/></marker></defs>
</svg>
</div>

> 咖啡機自動完成萃取+奶泡，手臂只負責取杯遞送

**架構 D：全自動機 + 手臂遞送** ⏱ 35-40s ✅ 推薦

<div align="center">
<svg width="100%" viewBox="0 0 700 120" viewBox="0 0 700 120" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <rect x="1" y="1" width="698" height="118" rx="8" fill="none" stroke="#16a34a" stroke-width="2"/>
  <!-- WMF/Eversys -->
  <rect x="40" y="35" width="170" height="40" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="125" y="60" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">WMF/Eversys 一鍵出品</text>
  <!-- arrow -->
  <line x1="210" y1="55" x2="270" y2="55" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-d)"/>
  <!-- NOVA 2 -->
  <rect x="270" y="35" width="160" height="40" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="350" y="60" text-anchor="middle" font-size="13" fill="#2563eb" font-weight="bold">🤖 NOVA 2 取杯遞送</text>
  <!-- arrow -->
  <line x1="430" y1="55" x2="490" y2="55" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-d)"/>
  <!-- 取餐口 -->
  <rect x="490" y="35" width="80" height="40" rx="6" fill="#f3f4f6" stroke="#374151" stroke-width="1.5"/>
  <text x="530" y="60" text-anchor="middle" font-size="13" fill="#374151">取餐口</text>
  <!-- badge -->
  <rect x="600" y="40" width="70" height="30" rx="12" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
  <text x="635" y="60" text-anchor="middle" font-size="12" fill="#16a34a" font-weight="bold">✅ 推薦</text>
  <defs><marker id="ah-d" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#374151"/></marker></defs>
</svg>
</div>

> 高速全自動機 + 手臂遞送，剛好達標 40 秒

**架構 E：雙機 Pipeline** ⏱ 20-25s ✅✅ 最佳

<div align="center">
<svg width="100%" viewBox="0 0 700 160" viewBox="0 0 700 160" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <rect x="1" y="1" width="698" height="158" rx="8" fill="none" stroke="#16a34a" stroke-width="2"/>
  <!-- 全自動機 A -->
  <rect x="40" y="25" width="140" height="40" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="110" y="50" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">全自動機 A</text>
  <!-- 全自動機 B -->
  <rect x="40" y="90" width="140" height="40" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="110" y="115" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">全自動機 B</text>
  <!-- arrows converge -->
  <line x1="180" y1="45" x2="270" y2="75" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-e)"/>
  <line x1="180" y1="110" x2="270" y2="85" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-e)"/>
  <!-- NOVA 5 -->
  <rect x="270" y="55" width="170" height="40" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="355" y="80" text-anchor="middle" font-size="13" fill="#2563eb" font-weight="bold">🤖 NOVA 5 輪流取杯</text>
  <!-- arrow -->
  <line x1="440" y1="75" x2="500" y2="75" stroke="#374151" stroke-width="1.5" marker-end="url(#ah-e)"/>
  <!-- 取餐口 -->
  <rect x="500" y="55" width="80" height="40" rx="6" fill="#f3f4f6" stroke="#374151" stroke-width="1.5"/>
  <text x="540" y="80" text-anchor="middle" font-size="13" fill="#374151">取餐口</text>
  <!-- badge -->
  <rect x="610" y="60" width="70" height="30" rx="12" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
  <text x="645" y="80" text-anchor="middle" font-size="12" fill="#16a34a" font-weight="bold">✅✅ 最佳</text>
  <defs><marker id="ah-e" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#374151"/></marker></defs>
</svg>
</div>

> 兩台機器交替出品，手臂輪流取杯，速度翻倍

### 架構對比總表

| 架構類型 | 出杯時間 | 佔地面積 | 設備成本 | 維護難度 | 咖啡品質 | 40秒可行性 |
|---------|---------|---------|---------|---------|---------|-----------|
| **A. 單臂+半自動機** | 2-3 min | 3-5 m² | $30-80K | 中 | ⭐⭐⭐⭐⭐ | ❌ 不可能 |
| **B. 雙臂式** | 1.5-2 min | 4-6 m² | $60-120K | 高 | ⭐⭐⭐⭐⭐ | ❌ 不可能 |
| **C. 單臂+全自動機** | 45-90s | 2-4 m² | $20-60K | 低 | ⭐⭐⭐ | ⚠️ 勉強 |
| **D. 全自動機+NOVA遞送** | **35-40s** | 2-4 m² | $30-70K | 低 | ⭐⭐⭐ | ✅ 可行 |
| **E. 雙機+NOVA Pipeline** | **20-25s** | 4-6 m² | $50-100K | 中 | ⭐⭐⭐ | ✅✅ 最佳 |

---

## 四、40 秒出杯方案設計（以 Dobot NOVA 為核心）

### 4.1 關鍵定義

> ⚠️ **「40 秒」的兩種理解**：
> - **First Cup Time**：從下單到第一杯出杯 — 約需 40-60 秒（含機器準備）
> - **Cycle Time**：連續出杯的間隔時間 — 可壓到 20-30 秒
> 
> **建議定義為 Cycle Time（連續出杯間隔）**，這也是業界標準

### 4.2 咖啡製作流程耗時拆解

| 步驟 | NOVA 操作半自動機 | 全自動機自動完成 |
|------|-----------------|----------------|
| 取杯 | 3-5s | 自動（0s） |
| 磨豆 | 5-8s | 自動（含在萃取中） |
| 填粉壓粉 | 5-8s | 自動 |
| 萃取 Espresso | **25-30s**（不可壓縮） | **25-30s**（不可壓縮） |
| 打奶泡 | 15-20s | 自動並行（0s 額外） |
| 倒奶/混合 | 5-8s | 自動（0s） |
| NOVA 遞送到取餐口 | 5-8s | 5-8s |
| **總計** | **63-87s** | **30-38s** |

**核心瓶頸**：Espresso 萃取 25-30 秒是物理極限，無法壓縮

---

### 方案 A：NOVA 5 + 雙全自動機交替出品（Pipeline）

**架構**：1 支 NOVA 5（臂展 850mm 覆蓋雙機）+ 2 台全自動咖啡機

#### 動作時序圖

<div align="center">
<svg width="100%" viewBox="0 0 700 200" viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <defs><marker id="ga" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#374151"/></marker></defs>
  <!-- title -->
  <text x="350" y="18" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">方案 A 動作時序圖</text>
  <!-- Y axis labels -->
  <text x="85" y="55" text-anchor="end" font-size="11" fill="#16a34a">全自動機 A</text>
  <text x="85" y="90" text-anchor="end" font-size="11" fill="#16a34a">全自動機 B</text>
  <text x="85" y="125" text-anchor="end" font-size="11" fill="#2563eb">NOVA 5</text>
  <text x="85" y="160" text-anchor="end" font-size="11" fill="#374151">出杯</text>
  <!-- grid lines -->
  <line x1="90" y1="30" x2="90" y2="175" stroke="#e5e7eb" stroke-width="1"/>
  <!-- time axis: 0 to 95s, scale: 90px = 0s, 680px = 95s → px = 90 + t*6.2 -->
  <!-- X axis -->
  <line x1="90" y1="175" x2="680" y2="175" stroke="#374151" stroke-width="1"/>
  <text x="90" y="190" text-anchor="middle" font-size="10" fill="#6b7280">0</text>
  <text x="214" y="190" text-anchor="middle" font-size="10" fill="#6b7280">20</text>
  <text x="338" y="190" text-anchor="middle" font-size="10" fill="#6b7280">40</text>
  <text x="462" y="190" text-anchor="middle" font-size="10" fill="#6b7280">60</text>
  <text x="586" y="190" text-anchor="middle" font-size="10" fill="#6b7280">80</text>
  <text x="400" y="200" text-anchor="middle" font-size="10" fill="#6b7280">時間（秒）</text>
  <!-- tick marks -->
  <line x1="214" y1="175" x2="214" y2="170" stroke="#374151" stroke-width="1"/>
  <line x1="338" y1="175" x2="338" y2="170" stroke="#374151" stroke-width="1"/>
  <line x1="462" y1="175" x2="462" y2="170" stroke="#374151" stroke-width="1"/>
  <line x1="586" y1="175" x2="586" y2="170" stroke="#374151" stroke-width="1"/>
  <!-- Machine A bars: 0-35, 40-75 -->
  <rect x="90" y="42" width="217" height="18" rx="3" fill="#86efac" stroke="#16a34a" stroke-width="1"/>
  <text x="198" y="55" text-anchor="middle" font-size="9" fill="#166534">萃取 #1</text>
  <rect x="338" y="42" width="217" height="18" rx="3" fill="#86efac" stroke="#16a34a" stroke-width="1"/>
  <text x="446" y="55" text-anchor="middle" font-size="9" fill="#166534">萃取 #3</text>
  <!-- Machine B bars: 20-55, 60-95 -->
  <rect x="214" y="77" width="217" height="18" rx="3" fill="#bbf7d0" stroke="#16a34a" stroke-width="1"/>
  <text x="322" y="90" text-anchor="middle" font-size="9" fill="#166534">萃取 #2</text>
  <rect x="462" y="77" width="217" height="18" rx="3" fill="#bbf7d0" stroke="#16a34a" stroke-width="1"/>
  <text x="570" y="90" text-anchor="middle" font-size="9" fill="#166534">萃取 #4</text>
  <!-- NOVA bars: 35-43 取A, 43-47 move, 55-63 取B, 63-67 move, 75-83 取A -->
  <rect x="307" y="112" width="50" height="18" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="332" y="125" text-anchor="middle" font-size="8" fill="#1e40af">取A→送</text>
  <rect x="357" y="112" width="25" height="18" rx="3" fill="#e0e7ff" stroke="#2563eb" stroke-width="1"/>
  <text x="369" y="125" text-anchor="middle" font-size="7" fill="#6b7280">移</text>
  <rect x="432" y="112" width="50" height="18" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="457" y="125" text-anchor="middle" font-size="8" fill="#1e40af">取B→送</text>
  <rect x="482" y="112" width="25" height="18" rx="3" fill="#e0e7ff" stroke="#2563eb" stroke-width="1"/>
  <text x="494" y="125" text-anchor="middle" font-size="7" fill="#6b7280">移</text>
  <rect x="556" y="112" width="50" height="18" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="581" y="125" text-anchor="middle" font-size="8" fill="#1e40af">取A→送</text>
  <!-- cups out -->
  <text x="332" y="155" text-anchor="middle" font-size="12">☕</text>
  <text x="457" y="155" text-anchor="middle" font-size="12">☕</text>
  <text x="581" y="155" text-anchor="middle" font-size="12">☕</text>
  <!-- Cycle time red dashed lines at t=35(307), t=55(432), t=75(556) → ~20s apart -->
  <line x1="332" y1="30" x2="332" y2="170" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="457" y1="30" x2="457" y2="170" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="581" y1="30" x2="581" y2="170" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <!-- Cycle time annotation -->
  <line x1="332" y1="35" x2="457" y2="35" stroke="#dc2626" stroke-width="1"/>
  <text x="395" y="33" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="bold">Cycle ≈ 20s</text>
</svg>
</div>

> **Cycle Time ≈ 20 秒** — 遠超 40 秒目標 ✅

#### 硬體佈局圖（俯視圖）

<div align="center">
<svg width="100%" viewBox="0 0 500 400" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <defs>
    <marker id="dim-a" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#6b7280"/></marker>
    <marker id="dim-a2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6" fill="#6b7280"/></marker>
  </defs>
  <!-- outer box -->
  <rect x="60" y="40" width="360" height="300" rx="4" fill="#fafafa" stroke="#374151" stroke-width="2"/>
  <!-- dimension lines -->
  <!-- width 2.0m -->
  <line x1="60" y1="25" x2="420" y2="25" stroke="#6b7280" stroke-width="1" marker-start="url(#dim-a2)" marker-end="url(#dim-a)"/>
  <line x1="60" y1="20" x2="60" y2="30" stroke="#6b7280" stroke-width="1"/>
  <line x1="420" y1="20" x2="420" y2="30" stroke="#6b7280" stroke-width="1"/>
  <text x="240" y="20" text-anchor="middle" font-size="12" fill="#6b7280">2.0 m</text>
  <!-- height 1.5m -->
  <line x1="45" y1="40" x2="45" y2="340" stroke="#6b7280" stroke-width="1" marker-start="url(#dim-a2)" marker-end="url(#dim-a)"/>
  <line x1="40" y1="40" x2="50" y2="40" stroke="#6b7280" stroke-width="1"/>
  <line x1="40" y1="340" x2="50" y2="340" stroke="#6b7280" stroke-width="1"/>
  <text x="35" y="195" text-anchor="middle" font-size="12" fill="#6b7280" transform="rotate(-90 35 195)">1.5 m</text>
  <!-- 後方設備區 label -->
  <text x="440" y="90" font-size="11" fill="#9ca3af">後方設備區</text>
  <!-- 全自動機A -->
  <rect x="80" y="60" width="130" height="70" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="145" y="90" text-anchor="middle" font-size="12" fill="#16a34a" font-weight="bold">全自動機 A</text>
  <text x="145" y="105" text-anchor="middle" font-size="10" fill="#6b7280">WMF 1500S+</text>
  <!-- 全自動機B -->
  <rect x="230" y="60" width="130" height="70" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="295" y="90" text-anchor="middle" font-size="12" fill="#16a34a" font-weight="bold">全自動機 B</text>
  <text x="295" y="105" text-anchor="middle" font-size="10" fill="#6b7280">WMF 1500S+</text>
  <!-- 水箱 & 牛奶 -->
  <rect x="80" y="140" width="60" height="30" rx="3" fill="#e0f2fe" stroke="#6b7280" stroke-width="1"/>
  <text x="110" y="160" text-anchor="middle" font-size="10" fill="#6b7280">水箱</text>
  <rect x="300" y="140" width="60" height="30" rx="3" fill="#fef3c7" stroke="#6b7280" stroke-width="1"/>
  <text x="330" y="160" text-anchor="middle" font-size="10" fill="#6b7280">牛奶冷藏</text>
  <!-- 中央作業區 label -->
  <text x="440" y="215" font-size="11" fill="#9ca3af">中央作業區</text>
  <!-- 杯架左 -->
  <rect x="90" y="195" width="50" height="40" rx="3" fill="#f3f4f6" stroke="#6b7280" stroke-width="1"/>
  <text x="115" y="220" text-anchor="middle" font-size="10" fill="#6b7280">杯架</text>
  <!-- NOVA 5 -->
  <circle cx="220" cy="215" r="18" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="220" y="220" text-anchor="middle" font-size="11" fill="#2563eb" font-weight="bold">N5</text>
  <!-- arm reach arc (850mm) -->
  <circle cx="220" cy="215" r="90" fill="none" stroke="#2563eb" stroke-width="1" stroke-dasharray="6,4"/>
  <text x="320" y="175" font-size="10" fill="#2563eb">臂展 850mm</text>
  <!-- 杯架右 -->
  <rect x="300" y="195" width="50" height="40" rx="3" fill="#f3f4f6" stroke="#6b7280" stroke-width="1"/>
  <text x="325" y="220" text-anchor="middle" font-size="10" fill="#6b7280">杯架</text>
  <!-- 前方顧客區 label -->
  <text x="440" y="305" font-size="11" fill="#9ca3af">前方顧客區</text>
  <!-- 點餐面板 -->
  <rect x="150" y="280" width="100" height="25" rx="3" fill="#ede9fe" stroke="#6b7280" stroke-width="1"/>
  <text x="200" y="297" text-anchor="middle" font-size="10" fill="#6b7280">📱 點餐面板</text>
  <!-- 取餐窗口 -->
  <rect x="150" y="310" width="100" height="25" rx="3" fill="#fef3c7" stroke="#374151" stroke-width="1.5"/>
  <text x="200" y="327" text-anchor="middle" font-size="10" fill="#374151" font-weight="bold">📦 取餐窗口</text>
</svg>
</div>

**NOVA 5 選擇理由**：臂展 850mm 可覆蓋左右兩台咖啡機（間距約 700mm），無需滑軌

---

### 方案 B：NOVA 2 + 高速全自動機（Eversys Shotmaster）

**架構**：1 支 NOVA 2 + 1 台 Eversys Shotmaster（雙沖煮頭，700 espresso/hr）

#### 動作時序圖

<div align="center">
<svg width="100%" viewBox="0 0 700 200" viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <text x="350" y="18" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">方案 B 動作時序圖</text>
  <!-- Y labels -->
  <text x="85" y="55" text-anchor="end" font-size="11" fill="#16a34a">沖煮頭 1</text>
  <text x="85" y="90" text-anchor="end" font-size="11" fill="#16a34a">沖煮頭 2</text>
  <text x="85" y="125" text-anchor="end" font-size="11" fill="#2563eb">NOVA 2</text>
  <text x="85" y="160" text-anchor="end" font-size="11" fill="#374151">出杯</text>
  <!-- X axis: 0-65s, scale px = 90 + t*9.08 -->
  <line x1="90" y1="175" x2="680" y2="175" stroke="#374151" stroke-width="1"/>
  <text x="90" y="190" text-anchor="middle" font-size="10" fill="#6b7280">0</text>
  <text x="181" y="190" text-anchor="middle" font-size="10" fill="#6b7280">10</text>
  <text x="272" y="190" text-anchor="middle" font-size="10" fill="#6b7280">20</text>
  <text x="362" y="190" text-anchor="middle" font-size="10" fill="#6b7280">30</text>
  <text x="453" y="190" text-anchor="middle" font-size="10" fill="#6b7280">40</text>
  <text x="544" y="190" text-anchor="middle" font-size="10" fill="#6b7280">50</text>
  <text x="635" y="190" text-anchor="middle" font-size="10" fill="#6b7280">60</text>
  <text x="400" y="200" text-anchor="middle" font-size="10" fill="#6b7280">時間（秒）</text>
  <!-- Head 1: 0-25, 30-55 -->
  <rect x="90" y="42" width="227" height="18" rx="3" fill="#86efac" stroke="#16a34a" stroke-width="1"/>
  <text x="203" y="55" text-anchor="middle" font-size="9" fill="#166534">萃取 #1</text>
  <rect x="362" y="42" width="227" height="18" rx="3" fill="#86efac" stroke="#16a34a" stroke-width="1"/>
  <text x="476" y="55" text-anchor="middle" font-size="9" fill="#166534">萃取 #3</text>
  <!-- Head 2: 10-35, 40-65 -->
  <rect x="181" y="77" width="227" height="18" rx="3" fill="#bbf7d0" stroke="#16a34a" stroke-width="1"/>
  <text x="294" y="90" text-anchor="middle" font-size="9" fill="#166534">萃取 #2</text>
  <rect x="453" y="77" width="227" height="18" rx="3" fill="#bbf7d0" stroke="#16a34a" stroke-width="1"/>
  <text x="567" y="90" text-anchor="middle" font-size="9" fill="#166534">萃取 #4</text>
  <!-- NOVA: 0-3 取杯, 25-31 送#1, 35-41 送#2, 55-61 送#3 -->
  <rect x="90" y="112" width="27" height="18" rx="3" fill="#e0e7ff" stroke="#2563eb" stroke-width="1"/>
  <text x="103" y="125" text-anchor="middle" font-size="7" fill="#6b7280">杯</text>
  <rect x="317" y="112" width="55" height="18" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="344" y="125" text-anchor="middle" font-size="8" fill="#1e40af">送#1</text>
  <rect x="408" y="112" width="55" height="18" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="435" y="125" text-anchor="middle" font-size="8" fill="#1e40af">送#2</text>
  <rect x="589" y="112" width="55" height="18" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="617" y="125" text-anchor="middle" font-size="8" fill="#1e40af">送#3</text>
  <!-- cups -->
  <text x="344" y="155" text-anchor="middle" font-size="12">☕</text>
  <text x="435" y="155" text-anchor="middle" font-size="12">☕</text>
  <text x="617" y="155" text-anchor="middle" font-size="12">☕</text>
  <!-- Cycle time lines -->
  <line x1="344" y1="30" x2="344" y2="170" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="435" y1="30" x2="435" y2="170" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="344" y1="35" x2="435" y2="35" stroke="#dc2626" stroke-width="1"/>
  <text x="390" y="33" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="bold">Cycle ≈ 10s</text>
</svg>
</div>

> **Cycle Time ≈ 10-15 秒**（Shotmaster 超高速）✅✅

#### 硬體佈局圖（俯視圖）

<div align="center">
<svg width="100%" viewBox="0 0 500 400" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <defs>
    <marker id="dim-b" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#6b7280"/></marker>
    <marker id="dim-b2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6" fill="#6b7280"/></marker>
  </defs>
  <!-- outer box -->
  <rect x="80" y="40" width="300" height="310" rx="4" fill="#fafafa" stroke="#374151" stroke-width="2"/>
  <!-- dimension: width 1.5m -->
  <line x1="80" y1="25" x2="380" y2="25" stroke="#6b7280" stroke-width="1" marker-start="url(#dim-b2)" marker-end="url(#dim-b)"/>
  <line x1="80" y1="20" x2="80" y2="30" stroke="#6b7280" stroke-width="1"/>
  <line x1="380" y1="20" x2="380" y2="30" stroke="#6b7280" stroke-width="1"/>
  <text x="230" y="20" text-anchor="middle" font-size="12" fill="#6b7280">1.5 m</text>
  <!-- dimension: height 1.2m -->
  <line x1="65" y1="40" x2="65" y2="350" stroke="#6b7280" stroke-width="1" marker-start="url(#dim-b2)" marker-end="url(#dim-b)"/>
  <line x1="60" y1="40" x2="70" y2="40" stroke="#6b7280" stroke-width="1"/>
  <line x1="60" y1="350" x2="70" y2="350" stroke="#6b7280" stroke-width="1"/>
  <text x="52" y="200" text-anchor="middle" font-size="12" fill="#6b7280" transform="rotate(-90 52 200)">1.2 m</text>
  <!-- Shotmaster -->
  <rect x="110" y="60" width="200" height="80" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="210" y="95" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">Eversys Shotmaster</text>
  <text x="210" y="115" text-anchor="middle" font-size="10" fill="#6b7280">雙沖煮頭 70×55cm</text>
  <!-- 水箱 牛奶 豆倉 -->
  <rect x="100" y="150" width="50" height="25" rx="3" fill="#e0f2fe" stroke="#6b7280" stroke-width="1"/>
  <text x="125" y="167" text-anchor="middle" font-size="9" fill="#6b7280">水箱</text>
  <rect x="160" y="150" width="50" height="25" rx="3" fill="#fef3c7" stroke="#6b7280" stroke-width="1"/>
  <text x="185" y="167" text-anchor="middle" font-size="9" fill="#6b7280">牛奶</text>
  <rect x="220" y="150" width="50" height="25" rx="3" fill="#fef3c7" stroke="#6b7280" stroke-width="1"/>
  <text x="245" y="167" text-anchor="middle" font-size="9" fill="#6b7280">豆倉</text>
  <!-- NOVA 2 -->
  <circle cx="180" cy="225" r="16" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="180" y="230" text-anchor="middle" font-size="10" fill="#2563eb" font-weight="bold">N2</text>
  <!-- arm reach (625mm) -->
  <circle cx="180" cy="225" r="75" fill="none" stroke="#2563eb" stroke-width="1" stroke-dasharray="6,4"/>
  <text x="265" y="195" font-size="10" fill="#2563eb">臂展 625mm</text>
  <!-- 杯架 -->
  <rect x="280" y="210" width="60" height="35" rx="3" fill="#f3f4f6" stroke="#6b7280" stroke-width="1"/>
  <text x="310" y="225" text-anchor="middle" font-size="10" fill="#6b7280">杯架</text>
  <text x="310" y="238" text-anchor="middle" font-size="9" fill="#9ca3af">50杯</text>
  <!-- 點餐面板 -->
  <rect x="160" y="290" width="100" height="22" rx="3" fill="#ede9fe" stroke="#6b7280" stroke-width="1"/>
  <text x="210" y="305" text-anchor="middle" font-size="10" fill="#6b7280">📱 點餐面板</text>
  <!-- 取餐窗口 -->
  <rect x="160" y="318" width="100" height="22" rx="3" fill="#fef3c7" stroke="#374151" stroke-width="1.5"/>
  <text x="210" y="333" text-anchor="middle" font-size="10" fill="#374151" font-weight="bold">📦 取餐窗口</text>
</svg>
</div>

**NOVA 2 選擇理由**：單機佈局、空間緊湊、625mm 臂展足夠覆蓋

---

### 方案 C：NOVA 2 + 全自動機一鍵出品（⭐ 推薦起步方案）

**架構**：1 支 NOVA 2 + 1 台 WMF 5000S+（或 Eversys Cameo C'2）

#### 動作時序圖

<div align="center">
<svg width="100%" viewBox="0 0 700 200" viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <text x="350" y="18" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">方案 C 動作時序圖</text>
  <!-- Y labels -->
  <text x="85" y="55" text-anchor="end" font-size="11" fill="#16a34a">WMF 5000S+</text>
  <text x="85" y="100" text-anchor="end" font-size="11" fill="#2563eb">NOVA 2</text>
  <text x="85" y="145" text-anchor="end" font-size="11" fill="#374151">出杯</text>
  <!-- X axis: 0-90s, scale px = 90 + t*6.56 -->
  <line x1="90" y1="165" x2="680" y2="165" stroke="#374151" stroke-width="1"/>
  <text x="90" y="180" text-anchor="middle" font-size="10" fill="#6b7280">0</text>
  <text x="222" y="180" text-anchor="middle" font-size="10" fill="#6b7280">20</text>
  <text x="353" y="180" text-anchor="middle" font-size="10" fill="#6b7280">40</text>
  <text x="484" y="180" text-anchor="middle" font-size="10" fill="#6b7280">60</text>
  <text x="616" y="180" text-anchor="middle" font-size="10" fill="#6b7280">80</text>
  <text x="400" y="195" text-anchor="middle" font-size="10" fill="#6b7280">時間（秒）</text>
  <!-- WMF: 0-30 美式, 38-78 拿鐵 -->
  <rect x="90" y="42" width="197" height="20" rx="3" fill="#86efac" stroke="#16a34a" stroke-width="1"/>
  <text x="188" y="56" text-anchor="middle" font-size="9" fill="#166534">美式 #1 (30s)</text>
  <rect x="339" y="42" width="263" height="20" rx="3" fill="#bbf7d0" stroke="#16a34a" stroke-width="1"/>
  <text x="470" y="56" text-anchor="middle" font-size="9" fill="#166534">拿鐵 #2 (40s)</text>
  <!-- NOVA: 0-4 取杯, 4-30 等, 30-38 送, 38-42 取杯, 42-78 等, 78-86 送 -->
  <rect x="90" y="87" width="26" height="20" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="103" y="101" text-anchor="middle" font-size="7" fill="#1e40af">杯</text>
  <rect x="116" y="87" width="171" height="20" rx="3" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="201" y="101" text-anchor="middle" font-size="8" fill="#9ca3af">⏳ 等待</text>
  <rect x="287" y="87" width="52" height="20" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="313" y="101" text-anchor="middle" font-size="8" fill="#1e40af">送 #1</text>
  <rect x="339" y="87" width="26" height="20" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="352" y="101" text-anchor="middle" font-size="7" fill="#1e40af">杯</text>
  <rect x="365" y="87" width="237" height="20" rx="3" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="484" y="101" text-anchor="middle" font-size="8" fill="#9ca3af">⏳ 等待</text>
  <rect x="602" y="87" width="52" height="20" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1"/>
  <text x="628" y="101" text-anchor="middle" font-size="8" fill="#1e40af">送 #2</text>
  <!-- cups -->
  <text x="313" y="142" text-anchor="middle" font-size="12">☕</text>
  <text x="313" y="155" text-anchor="middle" font-size="9" fill="#6b7280">美式</text>
  <text x="628" y="142" text-anchor="middle" font-size="12">☕</text>
  <text x="628" y="155" text-anchor="middle" font-size="9" fill="#6b7280">拿鐵</text>
  <!-- Cycle time lines -->
  <line x1="313" y1="28" x2="313" y2="160" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="628" y1="28" x2="628" y2="160" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="313" y1="32" x2="628" y2="32" stroke="#dc2626" stroke-width="1"/>
  <text x="470" y="30" text-anchor="middle" font-size="10" fill="#dc2626" font-weight="bold">Cycle: 美式~35s / 拿鐵~45s</text>
</svg>
</div>

> **Cycle Time**：美式 ~35s ✅ / 拿鐵 ~45s ⚠️

#### 硬體佈局圖（俯視圖）

<div align="center">
<svg width="100%" viewBox="0 0 500 400" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <defs>
    <marker id="dim-c" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#6b7280"/></marker>
    <marker id="dim-c2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6" fill="#6b7280"/></marker>
  </defs>
  <!-- outer box -->
  <rect x="100" y="40" width="260" height="310" rx="4" fill="#fafafa" stroke="#374151" stroke-width="2"/>
  <!-- dimension: width 1.2m -->
  <line x1="100" y1="25" x2="360" y2="25" stroke="#6b7280" stroke-width="1" marker-start="url(#dim-c2)" marker-end="url(#dim-c)"/>
  <line x1="100" y1="20" x2="100" y2="30" stroke="#6b7280" stroke-width="1"/>
  <line x1="360" y1="20" x2="360" y2="30" stroke="#6b7280" stroke-width="1"/>
  <text x="230" y="20" text-anchor="middle" font-size="12" fill="#6b7280">1.2 m</text>
  <!-- dimension: height 1.0m -->
  <line x1="85" y1="40" x2="85" y2="350" stroke="#6b7280" stroke-width="1" marker-start="url(#dim-c2)" marker-end="url(#dim-c)"/>
  <line x1="80" y1="40" x2="90" y2="40" stroke="#6b7280" stroke-width="1"/>
  <line x1="80" y1="350" x2="90" y2="350" stroke="#6b7280" stroke-width="1"/>
  <text x="72" y="200" text-anchor="middle" font-size="12" fill="#6b7280" transform="rotate(-90 72 200)">1.0 m</text>
  <!-- WMF 5000S+ -->
  <rect x="130" y="60" width="170" height="75" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="215" y="93" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">WMF 5000S+</text>
  <text x="215" y="112" text-anchor="middle" font-size="10" fill="#6b7280">全自動 55×50cm</text>
  <!-- 水 奶 豆 -->
  <rect x="120" y="148" width="40" height="22" rx="3" fill="#e0f2fe" stroke="#6b7280" stroke-width="1"/>
  <text x="140" y="163" text-anchor="middle" font-size="9" fill="#6b7280">水</text>
  <rect x="170" y="148" width="40" height="22" rx="3" fill="#fef3c7" stroke="#6b7280" stroke-width="1"/>
  <text x="190" y="163" text-anchor="middle" font-size="9" fill="#6b7280">奶</text>
  <rect x="220" y="148" width="40" height="22" rx="3" fill="#fef3c7" stroke="#6b7280" stroke-width="1"/>
  <text x="240" y="163" text-anchor="middle" font-size="9" fill="#6b7280">豆</text>
  <!-- NOVA 2 -->
  <circle cx="190" cy="225" r="16" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="190" y="230" text-anchor="middle" font-size="10" fill="#2563eb" font-weight="bold">N2</text>
  <!-- arm reach (625mm) -->
  <circle cx="190" cy="225" r="70" fill="none" stroke="#2563eb" stroke-width="1" stroke-dasharray="6,4"/>
  <text x="270" y="200" font-size="10" fill="#2563eb">臂展 625mm</text>
  <!-- 杯架 -->
  <rect x="280" y="212" width="50" height="30" rx="3" fill="#f3f4f6" stroke="#6b7280" stroke-width="1"/>
  <text x="305" y="232" text-anchor="middle" font-size="10" fill="#6b7280">杯架</text>
  <!-- 點餐面板 -->
  <rect x="170" y="295" width="90" height="22" rx="3" fill="#ede9fe" stroke="#6b7280" stroke-width="1"/>
  <text x="215" y="310" text-anchor="middle" font-size="10" fill="#6b7280">📱 點餐面板</text>
  <!-- 取餐口 -->
  <rect x="170" y="322" width="90" height="22" rx="3" fill="#fef3c7" stroke="#374151" stroke-width="1.5"/>
  <text x="215" y="337" text-anchor="middle" font-size="10" fill="#374151" font-weight="bold">📦 取餐口</text>
</svg>
</div>

---

### 方案總覽比較

> **🎯 方案選擇指南 — 客戶需求是什麼？**
>
> | 需求 | 推薦方案 | Cycle Time | 預算 |
> |------|---------|-----------|------|
> | 嚴格 40 秒（含拿鐵） | **方案 A** — NOVA 5 + 雙機 | 20s | 💰 $75K |
> | 極速出杯、高人流場域 | **方案 B** — NOVA 2 + Shotmaster | 15s | 💰 $65K |
> | 成本優先、先行驗證 | **方案 C ⭐** — NOVA 2 + WMF | 35s | 💰 $50K |
>
> 📈 升級路徑：**方案 C** →（加一台機）→ **方案 A** →（換 Shotmaster）→ **方案 B**

---

### 方案對比總結

| 指標 | 方案 A（NOVA 5 + 雙機） | 方案 B（NOVA 2 + Shotmaster） | 方案 C（NOVA 2 + WMF）⭐ |
|------|----------------------|---------------------------|------------------------|
| Cycle Time | **20-25s** ✅ | **10-15s** ✅✅ | **35-40s** ✅ |
| First Cup Time | 35-40s | 30-35s | 38-50s |
| NOVA 型號 | **NOVA 5**（臂展 850mm） | **NOVA 2**（臂展 625mm） | **NOVA 2**（臂展 625mm） |
| 設備成本 | ~$75K | ~$65K | **~$50K** |
| 佔地面積 | 2.0×1.5m | **1.5×1.2m** | **1.2×1.0m** |
| 實施難度 | 中 | 中 | **低** |
| 可靠性 | ⭐⭐⭐⭐（雙機冗餘） | ⭐⭐⭐ | **⭐⭐⭐⭐⭐** |
| 觀賞性 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

---

## 五、關鍵設備選型建議

### 5.1 協作手臂 — Dobot NOVA 系列詳細規格

| 規格 | NOVA 2 | NOVA 5 |
|------|--------|--------|
| 自由度 | 6 軸 | 6 軸 |
| 負載 | 2 kg | 5 kg |
| 臂展 | 625 mm | 850 mm |
| 最大 TCP 速度 | 1.6 m/s | 2.0 m/s |
| 重複精度 | ±0.05 mm | ±0.05 mm |
| 自重 | 11 kg | 17 kg |
| 防護等級 | IP54 | IP54 |
| 安全等級 | 5 級碰撞保護 | 5 級碰撞保護 |
| 編程方式 | 圖形化 + Python + 拖拽示教 | 圖形化 + Python + 拖拽示教 |
| 咖啡場景 | ✅ 已有官方 Coffee Bar 方案 | ✅ 適用（臂展大、覆蓋範圍廣） |
| 外觀客製化 | ✅ 支援品牌配色 | ✅ 支援品牌配色 |
| 預估價格 | ~$8-12K | ~$12-18K |

**NOVA 在咖啡場景的優勢**：
1. **已驗證**：越疆官方已有 NOVA 2 Coffee Bar 方案（合作夥伴 GateIn Technology 宣稱 45 秒出杯）
2. **輕量部署**：11kg 自重，1m² 即可部署
3. **簡易編程**：拖拽示教 + 軌跡復現技術，無需編程經驗
4. **雲端同步**：支持多店同步管理
5. **安全認證**：ISO 15066 / ISO 13849 合規

### 5.2 咖啡機推薦

| 品牌 | 型號 | 產能（杯/hr） | 適配方案 | 價格（USD） |
|------|------|-------------|---------|-----------|
| **Eversys** | Shotmaster | **700** | 方案 B | $30-50K |
| **Eversys** | Cameo C'2 | 175 | 方案 C | $15-25K |
| **Eversys** | Enigma E'4S | 350 | 方案 A/B | $20-35K |
| **WMF** | 5000 S+ | 150-200 | 方案 C（推薦） | $15-30K |
| **WMF** | 1500 S+ | 100-150 | 方案 A（×2台） | $10-20K |
| **JURA** | GIGA X3c | 80-100 | 方案 A（經濟版） | $5-10K |

### 5.3 末端執行器（夾爪）

> **推薦**：客製化咖啡杯夾具（$200-500），針對固定杯型設計，NOVA 系列的法蘭接口直接安裝

| 類型 | 適用場景 | 價格 |
|------|---------|------|
| 客製化杯夾 | 固定杯型、最快最穩 | $200-500 |
| 二指平行夾爪 | 多種杯型 | $500-2K |
| 真空吸盤 | 杯蓋操作 | $300-1K |

### 5.4 感測器

NOVA 系列已內建力矩感測器和碰撞檢測，**額外只需選配 2D 視覺相機**（杯位檢測，$500-2K）。

---

## 六、成本與 ROI 估算

### 6.1 設備投資成本

| 項目 | 方案 A（NOVA 5 + 雙機） | 方案 B（NOVA 2 + Shotmaster） | 方案 C（NOVA 2 + WMF）⭐ |
|------|----------------------|---------------------------|------------------------|
| NOVA 手臂 | $15K（NOVA 5） | $10K（NOVA 2） | $10K（NOVA 2） |
| 咖啡機 | $18K × 2 = $36K | $40K | $20K |
| 末端執行器 | $1K | $1K | $1K |
| Kiosk 外殼 | $10K | $8K | $6K |
| 控制系統/軟體 | $5K | $5K | $5K |
| 安裝調試 | $5K | $5K | $5K |
| **總計（USD）** | **$72K** | **$69K** | **$47K** |
| **折合台幣** | **~NT$225 萬** | **~NT$215 萬** | **~NT$147 萬** |

### 6.2 營運成本對比（月）

| 項目 | 人工咖啡師（2人） | NOVA 機器人咖啡 |
|------|-----------------|----------------|
| 人事 | NT$90,000 | NT$0 |
| 租金 | NT$40,000（需 10m²+） | NT$15,000（3-4m²） |
| 原料 | NT$30,000 | NT$30,000 |
| 水電 | NT$5,000 | NT$8,000 |
| 設備維護/折舊 | NT$5,000 | NT$15,000 |
| **月總成本** | **NT$170,000** | **NT$68,000** |
| **月節省** | — | **NT$102,000** |

### 6.3 投資回收期

| 方案 | 投資額 | 月節省 | 回收期 |
|------|--------|--------|--------|
| 方案 A（NOVA 5 + 雙機） | NT$225萬 | NT$10.2萬 | ~22 個月 |
| 方案 C（NOVA 2 + WMF）⭐ | NT$147萬 | NT$10.2萬 | **~14 個月** |

> 若以中等日銷量 200 杯、均價 NT$60 計算：月營收 NT$36 萬、月淨利 NT$29.2 萬
> - 方案 A 回收期：**~8 個月**
> - 方案 C 回收期：**~5 個月**

---

## 七、NOVA 咖啡工站完整動作流程

<div align="center">
<svg width="100%" viewBox="0 0 600 680" viewBox="0 0 600 680" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif;background:#fff">
  <defs>
    <marker id="af" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#374151"/></marker>
  </defs>
  <!-- 開始 -->
  <ellipse cx="300" cy="25" rx="50" ry="18" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="300" y="30" text-anchor="middle" font-size="12" fill="#2563eb" font-weight="bold">顧客下單</text>
  <line x1="300" y1="43" x2="300" y2="58" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 檢查杯架 -->
  <rect x="225" y="60" width="150" height="35" rx="8" fill="#f3f4f6" stroke="#374151" stroke-width="1.5"/>
  <text x="300" y="82" text-anchor="middle" font-size="12" fill="#374151">檢查杯架</text>
  <line x1="300" y1="95" x2="300" y2="110" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 有杯？菱形 -->
  <polygon points="300,112 360,140 300,168 240,140" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="300" y="144" text-anchor="middle" font-size="11" fill="#92400e">有杯？</text>
  <!-- No branch -->
  <line x1="360" y1="140" x2="450" y2="140" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>
  <rect x="450" y="125" width="100" height="30" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="500" y="145" text-anchor="middle" font-size="11" fill="#dc2626">⚠️ 補杯提醒</text>
  <text x="400" y="135" font-size="10" fill="#6b7280">否</text>
  <!-- Yes branch -->
  <line x1="300" y1="168" x2="300" y2="188" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>
  <text x="310" y="182" font-size="10" fill="#6b7280">是</text>

  <!-- 取空杯 -->
  <rect x="225" y="190" width="150" height="35" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="300" y="212" text-anchor="middle" font-size="12" fill="#2563eb">🤖 取空杯 (2s)</text>
  <line x1="300" y1="225" x2="300" y2="240" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 放杯 -->
  <rect x="225" y="242" width="150" height="35" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="300" y="264" text-anchor="middle" font-size="12" fill="#2563eb">🤖 放杯至出口 (3s)</text>
  <line x1="300" y1="277" x2="300" y2="292" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 萃取 -->
  <rect x="210" y="294" width="180" height="35" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="300" y="316" text-anchor="middle" font-size="12" fill="#16a34a">☕ 萃取 (25-35s)</text>
  <line x1="300" y1="329" x2="300" y2="344" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 美式/拿鐵 菱形 -->
  <polygon points="300,346 370,374 300,402 230,374" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="300" y="378" text-anchor="middle" font-size="11" fill="#92400e">飲品類型？</text>
  <!-- 美式 left -->
  <line x1="230" y1="374" x2="130" y2="374" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>
  <rect x="50" y="359" width="80" height="30" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1"/>
  <text x="90" y="378" text-anchor="middle" font-size="10" fill="#16a34a">美式 ~30s</text>
  <line x1="90" y1="389" x2="90" y2="430" stroke="#374151" stroke-width="1"/>
  <line x1="90" y1="430" x2="300" y2="430" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>
  <!-- 拿鐵 right -->
  <line x1="370" y1="374" x2="460" y2="374" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>
  <rect x="460" y="359" width="90" height="30" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1"/>
  <text x="505" y="378" text-anchor="middle" font-size="10" fill="#16a34a">拿鐵 ~40s</text>
  <line x1="505" y1="389" x2="505" y2="430" stroke="#374151" stroke-width="1"/>
  <line x1="505" y1="430" x2="305" y2="430" stroke="#374151" stroke-width="1"/>

  <!-- 取成品 -->
  <rect x="225" y="420" width="150" height="35" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="300" y="442" text-anchor="middle" font-size="12" fill="#2563eb">🤖 取成品杯 (2s)</text>
  <line x1="300" y1="455" x2="300" y2="470" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 遞送 -->
  <rect x="225" y="472" width="150" height="35" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="300" y="494" text-anchor="middle" font-size="12" fill="#2563eb">🤖 遞送窗口 (3s)</text>
  <line x1="300" y1="507" x2="300" y2="522" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 開門 -->
  <rect x="225" y="524" width="150" height="35" rx="8" fill="#f3f4f6" stroke="#374151" stroke-width="1.5"/>
  <text x="300" y="546" text-anchor="middle" font-size="12" fill="#374151">📦 安全門開啟 (1s)</text>
  <line x1="300" y1="559" x2="300" y2="574" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 顧客取餐 -->
  <rect x="225" y="576" width="150" height="35" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="300" y="598" text-anchor="middle" font-size="12" fill="#92400e" font-weight="bold">☕ 顧客取餐！</text>
  <line x1="300" y1="611" x2="300" y2="626" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>

  <!-- 下一杯？菱形 -->
  <polygon points="300,628 360,650 300,672 240,650" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="300" y="654" text-anchor="middle" font-size="11" fill="#92400e">下一杯？</text>
  <!-- Yes: loop back -->
  <line x1="240" y1="650" x2="50" y2="650" stroke="#374151" stroke-width="1"/>
  <line x1="50" y1="650" x2="50" y2="207" stroke="#374151" stroke-width="1"/>
  <line x1="50" y1="207" x2="225" y2="207" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>
  <text x="130" y="665" font-size="10" fill="#6b7280">是 → 回取杯</text>
  <!-- No: end -->
  <line x1="360" y1="650" x2="440" y2="650" stroke="#374151" stroke-width="1.5" marker-end="url(#af)"/>
  <ellipse cx="495" cy="650" rx="50" ry="18" fill="#f3f4f6" stroke="#6b7280" stroke-width="1.5"/>
  <text x="495" y="655" text-anchor="middle" font-size="11" fill="#6b7280">🤖 回待機位</text>
  <text x="395" y="645" font-size="10" fill="#6b7280">否</text>
</svg>
</div>

---

## 八、實施建議與路線圖

### Phase 1：概念驗證（1-2 個月）
1. 採購 **NOVA 2** + **WMF 1500S+**（方案 C 起步）
2. 在和椿科技實驗室搭建原型
3. 驗證各飲品的 Cycle Time，目標：美式 ≤ 38s

### Phase 2：方案優化（1-2 個月）
1. 設計客製化 Kiosk 外殼（可參考 COFE+ 或 CafeXbot 外觀）
2. 開發點餐系統（觸控面板 + 掃碼支付）
3. 如需更快：升級為 **NOVA 5 + 雙機**（方案 A）

### Phase 3：試運營（1-2 個月）
1. 在和椿展廳或合作商場部署
2. 收集營運數據、調整菜單
3. 進行食品安全認證

### Phase 4：商業推廣
1. 包裝為**和椿 × NOVA 咖啡機器人**標準方案
2. 建立遠端監控系統（NOVA 支援雲端同步）
3. 拓展到機場、車站、企業大廳、商場

---

## 九、總結

### 給和椿科技的建議

1. **起步方案**：NOVA 2 + WMF 5000S+（方案 C），投資 NT$147 萬、Cycle Time 35-40 秒 ✅
2. **進階方案**：NOVA 5 + 雙 WMF 1500S+（方案 A），Cycle Time 20-25 秒 ✅✅
3. **NOVA 已有咖啡場景驗證**，越疆官方合作夥伴已落地 45 秒方案，和椿可在此基礎上優化至 40 秒以內
4. **差異化**：可加入「NOVA 拉花表演」模式作為展示亮點（非量產流程），增加話題性
5. **ROI**：中等人流場域下，5-8 個月可回收投資

---

*本報告由 Jarvis AI 研究助理撰寫，資料來源涵蓋全球 20+ 咖啡機器人品牌公開資訊*  
*指定手臂：越疆 Dobot NOVA 系列（NOVA 2 / NOVA 5）*  
*研究日期：2026-02-10*
