#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自動翻譯模組
支援中英互譯，使用多種翻譯服務
"""

import re
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()
logger = logging.getLogger(__name__)


@dataclass
class TranslationResult:
    """翻譯結果"""
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    success: bool
    error: Optional[str] = None


class Translator:
    """自動翻譯器"""
    
    # 語言代碼映射
    LANG_MAP = {
        "zh": "zh-CN",
        "zh-TW": "zh-TW",
        "zh-CN": "zh-CN",
        "en": "en",
        "ja": "ja",
        "ko": "ko",
        "fr": "fr",
        "de": "de",
        "es": "es",
        "ru": "ru"
    }
    
    def __init__(self, service: str = "google", config: Optional[Dict] = None):
        """
        初始化翻譯器
        
        Args:
            service: 翻譯服務 (google, deep_translator)
            config: 其他設定
        """
        self.service = service
        self.config = config or {}
        self.translator = None
        self._init_translator()
        
        logger.info(f"翻譯器已初始化 (服務: {service})")
    
    def _init_translator(self):
        """初始化翻譯引擎"""
        try:
            if self.service == "google":
                from deep_translator import GoogleTranslator
                self.translator = GoogleTranslator
                
            elif self.service == "deepl":
                from deep_translator import DeeplTranslator
                api_key = self.config.get("deepl_api_key")
                if not api_key:
                    raise ValueError("DeepL 需要 API Key")
                self.translator = lambda source, target: DeeplTranslator(
                    api_key=api_key, source=source, target=target
                )
                
            elif self.service == "microsoft":
                from deep_translator import MicrosoftTranslator
                api_key = self.config.get("microsoft_api_key")
                if not api_key:
                    raise ValueError("Microsoft Translator 需要 API Key")
                self.translator = lambda source, target: MicrosoftTranslator(
                    api_key=api_key, source=source, target=target
                )
            else:
                raise ValueError(f"不支援的翻譯服務: {self.service}")
                
        except ImportError as e:
            logger.error(f"請安裝 deep_translator: pip install deep-translator")
            raise e
    
    def detect_language(self, text: str) -> str:
        """
        偵測文字語言
        
        Args:
            text: 輸入文字
            
        Returns:
            語言代碼
        """
        # 簡易偵測：檢查中文字元比例
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        total_chars = len(text.strip())
        
        if total_chars == 0:
            return "en"
        
        chinese_ratio = chinese_chars / total_chars
        
        if chinese_ratio > 0.3:
            return "zh-TW" if "繁" in text or "台" in text or "臺" in text else "zh-CN"
        else:
            return "en"
    
    def translate(
        self, 
        text: str, 
        source_lang: str = "auto",
        target_lang: str = "zh-TW"
    ) -> TranslationResult:
        """
        翻譯文字
        
        Args:
            text: 要翻譯的文字
            source_lang: 來源語言 (auto 為自動偵測)
            target_lang: 目標語言
            
        Returns:
            翻譯結果
        """
        if not text or not text.strip():
            return TranslationResult(
                original_text=text,
                translated_text=text,
                source_lang=source_lang,
                target_lang=target_lang,
                success=True
            )
        
        # 自動偵測語言
        if source_lang == "auto":
            source_lang = self.detect_language(text)
            
            # 如果已經是目標語言，直接返回
            if source_lang == target_lang:
                return TranslationResult(
                    original_text=text,
                    translated_text=text,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    success=True
                )
        
        # 映射語言代碼
        source = self.LANG_MAP.get(source_lang, source_lang)
        target = self.LANG_MAP.get(target_lang, target_lang)
        
        try:
            if self.service == "google":
                translator = self.translator(source=source, target=target)
                translated = translator.translate(text)
            else:
                translator = self.translator(source, target)
                translated = translator.translate(text)
            
            return TranslationResult(
                original_text=text,
                translated_text=translated,
                source_lang=source_lang,
                target_lang=target_lang,
                success=True
            )
            
        except Exception as e:
            logger.error(f"翻譯失敗: {str(e)}")
            return TranslationResult(
                original_text=text,
                translated_text=text,
                source_lang=source_lang,
                target_lang=target_lang,
                success=False,
                error=str(e)
            )
    
    def translate_document(
        self, 
        content: Dict[str, Any],
        fields_to_translate: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        翻譯文件內容
        
        Args:
            content: 文件內容字典
            fields_to_translate: 要翻譯的欄位列表
            
        Returns:
            包含翻譯的文件字典
        """
        fields_to_translate = fields_to_translate or ["title", "content", "description"]
        
        translated = content.copy()
        translations = {}
        
        for field in fields_to_translate:
            if field in content and isinstance(content[field], str):
                result = self.translate(content[field])
                if result.success and result.source_lang != result.target_lang:
                    translations[field] = {
                        "original": result.original_text,
                        "translated": result.translated_text,
                        "source_lang": result.source_lang
                    }
                    translated[f"{field}_zh"] = result.translated_text
        
        translated["translations"] = translations
        translated["has_translation"] = len(translations) > 0
        
        return translated
    
    def batch_translate(
        self, 
        texts: list,
        source_lang: str = "auto",
        target_lang: str = "zh-TW"
    ) -> list:
        """
        批次翻譯
        
        Args:
            texts: 文字列表
            source_lang: 來源語言
            target_lang: 目標語言
            
        Returns:
            翻譯結果列表
        """
        results = []
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task(f"翻譯 {len(texts)} 段文字...", total=len(texts))
            
            for text in texts:
                result = self.translate(text, source_lang, target_lang)
                results.append(result)
                progress.advance(task)
        
        successful = sum(1 for r in results if r.success)
        console.print(f"[bold green]✓ 翻譯完成: {successful}/{len(texts)}[/bold green]")
        
        return results
    
    def translate_markdown(
        self, 
        markdown_text: str,
        preserve_code_blocks: bool = True
    ) -> str:
        """
        翻譯 Markdown 內容，保留程式碼區塊
        
        Args:
            markdown_text: Markdown 文字
            preserve_code_blocks: 是否保留程式碼區塊
            
        Returns:
            翻譯後的 Markdown
        """
        if preserve_code_blocks:
            # 提取並保留程式碼區塊
            code_blocks = []
            
            def replace_code_block(match):
                code_blocks.append(match.group(0))
                return f"<<<CODE_BLOCK_{len(code_blocks)-1}>>>"
            
            # 替換程式碼區塊
            pattern = r'```[\s\S]*?```|`[^`]+`'
            text_without_code = re.sub(pattern, replace_code_block, markdown_text)
            
            # 翻譯文字
            result = self.translate(text_without_code)
            translated_text = result.translated_text if result.success else text_without_code
            
            # 還原程式碼區塊
            for i, block in enumerate(code_blocks):
                translated_text = translated_text.replace(f"<<<CODE_BLOCK_{i}>>>", block)
            
            return translated_text
        else:
            result = self.translate(markdown_text)
            return result.translated_text if result.success else markdown_text
