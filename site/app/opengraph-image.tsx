import { ImageResponse } from "next/og";
import { getData } from "@/lib/data";

export const dynamic = "force-static";
export const alt = "Unmet: the internet's unmet demand, ranked daily";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const { problems, stats } = getData();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#FBFCFE", color: "#17213B", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 34, fontWeight: 700 }}>
          <svg width="40" height="40" viewBox="0 0 30 30">
            <rect x="1" y="17" width="12" height="12" rx="3.5" fill="#8FB4F6" />
            <rect x="15" y="10" width="12" height="12" rx="3.5" fill="#B99AF2" />
            <rect x="15" y="1" width="7" height="7" rx="2.5" fill="#EFA3C4" />
          </svg>
          Unmet
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 700, lineHeight: 1.03, letterSpacing: -3 }}>
            <span>The internet&rsquo;s</span>
            <span><span style={{ color: "#71809D" }}>unmet demand,</span>&nbsp;ranked daily.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#55617A" }}>
            {`#1 right now: ${problems[0]?.name ?? "—"}`}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#55617A" }}>
          {`${stats.posts_classified} posts read · ${stats.needs_found} needs · from Hacker News and Stack Exchange, updated daily`}
        </div>
      </div>
    ),
    size,
  );
}
