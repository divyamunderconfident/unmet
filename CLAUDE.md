# Project rules
- Read docs/PRD.md before any task. The "v1 scope" section at the top is what ships first; the rest is for later.
- Ship fast: work autonomously, make reasonable choices without asking, and list the choices you made at the end. Ask only if you are truly blocked (a missing key, file or login).
- Stack: Python 3.11 for the pipeline in the package folder; a Next.js site in /site that only reads JSON files in /site/public/data. The site never calls a model.
- Free services only: Groq or Gemini free tiers, local embeddings (fastembed with all-MiniLM-L6-v2). No paid APIs, databases or hosting.
- Every model call goes through llm.py (copied from ../Retrace), which caches each call on disk by a hash of its input.
- Long runs must stop cleanly at the daily quota and resume from where they stopped.
- Tests use pytest with a fake model client. Tests never call a real model or the network.
- Never read, print or commit .env. Never hard-code keys. The repo is public.
- Commit and push after every working milestone.
- Never invent numbers in README, RESULTS.md or the site. Quote them from results files.
# This project
- Package folder: unmet/. Sources: Hacker News Algolia API (no key) and Stack Exchange API (STACKEXCHANGE_KEY in .env is optional; without it the limit is 300 requests a day).
- Stack Exchange content is CC BY-SA: store short quotes only, always with a link and the author's name.
