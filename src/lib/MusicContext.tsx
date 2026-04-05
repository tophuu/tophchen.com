"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { tracks, trackUrl, type Track } from "../data/tracks";

const TRACK_KEY = "pref-music-track";
const EXPANDED_KEY = "pref-music-expanded";
const TIME_KEY = "pref-music-time";
const MINI_KEY = "pref-music-mini";
const HISTORY_KEY = "pref-music-history";
const HISTORY_POS_KEY = "pref-music-history-pos";

// Module-level Audio singleton — survives Strict Mode double-mount.
const audio: HTMLAudioElement | null =
  typeof window !== "undefined"
    ? (() => {
        const a = new Audio();
        a.preload = "metadata";
        return a;
      })()
    : null;

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function createShuffledDeck(total: number, avoid?: number): number[] {
  const deck: number[] = [];
  for (let i = 0; i < total; i++) deck.push(i);
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  // Avoid back-to-back repeat at deck boundary
  if (avoid !== undefined && deck[0] === avoid && deck.length > 1) {
    const swapIdx = 1 + Math.floor(Math.random() * (deck.length - 1));
    [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
  }
  return deck;
}

function mediaArtUrl(path?: string): string | undefined {
  if (!path) return undefined;
  const slash = path.lastIndexOf("/");
  if (slash < 0) return encodeURIComponent(path);
  const base = path.slice(0, slash + 1);
  const name = path.slice(slash + 1);
  return `${base}${encodeURIComponent(name)}`;
}

export interface MusicState {
  track: Track;
  currentTrack: number;
  isPlaying: boolean;
  isExpanded: boolean;
  isMini: boolean;
  progress: number;
  currentTime: string;
  duration: string;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (index: number) => void;
  seek: (pct: number) => void;
  seekStart: () => void;
  seekEnd: () => void;
  toggleExpanded: () => void;
  collapse: () => void;
  toggleMini: () => void;
}

const MusicContext = createContext<MusicState | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const playHistoryRef = useRef<number[]>([0]);
  const historyPosRef = useRef(0);
  const shuffledDeckRef = useRef<number[]>([]);
  const deckPosRef = useRef(0);
  const consecutiveErrorsRef = useRef(0);
  const initializedRef = useRef(false);
  const handleNextRef = useRef<() => void>(() => {});
  const pendingSeekRef = useRef<number | null>(null);
  const userSeekingRef = useRef(false);
  const wasPlayingBeforeSeekRef = useRef(false);
  const switchingTrackRef = useRef(false);
  const playAttemptIdRef = useRef(0);
  const preloadedArtRef = useRef<Set<string>>(new Set());

  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [progress, setProgress] = useState(0);
  const [curTime, setCurTime] = useState("0:00");
  const [dur, setDur] = useState("0:00");

  const track = tracks[currentTrack];

  const preloadArt = useCallback((art?: string) => {
    if (!art || preloadedArtRef.current.has(art)) return;
    preloadedArtRef.current.add(art);
    const img = new Image();
    img.decoding = "async";
    img.src = art;
    if (typeof img.decode === "function") {
      void img.decode().catch(() => {});
    }
  }, []);

  const persistHistory = useCallback(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(playHistoryRef.current));
      localStorage.setItem(HISTORY_POS_KEY, String(historyPosRef.current));
    } catch {}
  }, []);

  const loadAndPlay = useCallback((index: number) => {
    if (!audio) return;
    switchingTrackRef.current = true;
    const attemptId = ++playAttemptIdRef.current;
    audio.src = trackUrl(tracks[index].file);
    pendingSeekRef.current = null;
    try { localStorage.setItem(TIME_KEY, "0"); } catch {}
    setProgress(0);
    setCurTime("0:00");
    setDur("0:00");
    audio.play()
      .then(() => {
        if (attemptId !== playAttemptIdRef.current) return;
        setIsPlaying(true);
      })
      .catch(() => {
        if (attemptId !== playAttemptIdRef.current) return;
        switchingTrackRef.current = false;
        if (audio.paused) setIsPlaying(false);
      });
  }, []);

  const handleNext = useCallback(() => {
    const h = playHistoryRef.current;
    const pos = historyPosRef.current;
    let nextIndex: number;
    if (pos < h.length - 1) {
      nextIndex = h[pos + 1];
      historyPosRef.current = pos + 1;
    } else {
      let deck = shuffledDeckRef.current;
      let dPos = deckPosRef.current;
      if (dPos >= deck.length) {
        deck = createShuffledDeck(tracks.length, h[pos]);
        shuffledDeckRef.current = deck;
        dPos = 0;
      }
      nextIndex = deck[dPos];
      deckPosRef.current = dPos + 1;
      playHistoryRef.current = [...h, nextIndex];
      historyPosRef.current = pos + 1;
    }
    setCurrentTrack(nextIndex);
    loadAndPlay(nextIndex);
    persistHistory();
  }, [loadAndPlay, persistHistory]);

  const handlePrev = useCallback(() => {
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const pos = historyPosRef.current;
    if (pos > 0) {
      historyPosRef.current = pos - 1;
      const prevIndex = playHistoryRef.current[pos - 1];
      setCurrentTrack(prevIndex);
      loadAndPlay(prevIndex);
      persistHistory();
    }
  }, [loadAndPlay, persistHistory]);

  const selectTrack = useCallback(
    (index: number) => {
      const h = playHistoryRef.current;
      const pos = historyPosRef.current;
      const newH = [...h.slice(0, pos + 1), index];
      playHistoryRef.current = newH;
      historyPosRef.current = newH.length - 1;
      setCurrentTrack(index);
      loadAndPlay(index);
      persistHistory();
    },
    [loadAndPlay, persistHistory],
  );

  const togglePlay = useCallback(() => {
    if (!audio) return;
    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0;
      const attemptId = ++playAttemptIdRef.current;
      audio
        .play()
        .then(() => {
          if (attemptId !== playAttemptIdRef.current) return;
          setIsPlaying(true);
        })
        .catch(() => {
          if (attemptId !== playAttemptIdRef.current) return;
          if (audio.paused) setIsPlaying(false);
        });
    } else {
      playAttemptIdRef.current++;
      switchingTrackRef.current = false;
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekStart = useCallback(() => {
    if (!audio) return;
    userSeekingRef.current = true;
    wasPlayingBeforeSeekRef.current = !audio.paused;
    if (!audio.paused) audio.pause();
  }, []);

  const seekEnd = useCallback(() => {
    if (!audio) return;
    userSeekingRef.current = false;
    if (wasPlayingBeforeSeekRef.current) {
      const attemptId = ++playAttemptIdRef.current;
      audio.play()
        .then(() => {
          if (attemptId !== playAttemptIdRef.current) return;
          setIsPlaying(true);
        })
        .catch(() => {
          if (attemptId !== playAttemptIdRef.current) return;
          if (audio.paused) setIsPlaying(false);
        });
    }
  }, []);

  const seek = useCallback((pct: number) => {
    if (audio && audio.duration) {
      const target = (pct / 100) * audio.duration;
      audio.currentTime = Math.min(target, audio.duration - 0.1);
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurTime(formatTime(audio.currentTime));
    }
  }, []);

  const toggleExpanded = useCallback(() => setIsExpanded((e) => !e), []);
  const collapse = useCallback(() => setIsExpanded(false), []);
  const toggleMini = useCallback(() => setIsMini((m) => !m), []);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  // One-time init — guarded so Strict Mode double-mount is harmless.
  useEffect(() => {
    if (!audio || initializedRef.current) return;
    initializedRef.current = true;

    // --- Restore persisted preferences ---
    let startTrack = Math.floor(Math.random() * tracks.length);
    try {
      const saved = localStorage.getItem(TRACK_KEY);
      if (saved) {
        const idx = tracks.findIndex((t) => t.file === saved);
        if (idx >= 0) startTrack = idx;
      }
    } catch {}

    // Restore play history so user can skip backwards across reloads
    let restoredHistory: number[] | null = null;
    let restoredPos = 0;
    try {
      const hStr = localStorage.getItem(HISTORY_KEY);
      const pStr = localStorage.getItem(HISTORY_POS_KEY);
      if (hStr) {
        const parsed = JSON.parse(hStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          restoredHistory = parsed;
          restoredPos = pStr ? parseInt(pStr, 10) || 0 : parsed.length - 1;
          restoredPos = Math.max(0, Math.min(restoredPos, parsed.length - 1));
          startTrack = parsed[restoredPos];
        }
      }
    } catch {}

    let expanded = true;
    try {
      const v = localStorage.getItem(EXPANDED_KEY);
      if (v !== null) expanded = v === "1";
    } catch {}

    let mini = false;
    try {
      const v = localStorage.getItem(MINI_KEY);
      if (v !== null) mini = v === "1";
    } catch {}

    let savedTime = 0;
    try {
      const v = localStorage.getItem(TIME_KEY);
      if (v) savedTime = parseFloat(v) || 0;
    } catch {}

    if (restoredHistory) {
      playHistoryRef.current = restoredHistory;
      historyPosRef.current = restoredPos;
    } else {
      playHistoryRef.current = [startTrack];
      historyPosRef.current = 0;
    }
    shuffledDeckRef.current = createShuffledDeck(tracks.length, startTrack);
    deckPosRef.current = 0;
    setCurrentTrack(startTrack);
    setIsExpanded(expanded);
    setIsMini(mini);

    // --- Wire up event listeners ---
    let lastTimeSave = 0;
    const onTimeUpdate = () => {
      if (audio.duration) {
        if (switchingTrackRef.current && !audio.paused && audio.currentTime > 0) {
          switchingTrackRef.current = false;
        }
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurTime(formatTime(audio.currentTime));
        // Throttle localStorage writes to ~every 2 seconds
        const now = Date.now();
        if (now - lastTimeSave > 2000) {
          lastTimeSave = now;
          try {
            localStorage.setItem(TIME_KEY, String(audio.currentTime));
          } catch {}
        }
      }
    };
    const onLoadedMetadata = () => {
      setDur(formatTime(audio.duration));
      // Apply pending seek (timeline restore on reload)
      const seekTo = pendingSeekRef.current;
      if (seekTo !== null && seekTo > 0 && seekTo < audio.duration) {
        audio.currentTime = seekTo;
        setProgress((seekTo / audio.duration) * 100);
        setCurTime(formatTime(seekTo));
        pendingSeekRef.current = null;
      }
    };
    const onEnded = () => {
      switchingTrackRef.current = true;
      handleNextRef.current();
    };
    const onPlaying = () => {
      consecutiveErrorsRef.current = 0;
      setIsPlaying(true);
    };
    const onPause = () => {
      if (userSeekingRef.current || switchingTrackRef.current || audio.ended) return;
      setIsPlaying(false);
    };
    const onError = () => {
      if (consecutiveErrorsRef.current < 5) {
        consecutiveErrorsRef.current++;
        handleNextRef.current();
      } else {
        switchingTrackRef.current = false;
        setIsPlaying(false);
      }
    };

    // Flush state on page unload so reloads aren't stale.
    const onBeforeUnload = () => {
      try {
        localStorage.setItem(TIME_KEY, String(audio.currentTime));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(playHistoryRef.current));
        localStorage.setItem(HISTORY_POS_KEY, String(historyPosRef.current));
      } catch {}
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    window.addEventListener("beforeunload", onBeforeUnload);

    // --- Load the track ---
    audio.src = trackUrl(tracks[startTrack].file);

    if (savedTime > 0) {
      pendingSeekRef.current = savedTime;
    }

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      window.removeEventListener("beforeunload", onBeforeUnload);
      initializedRef.current = false;
    };
  }, []);

  // --- Persist preferences ---
  useEffect(() => {
    if (!initializedRef.current) return;
    try {
      localStorage.setItem(TRACK_KEY, tracks[currentTrack].file);
    } catch {}
  }, [currentTrack]);

  useEffect(() => {
    if (!initializedRef.current) return;
    try {
      localStorage.setItem(EXPANDED_KEY, isExpanded ? "1" : "0");
    } catch {}
  }, [isExpanded]);

  useEffect(() => {
    if (!initializedRef.current) return;
    try {
      localStorage.setItem(MINI_KEY, isMini ? "1" : "0");
    } catch {}
  }, [isMini]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const mediaSession = navigator.mediaSession;
    mediaSession.setActionHandler("nexttrack", handleNext);
    mediaSession.setActionHandler("previoustrack", handlePrev);
    mediaSession.setActionHandler("play", togglePlay);
    mediaSession.setActionHandler("pause", togglePlay);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "MediaTrackNext" || event.key === "MediaTrackNext") {
        event.preventDefault();
        handleNext();
      } else if (event.code === "MediaTrackPrevious" || event.key === "MediaTrackPrevious") {
        event.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      mediaSession.setActionHandler("nexttrack", null);
      mediaSession.setActionHandler("previoustrack", null);
      mediaSession.setActionHandler("play", null);
      mediaSession.setActionHandler("pause", null);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleNext, handlePrev, togglePlay]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const mediaSession = navigator.mediaSession;
    mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.artist,
      album: "Toph Chen",
      artwork: track.art
        ? [
            {
              src: mediaArtUrl(track.art) ?? track.art,
              sizes: "256x256",
              type: "image/webp",
            },
          ]
        : [],
    });
  }, [track]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // Stagger preload unique album art to avoid competing with startup work.
  useEffect(() => {
    const uniqueArt = Array.from(
      new Set(tracks.map((t) => t.art).filter((art): art is string => Boolean(art))),
    );

    let cursor = 0;
    let timer: number | null = null;

    const step = () => {
      // Keep concurrency low to reduce UI/decode contention at startup.
      for (let i = 0; i < 3 && cursor < uniqueArt.length; i++) {
        preloadArt(uniqueArt[cursor]);
        cursor++;
      }
      if (cursor < uniqueArt.length) {
        timer = window.setTimeout(step, 120);
      }
    };

    timer = window.setTimeout(step, 300);
    return () => {
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [preloadArt]);

  // Prioritize current/nearby art so quick skips are more likely cache-hot.
  useEffect(() => {
    const idxs = [
      currentTrack,
      (currentTrack + 1) % tracks.length,
      (currentTrack + 2) % tracks.length,
      (currentTrack - 1 + tracks.length) % tracks.length,
      (currentTrack - 2 + tracks.length) % tracks.length,
    ];
    for (const idx of idxs) preloadArt(tracks[idx]?.art);
  }, [currentTrack, preloadArt]);

  // Prefetch next track audio so playback starts faster on skip.
  useEffect(() => {
    const pos = historyPosRef.current;
    const h = playHistoryRef.current;
    const deck = shuffledDeckRef.current;
    const dPos = deckPosRef.current;

    const nextIdx = pos < h.length - 1
      ? h[pos + 1]
      : dPos < deck.length
        ? deck[dPos]
        : undefined;
    if (nextIdx !== undefined && nextIdx !== currentTrack && tracks[nextIdx]) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "fetch";
      link.href = trackUrl(tracks[nextIdx].file);
      document.head.appendChild(link);
      return () => { link.remove(); };
    }
  }, [currentTrack]);

  const value: MusicState = {
    track,
    currentTrack,
    isPlaying,
    isExpanded,
    isMini,
    progress,
    currentTime: curTime,
    duration: dur,
    togglePlay,
    nextTrack: handleNext,
    prevTrack: handlePrev,
    selectTrack,
    seek,
    seekStart,
    seekEnd,
    toggleExpanded,
    collapse,
    toggleMini,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusicContext() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicContext must be inside MusicProvider");
  return ctx;
}
