#!/usr/bin/env python3
# 🔒 AUDIT: 2026-03-08 | score=100/100 | full-audit
# -*- coding: utf-8 -*-
"""
分析報表產生器
負責產出結構化情報分析報告
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

console = Console()
logger = logging.getLogger(__name__)


@dataclass
class AnalysisSummary:
    """分析摘要"""
    total_sources: int
    total_words: int
    categories: Dict[str, int]
    languages: Dict[str, int]
    translation_count: int
    avg_content_length: float


class ReportGenerator:
    """報表產生器"""
    
    def __init__(self, config: Optional[Dict] = None):
        """
        初始化報表產生器
        
        Args:
            config: 設定字典
        """
        self.config = config or {}
        self.template_dir = Path(self.config.get("template_dir", "templates"))
        self.include_summary = self.config.get("include_summary", True)
        self.include_translation = self.config.get("include_translation", True)
        self.include_metadata = self.config.get("include_metadata", True)
        
        logger.info("報表產生器已初始化")
    
    def analyze_data(self, items: List[Dict[str, Any]]) -> AnalysisSummary:
        """
        分析資料統計
        
        Args:
            items: 資料項目列表
            
        Returns:
            分析摘要
        """
        categories = {}
        languages = {}
        total_words = 0
        translation_count = 0
        
        for item in items:
            # 分類統計
            category = item.get("category", "未分類")
            categories[category] = categories.get(category, 0) + 1
            
            # 語言統計
            lang = item.get("detected_language", "unknown")
            languages[lang] = languages.get(lang, 0) + 1
            
            # 字數統計
            content = item.get("content", "")
            if content:
                total_words += len(content.split())
            
            # 翻譯統計
            if item.get("translations") or item.get("has_translation"):
                translation_count += 1
        
        avg_length = total_words / len(items) if items else 0
        
        return AnalysisSummary(
            total_sources=len(items),
            total_words=total_words,
            categories=categories,
            languages=languages,
            translation_count=translation_count,
            avg_content_length=avg_length
        )
    
    def generate_markdown_report(
        self, 
        items: List[Dict[str, Any]],
        report_title: str = "情報分析報告",
        query_info: Optional[str] = None
    ) -> str:
        """
        產生 Markdown 格式報告
        
        Args:
            items: 資料項目列表
            report_title: 報告標題
            query_info: 查詢資訊
            
        Returns:
            Markdown 報告文字
        """
        summary = self.analyze_data(items)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        lines = [
            f"# {report_title}",
            "",
            f"**產出時間:** {timestamp}",
            f"**資料來源數:** {summary.total_sources}",
            "",
            "---",
            "",
        ]
        
        if query_info:
            lines.extend([
                "## 查詢資訊",
                "",
                f"{query_info}",
                "",
                "---",
                "",
            ])
        
        # 統計摘要
        if self.include_summary:
            lines.extend([
                "## 📊 統計摘要",
                "",
                f"- **總來源數:** {summary.total_sources}",
                f"- **總字數:** {summary.total_words:,}",
                f"- **平均長度:** {summary.avg_content_length:.1f} 字",
                f"- **已翻譯:** {summary.translation_count} 項",
                "",
                "### 分類分佈",
                "",
            ])
            
            for cat, count in sorted(summary.categories.items(), key=lambda x: -x[1]):
                lines.append(f"- {cat}: {count} 項")
            
            lines.extend(["", "### 語言分佈", ""])
            for lang, count in sorted(summary.languages.items(), key=lambda x: -x[1]):
                lines.append(f"- {lang}: {count} 項")
            
            lines.extend(["", "---", ""])
        
        # 詳細內容
        lines.extend([
            "## 📑 詳細情報",
            "",
        ])
        
        for i, item in enumerate(items, 1):
            title = item.get("title", "無標題")
            url = item.get("url", "")
            category = item.get("category", "未分類")
            content = item.get("content", "")[:1000]  # 限制長度
            
            lines.extend([
                f"### {i}. {title}",
                "",
                f"- **來源:** [{url}]({url})",
                f"- **分類:** {category}",
                "",
            ])
            
            if self.include_translation and item.get("translations"):
                lines.extend([
                    "**原文內容:**",
                    "",
                    f"> {content[:500]}..." if len(content) > 500 else f"> {content}",
                    "",
                    "**中文翻譯:**",
                    "",
                ])
                
                for field, trans in item["translations"].items():
                    if field == "content":
                        translated = trans.get("translated", "")[:500]
                        lines.append(f"> {translated}..." if len(translated) > 500 else f"> {translated}")
                        lines.append("")
            else:
                lines.extend([
                    "**內容摘要:**",
                    "",
                    f"> {content[:500]}..." if len(content) > 500 else f"> {content}",
                    "",
                ])
            
            lines.append("---")
            lines.append("")
        
        return "\n".join(lines)
    
    def generate_html_report(
        self, 
        items: List[Dict[str, Any]],
        report_title: str = "情報分析報告"
    ) -> str:
        """
        產生 HTML 格式報告
        
        Args:
            items: 資料項目列表
            report_title: 報告標題
            
        Returns:
            HTML 報告文字
        """
        summary = self.analyze_data(items)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        html_template = f"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{report_title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2em;
        }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .stat-card h3 {{
            margin: 0 0 10px 0;
            color: #667eea;
        }}
        .stat-card .number {{
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }}
        .content {{
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .item {{
            border-bottom: 1px solid #eee;
            padding: 20px 0;
        }}
        .item:last-child {{
            border-bottom: none;
        }}
        .item h3 {{
            color: #333;
            margin: 0 0 10px 0;
        }}
        .item a {{
            color: #667eea;
            text-decoration: none;
        }}
        .item a:hover {{
            text-decoration: underline;
        }}
        .category {{
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            margin-bottom: 10px;
        }}
        .original {{
            color: #666;
            font-style: italic;
            margin: 10px 0;
            padding: 10px;
            background: #f5f5f5;
            border-left: 4px solid #ccc;
        }}
        .translated {{
            color: #333;
            margin: 10px 0;
            padding: 10px;
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🦞 {report_title}</h1>
        <p>產出時間: {timestamp}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>資料來源</h3>
            <div class="number">{summary.total_sources}</div>
        </div>
        <div class="stat-card">
            <h3>總字數</h3>
            <div class="number">{summary.total_words:,}</div>
        </div>
        <div class="stat-card">
            <h3>已翻譯</h3>
            <div class="number">{summary.translation_count}</div>
        </div>
    </div>
    
    <div class="content">
        <h2>📑 情報詳情</h2>
"""
        
        for item in items:
            title = item.get("title", "無標題")
            url = item.get("url", "")
            category = item.get("category", "未分類")
            content = item.get("content", "")[:800]
            
            html_template += f"""
        <div class="item">
            <span class="category">{category}</span>
            <h3><a href="{url}" target="_blank">{title}</a></h3>
            <div class="original">{content}...</div>
"""
            
            if item.get("translations"):
                for field, trans in item["translations"].items():
                    if field == "content":
                        translated = trans.get("translated", "")[:800]
                        html_template += f'<div class="translated">🌐 {translated}...</div>'
            
            html_template += "</div>"
        
        html_template += """
    </div>
</body>
</html>"""
        
        return html_template
    
    def save_report(
        self, 
        content: str, 
        filename: str,
        output_dir: str = "reports"
    ) -> str:
        """
        儲存報告到檔案
        
        Args:
            content: 報告內容
            filename: 檔案名稱
            output_dir: 輸出目錄
            
        Returns:
            儲存的檔案路徑
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # 加入日期資料夾
        date_folder = datetime.now().strftime("%Y/%m/%d")
        full_path = output_path / date_folder / filename
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        logger.info(f"報告已儲存: {full_path}")
        return str(full_path)
    
    def display_summary(self, items: List[Dict[str, Any]]):
        """
        在終端機顯示摘要
        
        Args:
            items: 資料項目列表
        """
        summary = self.analyze_data(items)
        
        # 創建統計表格
        table = Table(title="📊 情報分析摘要")
        table.add_column("指標", style="cyan")
        table.add_column("數值", style="green")
        
        table.add_row("總來源數", str(summary.total_sources))
        table.add_row("總字數", f"{summary.total_words:,}")
        table.add_row("平均長度", f"{summary.avg_content_length:.1f} 字")
        table.add_row("已翻譯項目", str(summary.translation_count))
        
        console.print(table)
        
        # 分類分佈
        if summary.categories:
            cat_table = Table(title="📁 分類分佈")
            cat_table.add_column("分類", style="cyan")
            cat_table.add_column("數量", style="yellow")
            
            for cat, count in sorted(summary.categories.items(), key=lambda x: -x[1]):
                cat_table.add_row(cat, str(count))
            
            console.print(cat_table)
