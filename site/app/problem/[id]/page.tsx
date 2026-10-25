import Link from "next/link";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/Reveal";
import { Credit, Nav } from "@/components/ui";
import {
  DAY, PRECISION, SOURCE_NAMES, formatDate, formatLong, firstSeen, getData, hue, painDots, people,
} from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getData().problems.map((p) => ({ id: p.id }));
}

function find(id: string) {
  const data = getData();
  const i = data.problems.findIndex((p) => p.id === id);
  return { data, p: data.problems[i], i };
}

export async function generateMetadata({ params }: PageProps<"/problem/[id]">) {
  const { p } = find((await params).id);
  return { title: p.name, description: p.summary };
}

/** 3×3 stack beside the title: filled tiles scale with score against #1 (min 2 of 9), filled from the bottom. */
function stack(score: number, top: number) {
  const filled = Math.max(2, Math.round((score / top) * 7));
  return Array.from({ length: 9 }, (_, i) => {
    const style = { "--h": 215 + i * 12, "--h2": 230 + i * 12, "--a": (0.6 + i * 0.04).toFixed(2), "--k": 2 } as CSSProperties;
    return { cls: i >= 9 - filled ? "tile on" : "tile off", style };
  });
}

export default async function ProblemPage({ params }: PageProps<"/problem/[id]">) {
  const { data, p, i } = find((await params).id);
  const { updated_at, window_days, stats, problems } = data;
  const end = Date.parse(updated_at);
  const start = end - window_days * DAY;
  const days = Array.from({ length: window_days }, (_, d) => {
    const a = start + d * DAY;
    return p.quotes.some((q) => Date.parse(q.date) >= a && Date.parse(q.date) < a + DAY);
  });
  const inWindow = p.quotes.filter((q) => Date.parse(q.date) >= start).length;
  const related = (p.related ?? []).map((id) => problems.findIndex((r) => r.id === id)).filter((r) => r >= 0);

  return (
    <>
      <div className="stage">
        <div className="in">
          <Nav />
          <header id="main" className="hero fade">
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link className="pill ghost sm" href="/#index">← Today&rsquo;s index</Link>
                <span className="pill ghost sm muted">
                  No. {i + 1} of {stats.problems_in_window}{p.pay_signal && " · Would pay"}
                </span>
              </div>
              <h1 style={{ margin: "28px 0 0", fontSize: "clamp(42px, 7vw, 88px)", lineHeight: 1.02, fontWeight: 600, letterSpacing: "-0.035em", overflowWrap: "break-word" }}>
                {p.name}
              </h1>
              <p style={{ margin: "24px 0 0", maxWidth: 680, fontSize: 21, lineHeight: 1.5, color: "var(--dim)" }}>{p.summary}</p>
              <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--dim)" }}>Problem statement written by the classifier from the quotes below.</p>
            </div>
            <figure style={{ margin: 0 }}>
              <div className="stack" aria-hidden="true">
                {stack(p.score, problems[0].score).map((t, k) => <span key={k} className={t.cls} style={t.style} />)}
              </div>
              <figcaption style={{ marginTop: 12, fontSize: 13, color: "var(--dim)" }}>
                Score <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{p.score.toFixed(3)}</strong>
                {i === 0 && ", the highest today"}
              </figcaption>
            </figure>
          </header>
        </div>
      </div>

      <div className="in fade d2" style={{ paddingTop: 48 }}>
        <dl className="facts" style={{ margin: 0 }}>
          {[
            ["Raised by", people(p.people)],
            ["Mentions", p.mentions],
            ["Pain", <span key="pain" role="img" aria-label={`Pain ${p.pain} of 3`}>{painDots(p.pain)} <span style={{ fontSize: 15, fontWeight: 500, color: "var(--dim)" }}>{p.pain} of 3</span></span>],
            ["Would pay", p.pay_signal ? "Yes" : "No"],
            ["Sources", p.sources.map((s) => SOURCE_NAMES[s]).join(", ")],
            ["First seen", formatDate(firstSeen(p))],
            ["Last seen", formatDate(p.last_seen)],
            ["Score", p.score.toFixed(3)],
          ].map(([k, v]) => (
            <div key={String(k)} className="fact">
              <dt className="k">{k}</dt>
              <dd className="v" style={{ margin: "6px 0 0" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="in" aria-labelledby="days-h" style={{ paddingTop: 56 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <h2 id="days-h" style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Mentions, last {window_days} days</h2>
          <span style={{ fontSize: 14, color: "var(--dim)" }}>{inWindow} {inWindow === 1 ? "mention" : "mentions"}</span>
        </div>
        <div className="days" role="img" aria-label={`${inWindow} ${inWindow === 1 ? "mention" : "mentions"} in the ${window_days} days to ${formatLong(updated_at)}`}>
          {days.map((on, d) => <span key={d} className={on ? "day on" : "day"} />)}
        </div>
        <div aria-hidden="true" style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "var(--dim)" }}>
          <span>{formatDate(new Date(start).toISOString())}</span>
          <span>{formatDate(updated_at)}</span>
        </div>
      </section>

      <section className="in" aria-labelledby="q-h" style={{ paddingTop: 72 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <h2 id="q-h" style={{ margin: 0, fontSize: "clamp(30px, 3.6vw, 44px)", lineHeight: 1.05, fontWeight: 600, letterSpacing: "-0.03em" }}>
            In their words <span className="tone">{p.quotes.length} {p.quotes.length === 1 ? "quote" : "quotes"}</span>
          </h2>
          <span style={{ fontSize: 14, color: "var(--dim)" }}>Short excerpts, credited and linked</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {p.quotes.map((q) => (
            <Reveal key={q.url}>
              <figure className="card qcard">
                <span className="qmark" aria-hidden="true">&ldquo;</span>
                <blockquote cite={q.url} style={{ margin: 0, maxWidth: 900, fontSize: "clamp(22px, 2.6vw, 32px)", lineHeight: 1.4, fontWeight: 500, letterSpacing: "-0.01em", overflowWrap: "anywhere" }}>
                  {q.text}
                </blockquote>
                <figcaption style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <span className="avatar" aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12 }} />
                  <Credit q={q} size={15} />
                  <a className="pill ghost" href={q.url} style={{ marginLeft: "auto" }}>Original post ↗</a>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="in" aria-labelledby="rel-h" style={{ paddingTop: 72 }}>
          <h2 id="rel-h" style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>Related problems</h2>
          <div className="rel">
            {related.map((r) => (
              <Link key={problems[r].id} className="card" href={`/problem/${problems[r].id}`}>
                <span className="rk" style={{ ...hue(r), width: 48, height: 48, fontSize: 16 }}>{r + 1}</span>
                <span>
                  <span style={{ display: "block", fontSize: 19, lineHeight: 1.3, fontWeight: 600 }}>{problems[r].name}</span>
                  <span style={{ display: "block", marginTop: 6, fontSize: 14, color: "var(--dim)" }}>
                    {people(problems[r].people)}{problems[r].pay_signal && " · Would pay"}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="in end-foot" style={{ marginTop: 72 }}>
        <span>Stack Exchange content is CC BY-SA. Classifier precision: {PRECISION}.</span>
        <Link href="/method#removal">Ask for a post to be removed →</Link>
      </footer>
    </>
  );
}
