import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const TITLE = "Unmet: the internet's unmet demand, ranked daily";
const DESCRIPTION =
  "The problems people publicly ask someone to build, read from Hacker News and Stack Exchange, grouped and ranked every day. Every problem links to the real posts.";

// Runs before paint: apply a saved theme choice so the page never flashes the wrong one.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;

export const metadata: Metadata = {
  // Vercel sets this at build time; absolute URLs make the Open Graph image work when the link is shared.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
  ),
  title: { default: TITLE, template: "%s · Unmet" },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", siteName: "Unmet" },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <div className="box">{children}</div>
      </body>
    </html>
  );
}
