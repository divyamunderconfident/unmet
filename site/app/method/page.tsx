import { REPO, getData } from "@/lib/data";

export const metadata = {
  title: "Method and attribution",
  description: "Where Unmet's posts come from, how problems are found and ranked, and how to ask for a post to be removed.",
};

const H2 = "mt-12 text-lg font-semibold tracking-tight text-zinc-100 scroll-mt-20";
const P = "mt-3 max-w-2xl leading-relaxed text-zinc-400";
const A = "text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:text-amber-300";

export default function Method() {
  const { stats, window_days } = getData();
  return (
    <article>
      <h1 className="rise text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Method and attribution</h1>
      <p className="rise rise-1 mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
        Everything on this site is produced by a script that anyone can read and rerun. No problem is added, removed or
        reordered by hand.
      </p>

      <h2 className={H2}>Sources</h2>
      <ul className={`${P} list-disc space-y-1 pl-5`}>
        <li>
          <a className={A} href="https://hn.algolia.com/api">Hacker News search API</a> (Algolia): stories and comments.
        </li>
        <li>
          <a className={A} href="https://api.stackexchange.com/">Stack Exchange API</a>: questions on Stack Overflow,
          Software Engineering and Super User.
        </li>
      </ul>
      <p className={P}>
        Only official public APIs are used, and only posts containing one of these phrases: &ldquo;I wish there
        was&rdquo;, &ldquo;is there a tool&rdquo;, &ldquo;looking for a way to&rdquo;, &ldquo;would pay for&rdquo;,
        &ldquo;we gave up on&rdquo;, &ldquo;why is there no&rdquo;, &ldquo;does anyone know a tool&rdquo; and &ldquo;I&rsquo;d
        love an app&rdquo;. Reddit and X are not used: their API terms rule this out.
      </p>

      <h2 className={H2}>How problems are found</h2>
      <ol className={`${P} list-decimal space-y-2 pl-5`}>
        <li>A free open model (gpt-oss-20b on Groq) reads posts 20 at a time and decides whether each describes a real unmet need, writes the problem in one line, rates the pain from 1 to 3 and notes any sign the person would pay.</li>
        <li>The one-line problems are embedded locally with all-MiniLM-L6-v2 and similar ones are grouped into a single problem.</li>
        <li>The model names each of the top problems from the lines in its group.</li>
      </ol>

      <h2 className={H2}>How ranking works</h2>
      <p className={P}>
        <span className="font-mono text-zinc-200">score = distinct people × recency × pain × pay boost</span>
      </p>
      <ul className={`${P} list-disc space-y-1 pl-5`}>
        <li>Distinct people: one author raising a problem twice counts once.</li>
        <li>Recency: each post&rsquo;s weight halves every 14 days; only the last {window_days} days count.</li>
        <li>Pain: the average 1–3 rating across the group.</li>
        <li>Pay boost: ×1.5 when anyone in the group says they would pay.</li>
      </ul>
      <p className={P}>
        So far: {stats.posts_classified} posts read, {stats.needs_found} judged to be needs, grouped into{" "}
        {stats.problems_in_window} problems in the last {window_days} days.
      </p>

      <h2 className={H2}>Accuracy</h2>
      <p className={P}>
        Classifier precision: <span className="font-mono text-zinc-200">not measured yet</span>. A hand-labelled sample
        will be published here once it is done. Until then, treat the list as a lead, not a measurement, and read the
        quotes.
      </p>

      <h2 className={H2}>Attribution and licences</h2>
      <p className={P}>
        Each quote is a short excerpt shown with its author&rsquo;s name and a link to the original post. Posts are
        never copied in full. Stack Exchange content is licensed under{" "}
        <a className={A} href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> and attributed to its
        authors per <a className={A} href="https://stackoverflow.com/help/licensing">Stack Exchange&rsquo;s licensing terms</a>.
        Hacker News content belongs to its authors. Source icons are from Simple Icons (CC0).
      </p>

      <h2 id="removal" className={H2}>Request removal</h2>
      <p className={P}>
        If you wrote a quoted post and want it removed, <a className={A} href={`${REPO}/issues/new?title=Removal%20request`}>open an issue</a>{" "}
        with the post&rsquo;s link. It will be removed from the site and from the stored data.
      </p>
    </article>
  );
}
