import json

import pytest

from unmet import classify, llm


def post(i):
    return {"id": f"hn:{i}", "title": "t", "text": "I wish there was a tool"}


def reply(ids, **over):
    results = [{"id": i, "is_need": True, "problem": "p", "pain": 2, "pay_signal": False, **over} for i in ids]
    return {"role": "assistant", "content": json.dumps({"results": results})}


def test_batches_of_20_and_saves_each(fake_llm):
    posts = [post(i) for i in range(45)]
    ids = [p["id"] for p in posts]
    fake_llm.replies = [reply(ids[:20]), reply(ids[20:40]), reply(ids[40:])]
    saves = []
    assert classify.classify(posts, {}, lambda d: saves.append(len(d)))
    assert saves == [20, 40, 45]


def test_bad_reply_is_retried_with_feedback(fake_llm):
    fake_llm.replies = [{"role": "assistant", "content": "sure!"}, reply(["hn:0"], pain=5), reply(["hn:0"])]
    done = {}
    assert classify.classify([post(0)], done, lambda d: None)
    assert done["hn:0"]["pain"] == 2
    assert "invalid" in fake_llm.calls[2]["body"]["messages"][-1]["content"]


def test_gives_up_after_two_retries(fake_llm):
    fake_llm.replies = [{"role": "assistant", "content": "{}"}] * 3
    with pytest.raises(ValueError, match="2 retries"):
        classify.classify([post(0)], {}, lambda d: None)


def test_wrong_ids_are_invalid(fake_llm):
    fake_llm.replies = [reply(["hn:9"]), reply(["hn:0"])]
    done = {}
    classify.classify([post(0)], done, lambda d: None)
    assert list(done) == ["hn:0"]


def test_stops_at_quota_and_resumes(fake_llm):
    posts = [post(i) for i in range(30)]
    ids = [p["id"] for p in posts]
    done = {}
    fake_llm.replies = [reply(ids[:20]), llm.QuotaExceeded("tokens per day")]
    assert classify.classify(posts, done, lambda d: None) is False
    assert len(done) == 20
    fake_llm.replies = [reply(ids[20:])]
    assert classify.classify(posts, done, lambda d: None) is True
    assert len(done) == 30 and len(fake_llm.calls) == 3


def test_waits_out_per_minute_limit(fake_llm, monkeypatch):
    monkeypatch.setattr(classify.time, "sleep", lambda s: None)
    fake_llm.replies = [llm.QuotaExceeded("Limit on tokens per minute (TPM)"), reply(["hn:0"])]
    assert classify.classify([post(0)], {}, lambda d: None)


def test_parse_json_handles_fences():
    assert classify.parse_json('```json\n{"a": 1}\n```') == {"a": 1}
