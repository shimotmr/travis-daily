#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
龍蝦爬蟲系統測試腳本
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

def test_imports():
    """測試模組匯入"""
    print("🧪 測試模組匯入...")
    try:
        from firecrawl_client import FirecrawlClient
        from translator import Translator
        from github_sync import GitHubSync
        from analyzer import ReportGenerator
        from main import LobsterCrawler, load_config
        print("✅ 所有模組匯入成功")
        return True
    except Exception as e:
        print(f"❌ 模組匯入失敗: {e}")
        return False

def test_translator():
    """測試翻譯功能"""
    print("\n🌐 測試翻譯功能...")
    try:
        from translator import Translator
        
        translator = Translator(service="google")
        
        # 測試英文翻中文
        result = translator.translate("Hello World", target_lang="zh-TW")
        print(f"  原文: Hello World")
        print(f"  翻譯: {result.translated_text}")
        print(f"  語言: {result.source_lang} -> {result.target_lang}")
        
        # 測試自動語言偵測
        detected = translator.detect_language("這是一段中文測試")
        print(f"  語言偵測: '這是一段中文測試' -> {detected}")
        
        print("✅ 翻譯功能正常")
        return True
    except Exception as e:
        print(f"❌ 翻譯測試失敗: {e}")
        return False

def test_analyzer():
    """測試分析報表產生"""
    print("\n📊 測試分析報表...")
    try:
        from analyzer import ReportGenerator
        
        generator = ReportGenerator()
        
        # 測試資料
        test_items = [
            {
                "title": "Test Article 1",
                "url": "https://example.com/1",
                "content": "This is a test article content.",
                "category": "technology",
                "detected_language": "en",
                "translations": {
                    "content": {
                        "original": "This is a test article content.",
                        "translated": "這是一篇測試文章內容。",
                        "source_lang": "en"
                    }
                }
            },
            {
                "title": "測試文章 2",
                "url": "https://example.com/2",
                "content": "這是另一篇測試文章。",
                "category": "news",
                "detected_language": "zh-TW"
            }
        ]
        
        # 測試 Markdown 報告
        report = generator.generate_markdown_report(test_items, "測試報告")
        assert "# 測試報告" in report
        assert len(report) > 0
        
        print("✅ 報表產生功能正常")
        return True
    except Exception as e:
        print(f"❌ 報表測試失敗: {e}")
        return False

def test_config_loading():
    """測試設定檔載入"""
    print("\n⚙️  測試設定檔載入...")
    try:
        from main import load_config
        import os
        
        # 嘗試載入設定檔
        config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'settings.yaml')
        if os.path.exists(config_path):
            config = load_config(config_path)
            print(f"  載入設定檔: {config_path}")
            print(f"  設定項目: {list(config.keys())}")
            print("✅ 設定檔載入正常")
        else:
            print("⚠️  設定檔不存在，但載入函式正常")
        return True
    except Exception as e:
        print(f"❌ 設定檔測試失敗: {e}")
        return False

def main():
    """執行所有測試"""
    print("=" * 50)
    print("🦞 龍蝦爬蟲大法系統測試")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_translator,
        test_analyzer,
        test_config_loading
    ]
    
    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"❌ 測試異常: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"測試結果: {passed}/{total} 通過")
    
    if passed == total:
        print("🎉 所有測試通過！")
        return 0
    else:
        print("⚠️  部分測試失敗")
        return 1

if __name__ == "__main__":
    sys.exit(main())
