#!/usr/bin/env python3
"""Validate course hub structure and integrity."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
warnings = []

def err(msg):
    errors.append(msg)

def warn(msg):
    warnings.append(msg)

catalog_path = ROOT / "courses" / "catalog.json"
if not catalog_path.exists():
    err("Missing courses/catalog.json")
    catalog = []
else:
    try:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        if not isinstance(catalog, list):
            err("courses/catalog.json is not a list")
            catalog = []
    except Exception as e:
        err(f"Invalid catalog.json: {e}")
        catalog = []

slugs = set()
for item in catalog:
    slug = item.get("slug") or item.get("id")
    if not slug:
        err("Catalog item missing slug/id")
        continue
    if slug in slugs:
        err(f"Duplicate course slug: {slug}")
    slugs.add(slug)
    
    course = ROOT / "courses" / slug
    if not course.exists():
        err(f"Course directory missing: courses/{slug}")
        continue
    
    for rel in ["index.html", "course_manifest.json", "resources.html"]:
        if not (course / rel).exists():
            err(f"Missing {rel} in courses/{slug}")
    
    manifest_path = course / "course_manifest.json"
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            if manifest.get("slug") != slug:
                warn(f"Manifest slug mismatch in courses/{slug}")
            stats = manifest.get("stats", {})
            for key in ["subtitle_cues_zh", "subtitle_cues_bilingual"]:
                if key in stats and stats[key] <= 0:
                    warn(f"{slug}: {key} is not positive")
        except Exception as e:
            err(f"Invalid manifest for {slug}: {e}")

large = [p for p in ROOT.rglob("*") if p.is_file() and p.stat().st_size > 90 * 1024 * 1024]
for p in large:
    err(f"Large file should not be published: {p.relative_to(ROOT)}")

for p in list(ROOT.rglob("*.html")) + list(ROOT.rglob("*.js")) + list(ROOT.rglob("*.css")):
    text = p.read_text(encoding="utf-8", errors="ignore")
    if "/mnt/d/home" in text or "D:\\home" in text:
        err(f"Local path leaked: {p.relative_to(ROOT)}")

print("Course hub validation")
print(f"Catalog entries: {len(catalog)}")
print(f"Warnings: {len(warnings)}")
for w in warnings:
    print(f"WARN: {w}")
print(f"Errors: {len(errors)}")
for e in errors:
    print(f"ERROR: {e}")

if errors:
    sys.exit(1)
