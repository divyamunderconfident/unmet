// Source marks from Simple Icons via Iconify (CC0), used only to label where a quote came from.
const ICONS = {
  hn: {
    label: "Hacker News",
    color: "text-orange-400",
    path: "M0 24V0h24v24zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-2.457 4.875c-.372.745-.688 1.434-.688 1.434s-.297-.708-.651-1.434L8.831 5.896z",
  },
  se: {
    label: "Stack Exchange",
    color: "text-sky-400",
    path: "M21.728 15.577v1.036c0 1.754-1.395 3.177-3.1 3.177h-.904L13.645 24v-4.21H5.371c-1.704 0-3.099-1.423-3.099-3.181v-1.032zM2.275 10.463h19.323v3.979H2.275zm0-5.141h19.323v3.979H2.275zM18.575 0c1.681 0 3.023 1.42 3.023 3.178v1.034H2.275V3.178C2.275 1.422 3.67 0 5.375 0z",
  },
};

export function SourceIcon({ source }: { source: "hn" | "se" }) {
  const icon = ICONS[source];
  return (
    <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${icon.color}`} role="img" aria-label={icon.label}>
      <title>{icon.label}</title>
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}

const PAIN = [
  { max: 1.5, label: "mild", style: "bg-zinc-900 text-zinc-300 ring-zinc-700" },
  { max: 2.5, label: "painful", style: "bg-amber-950 text-amber-300 ring-amber-800" },
  { max: 3, label: "severe", style: "bg-rose-950 text-rose-300 ring-rose-800" },
];

export function PainBadge({ pain }: { pain: number }) {
  const level = PAIN.find((p) => pain <= p.max) ?? PAIN[2];
  return (
    <span
      title={`Average pain ${pain} on a 1-3 scale`}
      className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-inset ${level.style}`}
    >
      {level.label}
    </span>
  );
}

export function PayBadge() {
  return (
    <span
      title="Someone said they would pay"
      className="inline-block rounded bg-emerald-950 px-1.5 py-0.5 font-mono text-[11px] text-emerald-300 ring-1 ring-inset ring-emerald-800"
    >
      would pay
    </span>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 transition-colors hover:border-zinc-700">
      <div className="font-mono text-xl text-zinc-100">{value}</div>
      <div className="mt-0.5 text-xs text-zinc-500">{label}</div>
    </div>
  );
}
