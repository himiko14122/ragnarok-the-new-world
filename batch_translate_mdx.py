#!/usr/bin/env python3
"""
Fast parallel MDX translator - translates one locale at a time using larger chunks.
"""

import json
import os
import sys
import time
import re
import urllib.request
import urllib.error
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed

API_BASE = "https://tokenverse.corp.kuaishou.com/v1"
MODEL = "deepseek-v4-pro"
API_KEY = "sk-tp-RHExhDhxjrQxRl4JRddnVvcQGu49Wu77"

PROJECT_ROOT = "/Users/jinwei/Desktop/code/ragnarok-the-new-world"
CONTENT_DIR = os.path.join(PROJECT_ROOT, "content")

TARGET_LOCALE = sys.argv[1] if len(sys.argv) > 1 else "zh-TW"

PROPER_NOUNS_LIST = "Ragnarok, Midgard, Prontera, Kafra, Poring, Zeny, MVP, PvE, PvP, GvG, AoE, DPS, HP, SP, ASPD, ADL, F2P, NPC, Izlude, Steam, Discord, Gravity, GRAVITY, Kafra Blind Box, Adventure Coin, Bound Zeny, Time Corridor, War of Emperium, Job Freedom, Assassin Cross, Bowling Bash, Meteor Storm, Storm Gust, Sonic Blow, Magnificat, Kyrie Eleison, Magnus Exorcismus, Cart Revolution, Fire Wall, Werewolf, Bird-Man, Human Arcanist, Swordsman, Mage, Archer, Acolyte, Thief, Merchant, Gunslinger, Druid, Knight, Wizard, Hunter, Priest, Blacksmith"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def call_llm(messages, temperature=0.2, max_tokens=4096):
    payload = json.dumps({
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{API_BASE}/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
    )

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=90) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"    API error (attempt {attempt+1}): {e}", file=sys.stderr)
            if attempt < 2:
                time.sleep(5)
            else:
                raise
    return None


def translate_single_mdx(rel_path, locale):
    """Translate one MDX file."""
    source_path = os.path.join(CONTENT_DIR, "en", rel_path)
    target_path = os.path.join(CONTENT_DIR, locale, rel_path)

    # Skip if already translated
    if os.path.exists(target_path):
        return rel_path, "skip"

    with open(source_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Separate metadata block and body
    metadata_match = re.match(r'(export\s+const\s+metadata\s*=\s*\{.*?\})\s*\n', content, re.DOTALL)
    if metadata_match:
        metadata_block = metadata_match.group(1)
        body = content[metadata_match.end():]
    else:
        metadata_block = ""
        body = content

    locale_names = {"zh-TW": "Traditional Chinese (Taiwan)", "th": "Thai", "id": "Indonesian"}
    locale_name = locale_names[locale]

    # Translate the ENTIRE file (metadata + body) in one shot for speed
    # But we need to handle metadata carefully
    
    # First translate metadata translatable fields
    title_match = re.search(r'title:\s*"([^"]*)"', metadata_block)
    desc_match = re.search(r'description:\s*"([^"]*)"', metadata_block)
    kw_match = re.search(r'keywords:\s*\[([^\]]*)\]', metadata_block)

    meta_items = []
    if title_match:
        meta_items.append(f"title: {title_match.group(1)}")
    if desc_match:
        meta_items.append(f"description: {desc_match.group(1)}")
    if kw_match:
        kw_str = kw_match.group(1)
        keywords = [k.strip().strip('"').strip("'") for k in kw_str.split(",") if k.strip()]
        meta_items.append(f"keywords: {json.dumps(keywords)}")

    new_metadata = metadata_block

    if meta_items:
        meta_text = "\n".join(meta_items)
        meta_resp = call_llm([
            {"role": "system", "content": f"Translate these metadata fields to {locale_name}. Keep field names unchanged. Keep proper nouns in English: {PROPER_NOUNS_LIST}. Output: fieldname: translated_value, one per line. For keywords output as JSON array."},
            {"role": "user", "content": meta_text}
        ], temperature=0.1)

        if meta_resp:
            for line in meta_resp.strip().split("\n"):
                line = line.strip()
                if ": " not in line:
                    continue
                field, val = line.split(": ", 1)
                field = field.strip()
                val = val.strip()
                if field == "title" and title_match:
                    orig_title = title_match.group(1)
                    # Escape quotes in translation
                    new_metadata = new_metadata.replace(f'title: "{orig_title}"', f'title: "{val}"')
                elif field == "description" and desc_match:
                    orig_desc = desc_match.group(1)
                    new_metadata = new_metadata.replace(f'description: "{orig_desc}"', f'description: "{val}"')
                elif field == "keywords" and kw_match:
                    try:
                        parsed = json.loads(val)
                        if isinstance(parsed, list):
                            new_kw = ", ".join(f'"{k}"' for k in parsed)
                            new_metadata = re.sub(r'keywords:\s*\[[^\]]*\]', f'keywords: [{new_kw}]', new_metadata)
                    except json.JSONDecodeError:
                        pass

    # Translate body - send entire body in one call if not too long
    body_text = body.strip()
    if body_text:
        system_msg = f"""You are a professional game wiki translator. Translate the following markdown content from English to {locale_name}.

CRITICAL RULES:
1. Internal links must NOT have their URLs translated: [text](/guides/beginner-guide) — translate only the link text, keep the URL path exactly as-is
2. Category/slug in URLs must NOT be translated: /codes/, /tier-list/, /guides/, /classes/, /mvp-hunting/, /refining/, /zeny-farming/, /pvp/, /dungeons/, /mounts/ stay in English
3. Keep game proper nouns in English: {PROPER_NOUNS_LIST}
4. Keep all markdown formatting (headings, links, lists, bold, tables) intact
5. Keep "## FAQ" heading as-is — do not translate
6. FAQ format: translate H3 questions, no Q:/A: prefixes
7. Output ONLY the translated markdown — no extra text or comments
8. Keep any HTML tags or component references unchanged"""

        translated_body = call_llm([
            {"role": "system", "content": system_msg},
            {"role": "user", "content": body_text}
        ], temperature=0.2, max_tokens=6000)

        if not translated_body:
            translated_body = body_text  # Fallback
    else:
        translated_body = body_text

    # Reconstruct file
    output = new_metadata + "\n" + translated_body.strip() + "\n"

    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(output)

    return rel_path, "ok"


def main():
    locale = TARGET_LOCALE
    locale_names = {"zh-TW": "Traditional Chinese (Taiwan)", "th": "Thai", "id": "Indonesian"}
    print(f"Translating MDX files to {locale} ({locale_names[locale]})")

    en_dir = os.path.join(CONTENT_DIR, "en")
    mdx_files = []
    for root, dirs, files in os.walk(en_dir):
        for fname in files:
            if fname.endswith(".mdx"):
                rel_path = os.path.relpath(os.path.join(root, fname), en_dir)
                mdx_files.append(rel_path)

    mdx_files.sort()
    print(f"Total MDX files: {len(mdx_files)}")

    # Check which already exist
    existing = []
    needed = []
    for rel_path in mdx_files:
        target_path = os.path.join(CONTENT_DIR, locale, rel_path)
        if os.path.exists(target_path):
            existing.append(rel_path)
        else:
            needed.append(rel_path)

    print(f"Already translated: {len(existing)}")
    print(f"Need translation: {len(needed)}")

    if not needed:
        print("All files already translated!")
        return

    # Process sequentially to avoid rate limits but efficiently
    success = 0
    fail = 0
    for idx, rel_path in enumerate(needed):
        print(f"  [{idx+1}/{len(needed)}] {rel_path}...", flush=True)
        try:
            _, status = translate_single_mdx(rel_path, locale)
            if status == "ok":
                success += 1
            elif status == "skip":
                print(f"    (skipped, already exists)")
        except Exception as e:
            print(f"    ERROR: {e}")
            fail += 1

        time.sleep(0.3)

    print(f"\nDone: {success} translated, {fail} failed, {len(existing)} pre-existing")


if __name__ == "__main__":
    main()
