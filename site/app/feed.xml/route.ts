import { getData } from "@/lib/data";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS of the current top problems, built at export time from problems.json. */
export function GET() {
  const { problems, updated_at } = getData();
  const base = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";
  const items = problems.map((p, i) => `
    <item>
      <title>${esc(`#${i + 1} ${p.name}`)}</title>
      <link>${base}/problem/${p.id}</link>
      <guid isPermaLink="false">${p.id}</guid>
      <pubDate>${new Date(p.last_seen).toUTCString()}</pubDate>
      <description>${esc(`${p.summary} Raised by ${p.people} ${p.people === 1 ? "person" : "people"}.`)}</description>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Unmet: the internet's unmet demand, ranked daily</title>
    <link>${base}</link>
    <description>Problems people publicly ask someone to build, from Hacker News and Stack Exchange.</description>
    <lastBuildDate>${new Date(updated_at).toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
