#!/usr/bin/env python3
"""
Validate that app-context.tsx has consistent structure:
- All fields in UserPreferences interface are in DEFAULT_PREFERENCES
- All functions in AppContextType are in the Provider value
- All setters have corresponding savePreferences calls
"""

import re
import sys
from pathlib import Path


def extract_interface_fields(content: str, interface_name: str) -> set:
    """Extract field names from a TypeScript interface."""
    pattern = rf"interface {interface_name}\s*{{([^}}]+)}}"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return set()
    
    interface_body = match.group(1)
    # Match field names (before : or ;)
    fields = re.findall(r"^\s*(\w+)\s*[?:]", interface_body, re.MULTILINE)
    return set(fields)


def extract_const_fields(content: str, const_name: str) -> set:
    """Extract field names from a const object."""
    pattern = rf"const {const_name}[^=]*=\s*{{([^}}]+)}}"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return set()
    
    obj_body = match.group(1)
    # Match field names (before : or ,)
    fields = re.findall(r"^\s*(\w+)\s*:", obj_body, re.MULTILINE)
    return set(fields)


def extract_provider_value_fields(content: str) -> set:
    """Extract fields from Provider value prop."""
    pattern = r"<AppContext\.Provider\s+value={{([^}]+)}}"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return set()
    
    value_body = match.group(1)
    # Match field names
    fields = re.findall(r"^\s*(\w+)\s*[,\n]", value_body, re.MULTILINE)
    return set(fields)


def main():
    if len(sys.argv) != 2:
        print("Usage: python validate_context.py <path_to_app-context.tsx>")
        sys.exit(1)
    
    context_path = Path(sys.argv[1])
    if not context_path.exists():
        print(f"Error: File not found: {context_path}")
        sys.exit(1)
    
    content = context_path.read_text()
    
    # Extract fields
    user_prefs_fields = extract_interface_fields(content, "UserPreferences")
    default_prefs_fields = extract_const_fields(content, "DEFAULT_PREFERENCES")
    context_type_fields = extract_interface_fields(content, "AppContextType")
    provider_value_fields = extract_provider_value_fields(content)
    
    print("🔍 Validating app-context.tsx structure...\n")
    
    # Check 1: UserPreferences vs DEFAULT_PREFERENCES
    missing_in_default = user_prefs_fields - default_prefs_fields
    extra_in_default = default_prefs_fields - user_prefs_fields
    
    if missing_in_default:
        print(f"❌ Fields in UserPreferences but missing in DEFAULT_PREFERENCES:")
        for field in sorted(missing_in_default):
            print(f"   - {field}")
    else:
        print("✅ All UserPreferences fields are in DEFAULT_PREFERENCES")
    
    if extra_in_default:
        print(f"⚠️  Fields in DEFAULT_PREFERENCES but not in UserPreferences:")
        for field in sorted(extra_in_default):
            print(f"   - {field}")
    
    print()
    
    # Check 2: AppContextType vs Provider value
    missing_in_provider = context_type_fields - provider_value_fields - {"preferences", "loading"}
    extra_in_provider = provider_value_fields - context_type_fields
    
    if missing_in_provider:
        print(f"❌ Functions in AppContextType but missing in Provider value:")
        for field in sorted(missing_in_provider):
            print(f"   - {field}")
    else:
        print("✅ All AppContextType functions are in Provider value")
    
    if extra_in_provider:
        print(f"⚠️  Fields in Provider value but not in AppContextType:")
        for field in sorted(extra_in_provider):
            print(f"   - {field}")
    
    print()
    
    # Check 3: Setter functions have savePreferences
    setter_pattern = r"const (set\w+) = useCallback\(([^}]+})\s*,\s*\[savePreferences\]\)"
    setters_with_save = set(re.findall(setter_pattern, content))
    
    all_setters = set(re.findall(r"const (set\w+) = useCallback", content))
    setters_without_save = all_setters - {s[0] for s in setters_with_save}
    
    if setters_without_save:
        print(f"⚠️  Setter functions without savePreferences dependency:")
        for setter in sorted(setters_without_save):
            print(f"   - {setter}")
    else:
        print("✅ All setter functions have savePreferences dependency")
    
    print()
    
    # Summary
    if missing_in_default or missing_in_provider:
        print("❌ Validation failed: Missing fields detected")
        sys.exit(1)
    else:
        print("✅ Validation passed: Context structure is consistent")
        sys.exit(0)


if __name__ == "__main__":
    main()
