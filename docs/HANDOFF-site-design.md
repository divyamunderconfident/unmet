# Handoff: restyle the site to the "soft tiles" design

The approved design is direction C, "soft tiles". The design files are in `docs/design/`:

- `home.dc.html` is the home page.
- `problem.dc.html` is the problem page (it shows #1 as the example).
- `method.dc.html` is the method and attribution page.

These are design-canvas files, not runnable pages. Copy their markup, the CSS inside `<helmet><style>`, and the tile maths in each `renderVals()`. Their numbers are a frozen snapshot of `problems.json` (updated 2026-10-25). The real site must read every number from the data.

## The job

Restyle the existing Next.js site in `/site` (`app/page.tsx`, `app/problem/[id]/page.tsx`, `app/method/page.tsx`, `components/`, `globals.css`) to match the design.

Keep the current data flow: `lib/data.ts` reads `public/data/problems.json` at build time, the site is a static export, and the site never calls a model.

Read `site/AGENTS.md` first. This Next.js version has breaking changes, and its docs are in `node_modules/next/dist/docs/`.

## Design tokens

Font: Figtree (400/500/600/700) from `next/font/google`.

| Token | Light | Dark |
|---|---|---|
| `--out` (page behind the panel) | #E9EDF5 | #080B14 |
| `--box` (main rounded panel) | #FBFCFE | #0F1424 |
| `--card` | #FFFFFF | #151B2E |
| `--ink` (text, navy) | #17213B | #E9EDF7 |
| `--tone` (second headline tone) | #71809D | #8B98B4 |
| `--dim` (secondary text) | #55617A | #A6B0C6 |
| `--line` | #E3E7EF | #232B42 |
| `--chip` | #F1F4F9 | #1B2238 |
| `--btn` / `--btnfg` | #17213B / #FFF | #E9EDF7 / #0F1424 |

`--tone` is only for large headline text (contrast is about 4:1). Body text uses `--dim` or `--ink`.

Theme: follow `prefers-color-scheme` by default. The pill switch overrides it and stores the choice in `localStorage` (wrap the access in try/catch). Set `data-theme` on `<html>` before paint, with a small inline script, so the page doesn't flash the wrong theme.

## Components

- **Panel**: the whole page sits in one panel, `max-width: 1240px`, 32px radius, with a soft shadow on `--out`. Side padding is 56px, or 18px below 720px.
- **Stage**: the hero background has faint vertical lines in 12 columns, drawn with `linear-gradient(to right, var(--grid) 1px, transparent 1px)` and `background-size: calc(100%/12) 100%`.
- **Theme switch**: a `<button role="switch" aria-checked aria-label="Dark theme">`. The track is a blue→violet→peach gradient with a white knob. On Home it sits inline in the H1, sized in `em`. On the other pages it's in the nav at 52×30.
- **Tile wall** (Home hero): a 20-column grid, one column per top-20 problem, with #1 on the left.
  - Solid tiles per column: `max(2, round(score / topScore * 5))`. Ghost tiles fill up to 6 rows.
  - Column hue: `(215 + i/19*170) % 360`. Each tile is a 155° gradient, with opacity rising toward the bottom.
  - Each column is an `<a>` to the problem page, with `aria-label` "#N name, score X" and a hover/focus tooltip.
  - Below 720px, show only the first 10 columns.
- **Rank tile**: a 52px rounded square with the column's hue gradient and the rank in #141B30. It's used in the index rows and in related-problem cards.
- **Chips**: rounded pills on `--chip` for people, pain (●●○ with an `aria-label`), source (HN/SE), age and "Would pay".
- **Buttons**: the solid navy pill (`--btn`, deep shadow) and the ghost pill (`--card` with a `--line` border).
- **Quote card**: a gradient “ mark, the quote text, then the author linked to `author_url`, the site, the date, and an "Original post ↗" link.

## Pages

1. **Home**
   - Nav: logo, links, an "Updated <updated_at>" pill and a Follow button.
   - Hero: "Sunday edition · <date>" pill, then the H1 "The internet's [switch] / unmet demand, ranked daily.", the sub line, two CTAs and the tile wall.
   - A caption line with the stats: `posts_classified`, `needs_found`, `problems_in_window` and `window_days`.
   - The lead card for #1, with its best quote.
   - The ranked top 20.
   - Follow card (email field plus RSS) and a "How it works" card.
2. **Problem** (`/problem/[id]`)
   - Hero: back pill, then the "No. N of <problems_in_window>" pill (add "· Would pay" when `pay_signal` is true), then the name with one phrase in `--tone` (optional) and the summary.
   - Fact tiles: people, mentions, pain, would pay, sources, first seen, last seen and score.
   - A 30-day row of day tiles, with a tile lit on each day that has a quote.
   - Every quote as a quote card.
   - Related problems as rank-tile cards.
3. **Method**: numbered cards for Every day, Sources (need-phrase chips), How ranking works (People × Recency × Pain + Pay boost tiles), This edition (stats), Accuracy, Attribution & licence, and Remove a post.
   - Accuracy reads "Classifier precision: not measured yet" until `RESULTS.md` has a measured number.
   - Remove a post links to GitHub issues.

## Data the pipeline must add

- **`first_seen`** per problem: the earliest quote date. You can compute it in the site from `quotes`.
- **`related`**: up to 3 problem ids per problem, by centroid cosine similarity in `cluster.py`. Until it exists, hide the Related section. Don't hand-pick related problems.
- **Daily mentions**: optional. The day-tile row can be computed from the quote dates for now.

## Rules (from the project)

- Never invent numbers: every figure comes from `problems.json` or `RESULTS.md`.
- Every quote shows the author, the site and a link to the original. Stack Exchange quotes are CC BY-SA, short excerpts only.
- Motion is limited to fade-ins (the existing `Reveal.tsx` is fine) and hover lifts, and all of it is switched off under `prefers-reduced-motion`. No 3D, no custom cursor, no scroll-jacking.
- Accessibility: text contrast 4.5:1, real `<a>` and `<button>` elements, touch targets of at least 44px, and SVG decorations marked `aria-hidden`.
- It must work at 360px wide without horizontal scroll.

## Done when

- `npm run build` passes and the static export renders all three pages.
- Every problem page is generated from the data.
- Light, dark and system themes all work.
- The layout checks out at 360px, 768px and 1280px.
- It's committed and pushed.
