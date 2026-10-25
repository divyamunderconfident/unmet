"""Run the pipeline: python -m unmet --days 30 (backfill) or --days 1 (daily). Re-running resumes where it stopped."""

import argparse
import json
import sys
import time
from pathlib import Path

from unmet import llm
from unmet.classify import classify
from unmet.cluster import cluster
from unmet.config import QUOTE_CHARS, WINDOW_DAYS
from unmet.fetch import fetch_all, find_phrase
from unmet.rank import iso, top_problems

DATA = Path("data")
SITE_DATA = Path("site/public/data/problems.json")


def load(path, default):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def save(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_bytes(json.dumps(obj, indent=1, ensure_ascii=False, sort_keys=True).encode())  # bytes: LF on every OS
    tmp.replace(path)


def make_quote(post, limit=QUOTE_CHARS):
    """A short excerpt around the need phrase: short quotes only, never the whole post."""
    phrase = find_phrase(post["text"])
    if not phrase:  # the phrase is in the title
        text, at = f"{post['title']}. {post['text']}", 0
    else:
        text, at = post["text"], post["text"].lower().find(phrase.lower())
    start = max(0, at - limit // 3)
    if start:
        start = text.find(" ", start) + 1 or start
    quote = text[start:start + limit]
    if start + limit < len(text):
        quote = quote.rsplit(" ", 1)[0] + "…"
    return ("…" if start else "") + quote.strip()


def run(days, now=None):
    now = now or int(time.time()) // 3600 * 3600  # whole hours, so a rerun hits the response cache
    posts = fetch_all(now - days * 86400, now)
    print(f"fetched {len(posts)} posts from the last {days} days")

    classified_path, needs_path = DATA / "classified.json", DATA / "needs.json"
    classified = load(classified_path, {})
    finished = classify(posts, classified, lambda done: save(classified_path, done))

    needs = {n["id"]: n for n in load(needs_path, [])}
    for p in posts:
        c = classified.get(p["id"])
        if c and c["is_need"] and p["id"] not in needs:
            needs[p["id"]] = {
                **{k: p[k] for k in ("id", "source", "site", "url", "author", "author_url", "created_at")},
                "problem": c["problem"].strip(), "pain": c["pain"], "pay_signal": c["pay_signal"],
                "quote": make_quote(p),
            }
    all_needs = sorted(needs.values(), key=lambda n: (n["created_at"], n["id"]))
    save(needs_path, all_needs)
    if not finished:
        return 3  # stopped at the quota; nothing published until classification is complete

    recent = [n for n in all_needs if n["created_at"] > now - WINDOW_DAYS * 86400]
    groups = cluster(recent)
    save(SITE_DATA, {
        "updated_at": iso(now),
        "window_days": WINDOW_DAYS,
        "stats": {
            "posts_classified": len(classified),
            "needs_found": len(all_needs),
            "needs_in_window": len(recent),
            "problems_in_window": len(groups),
        },
        "problems": top_problems(groups, now),
    })
    print(f"{len(classified)} posts classified, {len(all_needs)} needs, {len(groups)} problems; wrote {SITE_DATA}")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=1)
    args = parser.parse_args()
    llm.load_env()
    try:
        sys.exit(run(args.days))
    except llm.QuotaExceeded:
        print("Model quota reached while naming problems; run again to resume.")
        sys.exit(3)


if __name__ == "__main__":
    main()
