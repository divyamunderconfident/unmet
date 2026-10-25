import json

from unmet import cluster, rank
from unmet.__main__ import make_quote

DAY = 86400
NOW = 100 * DAY


def need(i, problem, author, age_days=1, pain=2, pay=False):
    return {"id": f"hn:{i}", "source": "hn", "site": "Hacker News", "url": f"https://x/{i}", "author": author,
            "author_url": None, "created_at": NOW - age_days * DAY, "problem": problem, "pain": pain,
            "pay_signal": pay, "quote": "q"}


def test_similar_problems_cluster_together():
    needs = [need(1, "self hosted password manager", "a"), need(2, "excel to sql converter", "b"),
             need(3, "self hosted password manager for teams", "c")]
    assert sorted(len(g) for g in cluster.cluster(needs)) == [1, 2]


def test_score_counts_distinct_people_recency_pain_and_pay():
    base = rank.score([need(1, "x", "a")], NOW)
    assert rank.score([need(1, "x", "a"), need(2, "x", "a")], NOW) == base  # same person twice counts once
    assert rank.score([need(1, "x", "a"), need(2, "x", "b")], NOW) > base
    assert rank.score([need(1, "x", "a", age_days=20)], NOW) < base
    assert rank.score([need(1, "x", "a", pain=3)], NOW) > base
    assert rank.score([need(1, "x", "a", pay=True)], NOW) == base * 1.5


def test_top_problems_shape(fake_llm):
    groups = [[need(3, "y", "c")], [need(1, "x", "a"), need(2, "x", "b")]]
    fake_llm.replies = [{"role": "assistant", "content": json.dumps({"name": f"N{i}", "summary": "s"})} for i in range(2)]
    top = rank.top_problems(groups, NOW)
    assert [p["people"] for p in top] == [2, 1]
    assert top[0]["name"] == "N0" and top[0]["quotes"][0]["author"] in {"a", "b"}
    assert len({p["id"] for p in top}) == 2


def test_quote_is_short_and_contains_phrase():
    post = {"title": "t", "text": "word " * 200 + "I wish there was a tool for this. " + "more " * 200}
    q = make_quote(post)
    assert "I wish there was" in q and len(q) <= 242 and q.startswith("…") and q.endswith("…")
