import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { PainBadge, PayBadge, SourceIcon } from "@/components/ui";
import { SITE_NAMES, formatDate, getData } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getData().problems.map((p) => ({ id: p.id }));
}

function find(id: string) {
  const problems = getData().problems;
  const i = problems.findIndex((p) => p.id === id);
  return { problem: problems[i], rank: i + 1 };
}

export async function generateMetadata({ params }: PageProps<"/problem/[id]">) {
  const { problem } = find((await params).id);
  return { title: problem.name, description: problem.summary };
}

export default async function ProblemPage({ params }: PageProps<"/problem/[id]">) {
  const { problem: p, rank } = find((await params).id);
  return (
    <article>
      <Link href="/#problems" className="text-zinc-500 transition-colors hover:text-zinc-200">← All problems</Link>
      <header className="rise mt-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400">#{rank} in the top {getData().problems.length}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-4xl">{p.name}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">{p.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-mono text-zinc-300">
            {p.people} {p.people === 1 ? "person" : "people"} · {p.mentions} {p.mentions === 1 ? "post" : "posts"}
          </span>
          <PainBadge pain={p.pain} />
          {p.pay_signal && <PayBadge />}
        </div>
      </header>

      <h2 className="mt-12 text-lg font-semibold tracking-tight text-zinc-100">What people said</h2>
      <ul className="mt-4 space-y-4">
        {p.quotes.map((q) => (
          <li key={q.url}>
            <Reveal>
              <figure className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700">
                <blockquote cite={q.url} className="text-[15px] leading-relaxed text-zinc-200">&ldquo;{q.text}&rdquo;</blockquote>
                <figcaption className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                  <SourceIcon source={q.source} />
                  {q.author_url ? (
                    <a href={q.author_url} className="text-zinc-300 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-100">{q.author}</a>
                  ) : (
                    <span className="text-zinc-300">{q.author}</span>
                  )}
                  <span>on {SITE_NAMES[q.site] ?? q.site}</span>
                  <span>· {formatDate(q.date)}</span>
                  <a href={q.url} className="ml-auto text-amber-400 transition-colors hover:text-amber-300">Read the post →</a>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-zinc-500">
        Short excerpts, credited and linked to the original.{" "}
        {p.sources.includes("se") && "Stack Exchange content is licensed CC BY-SA. "}
        <Link href="/method#removal" className="underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300">Ask for removal</Link>.
      </p>
    </article>
  );
}
