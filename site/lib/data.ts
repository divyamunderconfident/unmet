import { readFileSync } from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";

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
  related?: string[]; // not produced by the pipeline yet; the Related section stays hidden until it is
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

// Until RESULTS.md has a measured precision, the site says so.
export const PRECISION = "not measured yet";
export const REPO = "https://github.com/divyamunderconfident/unmet";
export const DAY = 864e5;

const UTC = { timeZone: "UTC" } as const;

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", ...UTC });
}

export function formatLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", ...UTC });
}

export function weekday(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", ...UTC });
}

export function formatUpdated(iso: string) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", ...UTC });
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...UTC })}, ${time} UTC`;
}

/** Whole days from `iso` to the edition's update time, so ages are fixed at build time. */
export function daysBefore(iso: string, updated: string) {
  return Math.max(0, Math.floor((Date.parse(updated) - Date.parse(iso)) / DAY));
}

export function ago(days: number) {
  return days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
}

export function firstSeen(p: Problem) {
  return p.quotes.reduce((min, q) => (q.date < min ? q.date : min), p.last_seen);
}

export function people(n: number) {
  return n === 1 ? "1 person" : `${n} people`;
}

export function painDots(pain: number) {
  const n = Math.round(pain);
  return "●".repeat(n) + "○".repeat(3 - n);
}

export const SOURCE_NAMES = { hn: "Hacker News", se: "Stack Exchange" } as const;

export const SITE_NAMES: Record<string, string> = {
  "Hacker News": "Hacker News",
  stackoverflow: "Stack Overflow",
  softwareengineering: "Software Engineering",
  superuser: "Super User",
};

/** Column hue for rank index i (0-based) across the top 20, as in the design's tile maths. */
export function hue(i: number) {
  return {
    "--h": Math.round((215 + (i / 19) * 170) % 360),
    "--h2": Math.round((230 + (i / 19) * 170) % 360),
  } as CSSProperties;
}
