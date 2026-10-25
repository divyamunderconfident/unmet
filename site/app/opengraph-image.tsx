import { ImageResponse } from "next/og";
import { getData } from "@/lib/data";

export const dynamic = "force-static";
export const alt = "Unmet: what are people asking someone to build?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const { problems, stats } = getData();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#09090b", color: "#fafafa", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
          unmet<span style={{ color: "#fbbf24" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>What are people asking someone to build?</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#a1a1aa" }}>
            {`#1 right now: ${problems[0]?.name ?? "—"}`}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#71717a" }}>
          {`${stats.posts_classified} posts read · ${stats.needs_found} needs · from Hacker News and Stack Exchange, updated daily`}
        </div>
      </div>
    ),
    size,
  );
}
