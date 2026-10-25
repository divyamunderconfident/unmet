"""Fetch posts that contain a need phrase from Hacker News (Algolia) and Stack Exchange. Every response is cached on disk."""

import hashlib
import html
import json
import os
import re
import time
from pathlib import Path

import requests

from unmet.config import NEED_PHRASES, SE_SITES

CACHE_DIR = Path(".cache/http")
HN_URL = "https://hn.algolia.com/api/v1/search_by_date"
SE_URL = "https://api.stackexchange.com/2.3/search/advanced"


def get_json(url, params):
    """GET with an on-disk cache keyed by URL and params. The optional Stack Exchange key is not part of the key."""
    key = hashlib.sha256(json.dumps([url, params], sort_keys=True).encode()).hexdigest()
    path = CACHE_DIR / f"{key}.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    sent = dict(params)
    if "stackexchange" in url and os.environ.get("STACKEXCHANGE_KEY"):
        sent["key"] = os.environ["STACKEXCHANGE_KEY"]
    resp = requests.get(url, params=sent, timeout=60)
    if not resp.ok:
        # never echo the request URL: it may carry the key
        raise requests.HTTPError(f"{resp.status_code} from {url}: {resp.text[:300]}", response=resp)
    data = resp.json()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data), encoding="utf-8")
    if data.get("backoff"):  # Stack Exchange asks clients to wait this many seconds before the next call
        time.sleep(data["backoff"])
    return data


def clean(text):
    """HTML to plain text with straight apostrophes, so phrase matching works."""
    text = html.unescape(re.sub(r"<[^>]+>", " ", text or ""))
    return re.sub(r"\s+", " ", text.replace("’", "'")).strip()


def find_phrase(text):
    low = text.lower()
    return next((p for p in NEED_PHRASES if p.lower() in low), None)


def fetch_hn(since, until):
    posts = []
    for phrase in NEED_PHRASES:
        page, pages = 0, 1
        while page < pages:
            data = get_json(HN_URL, {
                "query": f'"{phrase}"', "tags": "(story,comment)", "hitsPerPage": 1000, "page": page,
                "numericFilters": f"created_at_i>{since},created_at_i<={until}",
            })
            pages, page = data.get("nbPages", 1), page + 1
            for h in data["hits"]:
                title = clean(h.get("title") or h.get("story_title"))
                text = clean(h.get("comment_text") or h.get("story_text"))
                if not h.get("author") or not find_phrase(f"{h.get('title') or ''} {text}"):
                    continue
                posts.append({
                    "id": f"hn:{h['objectID']}", "source": "hn", "site": "Hacker News",
                    "url": f"https://news.ycombinator.com/item?id={h['objectID']}",
                    "author": h["author"], "author_url": f"https://news.ycombinator.com/user?id={h['author']}",
                    "title": title, "text": text, "created_at": int(h["created_at_i"]),
                })
    return posts


def fetch_se(since, until, max_pages=3):
    posts = []
    for site in SE_SITES:
        for phrase in NEED_PHRASES:
            for page in range(1, max_pages + 1):
                # quoted q returns nothing on this API, so search the words and check the exact phrase below
                data = get_json(SE_URL, {
                    "q": phrase, "site": site, "fromdate": since, "todate": until,
                    "pagesize": 100, "page": page, "filter": "withbody", "sort": "creation",
                })
                if "error_id" in data:
                    raise RuntimeError(f"Stack Exchange error {data['error_id']}: {data.get('error_message')}")
                for q in data.get("items", []):
                    title, text = clean(q.get("title")), clean(q.get("body"))
                    owner = q.get("owner", {})
                    if not owner.get("display_name") or not find_phrase(f"{title} {text}"):
                        continue
                    posts.append({
                        "id": f"se:{site}:{q['question_id']}", "source": "se", "site": site,
                        "url": q["link"], "author": html.unescape(owner["display_name"]),
                        "author_url": owner.get("link"), "title": title, "text": text,
                        "created_at": int(q["creation_date"]),
                    })
                if not data.get("has_more"):
                    break
    return posts


def fetch_all(since, until):
    """All matching posts in (since, until], one per id, oldest first."""
    by_id = {p["id"]: p for p in fetch_hn(since, until) + fetch_se(since, until)}
    return sorted(by_id.values(), key=lambda p: (p["created_at"], p["id"]))
