"""Settings in one place. Providers retire models often; a 404 from llm.py usually means one is gone."""

# Groq: https://console.groq.com/docs/models. Same model Retrace runs on.
DEFAULT_MODEL = "groq/openai/gpt-oss-20b"

# From docs/PRD.md. Matched as exact phrases, case-insensitive.
NEED_PHRASES = [
    "I wish there was",
    "is there a tool",
    "looking for a way to",
    "would pay for",
    "we gave up on",
    "why is there no",
    "does anyone know a tool",
    "I'd love an app",
]

SE_SITES = ["stackoverflow", "softwareengineering", "superuser"]

BATCH_SIZE = 20
WINDOW_DAYS = 30  # needs older than this drop out of the ranking
TOP_N = 20
CLUSTER_THRESHOLD = 0.6  # cosine similarity to join an existing cluster
RECENCY_HALF_LIFE_DAYS = 14
PAY_BOOST = 1.5
QUOTE_CHARS = 240
