import { Nav } from "@/components/ui";
import { PRECISION, REPO, formatUpdated, getData } from "@/lib/data";

export const metadata = {
  title: "Method and attribution",
  description: "Where Unmet's posts come from, how problems are found and ranked, and how to ask for a post to be removed.",
};

// Same list as NEED_PHRASES in unmet/config.py.
const PHRASES = [
  "I wish there was", "is there a tool", "looking for a way to", "would pay for",
  "we gave up on", "why is there no", "does anyone know a tool", "I'd love an app",
];

const STEPS = [
  ["Pull", "New posts matching the need phrases are fetched and cached."],
  ["Classify", "A free model reads them in batches of 20: is it a real need, what is the problem, how painful (1–3), would they pay?"],
  ["Group", "Local embeddings cluster similar needs into one problem, and the model names it."],
  ["Rank", "Each problem gets a score; the top 20 make the index."],
  ["Publish", "Results are committed as JSON and the site rebuilds."],
];

const N = (a: string, b: string) => ({ background: `linear-gradient(150deg,${a},${b})` });

export default function Method() {
  const { stats, window_days, updated_at } = getData();
  return (
    <>
      <div className="stage">
        <div className="in">
          <Nav />
          <header id="main" className="fade" style={{ padding: "64px 0 72px", maxWidth: 920 }}>
            <span className="pill ghost sm muted">Method &amp; attribution</span>
            <h1 style={{ margin: "28px 0 0", fontSize: "clamp(40px, 6.4vw, 84px)", lineHeight: 1.03, fontWeight: 600, letterSpacing: "-0.035em" }}>
              How the index is made, <span className="tone">and whose words it quotes.</span>
            </h1>
            <p style={{ margin: "24px 0 0", maxWidth: 620, fontSize: 19, lineHeight: 1.55, color: "var(--dim)" }}>
              Nothing is hand-picked. A daily job reads public posts, a model sorts real needs from noise, and the ranking is
              arithmetic you can check.
            </p>
          </header>
        </div>
      </div>

      <div className="in fade d2" style={{ paddingTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="card sec" aria-labelledby="s1">
          <span className="n" style={N("#C6DAFC", "#B4C2F7")}>01</span>
          <h2 id="s1">Every day</h2>
          <ol className="steps">
            {STEPS.map(([b, s]) => <li key={b}><b>{b}</b><span>{s}</span></li>)}
          </ol>
        </section>

        <div className="g2">
          <section className="card sec" aria-labelledby="s2">
            <span className="n" style={N("#CFCBFA", "#C3B0F6")}>02</span>
            <h2 id="s2">Sources</h2>
            <p>
              <strong>Hacker News</strong> through the official <a href="https://hn.algolia.com/api">Algolia search API</a>,
              and <strong>Stack Exchange</strong> (Stack Overflow, Software Engineering, Super User) through the official{" "}
              <a href="https://api.stackexchange.com/">Stack Exchange API</a>. No scraping, and no Reddit or X, whose API
              terms rule them out. We read the last {window_days} days of posts that contain:
            </p>
            <div className="chips" role="list" aria-label="Need phrases">
              {PHRASES.map((p) => <span key={p} className="chip" role="listitem">{p}</span>)}
            </div>
          </section>

          <section className="card sec" aria-labelledby="s3">
            <span className="n" style={N("#E3C6F8", "#DDAEEF")}>03</span>
            <h2 id="s3">How ranking works</h2>
            <div className="eq" role="img" aria-label="Score equals different people times recency times pain, boosted if someone would pay">
              <span className="t" style={N("#D3E2FD", "#BCD0FA")}>People</span><span className="op">×</span>
              <span className="t" style={N("#DCD7FC", "#C9BEF8")}>Recency</span><span className="op">×</span>
              <span className="t" style={N("#EFD3FA", "#E3BDF3")}>Pain</span><span className="op">+</span>
              <span className="t" style={N("#FBD8D0", "#F7C2A9")}>Pay boost</span>
            </div>
            <p style={{ marginTop: 22 }}>
              <strong>People</strong> counts different authors, not posts. <strong>Recency</strong> halves a post&rsquo;s
              weight every 14 days. <strong>Pain</strong> is the average 1–3 level the classifier assigns. If anyone says
              they would pay, the score is multiplied by 1.5.
            </p>
          </section>
        </div>

        <section className="card sec" aria-labelledby="s4">
          <span className="n" style={N("#F6CFE6", "#F1B9D3")}>04</span>
          <h2 id="s4">This edition</h2>
          <dl className="figs" style={{ marginBottom: 0 }}>
            {[
              ["Posts classified", stats.posts_classified],
              ["Needs found", stats.needs_found],
              ["Problems", stats.problems_in_window],
              ["Window", `${window_days} days`],
            ].map(([k, v]) => (
              <div key={k}><dt className="k">{k}</dt><dd className="v" style={{ margin: "4px 0 0" }}>{v}</dd></div>
            ))}
          </dl>
          <p>Last updated {formatUpdated(updated_at)}.</p>
        </section>

        <div className="g2">
          <section className="card sec" aria-labelledby="s5">
            <span className="n" style={N("#FAD3D6", "#F6BDB8")}>05</span>
            <h2 id="s5">Accuracy</h2>
            <p style={{ fontSize: "clamp(22px, 2.4vw, 28px)", lineHeight: 1.3, color: "var(--ink)", fontWeight: 600, letterSpacing: "-0.01em" }}>
              Classifier precision: <span className="tone">{PRECISION}.</span>
            </p>
            <p>
              The phrases also catch jokes and rhetorical questions. We will hand-label a random sample of classified posts
              and publish the share the model got right here. Until then, judge each listing by its quotes.
            </p>
          </section>

          <section className="card sec" aria-labelledby="s6">
            <span className="n" style={N("#FCDCC8", "#F8C79E")}>06</span>
            <h2 id="s6">Attribution &amp; licence</h2>
            <p>
              Every quote shows its author&rsquo;s name, its source and a link to the original post. We keep short excerpts
              only, never full posts; a cut is marked with &ldquo;…&rdquo;.
            </p>
            <p>
              Content from Stack Exchange sites is licensed under{" "}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" style={{ color: "var(--ink)", fontWeight: 600 }}>Creative Commons BY-SA 4.0</a>{" "}
              per <a href="https://stackoverflow.com/help/licensing" style={{ color: "var(--ink)", fontWeight: 600 }}>Stack Exchange&rsquo;s licensing terms</a>,
              and each Stack Exchange quote credits its author with links to their profile and the original post. Hacker News
              comments remain their authors&rsquo; own.
            </p>
          </section>
        </div>

        <section id="removal" className="card sec" aria-labelledby="s7" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap", scrollMarginTop: 24 }}>
          <div style={{ maxWidth: 640 }}>
            <h2 id="s7">Remove a post</h2>
            <p>
              Wrote one of the quoted posts and want it off Unmet? Open an issue with the link to the original post, and it
              will be dropped from the next daily edition and from the stored data.
            </p>
          </div>
          <a className="pill solid big" href={`${REPO}/issues/new?title=Removal%20request`}>Request a removal on GitHub</a>
        </section>
      </div>

      <footer className="in" style={{ display: "flex", justifyContent: "space-between", gap: "12px 24px", flexWrap: "wrap", paddingTop: 40, paddingBottom: 40, fontSize: 14, color: "var(--dim)" }}>
        <span>Unmet is open source and runs on free services.</span>
        <a href={REPO}>Source on GitHub ↗</a>
      </footer>
    </>
  );
}
