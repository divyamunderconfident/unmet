import Link from "next/link";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/Reveal";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Credit, Nav, PainChip } from "@/components/ui";
import {
  PRECISION, REPO, SOURCE_NAMES, ago, daysBefore, firstSeen, formatLong, getData, hue, people, weekday,
} from "@/lib/data";

const ROWS = 6;

/** The design's tile maths: solid tiles scale with score (min 2, max 5), ghost tiles fill to 6 rows. */
function tiles(score: number, top: number) {
  const solid = Math.max(2, Math.round((score / top) * 5));
  return [
    ...Array.from({ length: ROWS - solid }, (_, k) => ({ cls: "tile off", style: { "--k": k } as CSSProperties })),
    ...Array.from({ length: solid }, (_, j) => ({
      cls: "tile on",
      style: { "--a": (0.55 + (j / Math.max(1, solid - 1)) * 0.4).toFixed(2) } as CSSProperties,
    })),
  ];
}

export default function Home() {
  const { problems, stats, updated_at, window_days } = getData();
  const top = problems[0];
  const best = top?.quotes[0];
  const topScore = top?.score || 1;

  return (
    <>
      <div className="stage">
        <div className="in">
          <Nav updated={updated_at} />
          <header id="main" className="fade" style={{ padding: "72px 0 56px", maxWidth: 900 }}>
            <span className="pill ghost sm muted">{weekday(updated_at)} edition · {formatLong(updated_at)}</span>
            <h1 style={{ margin: "28px 0 0", fontSize: "clamp(44px, 7.2vw, 92px)", lineHeight: 1.02, fontWeight: 600, letterSpacing: "-0.035em" }}>
              The internet&rsquo;s <ThemeSwitch inline />
              <br />
              <span className="tone">unmet demand,</span> ranked daily.
            </h1>
            <p style={{ margin: "26px 0 0", maxWidth: 600, fontSize: 19, lineHeight: 1.55, color: "var(--dim)" }}>
              Problems people publicly ask someone to build, read from Hacker News and Stack Exchange, grouped, and ranked by
              how many people raised them, how recently and how painfully.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 36 }}>
              <a className="pill solid big" href="#lead">See today&rsquo;s top problem</a>
              <Link className="pill ghost big" href="/method" style={{ fontWeight: 500 }}>How it works</Link>
            </div>
          </header>

          <ol className="wall fade d2" aria-label={`Today's top ${problems.length} problems; column height shows each problem's score`}>
            {problems.map((p, i) => (
              <li key={p.id}>
                <Link className="col" href={`/problem/${p.id}`} aria-label={`#${i + 1} ${p.name}, score ${p.score.toFixed(3)}`} style={hue(i)}>
                  <span className="tip" aria-hidden="true">
                    <b>#{i + 1} {p.name}</b>
                    <span>Score {p.score.toFixed(3)}</span>
                  </span>
                  {tiles(p.score, topScore).map((t, k) => <span key={k} className={t.cls} style={t.style} />)}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="in" style={{ paddingTop: 18, paddingBottom: 8 }}>
        <p style={{ margin: 0, display: "flex", justifyContent: "space-between", gap: "8px 24px", flexWrap: "wrap", fontSize: 13, color: "var(--dim)" }}>
          <span>Each column is one of today&rsquo;s top {problems.length} problems, #1 on the left. Its height is the problem&rsquo;s score.</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {stats.posts_classified} posts read · {stats.needs_found} needs · {stats.problems_in_window} problems · {window_days} days
          </span>
        </p>
      </div>

      {top && (
        <div className="in" style={{ paddingTop: 56 }}>
          <section id="lead" className="card lead fade d3" aria-labelledby="lead-h" style={{ scrollMarginTop: 24 }}>
            <div className="l">
              <div className="chips">
                <span className="chip" style={{ background: "linear-gradient(90deg,#DCE8FD,#EADFFC)", color: "#17213B", fontWeight: 600 }}>No. 1 today</span>
                {top.pay_signal && <span className="chip">Would pay</span>}
              </div>
              <h2 id="lead-h" style={{ margin: "24px 0 0", fontSize: "clamp(34px, 4.4vw, 56px)", lineHeight: 1.04, fontWeight: 600, letterSpacing: "-0.03em" }}>
                <Link href={`/problem/${top.id}`} style={{ textDecoration: "none" }}>{top.name}</Link>
              </h2>
              <p style={{ margin: "18px 0 0", fontSize: 18, lineHeight: 1.55, color: "var(--dim)", maxWidth: 560 }}>{top.summary}</p>
              <div className="chips" style={{ marginTop: 26 }}>
                <span className="chip"><i>Raised by</i> {people(top.people)}</span>
                <PainChip pain={top.pain} label />
                {top.sources.map((s) => <span key={s} className="chip">{SOURCE_NAMES[s]}</span>)}
                <span className="chip"><i>First seen</i> {ago(daysBefore(firstSeen(top), updated_at))}</span>
              </div>
              <Link className="pill solid" href={`/problem/${top.id}`} style={{ marginTop: 32 }}>Open the listing →</Link>
            </div>
            {best && (
              <figure className="r">
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--dim)" }}>In their words</span>
                <blockquote cite={best.url} style={{ margin: 0, fontSize: 22, lineHeight: 1.45, fontWeight: 500, letterSpacing: "-0.005em", overflowWrap: "anywhere" }}>
                  &ldquo;{best.text}&rdquo;
                </blockquote>
                <figcaption style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
                  <span className="avatar" aria-hidden="true" />
                  <span>
                    <Credit q={best} />
                    <br />
                    <a href={best.url} className="muted" style={{ fontSize: 14 }}>Read the original post ↗</a>
                  </span>
                </figcaption>
              </figure>
            )}
          </section>
        </div>
      )}

      <section id="index" className="in" aria-labelledby="idx-h" style={{ paddingTop: 88, scrollMarginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", padding: "0 20px 20px" }}>
          <h2 id="idx-h" style={{ margin: 0, fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05, fontWeight: 600, letterSpacing: "-0.03em" }}>
            Today&rsquo;s index <span className="tone">top {problems.length}</span>
          </h2>
          <span style={{ fontSize: 14, color: "var(--dim)" }}>Of {stats.problems_in_window} problems in the last {window_days} days</span>
        </div>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {problems.map((p, i) => (
            <li key={p.id}>
              <Reveal>
                <Link className="row" href={`/problem/${p.id}`}>
                  <span className="rk" style={hue(i)}>{i + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 18, lineHeight: 1.3, fontWeight: 600, letterSpacing: "-0.01em" }}>{p.name}</span>
                    <span className="clamp" style={{ marginTop: 3, fontSize: 14, lineHeight: 1.5, color: "var(--dim)" }}>{p.summary}</span>
                  </span>
                  <span className="meta">
                    {p.pay_signal && <span className="chip hot">Would pay</span>}
                    <span className="chip">{people(p.people)}</span>
                    <PainChip pain={p.pain} />
                    {p.sources.map((s) => <span key={s} className="chip" title={SOURCE_NAMES[s]}>{s.toUpperCase()}</span>)}
                    <span className="chip">{ago(daysBefore(p.last_seen, updated_at))}</span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <div className="in" style={{ paddingTop: 72, paddingBottom: 56 }}>
        <div className="foot">
          <section id="follow" className="card" aria-labelledby="follow-h" style={{ padding: 40, scrollMarginTop: 24 }}>
            <h2 id="follow-h" style={{ margin: 0, fontSize: 32, lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.025em" }}>
              Follow the index. <span className="tone">New every day.</span>
            </h2>
            <p style={{ margin: "14px 0 24px", fontSize: 16, lineHeight: 1.55, color: "var(--dim)" }}>
              The day&rsquo;s top problems, each with its quotes and links, in your feed reader. Or watch the repository, where
              every daily update lands as a commit.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="pill solid big" href="/feed.xml">RSS feed</a>
              <a className="pill ghost big" href={REPO} style={{ fontWeight: 500 }}>Watch on GitHub ↗</a>
            </div>
          </section>
          <section className="card" aria-labelledby="how-h" style={{ padding: 40, background: "var(--chip)", boxShadow: "none" }}>
            <h2 id="how-h" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>How it works</h2>
            <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--dim)" }}>
              Every day Unmet reads new public posts that ask for something to exist, keeps the real needs, groups them into
              problems and ranks each by distinct people × recency × pain.
            </p>
            <p style={{ margin: "16px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--dim)" }}>
              Quotes are short excerpts, always credited and linked. Stack Exchange content is CC BY-SA. Classifier precision: {PRECISION}.
            </p>
            <p style={{ margin: "18px 0 0", fontSize: 14 }}><Link href="/method">Method, attribution &amp; removal →</Link></p>
          </section>
        </div>
      </div>
    </>
  );
}
