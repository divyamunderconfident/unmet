import { readFileSync } from "node:fs";
import path from "node:path";

export type Quote = {
  text: string;
  url: string;
  author: string;
  author_url: string | null;
  site: string;
  source: "hn" | "se";
  date: string;
};

export type Problem = {
  id: string;
  name: string;
  summary: string;
  people: number;
  mentions: number;
  pain: number;
  pay_signal: boolean;
  score: number;
  sources: ("hn" | "se")[];
  last_seen: string;
  quotes: Quote[];
};

export type Data = {
  updated_at: string;
  window_days: number;
  stats: { posts_classified: number; needs_found: number; needs_in_window: number; problems_in_window: number };
  problems: Problem[];
};

// Read at build time only; the exported site is static and never calls a model.
export function getData(): Data {
  return JSON.parse(readFileSync(path.join(process.cwd(), "public", "data", "problems.json"), "utf-8")) as Data;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export const SITE_NAMES: Record<string, string> = {
  "Hacker News": "Hacker News",
  stackoverflow: "Stack Overflow",
  softwareengineering: "Software Engineering",
  superuser: "Super User",
};

export const REPO = "https://github.com/divyamunderconfident/unmet";
