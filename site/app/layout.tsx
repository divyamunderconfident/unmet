import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { REPO, formatDate, getData } from "@/lib/data";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const TITLE = "Unmet: what are people asking someone to build?";
const DESCRIPTION =
  "The problems people publicly say they want solved, read from Hacker News and Stack Exchange, grouped and ranked every day. Every problem links to the real posts.";

export const metadata: Metadata = {
  // Vercel sets this at build time; absolute URLs make the Open Graph image work when the link is shared.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000",
  ),
  title: { default: TITLE, template: "%s · Unmet" },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", siteName: "Unmet" },
  twitter: { card: "summary_large_image" },
};

const NAV = "rounded px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100";

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { updated_at } = getData();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="page-glow min-h-full flex flex-col bg-no-repeat font-sans text-sm">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:rounded focus:bg-zinc-900 focus:px-3 focus:py-1">
          Skip to content
        </a>
        <header className="sticky top-0 z-[5] border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
          <nav aria-label="Main" className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-3 sm:gap-3">
            <Link href="/" className="mr-2 text-[15px] font-semibold tracking-tight text-zinc-100">
              unmet<span className="text-amber-400">.</span>
            </Link>
            <Link href="/#problems" className={NAV}>Problems</Link>
            <Link href="/method" className={NAV}>Method</Link>
            <a href={REPO} className={`${NAV} ml-auto`}>GitHub</a>
          </nav>
        </header>
        <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:py-14">{children}</main>
        <footer className="border-t border-zinc-800/80 px-4 py-5 text-center text-xs text-zinc-500">
          Last updated {formatDate(updated_at)} · Quotes belong to their authors; Stack Exchange content is CC BY-SA ·{" "}
          <Link href="/method#removal" className="underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300">Request removal</Link>
        </footer>
      </body>
    </html>
  );
}
