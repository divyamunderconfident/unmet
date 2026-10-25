import json

from unmet import __main__ as pipeline

DAY = 86400
NOW = 100 * DAY


def need(i):
    return {"id": i, "is_need": True, "problem": "self hosted password manager", "pain": 3, "pay_signal": False}


def replies(post_id, summary):
    return [
        {"role": "assistant", "content": json.dumps({"results": [need(post_id)]})},
        {"role": "assistant", "content": json.dumps({"name": "Password manager", "summary": summary})},
    ]


def test_run_end_to_end_then_merges_next_day(fake_llm, monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    day1 = {"id": "hn:1", "source": "hn", "site": "Hacker News", "url": "u1", "author": "a", "author_url": None,
            "title": "t", "text": "I wish there was a password manager", "created_at": NOW - DAY}
    monkeypatch.setattr(pipeline, "fetch_all", lambda since, until: [day1])
    fake_llm.replies = replies("hn:1", "s")
    assert pipeline.run(30, now=NOW) == 0
    out = json.loads((tmp_path / pipeline.SITE_DATA).read_text(encoding="utf-8"))
    assert out["stats"]["needs_found"] == 1 and out["problems"][0]["people"] == 1

    day2 = {**day1, "id": "hn:2", "author": "b", "created_at": NOW}
    monkeypatch.setattr(pipeline, "fetch_all", lambda since, until: [day2])
    fake_llm.replies = replies("hn:2", "s2")
    assert pipeline.run(1, now=NOW + DAY) == 0
    out = json.loads((tmp_path / pipeline.SITE_DATA).read_text(encoding="utf-8"))
    assert out["stats"]["posts_classified"] == 2
    assert out["problems"][0]["people"] == 2  # merged with yesterday's problem


def test_quota_stop_publishes_nothing(fake_llm, monkeypatch, tmp_path):
    from unmet import llm
    monkeypatch.chdir(tmp_path)
    post = {"id": "hn:1", "source": "hn", "site": "Hacker News", "url": "u1", "author": "a", "author_url": None,
            "title": "t", "text": "I wish there was x", "created_at": NOW}
    monkeypatch.setattr(pipeline, "fetch_all", lambda since, until: [post])
    fake_llm.replies = [llm.QuotaExceeded("tokens per day")]
    assert pipeline.run(1, now=NOW) == 3
    assert not (tmp_path / pipeline.SITE_DATA).exists()
