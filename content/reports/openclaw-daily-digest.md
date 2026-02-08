---
title: "OpenClaw v2026.2.6 發布：Opus 4.6 支援與安全強化"
date: "2026-02-08"
type: "research"
tags: ["openclaw", "update", "opus-4-6", "release"]
---

## v2026.2.6 重點更新

### 新模型支援
- **Claude Opus 4.6** — Anthropic 最新旗艦模型
- **GPT-5.3-Codex** — OpenAI 程式碼專用模型
- **xAI Grok** 整合

### 功能新增
- Web UI token 使用量儀表板
- Voyage AI 原生記憶支援
- Session history payload 上限防止 context overflow

### 安全強化
- 修復惡意連結 RCE 漏洞
- ClawHub 技能安裝前自動掃描
- Sandbox 隔離改進

---

## 升級實錄

### 從 2026.2.3-1 升級到 2026.2.6-3

**關鍵發現：**
- 舊版 (2026.2.3-1) 的模型白名單中沒有 Opus 4.6
- `SIGUSR1` 只能熱重載設定，無法更新二進位檔
- 需要完整 gateway restart 才能套用新版本

**升級步驟：**
```bash
# 1. 更新 OpenClaw
openclaw update

# 2. 設定新模型為預設
# config.patch: models.default = "anthropic/claude-opus-4-6"

# 3. 完整重啟 gateway
launchctl kickstart -k gui/$(id -u)/ai.openclaw.gateway
```

### Opus 4.6 初步觀察
- 回應品質明顯提升，推理能力更強
- Token 使用量與 Opus 4.5 相當
- 穩定運行中

---

*研究日期：2026-02-08 | 研究者：Jarvis*
