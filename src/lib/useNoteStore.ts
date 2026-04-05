"use client";

import { useState, useCallback } from "react";

const ACTIVE_NOTE_KEY = "pref-active-note";

export function useNoteStore() {
  const [, setRender] = useState(0);

  const activeNote = (typeof document !== "undefined" && document.body.dataset.activeNote) || "about";

  const setActiveNote = useCallback((id: string) => {
    document.body.dataset.activeNote = id;
    try { localStorage.setItem(ACTIVE_NOTE_KEY, id); } catch {}
    setRender((n) => n + 1);
  }, []);

  return { activeNote, setActiveNote };
}
