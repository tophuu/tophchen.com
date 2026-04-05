"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { type Track } from "../../data/tracks";

const MARQUEE_GAP = 20;
const MARQUEE_SPEED = 30;
const MARQUEE_DELAY = 1500;

function ScrollingText({
  text,
  className,
  syncRef,
  syncKey,
  active,
}: {
  text: string;
  className: string;
  syncRef: React.MutableRefObject<Record<string, number>>;
  syncKey: string;
  active: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const fadeLeftRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    let rafId: number | null = null;
    const recalcOverflow = () => {
      const textW = measure.scrollWidth;
      const containerW = container.clientWidth;
      const over = textW > containerW + 1;
      setOverflows((prev) => (prev === over ? prev : over));
      syncRef.current[syncKey] = over ? textW + MARQUEE_GAP : 0;
    };
    const scheduleRecalc = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(recalcOverflow);
    };

    scheduleRecalc();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(scheduleRecalc);
      ro.observe(container);
      ro.observe(measure);
    }
    window.addEventListener("resize", scheduleRecalc);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      ro?.disconnect();
      window.removeEventListener("resize", scheduleRecalc);
      syncRef.current[syncKey] = 0;
    };
  }, [text, syncRef, syncKey]);

  useEffect(() => {
    const inner = innerRef.current;
    const fadeLeft = fadeLeftRef.current;
    if (!inner) return;
    inner.getAnimations().forEach(a => a.cancel());
    if (fadeLeft) {
      fadeLeft.getAnimations().forEach(a => a.cancel());
      fadeLeft.style.opacity = "0";
    }
    if (!overflows || !active) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const startMarquee = () => {
      const el = innerRef.current;
      const fl = fadeLeftRef.current;
      if (!el) return;
      const dist = syncRef.current[syncKey];
      if (!dist) {
        retryTimer = setTimeout(startMarquee, 60);
        return;
      }
      const allDists = Object.values(syncRef.current).filter(d => d > 0);
      if (allDists.length === 0) {
        retryTimer = setTimeout(startMarquee, 60);
        return;
      }
      const maxDist = Math.max(...allDists);
      const totalMs = (maxDist / MARQUEE_SPEED) * 1000;
      const ownFrac = Math.min(dist / maxDist, 1);

      const kf: Keyframe[] = ownFrac >= 0.999
        ? [
            { transform: "translateX(0)" },
            { transform: `translateX(-${dist}px)` },
          ]
        : [
            { transform: "translateX(0)", offset: 0 },
            { transform: `translateX(-${dist}px)`, offset: ownFrac },
            { transform: `translateX(-${dist}px)`, offset: 1 },
          ];

      el.animate(kf, {
        duration: totalMs,
        iterations: Infinity,
        easing: "linear",
      });

      if (fl) {
        const edge = 0.025;
        const fadeIn = Math.min(edge, ownFrac * 0.25);
        const fadeOut = Math.max(fadeIn, ownFrac - edge);
        const fadeKf: Keyframe[] =
          ownFrac >= 0.999
            ? [
                { opacity: "0", offset: 0 },
                { opacity: "1", offset: edge },
                { opacity: "1", offset: 1 - edge },
                { opacity: "0", offset: 1 },
              ]
            : [
                { opacity: "0", offset: 0 },
                { opacity: "1", offset: fadeIn },
                { opacity: "1", offset: fadeOut },
                { opacity: "0", offset: ownFrac },
                { opacity: "0", offset: 1 },
              ];
        fl.animate(fadeKf, {
          duration: totalMs,
          iterations: Infinity,
          easing: "linear",
        });
      }
    };
    const timer = setTimeout(startMarquee, MARQUEE_DELAY);

    return () => {
      clearTimeout(timer);
      if (retryTimer) clearTimeout(retryTimer);
      innerRef.current?.getAnimations().forEach(a => a.cancel());
      const fl = fadeLeftRef.current;
      if (fl) {
        fl.getAnimations().forEach(a => a.cancel());
        fl.style.opacity = "0";
      }
    };
  }, [overflows, active, text, syncRef, syncKey]);

  return (
    <div
      ref={containerRef}
      className={`${className}${overflows ? " md-marquee" : ""}`}
    >
      <span ref={measureRef} className="md-marquee-measure">{text}</span>
      <span ref={innerRef} className="md-marquee-inner">
        {text}
        {overflows && (
          <>
            <span className="md-marquee-gap" />
            {text}
          </>
        )}
      </span>
      {overflows && <span ref={fadeLeftRef} className="md-marquee-fade-left" />}
    </div>
  );
}

interface DynamicIslandProps {
  track: Track;
  isPlaying: boolean;
  isExpanded: boolean;
  isMini: boolean;
  progress: number;
  currentTime: string;
  duration: string;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (pct: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  onToggleExpanded: () => void;
  onCollapse: () => void;
  onToggleMini: () => void;
}

function PlaybackIndicator({ playing }: { playing: boolean }) {
  return (
    <div className={`md-playback-indicator${playing ? " md-indicator-playing" : ""}`}>
      <span className="md-indicator-bar"><span className="md-indicator-wave" /></span>
      <span className="md-indicator-bar"><span className="md-indicator-wave" /></span>
      <span className="md-indicator-bar"><span className="md-indicator-wave" /></span>
      <span className="md-indicator-bar"><span className="md-indicator-wave" /></span>
      <span className="md-indicator-bar"><span className="md-indicator-wave" /></span>
    </div>
  );
}

function PlayCircleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10,8 16,12 10,16" stroke="currentColor" fill="none" />
    </svg>
  );
}

export default function DynamicIsland({
  track, isPlaying, isExpanded, isMini, progress, currentTime, duration,
  onTogglePlay, onNext, onPrev, onSeek, onSeekStart, onSeekEnd, onToggleExpanded, onCollapse, onToggleMini,
}: DynamicIslandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fullSyncRef = useRef<Record<string, number>>({});
  const miniSyncRef = useRef<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      setMounted(true);
      setAnimateOut(false);
      setVisible(true);
      const id = requestAnimationFrame(() => setAnimateOut(true));
      return () => cancelAnimationFrame(id);
    } else {
      setAnimateOut(true);
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 280);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if ((target as HTMLElement | null)?.closest(".bg-switcher")) return;
      if (document.body.classList.contains("theme-transitioning")) return;
      if (isExpanded && ref.current && !ref.current.contains(target as Node)) onCollapse();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isExpanded) onCollapse();
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isExpanded, onCollapse]);

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSeek(Number(e.target.value)),
    [onSeek],
  );

  const handleDropdownClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (target.closest("button, input")) return;
      onToggleMini();
    },
    [onToggleMini],
  );

  return (
    <div
      ref={ref}
      className={`music-widget ${isExpanded ? "expanded" : ""}`}
    >
      <button className="music-icon" aria-label="Now Playing" onClick={onToggleExpanded}>
        <PlayCircleIcon />
      </button>

      {mounted && (
        <div
          className={`music-dropdown ${visible ? "md-visible" : ""} ${animateOut ? "md-anim-out" : ""} ${isMini ? "md-mini" : ""}`}
          onClick={handleDropdownClick}
        >
          <div className="md-album">
            {track.art ? <img src={track.art} alt="" className="md-album-img" /> : null}
          </div>

          <div className="md-full-content">
            <div className="md-text-row">
              <div className="md-text-info">
                <ScrollingText text={track.name} className="md-song" syncRef={fullSyncRef} syncKey="title" active={!isMini && isPlaying} />
                <ScrollingText text={track.artist} className="md-artist" syncRef={fullSyncRef} syncKey="artist" active={!isMini && isPlaying} />
              </div>
              <PlaybackIndicator playing={isPlaying} />
            </div>
            <div className="md-controls">
              <button className="md-ctrl" onClick={() => onPrev()}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.2 7.2Q12.2 6.5 11.5 6.9L5.4 11Q4.8 11.4 4.8 12Q4.8 12.6 5.4 13L11.5 17.1Q12.2 17.5 12.2 16.8Z" />
                  <path d="M20.2 7.2Q20.2 6.5 19.5 6.9L13.4 11Q12.8 11.4 12.8 12Q12.8 12.6 13.4 13L19.5 17.1Q20.2 17.5 20.2 16.8Z" />
                </svg>
              </button>
              <button className="md-ctrl md-play" onClick={() => onTogglePlay()}>
                {isPlaying ? (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                ) : (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button className="md-ctrl" onClick={() => onNext()}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M11.8 7.2Q11.8 6.5 12.5 6.9L18.6 11Q19.2 11.4 19.2 12Q19.2 12.6 18.6 13L12.5 17.1Q11.8 17.5 11.8 16.8Z" />
                  <path d="M3.8 7.2Q3.8 6.5 4.5 6.9L10.6 11Q11.2 11.4 11.2 12Q11.2 12.6 10.6 13L4.5 17.1Q3.8 17.5 3.8 16.8Z" />
                </svg>
              </button>
            </div>
            <div className="md-progress">
              <div className="md-progress-bar">
                <div className="md-progress-track">
                  <div
                    className="md-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  className="md-slider"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSlider}
                  onPointerDown={onSeekStart}
                  onPointerUp={onSeekEnd}
                />
              </div>
              <div className="md-times">
                <span>{currentTime}</span>
                <span>{duration}</span>
              </div>
            </div>
          </div>

          <div className="md-mini-content">
            <div className="md-mini-info">
              <ScrollingText text={track.name} className="md-song" syncRef={miniSyncRef} syncKey="title" active={isMini && isPlaying} />
              <ScrollingText text={track.artist} className="md-artist" syncRef={miniSyncRef} syncKey="artist" active={isMini && isPlaying} />
            </div>
            <div className="md-mini-controls">
              <button className="md-ctrl" onClick={() => onTogglePlay()}>
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button className="md-ctrl" onClick={() => onNext()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M11.8 7.2Q11.8 6.5 12.5 6.9L18.6 11Q19.2 11.4 19.2 12Q19.2 12.6 18.6 13L12.5 17.1Q11.8 17.5 11.8 16.8Z" />
                  <path d="M3.8 7.2Q3.8 6.5 4.5 6.9L10.6 11Q11.2 11.4 11.2 12Q11.2 12.6 10.6 13L4.5 17.1Q3.8 17.5 3.8 16.8Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
