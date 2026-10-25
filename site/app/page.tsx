import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { PainBadge, PayBadge, SourceIcon, Stat } from "@/components/ui";
import { formatDate, getData } from "@/lib/data";

export default function Home() {
  const { problems, stats, updated_at, window_days } = getData();
  return (
    <>
      <section className="pb-12 sm:pb-16">
        <p className="rise font-mono text-xs uppercase tracking-[0.2em] text-amber-400">Updated {formatDate(updated_at)}</p>
        <h1 className="rise rise-1 mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl">
          What are people asking someone to build?
        </h1>
        <p className="rise rise-2 mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Unmet reads Hacker News and Stack Exchange for posts like &ldquo;I wish there was&rdquo; and &ldquo;would pay
          for&rdquo;, keeps the ones a model judges to be real needs, groups them into problems and ranks them by how many
          people raise them, how recently and how painfully. Nothing is hand-picked.
        </p>
        <div className="rise rise-3 mt-7 flex flex-wrap gap-3">
          <a href="#problems" className="rounded-lg bg-amber-400 px-4 py-2 font-medium text-zinc-950 transition-colors hover:bg-amber-300">
            See the top {problems.length}
          </a>
          <Link href="/method" className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900">
            How it works
          </Link>
        </div>
        <div className="rise rise-3 mt-10 grid grid-cols-3 gap-3 sm:max-w-xl">
          <Stat label="posts read" value={stats.posts_classified} />
          <Stat label="needs found" value={stats.needs_found} />
          <Stat label={`problems, last ${window_days} days`} value={stats.problems_in_window} />
        </div>
      </section>

      <section id="problems" className="scroll-mt-20">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Top {problems.length} problems</h2>
        <p className="mt-1 text-zinc-500">Ranked by distinct people × recency × pain, boosted when someone says they would pay.</p>
        <ol className="mt-6 divide-y divide-zinc-800/80 border-y border-zinc-800/80">
          {problems.map((p, i) => (
            <li key={p.id}>
              <Reveal>
                <Link href={`/problem/${p.id}`} className="group flex gap-4 px-1 py-5 transition-colors hover:bg-zinc-900/50 sm:px-3">
                  <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-xs text-zinc-600">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-medium text-zinc-100 transition-colors group-hover:text-amber-300">{p.name}</h3>
                    <p className="mt-1 leading-relaxed text-zinc-400">{p.summary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="font-mono text-zinc-300">
                        {p.people} {p.people === 1 ? "person" : "people"}
                      </span>
                      <PainBadge pain={p.pain} />
                      {p.pay_signal && <PayBadge />}
                      <span className="flex items-center gap-1.5">
                        {p.sources.map((s) => <SourceIcon key={s} source={s} />)}
                      </span>
                      <span>last seen {formatDate(p.last_seen)}</span>
                    </div>
                  </div>
                  <span aria-hidden className="hidden self-center text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-amber-300 sm:block">→</span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
