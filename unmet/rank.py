"""Score problems, have the model name the top ones, and shape them for the site."""

import hashlib
import json
from datetime import datetime, timezone

from unmet.classify import ask_json
from unmet.config import PAY_BOOST, RECENCY_HALF_LIFE_DAYS, TOP_N

NAME_SYSTEM = """Reasoning: low
You name problems that several people described in forum posts.
Reply with JSON only: {"name": "...", "summary": "..."}
- name: the problem in at most 8 words, plain and specific, no marketing words
- summary: one sentence on what people want and why the current options fail them"""


def score(group, now):
    """Distinct people x recency weight x mean pain, boosted when anyone signals they would pay."""
    people = len({(n["source"], n["author"]) for n in group})
    recency = sum(0.5 ** ((now - n["created_at"]) / 86400 / RECENCY_HALF_LIFE_DAYS) for n in group) / len(group)
    pain = sum(n["pain"] for n in group) / len(group)
    boost = PAY_BOOST if any(n["pay_signal"] for n in group) else 1.0
    return people * recency * pain * boost


def check_name(data):
    name, summary = str(data["name"]).strip(), str(data["summary"]).strip()
    if not name or len(name) > 80 or not summary:
        raise ValueError("name must be 1-80 characters and summary non-empty")
    return {"name": name, "summary": summary}


def name_problem(group):
    lines = sorted({n["problem"] for n in group})[:15]
    return ask_json([
        {"role": "system", "content": NAME_SYSTEM},
        {"role": "user", "content": json.dumps(lines, ensure_ascii=False)},
    ], check_name)


def iso(ts):
    return datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def top_problems(groups, now, n=TOP_N):
    ranked = sorted(groups, key=lambda g: (-score(g, now), g[0]["id"]))[:n]
    out = []
    for group in ranked:
        members = sorted(group, key=lambda m: -m["created_at"])
        out.append({
            # keyed by the cluster's oldest need, which stays put as new needs join, so links keep working
            "id": hashlib.sha1(group[0]["id"].encode()).hexdigest()[:8],
            **name_problem(group),
            "people": len({(m["source"], m["author"]) for m in group}),
            "mentions": len(group),
            "pain": round(sum(m["pain"] for m in group) / len(group), 1),
            "pay_signal": any(m["pay_signal"] for m in group),
            "score": round(score(group, now), 3),
            "sources": sorted({m["source"] for m in group}),
            "last_seen": iso(members[0]["created_at"]),
            "quotes": [{
                "text": m["quote"], "url": m["url"], "author": m["author"], "author_url": m["author_url"],
                "site": m["site"], "source": m["source"], "date": iso(m["created_at"]),
            } for m in members],
        })
    return out
