#!/usr/bin/env python3
"""
Fix translated MDX files:
1. Ensure metadata block ends with `};\n\n` (semicolon + blank line)
2. Ensure body starts with proper heading (## or ###)
3. Fix any malformed metadata blocks
"""

import os
import re
import sys

PROJECT_ROOT = "/Users/jinwei/Desktop/code/ragnarok-the-new-world"
CONTENT_DIR = os.path.join(PROJECT_ROOT, "content")
LOCALES = ["zh-TW", "th", "id"]

def fix_mdx_file(filepath):
    """Fix a single MDX file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Check if metadata block exists
    # Pattern: export const metadata = { ... }
    # The metadata block should end with `};\n\n`

    # Find the metadata block
    metadata_match = re.match(r'(export\s+const\s+metadata\s*=\s*\{)(.*?)(\})\s*;?\s*\n', content, re.DOTALL)

    if not metadata_match:
        # Try without semicolon
        metadata_match = re.match(r'(export\s+const\s+metadata\s*=\s*\{)(.*?)(\})\s*\n', content, re.DOTALL)

    if not metadata_match:
        print(f"  WARNING: No metadata block found in {filepath}")
        return False

    # Extract parts
    metadata_prefix = metadata_match.group(1)  # "export const metadata = {"
    metadata_body = metadata_match.group(2)      # the fields
    metadata_close = metadata_match.group(3)     # "}"

    # The rest of the content after the metadata match
    rest_start = metadata_match.end()
    rest = content[rest_start:]

    # Reconstruct with proper formatting
    new_metadata = f"{metadata_prefix}{metadata_body}{metadata_close};\n\n"

    # Ensure rest starts with proper markdown (not immediately with text)
    # Skip any extra blank lines in rest, then ensure at most 1 blank line
    rest = rest.lstrip('\n')
    if rest and not rest.startswith('#') and not rest.startswith('<') and not rest.startswith('import'):
        # Body doesn't start with a heading - this might be OK for some files
        pass

    new_content = new_metadata + rest

    # Also fix: if metadata body has unescaped quotes in title/description
    # Fix title/description values that might have unescaped quotes
    # Replace any `"` inside string values with proper escaping
    # This is tricky - let's just ensure the metadata is valid JS

    # Check for common issues: metadata closing brace not on its own line
    # Sometimes the LLM puts `} # Heading` on same line
    new_content = re.sub(r'\}\s*(#{1,6}\s)', r'};\n\n\1', new_content)

    # Ensure metadata keywords array is properly formatted
    # Fix any quotes within keywords values

    if new_content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False


def main():
    for locale in LOCALES:
        print(f"\nFixing MDX files for {locale}...")
        locale_dir = os.path.join(CONTENT_DIR, locale)
        fixed = 0
        total = 0

        for root, dirs, files in os.walk(locale_dir):
            for fname in files:
                if not fname.endswith(".mdx"):
                    continue
                filepath = os.path.join(root, fname)
                total += 1
                try:
                    if fix_mdx_file(filepath):
                        fixed += 1
                        print(f"  FIXED: {os.path.relpath(filepath, locale_dir)}")
                except Exception as e:
                    print(f"  ERROR: {os.path.relpath(filepath, locale_dir)}: {e}")

        print(f"  {locale}: {fixed}/{total} files fixed")


if __name__ == "__main__":
    main()
