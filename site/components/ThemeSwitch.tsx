"use client";

import { useSyncExternalStore } from "react";

const DARK = "(prefers-color-scheme: dark)";

function isDark() {
  const chosen = document.documentElement.dataset.theme;
  return chosen ? chosen === "dark" : matchMedia(DARK).matches;
}

function subscribe(onChange: () => void) {
  const mq = matchMedia(DARK);
  mq.addEventListener("change", onChange);
  window.addEventListener("themechange", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener("themechange", onChange);
  };
}

/** Light/dark switch. The knob position comes from CSS, so it is right before this hydrates; this only owns aria-checked and clicks. */
export function ThemeSwitch({ inline = false }: { inline?: boolean }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // private mode or blocked storage: the choice lasts for this page only
    }
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button className={inline ? "sw inline" : "sw"} type="button" role="switch" aria-checked={dark} aria-label="Dark theme" onClick={toggle}>
      <span className="knob" />
    </button>
  );
}
