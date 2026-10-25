# PRD: Unmet

## v1 scope (ship first, in one day)
- Hacker News Algolia API, plus Stack Exchange if it works without trouble: posts from the last 30 days containing the need phrases below.
- Need phrases: "I wish there was", "is there a tool", "looking for a way to", "would pay for", "we gave up on", "why is there no", "does anyone know a tool", "I'd love an app".
- Classifier (R2) with the Groq model in batches of 20.
- Clustering (R3) with fastembed all-MiniLM-L6-v2, model-written problem names.
- Ranking (R4): distinct people x recency weight x pain, boosted by pay signals. Top 20.
- Static site (R6) with the top 20, quotes, links, author credit, and an attribution page (R7).
- A small precision check: show 50 random classified posts in a tiny local page, I mark each correct or not, and the precision goes in RESULTS.md and on the site. If I haven't labelled yet, the site says "precision: not measured yet".
- Later, not v1: the daily GitHub Actions run (R5), RSS, trend lines, backtest (R8).

## PRD 4 — Unmet: what are people asking someone to build?
Unmet is a live website that updates itself every day with the problems people publicly say they want solved. It reads new posts from Hacker News and Stack Exchange, finds the ones describing an unmet need, groups them into problems, and ranks those by how many people raise them, how recently and how painfully. Nothing is hand-picked: once launched, it runs on its own for $0.
### Why this one
The pain: founders and PMs spend hours reading forums to find problems worth solving, then still decide on gut feel.
Why it's commercial: "voice of the market" research is a paid category. GummySearch, a popular paid tool for mining Reddit for pain points, closed on 30 November 2025 because Reddit's API rules forbid commercial use. Unmet uses sources whose public APIs allow this.
Why it fits AI PM roles: problem discovery, opportunity sizing and a measured classifier, on a site anyone can open.
### Users
Primary: founders and PMs looking for problems with real demand behind them.
Secondary: builders looking for a side project that people already want.
### How it works, every day
Pull: a scheduled GitHub Actions job queries the Hacker News search API (Algolia) and the Stack Exchange API for the last 24 hours of posts containing need phrases such as "I wish there was", "is there a tool", "looking for a way to", "would pay for" and "we gave up on".
Classify: a free model reads posts in batches of 20 and returns, for each, whether it's a real unmet need, the problem in one line, a pain level from 1 to 3, and any sign the person would pay.
Group: local embeddings cluster similar needs into problems, merged with yesterday's problems; the model names each problem.
Rank: score = distinct people × recency weight × pain, boosted by signs of willingness to pay.
Publish: the job commits the JSON; Vercel rebuilds the site and an RSS feed.
### Goals and non-goals
Goals
A site that refreshes daily with no work from you.
Every problem backed by real quotes, each linked to its post with the author credited.
A classifier whose precision you have measured and published.
Non-goals
No Reddit or X: their API terms and costs rule them out.
No scraping: official APIs only.
No full copies of posts: short quotes and links only.
### Requirements
ID
Requirement
Priority
R1
Fetchers for the Hacker News (Algolia) and Stack Exchange APIs: last 24 hours, need-phrase filters, every response cached
P0 must-have
R2
Batched need classifier returning JSON: is_need, problem, pain (1–3), pay_signal
P0 must-have
R3
Clustering with local embeddings, merged with existing problems each day, plus model-written problem names
P0 must-have
R4
Ranking score and a weekly top 20
P0 must-have
R5
Daily GitHub Actions workflow that runs the pipeline and commits results; the API key is stored as a GitHub Actions secret
P0 must-have
R6
Static site: this week's top problems, each with quotes, links, author credit and a trend line; an RSS feed
P1 should-have
R7
Attribution page: sources, licences (Stack Exchange content is CC BY-SA) and how to ask for a post to be removed
P1 should-have
R8
Backtest: for problems found in 2024 posts, how many got a "Show HN" launch within 12 months
P2 nice-to-have
### Success metrics
Classifier precision and recall against 150 posts you label by hand. Target precision: at least 85%, so the top list isn't noise.
Cluster quality: rate 20 random problems as coherent or not. Target: at least 80% coherent.
Runs on its own: the site updates every day for 14 days without you touching it.
Headline: "This month's most-requested developer problem, raised by N different people", plus the backtest result if you build R8.
Commercial signal: RSS subscribers, GitHub stars and visitors (Vercel's free Web Analytics) in the first month.
### Milestones
Day 1: fetchers and the classifier, run on one week of past posts
Day 2: label 150 posts, measure precision, then clustering and ranking
Day 3: the daily workflow, the site and the RSS feed
Day 4: attribution page, backtest, write-up; then it runs itself
### Risks
API limits: Stack Exchange allows 300 requests a day without a key and 10,000 with a free app key. Register a key on day 1; one daily run needs far fewer requests.
Noise: need phrases also match jokes and rhetorical questions. The measured classifier and the 85% precision bar guard against that.
Content rights: short quotes, links and author credit only, plus a removal route on the attribution page.
A silent failure in the daily job: have the workflow fail loudly, so GitHub emails you, and show a "last updated" date on the site.
