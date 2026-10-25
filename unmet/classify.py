"""Ask the model, 20 posts at a time, which posts describe an unmet need."""

import json
import re
import time

from unmet import llm
from unmet.config import BATCH_SIZE

SYSTEM = """You read forum posts and find unmet needs: a person says they want a tool, product or feature that does not exist or that they cannot find.
Not a need: jokes, sarcasm, rhetorical complaints, ads, people answering someone else, or a plain how-to question about code they are writing.
For every post return:
- id: the post id, unchanged
- is_need: true or false
- problem: one line under 15 words naming the problem in neutral terms (empty string if not a need)
- pain: 1 (nice to have), 2 (real friction) or 3 (blocking, costly or repeated)
- pay_signal: true only if the person says they or their team would pay, already pay for a workaround, or lose money
Reply with JSON only: {"results": [{"id": "...", "is_need": true, "problem": "...", "pain": 2, "pay_signal": false}]}"""

MAX_RETRIES = 2
MINUTE_LIMIT_WAITS = 3


def parse_json(text):
    """The JSON object in a reply, tolerating code fences and stray prose."""
    match = re.search(r"\{.*\}", text or "", re.S)
    if not match:
        raise ValueError("no JSON object in reply")
    return json.loads(match.group(0))


def ask_json(messages, validate):
    """Call the model and return validate(parsed reply); on a bad reply, say what was wrong and ask again up to 2 times."""
    for attempt in range(MAX_RETRIES + 1):
        reply = call(messages)["message"].get("content") or ""
        try:
            return validate(parse_json(reply))
        except (ValueError, KeyError, TypeError) as err:
            if attempt == MAX_RETRIES:
                raise ValueError(f"bad model reply after {MAX_RETRIES} retries: {err}") from err
            messages = messages + [
                {"role": "assistant", "content": reply},
                {"role": "user", "content": f"That reply was invalid ({err}). Reply with the corrected JSON only."},
            ]


def call(messages):
    """llm.complete, waiting out per-minute limits. A daily limit raises QuotaExceeded to the caller."""
    for wait in range(MINUTE_LIMIT_WAITS + 1):
        try:
            return llm.complete(messages)
        except llm.QuotaExceeded as err:
            if "per minute" not in str(err).lower() or wait == MINUTE_LIMIT_WAITS:
                raise
            time.sleep(30)


def post_prompt(post):
    return {"id": post["id"], "title": post["title"][:200], "text": post["text"][:700]}


def validate_batch(ids):
    def check(data):
        results = {r["id"]: r for r in data["results"]}
        if set(results) != set(ids):
            raise ValueError(f"expected ids {sorted(ids)}, got {sorted(results)}")
        out = {}
        for i, r in results.items():
            if not isinstance(r["is_need"], bool) or not isinstance(r["pay_signal"], bool):
                raise ValueError(f"{i}: is_need and pay_signal must be true or false")
            if r["pain"] not in (1, 2, 3):
                raise ValueError(f"{i}: pain must be 1, 2 or 3")
            if r["is_need"] and not str(r["problem"]).strip():
                raise ValueError(f"{i}: a need must have a problem line")
            out[i] = {k: r[k] for k in ("is_need", "problem", "pain", "pay_signal")}
        return out
    return check


def classify(posts, done, save):
    """Classify posts not yet in `done` (id -> result), calling save(done) after every batch.

    Returns True when finished, False when it stopped at the daily quota; run again to resume.
    """
    todo = [p for p in posts if p["id"] not in done]
    for start in range(0, len(todo), BATCH_SIZE):
        batch = todo[start:start + BATCH_SIZE]
        messages = [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": json.dumps([post_prompt(p) for p in batch], ensure_ascii=False)},
        ]
        try:
            done.update(ask_json(messages, validate_batch([p["id"] for p in batch])))
        except llm.QuotaExceeded:
            print(f"Model quota reached after {start} of {len(todo)} new posts; run again to resume.")
            return False
        save(done)
        print(f"classified {min(start + BATCH_SIZE, len(todo))}/{len(todo)}")
    return True
