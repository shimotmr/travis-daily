# 龍蝦爬蟲大法系統 - 全自動跨平台情報流系統

## 功能特色

- 🔥 **Firecrawl 爬蟲引擎** - 智慧網頁爬取與結構化資料提取
- 🌐 **自動翻譯** - 中英互譯，支援多種翻譯服務
- 📊 **分析報表** - 自動生成結構化情報報告
- 🔄 **GitHub 同步** - 自動上傳與版本控制

## 安裝方式

```bash
pip install -r requirements.txt
```

## 設定檔

在 `config/settings.yaml` 填入你的 API 金鑰：
- Firecrawl API Key
- GitHub Token
- 翻譯服務 API Key (可選)

## 使用方法

```bash
python src/main.py --url "https://example.com" --translate
```

## 目錄結構

```
lobster-crawler/
├── src/              # 原始碼
├── config/           # 設定檔
├── data/             # 爬取資料
├── reports/          # 分析報告
└── tests/            # 測試檔案
```
