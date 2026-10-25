import Link from "next/link";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { type Quote, SITE_NAMES, formatDate, formatUpdated, painDots } from "@/lib/data";

export function Logo() {
  return (
    <Link href="/" className="logo">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <rect x="1" y="17" width="12" height="12" rx="3.5" fill="#8FB4F6" />
        <rect x="15" y="10" width="12" height="12" rx="3.5" fill="#B99AF2" />
        <rect x="15" y="1" width="7" height="7" rx="2.5" fill="#EFA3C4" opacity=".8" />
      </svg>
      Unmet
    </Link>
  );
}

/** Home shows the update time here (its switch sits in the H1); other pages show the switch. */
export function Nav({ updated }: { updated?: string }) {
  return (
    <nav className="nav" aria-label="Main">
      <Logo />
      <div className="links">
        <Link href="/#index">Today&rsquo;s index</Link>
        <Link href="/method">Method</Link>
        <Link href="/#follow">Follow</Link>
      </div>
      <div className="end">
        {updated ? (
          <span className="pill ghost hide-s" style={{ fontSize: 13, color: "var(--dim)" }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg,#7FA8F5,#E889D9)" }} />
            Updated {formatUpdated(updated)}
          </span>
        ) : (
          <ThemeSwitch />
        )}
        <Link className="pill solid" href="/#follow">Follow</Link>
      </div>
    </nav>
  );
}

export function PainChip({ pain, label = false }: { pain: number; label?: boolean }) {
  return (
    <span className="chip" role="img" aria-label={`Pain ${pain} of 3`}>
      {label && <i aria-hidden="true">Pain</i>}
      <span aria-hidden="true">{painDots(pain)}</span>
    </span>
  );
}

/** Author linked to their profile, the site, the date: every quote is credited and linked. */
export function Credit({ q, size = 14 }: { q: Quote; size?: number }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1.45 }}>
      {q.author_url ? <a href={q.author_url} style={{ fontWeight: 600 }}>{q.author}</a> : <b style={{ fontWeight: 600 }}>{q.author}</b>}{" "}
      <span className="muted">· {SITE_NAMES[q.site] ?? q.site} · {formatDate(q.date)}</span>
    </span>
  );
}
