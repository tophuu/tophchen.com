"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const bgs = [
  {
    id: "big-sur",
    image: "/images/wallpapers/macos-big-sur-apple-layers-fluidic-colorful-wwdc-stock-4096x2304-1455.webp",
  },
  { id: "tahoe", image: "/images/wallpapers/macos-tahoe-26-5120x2880-22675.webp" },
  { id: "sequoia", image: "/images/wallpapers/macos-sequoia-4096x2264-17018.webp" },
  { id: "minimal", image: null },
];

const dotStyles: Record<string, React.CSSProperties> = {
  sequoia: { background: "linear-gradient(135deg, #2a6ec2, #f0a040)" },
  "big-sur": { background: "linear-gradient(150deg, #5838a8, #e83868, #f09020)" },
  tahoe: { background: "linear-gradient(150deg, #d4c896, #30a8e0, #1060c0)" },
  minimal: { background: "#f5f5f7", border: "2px solid rgba(255,255,255,0.3)" },
};

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpColor(from: number[], to: number[], t: number): string {
  return `rgb(${lerpChannel(from[0], to[0], t)},${lerpChannel(from[1], to[1], t)},${lerpChannel(from[2], to[2], t)})`;
}

function parseColor(value: string): number[] {
  const v = value.trim();
  if (v.startsWith("#")) {
    const hex = v.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  const match = v.match(/\d+/g);
  if (match && match.length >= 3) {
    return [Number(match[0]), Number(match[1]), Number(match[2])];
  }
  return [128, 128, 128];
}

// Match CSS `ease` timing-function: cubic-bezier(0.25, 0.1, 0.25, 1)
function easeCss(t: number): number {
  const x1 = 0.25;
  const y1 = 0.1;
  const x2 = 0.25;
  const y2 = 1;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleCurveY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleCurveDerivativeX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  // Solve x(u) = t for u using Newton-Raphson (fallback to bisection)
  let u = t;
  for (let i = 0; i < 6; i += 1) {
    const x = sampleCurveX(u) - t;
    const dx = sampleCurveDerivativeX(u);
    if (Math.abs(x) < 1e-6) return sampleCurveY(u);
    if (Math.abs(dx) < 1e-6) break;
    u -= x / dx;
  }

  let lo = 0;
  let hi = 1;
  u = t;
  for (let i = 0; i < 8; i += 1) {
    const x = sampleCurveX(u);
    if (Math.abs(x - t) < 1e-6) break;
    if (x < t) lo = u;
    else hi = u;
    u = (lo + hi) / 2;
  }
  return sampleCurveY(u);
}

const WALLPAPER_KEY = "pref-wallpaper";
const THEME_KEY = "pref-theme";

export default function DesktopBackground() {
  const [active, setActive] = useState("big-sur");
  const [notesTheme, setNotesTheme] = useState<"white" | "black">("white");
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollbarRaf = useRef<number>(0);
  const synced = useRef(false);

  const switchTheme = useCallback(() => {
    document.body.classList.add("theme-transitioning");
    void document.body.offsetWidth;

    const current = (document.body.dataset.notesTheme || "white") as "white" | "black";
    const before = getComputedStyle(document.body);
    const fromThumb = parseColor(before.getPropertyValue("--scrollbar-thumb"));
    const fromTrack = parseColor(before.getPropertyValue("--scrollbar-track"));

    const next = current === "white" ? "black" : "white";
    document.body.dataset.notesTheme = next;
    setNotesTheme(next);

    // Clear in-flight inline overrides so getComputedStyle reads
    // CSS variable values from the new theme, not stale mid-animation values.
    document.body.style.removeProperty("--scrollbar-thumb");
    document.body.style.removeProperty("--scrollbar-track");

    const after = getComputedStyle(document.body);
    const toThumb = parseColor(after.getPropertyValue("--scrollbar-thumb"));
    const toTrack = parseColor(after.getPropertyValue("--scrollbar-track"));

    // Pin "from" values as inline overrides before the next paint so
    // the CSS variable snap is invisible. WebKit ignores CSS transitions
    // on ::-webkit-scrollbar pseudo-elements, so we lerp via rAF below.
    document.body.style.setProperty("--scrollbar-thumb", `rgb(${fromThumb[0]},${fromThumb[1]},${fromThumb[2]})`);
    document.body.style.setProperty("--scrollbar-track", `rgb(${fromTrack[0]},${fromTrack[1]},${fromTrack[2]})`);

    const duration = 600;
    const start = performance.now();
    cancelAnimationFrame(scrollbarRaf.current);

    function animateScrollbar(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeCss(t);
      document.body.style.setProperty("--scrollbar-thumb", lerpColor(fromThumb, toThumb, eased));
      document.body.style.setProperty("--scrollbar-track", lerpColor(fromTrack, toTrack, eased));
      if (t < 1) {
        scrollbarRaf.current = requestAnimationFrame(animateScrollbar);
      } else {
        document.body.style.removeProperty("--scrollbar-thumb");
        document.body.style.removeProperty("--scrollbar-track");
      }
    }
    scrollbarRaf.current = requestAnimationFrame(animateScrollbar);

    clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      document.body.classList.remove("theme-transitioning");
    }, 650);
  }, []);

  useEffect(() => {
    let savedWp = document.body.dataset.wallpaper || "big-sur";
    let savedTheme = (document.body.dataset.notesTheme || "white") as "white" | "black";
    try {
      const lsWp = localStorage.getItem(WALLPAPER_KEY);
      if (lsWp) savedWp = lsWp;
      const lsTheme = localStorage.getItem(THEME_KEY);
      if (lsTheme === "black" || lsTheme === "white") savedTheme = lsTheme;
    } catch {}
    document.body.dataset.wallpaper = savedWp;
    document.body.dataset.notesTheme = savedTheme;
    setActive(savedWp);
    setNotesTheme(savedTheme);
    requestAnimationFrame(() => {
      synced.current = true;
      document.body.classList.remove("no-transition");
    });
  }, []);

  useEffect(() => {
    if (!synced.current) return;
    document.body.dataset.wallpaper = active;
    try { localStorage.setItem(WALLPAPER_KEY, active); } catch {};
  }, [active]);

  useEffect(() => {
    if (!synced.current) return;
    document.body.dataset.notesTheme = notesTheme;
    try { localStorage.setItem(THEME_KEY, notesTheme); } catch {};
  }, [notesTheme]);

  useEffect(() => {
    return () => {
      clearTimeout(transitionTimer.current);
      cancelAnimationFrame(scrollbarRaf.current);
      document.body.classList.remove("theme-transitioning");
      document.body.style.removeProperty("--scrollbar-thumb");
      document.body.style.removeProperty("--scrollbar-track");
    };
  }, []);

  return (
    <>
      {bgs.map((bg) => (
        <div
          key={bg.id}
          className="desktop-bg"
          data-bg={bg.id}
          style={
            bg.image
              ? { backgroundImage: `url(${bg.image})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "#f5f5f7" }
          }
        />
      ))}

      <div className="bg-switcher">
        {bgs.map((bg) => (
          <div
            key={bg.id}
            className="bg-dot"
            data-bg={bg.id}
            role="button"
            tabIndex={0}
            aria-label={`${bg.id.charAt(0).toUpperCase() + bg.id.slice(1)} wallpaper`}
            style={dotStyles[bg.id]}
            onClick={() => { setActive(bg.id); document.body.dataset.wallpaper = bg.id; }}
            title={bg.id.charAt(0).toUpperCase() + bg.id.slice(1)}
          />
        ))}
        <button
          className="theme-toggle-btn"
          aria-label="Toggle light/dark theme"
          title="Toggle theme"
          onClick={switchTheme}
        >
          <svg className="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg className="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
          </svg>
        </button>
      </div>
    </>
  );
}
