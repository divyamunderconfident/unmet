import json
from pathlib import Path

from unmet import fetch

FIXTURES = Path(__file__).parent / "fixtures"


def saved(name):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def test_hn_hits_become_posts(monkeypatch):
    monkeypatch.setattr(fetch, "get_json", lambda url, params: saved("hn_search.json"))
    posts = fetch.fetch_hn(0, 2**31)
    assert posts and all(p["source"] == "hn" and p["author"] and p["url"].startswith("https://news.ycombinator.com/item?id=") for p in posts)
    assert all(fetch.find_phrase(f"{p['title']} {p['text']}") for p in posts)


def test_se_keeps_only_exact_phrase_matches(monkeypatch):
    data = saved("se_search.json")
    monkeypatch.setattr(fetch, "get_json", lambda url, params: data)
    monkeypatch.setattr(fetch, "SE_SITES", ["superuser"])
    posts = fetch.fetch_se(0, 2**31)
    assert len({p["id"] for p in posts}) == 1 < len(data["items"])
    assert all("looking for a way to" in p["text"].lower() for p in posts)


def test_fetch_all_dedupes_by_id(monkeypatch):
    p = {"id": "hn:1", "created_at": 1}
    monkeypatch.setattr(fetch, "fetch_hn", lambda s, u: [p, p])
    monkeypatch.setattr(fetch, "fetch_se", lambda s, u: [])
    assert fetch.fetch_all(0, 2) == [p]


def test_get_json_caches_and_hides_key(monkeypatch):
    calls = []

    class Resp:
        ok = True

        def json(self):
            return {"items": []}

    def fake_get(url, params, timeout):
        calls.append(params)
        return Resp()

    monkeypatch.setattr(fetch.requests, "get", fake_get)
    monkeypatch.setenv("STACKEXCHANGE_KEY", "secret")
    fetch.get_json(fetch.SE_URL, {"q": "x"})
    fetch.get_json(fetch.SE_URL, {"q": "x"})
    assert calls == [{"q": "x", "key": "secret"}]
    assert "secret" not in "".join(p.read_text() for p in fetch.CACHE_DIR.glob("*.json"))


def test_clean_strips_html_and_curly_quotes():
    assert fetch.clean("<p>I&#x27;d love an app</p>") == "I'd love an app"
    assert fetch.find_phrase(fetch.clean("I’d love an app for this")) == "I'd love an app"
