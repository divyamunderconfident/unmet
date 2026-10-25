import pytest

from unmet import cluster, fetch, llm


class FakeLLM:
    """Stands in for the HTTP call. Replies with scripted messages and records every request."""

    def __init__(self):
        self.replies = []
        self.calls = []

    def __call__(self, url, headers, body):
        self.calls.append({"url": url, "headers": headers, "body": body})
        if not self.replies:
            raise AssertionError("FakeLLM ran out of scripted replies")
        reply = self.replies.pop(0)
        if isinstance(reply, Exception):
            raise reply
        return {"choices": [{"message": reply}], "usage": {"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2}}


def no_network(*args, **kwargs):
    raise AssertionError("tests must not touch the network")


@pytest.fixture(autouse=True)
def fake_llm(monkeypatch, tmp_path):
    """Every test gets fresh cache dirs and can never reach a real model or the network."""
    fake = FakeLLM()
    monkeypatch.setattr(llm, "_post", fake)
    monkeypatch.setattr(llm, "CACHE_DIR", tmp_path / "llm")
    monkeypatch.setattr(fetch, "CACHE_DIR", tmp_path / "http")
    monkeypatch.setattr(fetch.requests, "get", no_network)
    monkeypatch.setattr(cluster, "embed", fake_embed)
    monkeypatch.setenv("GROQ_API_KEY", "test-groq")
    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini")
    return fake


def fake_embed(texts):
    """Bag-of-words vectors over a tiny vocabulary: texts sharing words are similar."""
    import numpy as np
    vocab = sorted({w for t in texts for w in t.lower().split()})
    vecs = np.array([[t.lower().split().count(w) for w in vocab] for t in texts], dtype=float)
    return vecs / np.linalg.norm(vecs, axis=1, keepdims=True)
