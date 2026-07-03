#!/usr/bin/env python3
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import json
import re
import sys
import time

ROOT_URL = "https://conanxin.github.io/courses-zh/"
COURSE_URL = ROOT_URL + "courses/how-to-speak/"
MANIFEST_URL = COURSE_URL + "course_manifest.json"

RESULTS = {
    "status": "PASS",
    "checks": [],
    "warnings": [],
    "errors": [],
}

def add_check(name, status, detail=""):
    RESULTS["checks"].append({"name": name, "status": status, "detail": detail})
    if status == "FAIL":
        RESULTS["status"] = "FAIL"
        RESULTS["errors"].append(f"{name}: {detail}")
    elif status == "WARN":
        RESULTS["warnings"].append(f"{name}: {detail}")

def fetch_text(url, timeout=30):
    req = Request(url, headers={"User-Agent": "courses-zh-phase7-qa/1.0"})
    with urlopen(req, timeout=timeout) as r:
        body = r.read()
        content_type = r.headers.get("content-type", "")
        return r.status, content_type, body.decode("utf-8", errors="replace")

def check_url(name, url, expect_text=None, timeout=30):
    try:
        status, content_type, text = fetch_text(url, timeout)
        if status != 200:
            add_check(name, "FAIL", f"HTTP {status}: {url}")
            return None
        if expect_text and expect_text not in text:
            add_check(name, "FAIL", f"Expected text not found: {expect_text}")
            return text
        add_check(name, "PASS", url)
        return text
    except Exception as e:
        add_check(name, "FAIL", f"{url} -> {e}")
        return None

def count_vtt_cues(text):
    return text.count("-->")

def extract_links(html, base_url):
    links = set()
    for m in re.finditer(r'''(?:href|src)=["']([^"']+)["']''', html):
        raw = m.group(1).strip()
        if not raw or raw.startswith("#") or raw.startswith("mailto:") or raw.startswith("javascript:"):
            continue
        links.add(urljoin(base_url, raw))
    return sorted(links)

def same_site(url):
    return urlparse(url).netloc == urlparse(ROOT_URL).netloc

def main():
    root_html = check_url("hub_root_http_200", ROOT_URL, "中文学习课程集合")
    course_html = check_url("course_http_200", COURSE_URL, "How to Speak")
    manifest_text = check_url("manifest_http_200", MANIFEST_URL, '"slug": "how-to-speak"')

    manifest = None
    if manifest_text:
        try:
            manifest = json.loads(manifest_text)
            add_check("manifest_json_valid", "PASS", "valid JSON")
        except Exception as e:
            add_check("manifest_json_valid", "FAIL", str(e))

    if manifest:
        stats = manifest.get("stats", {})
        zh_cues = stats.get("subtitle_cues_zh")
        bi_cues = stats.get("subtitle_cues_bilingual")
        if zh_cues == 1248 and bi_cues == 1248:
            add_check("manifest_subtitle_baseline", "PASS", "1248 / 1248")
        else:
            add_check("manifest_subtitle_baseline", "FAIL", f"{zh_cues} / {bi_cues}")

    if course_html:
        required_texts = [
            "1,248 条字幕",
            "中文字幕",
            "双语字幕",
            "章节",
        ]
        for t in required_texts:
            add_check(f"course_visible_text_{t}", "PASS" if t in course_html else "FAIL", t)

        if "archive.org/download/mithowtospeak/MIT_How_To_Speak_IAP_2018_300k.mp4" in course_html:
            add_check("online_video_source_present", "PASS", "Internet Archive MP4")
        else:
            add_check("online_video_source_present", "WARN", "video URL not found directly in HTML; may be in JS/data")

    # Key resources
    key_urls = {
        "resources_index": COURSE_URL + "resources.html",
        "review_page": COURSE_URL + "pages/review.html",
        "zh_transcript_page": COURSE_URL + "pages/transcript.html",
        "bilingual_transcript_page": COURSE_URL + "pages/transcript-bilingual.html",
        "zh_vtt": COURSE_URL + "assets/data/subtitles_zh.vtt",
        "bilingual_vtt": COURSE_URL + "assets/data/subtitles_bilingual.vtt",
        "catalog_json": ROOT_URL + "courses/catalog.json",
        "sitemap": ROOT_URL + "sitemap.xml",
    }

    fetched = {}
    for name, url in key_urls.items():
        text = check_url(name, url)
        fetched[name] = text

    for name in ["zh_vtt", "bilingual_vtt"]:
        text = fetched.get(name)
        if text:
            cues = count_vtt_cues(text)
            if cues == 1248:
                add_check(f"{name}_cue_count", "PASS", str(cues))
            else:
                add_check(f"{name}_cue_count", "FAIL", f"{cues}, expected 1248")

    # Link crawl
    link_sources = []
    if course_html:
        link_sources.append(("course_page", course_html, COURSE_URL))
    if fetched.get("resources_index"):
        link_sources.append(("resources_page", fetched["resources_index"], COURSE_URL + "resources.html"))
    if root_html:
        link_sources.append(("hub_root", root_html, ROOT_URL))

    checked = set()
    for source_name, html_text, base in link_sources:
        for link in extract_links(html_text, base):
            if link in checked:
                continue
            checked.add(link)
            parsed = urlparse(link)
            if parsed.scheme not in ("http", "https"):
                continue
            if "archive.org/download/mithowtospeak" in link and link.endswith(".mp4"):
                add_check("external_video_link_declared", "PASS", link)
                continue
            if not same_site(link):
                continue
            try:
                req = Request(link, headers={"User-Agent": "courses-zh-phase7-linkcheck/1.0"})
                with urlopen(req, timeout=20) as r:
                    status = r.status
                    if status == 200:
                        add_check(f"link_ok:{source_name}", "PASS", link)
                    else:
                        add_check(f"link_bad:{source_name}", "FAIL", f"HTTP {status}: {link}")
            except Exception as e:
                add_check(f"link_bad:{source_name}", "FAIL", f"{link} -> {e}")

    # Mobile responsive checks
    if course_html:
        if 'name="viewport"' in course_html or "name='viewport'" in course_html:
            add_check("course_viewport_meta", "PASS", "viewport present")
        else:
            add_check("course_viewport_meta", "WARN", "viewport meta missing")
    if root_html:
        if "grid-template-columns" in root_html or "auto-fit" in root_html:
            add_check("hub_responsive_grid_signal", "PASS", "responsive grid CSS present")
        else:
            add_check("hub_responsive_grid_signal", "WARN", "responsive grid CSS not detected")

    print(json.dumps(RESULTS, ensure_ascii=False, indent=2))
    return 0 if RESULTS["status"] == "PASS" else 1

if __name__ == "__main__":
    raise SystemExit(main())
