#!/usr/bin/env python3
"""
Batch translation script for Ragnarok: The New World wiki.
Translates en.json and MDX content files to zh-TW, th, id using DeepSeek API.
"""

import json
import os
import sys
import time
import re
import urllib.request
import urllib.error
import ssl

# ── Config ──
API_BASE = "https://tokenverse.corp.kuaishou.com/v1"
MODEL = "deepseek-v4-pro"
API_KEY = "sk-tp-RHExhDhxjrQxRl4JRddnVvcQGu49Wu77"

PROJECT_ROOT = "/Users/jinwei/Desktop/code/ragnarok-the-new-world"
LOCALES_DIR = os.path.join(PROJECT_ROOT, "src", "locales")
CONTENT_DIR = os.path.join(PROJECT_ROOT, "content")

TARGET_LOCALES = ["zh-TW", "th", "id"]
SOURCE_LOCALE = "en"

# Game proper nouns that must NOT be translated
PROPER_NOUNS = [
    "Ragnarok", "Midgard", "Prontera", "Kafra", "Poring", "Zeny",
    "Izlude", "Steam", "Discord", "Gravity", "GRAVITY", "GvG",
    "MVP", "PvE", "PvP", "AoE", "DPS", "HP", "SP", "ASPD",
    "ADL", "F2P", "NPC", "RNG", "Bowling Bash", "Meteor Storm",
    "Storm Gust", "Sonic Blow", "Magnificat", "Kyrie Eleison",
    "Magnus Exorcismus", "Cart Revolution", "Fire Wall",
    "Assassin Cross", "War of Emperium", "Job Freedom",
    "Adventure Coin", "Kafra Blind Box", "Bound Zeny",
    "Time Corridor", "Abyssal Pirates", "Desert Ruins",
    "Werewolf", "Bird-Man", "Human Arcanist",
    "Swordsman", "Mage", "Archer", "Acolyte", "Thief",
    "Merchant", "Gunslinger", "Druid", "Knight", "Wizard",
    "Hunter", "Priest", "Blacksmith",
]

# MDX metadata fields that must NOT be translated
MDX_UNTRANSLATABLE_KEYS = {"id", "slug", "category", "image", "video", "order", "date", "lastModified"}
# MDX metadata fields that CAN be translated
MDX_TRANSLATABLE_KEYS = {"title", "description", "keywords"}

# ── SSL Context ──
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def call_llm(messages, temperature=0.3, max_tokens=4096):
    """Call the LLM API and return the response content."""
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

    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return data["choices"][0]["message"]["content"]
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            print(f"  API error (attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(10)
            else:
                raise
        except json.JSONDecodeError as e:
            print(f"  JSON decode error (attempt {attempt+1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(10)
            else:
                raise
    return None


def translate_json_values(source_json, target_locale):
    """Translate all values in en.json to target locale, keeping keys identical."""
    print(f"\n{'='*60}")
    print(f"Translating en.json -> {target_locale}.json")
    print(f"{'='*60}")

    items = list(source_json.items())
    total = len(items)
    batch_size = 40
    result = {}

    for i in range(0, total, batch_size):
        batch = items[i:i+batch_size]
        batch_num = i // batch_size + 1
        total_batches = (total + batch_size - 1) // batch_size
        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} keys)...")

        # Build the translation prompt
        lines_to_translate = []
        for key, value in batch:
            if isinstance(value, str):
                lines_to_translate.append(f"{key} = {value}")
            elif isinstance(value, list):
                lines_to_translate.append(f"{key} = {json.dumps(value)}")

        source_text = "\n".join(lines_to_translate)

        locale_name = {"zh-TW": "Traditional Chinese (Taiwan)", "th": "Thai", "id": "Indonesian"}[target_locale]

        system_msg = f"""You are a professional game wiki translator. Translate the following key-value pairs from English to {locale_name}.

RULES:
1. Keep the KEY exactly as-is (left side of '=')
2. Translate only the VALUE (right side of '=')
3. Keep game proper nouns in English: {', '.join(PROPER_NOUNS[:20])}
4. Keep URLs, paths, and code references unchanged
5. For array values (JSON arrays), translate each string element
6. Output format: one line per key-value pair, exactly "KEY = TRANSLATED_VALUE"
7. Do NOT add any extra text, explanation, or markdown"""

        user_msg = f"Translate these key-value pairs to {locale_name}:\n\n{source_text}"

        response = call_llm([
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg}
        ], temperature=0.1)

        if not response:
            print(f"  ERROR: Failed to get response for batch {batch_num}")
            # Fallback: keep English
            for key, value in batch:
                result[key] = value
            continue

        # Parse the response
        parsed = 0
        for line in response.strip().split("\n"):
            line = line.strip()
            if " = " not in line:
                continue
            key, value = line.split(" = ", 1)
            key = key.strip()
            value = value.strip()
            if key in source_json:
                # Handle array values
                if isinstance(source_json[key], list):
                    try:
                        parsed_val = json.loads(value)
                        if isinstance(parsed_val, list):
                            result[key] = parsed_val
                        else:
                            result[key] = [value]
                    except json.JSONDecodeError:
                        result[key] = [v.strip().strip('"') for v in value.split(",")]
                else:
                    result[key] = value
                parsed += 1

        # Fill any missing keys with English fallback
        for key, value in batch:
            if key not in result:
                result[key] = value
                print(f"  WARNING: Missing key '{key}', using English fallback")

        print(f"  Parsed {parsed}/{len(batch)} keys")

        # Rate limit
        if i + batch_size < total:
            time.sleep(1)

    return result


def parse_mdx_metadata(content):
    """Parse export const metadata = { ... } from MDX content."""
    match = re.search(r'export\s+const\s+metadata\s*=\s*(\{[^}]+\})', content, re.DOTALL)
    if not match:
        return None, content
    metadata_str = match.group(1)
    # Parse the metadata object
    metadata = {}
    # Handle keywords array specially
    keywords_match = re.search(r'keywords:\s*\[([^\]]*)\]', metadata_str)
    if keywords_match:
        kw_str = keywords_match.group(1)
        keywords = [k.strip().strip('"').strip("'") for k in kw_str.split(",") if k.strip()]
        metadata["keywords"] = keywords

    # Parse other simple string fields
    for field in ["id", "slug", "title", "description", "category", "date", "lastModified", "image", "video"]:
        field_match = re.search(rf'{field}:\s*"([^"]*)"', metadata_str)
        if field_match:
            metadata[field] = field_match.group(1)
        else:
            field_match = re.search(rf'{field}:\s*\'([^\']*)\'', metadata_str)
            if field_match:
                metadata[field] = field_match.group(1)

    # Parse order (number)
    order_match = re.search(r'order:\s*(\d+)', metadata_str)
    if order_match:
        metadata["order"] = int(order_match.group(1))

    return metadata, content


def translate_mdx_file(source_path, target_path, target_locale):
    """Translate a single MDX file to target locale."""
    with open(source_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract metadata block
    metadata_match = re.search(r'(export\s+const\s+metadata\s*=\s*\{[^}]+\})', content, re.DOTALL)
    if not metadata_match:
        # No metadata, translate the whole body
        metadata_block = ""
        body = content
    else:
        metadata_block = metadata_match.group(1)
        body = content[metadata_match.end():]

    # Parse metadata fields
    metadata = {}
    metadata_str = metadata_block[metadata_block.index("{"):].strip("{}").strip()

    # Extract individual fields
    title_val = None
    desc_val = None
    keywords_val = None
    other_fields = {}

    # Title
    title_match = re.search(r'title:\s*"([^"]*)"', metadata_str)
    if not title_match:
        title_match = re.search(r"title:\s*'([^']*)'", metadata_str)
    if title_match:
        title_val = title_match.group(1)

    # Description
    desc_match = re.search(r'description:\s*"([^"]*)"', metadata_str)
    if not desc_match:
        desc_match = re.search(r"description:\s*'([^']*)'", metadata_str)
    if desc_match:
        desc_val = desc_match.group(1)

    # Keywords
    kw_match = re.search(r'keywords:\s*\[([^\]]*)\]', metadata_str)
    if kw_match:
        kw_str = kw_match.group(1)
        keywords_val = [k.strip().strip('"').strip("'") for k in kw_str.split(",") if k.strip()]

    # Translate metadata
    locale_name = {"zh-TW": "Traditional Chinese (Taiwan)", "th": "Thai", "id": "Indonesian"}[target_locale]

    meta_translations = {}
    if title_val:
        meta_translations["title"] = None  # Will be filled
    if desc_val:
        meta_translations["description"] = None
    if keywords_val:
        meta_translations["keywords"] = None

    if meta_translations:
        meta_prompt_parts = []
        if title_val:
            meta_prompt_parts.append(f"title: {title_val}")
        if desc_val:
            meta_prompt_parts.append(f"description: {desc_val}")
        if keywords_val:
            meta_prompt_parts.append(f"keywords: {json.dumps(keywords_val)}")

        meta_text = "\n".join(meta_prompt_parts)

        system_msg = f"""You are a professional game wiki translator. Translate the following metadata fields from English to {locale_name}.

RULES:
1. Keep field names (title, description, keywords) exactly as-is
2. Translate only the values
3. Keep game proper nouns in English: Ragnarok, Midgard, Prontera, Kafra, Poring, Zeny, MVP, PvE, PvP, GvG, AoE, DPS, ASPD, ADL, F2P, NPC, etc.
4. For keywords, translate each keyword string but keep the JSON array format
5. Output each field on its own line as "fieldname: translated_value"
6. Do NOT add any extra text"""

        response = call_llm([
            {"role": "system", "content": system_msg},
            {"role": "user", "content": meta_text}
        ], temperature=0.1)

        if response:
            for line in response.strip().split("\n"):
                line = line.strip()
                if ": " not in line:
                    continue
                field, val = line.split(": ", 1)
                field = field.strip()
                val = val.strip()
                if field == "title" and title_val:
                    meta_translations["title"] = val
                elif field == "description" and desc_val:
                    meta_translations["description"] = val
                elif field == "keywords" and keywords_val:
                    try:
                        parsed = json.loads(val)
                        if isinstance(parsed, list):
                            meta_translations["keywords"] = parsed
                    except json.JSONDecodeError:
                        meta_translations["keywords"] = [v.strip().strip('"') for v in val.split(",")]

    # Translate body content (the markdown part after metadata)
    # Split body into manageable chunks
    body_lines = body.strip().split("\n")
    if len(body_lines) > 5:  # Only translate if there's actual content
        chunk_size = 60
        translated_chunks = []

        for chunk_start in range(0, len(body_lines), chunk_size):
            chunk = "\n".join(body_lines[chunk_start:chunk_start + chunk_size])
            if not chunk.strip():
                translated_chunks.append(chunk)
                continue

            system_msg = f"""You are a professional game wiki translator translating game guide content from English to {locale_name}.

CRITICAL RULES:
1. Internal links MUST NOT be translated: [text](/guides/beginner-guide) — translate only the link text, keep the URL path exactly as-is
2. Category/slug in URLs must NOT be translated: /codes/, /tier-list/, /guides/, /classes/, /mvp-hunting/, /refining/, /zeny-farming/, /pvp/, /dungeons/, /mounts/ stay in English
3. Keep game proper nouns in English: Ragnarok, Midgard, Prontera, Kafra, Poring, Zeny, MVP, PvE, PvP, GvG, AoE, DPS, HP, SP, ASPD, ADL, F2P, NPC, Izlude, etc.
4. Keep markdown formatting (headings, links, lists, bold, etc.) intact
5. Keep "## FAQ" as "## FAQ" — do not translate the heading
6. FAQ format: H3 questions should be translated, no Q:/A: prefixes
7. Do NOT add any extra text, explanations, or comments
8. Output ONLY the translated markdown content"""

            response = call_llm([
                {"role": "system", "content": system_msg},
                {"role": "user", "content": chunk}
            ], temperature=0.2, max_tokens=4096)

            if response:
                translated_chunks.append(response)
            else:
                translated_chunks.append(chunk)  # Fallback to English

            time.sleep(0.5)

        translated_body = "\n".join(translated_chunks)
    else:
        translated_body = body

    # Reconstruct the metadata block
    new_metadata = metadata_block
    if title_val and "title" in meta_translations and meta_translations["title"]:
        new_metadata = new_metadata.replace(f'title: "{title_val}"', f'title: "{meta_translations["title"]}"')
        if f"title: '{title_val}'" in new_metadata:
            new_metadata = new_metadata.replace(f"title: '{title_val}'", f'title: "{meta_translations["title"]}"')
    if desc_val and "description" in meta_translations and meta_translations["description"]:
        new_metadata = new_metadata.replace(f'description: "{desc_val}"', f'description: "{meta_translations["description"]}"')
        if f"description: '{desc_val}'" in new_metadata:
            new_metadata = new_metadata.replace(f"description: '{desc_val}'", f'description: "{meta_translations["description"]}"')
    if keywords_val and "keywords" in meta_translations and meta_translations["keywords"]:
        old_kw = f"keywords: [{', '.join(repr(k) for k in keywords_val)}]"
        # More flexible replacement
        kw_pattern = r'keywords:\s*\[[^\]]*\]'
        new_kw_str = ", ".join(f'"{k}"' for k in meta_translations["keywords"])
        new_metadata = re.sub(kw_pattern, f'keywords: [{new_kw_str}]', new_metadata)

    # Reconstruct full file
    output = new_metadata + "\n" + translated_body.strip() + "\n"

    # Write output
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(output)

    return True


def main():
    print("=" * 60)
    print("BATCH TRANSLATION: Ragnarok The New World Wiki")
    print(f"Target locales: {TARGET_LOCALES}")
    print("=" * 60)

    # ── Step 1: Translate en.json ──
    en_json_path = os.path.join(LOCALES_DIR, f"{SOURCE_LOCALE}.json")
    with open(en_json_path, "r", encoding="utf-8") as f:
        en_json = json.load(f)

    print(f"\nLoaded en.json: {len(en_json)} keys")

    for locale in TARGET_LOCALES:
        target_path = os.path.join(LOCALES_DIR, f"{locale}.json")
        translated = translate_json_values(en_json, locale)

        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(translated, f, ensure_ascii=False, indent=2)
            f.write("\n")

        # Calculate translation rate
        translated_count = sum(1 for k, v in translated.items() if v != en_json.get(k, ""))
        rate = translated_count / len(en_json) * 100
        print(f"  Written {locale}.json ({len(translated)} keys, {rate:.1f}% translated)")

    # ── Step 2: Translate MDX files ──
    en_content_dir = os.path.join(CONTENT_DIR, SOURCE_LOCALE)

    # Collect all MDX files
    mdx_files = []
    for root, dirs, files in os.walk(en_content_dir):
        for fname in files:
            if fname.endswith(".mdx"):
                rel_path = os.path.relpath(os.path.join(root, fname), en_content_dir)
                mdx_files.append(rel_path)

    print(f"\nFound {len(mdx_files)} MDX files to translate")

    for locale in TARGET_LOCALES:
        locale_name = {"zh-TW": "Traditional Chinese (Taiwan)", "th": "Thai", "id": "Indonesian"}[locale]
        print(f"\n{'='*60}")
        print(f"Translating MDX files -> {locale}/ ({locale_name})")
        print(f"{'='*60}")

        success_count = 0
        fail_count = 0

        for idx, rel_path in enumerate(mdx_files):
            source_path = os.path.join(en_content_dir, rel_path)
            target_path = os.path.join(CONTENT_DIR, locale, rel_path)

            print(f"  [{idx+1}/{len(mdx_files)}] {rel_path}...")

            try:
                translate_mdx_file(source_path, target_path, locale)
                success_count += 1
            except Exception as e:
                print(f"  ERROR: {e}")
                fail_count += 1

            time.sleep(0.5)

        print(f"\n  {locale}: {success_count} success, {fail_count} failed out of {len(mdx_files)} files")

    print("\n" + "=" * 60)
    print("TRANSLATION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
