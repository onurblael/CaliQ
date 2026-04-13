#!/usr/bin/env python3
"""
Check that all translation keys are present in all languages (PT/EN/ES).
Validates i18n-context.tsx for completeness.
"""

import re
import sys
from pathlib import Path
from collections import defaultdict


def extract_translation_keys(content: str, lang_name: str) -> dict:
    """Extract all translation keys for a specific language."""
    # Find the language object (e.g., "const en: TranslationKeys = {")
    pattern = rf"const {lang_name}:\s*TranslationKeys\s*=\s*{{([^;]+)}};"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return {}
    
    lang_content = match.group(1)
    
    # Extract nested structure (section: { key: value })
    keys = defaultdict(set)
    current_section = None
    
    for line in lang_content.split('\n'):
        line = line.strip()
        
        # Match section start (e.g., "common: {")
        section_match = re.match(r'(\w+):\s*{', line)
        if section_match:
            current_section = section_match.group(1)
            continue
        
        # Match key (e.g., "continue: "Continue",")
        key_match = re.match(r'(\w+):\s*["\']', line)
        if key_match and current_section:
            keys[current_section].add(key_match.group(1))
    
    return dict(keys)


def main():
    if len(sys.argv) != 2:
        print("Usage: python check_translations.py <path_to_i18n-context.tsx>")
        sys.exit(1)
    
    i18n_path = Path(sys.argv[1])
    if not i18n_path.exists():
        print(f"Error: File not found: {i18n_path}")
        sys.exit(1)
    
    content = i18n_path.read_text()
    
    # Extract keys for each language
    en_keys = extract_translation_keys(content, "en")
    pt_keys = extract_translation_keys(content, "pt")
    es_keys = extract_translation_keys(content, "es")
    
    print("🌍 Checking translation completeness...\n")
    
    all_sections = set(en_keys.keys()) | set(pt_keys.keys()) | set(es_keys.keys())
    
    has_errors = False
    
    for section in sorted(all_sections):
        en_section = en_keys.get(section, set())
        pt_section = pt_keys.get(section, set())
        es_section = es_keys.get(section, set())
        
        all_keys = en_section | pt_section | es_section
        
        missing_en = all_keys - en_section
        missing_pt = all_keys - pt_section
        missing_es = all_keys - es_section
        
        if missing_en or missing_pt or missing_es:
            print(f"📋 Section: {section}")
            
            if missing_en:
                has_errors = True
                print(f"   ❌ Missing in EN: {', '.join(sorted(missing_en))}")
            
            if missing_pt:
                has_errors = True
                print(f"   ❌ Missing in PT: {', '.join(sorted(missing_pt))}")
            
            if missing_es:
                has_errors = True
                print(f"   ❌ Missing in ES: {', '.join(sorted(missing_es))}")
            
            print()
        else:
            print(f"✅ Section '{section}': All translations complete ({len(all_keys)} keys)")
    
    print()
    
    if has_errors:
        print("❌ Translation check failed: Missing keys detected")
        sys.exit(1)
    else:
        print("✅ Translation check passed: All languages are complete")
        sys.exit(0)


if __name__ == "__main__":
    main()
