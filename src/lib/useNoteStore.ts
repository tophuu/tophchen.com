"use client";

import { useState, useCallback, useLayoutEffect } from "react";

const ACTIVE_NOTE_KEY = "pref-active-note";
const VALID_NOTES = ["about", "projects", "contact"];

export function useNoteStore() {
  const [, setRender] = useState(0);

  const activeNote = (typeof document !== "undefined" && document.body.dataset.activeNote) || "about";

  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_NOTE_KEY);
      if (saved && VALID_NOTES.includes(saved)) {
        document.body.dataset.activeNote = saved;
        setRender((n) => n + 1);
      }
    } catch {}
    document.body.classList.remove("note-booting");
  }, []);

  const setActiveNote = useCallback((id: string) => {
    document.body.dataset.activeNote = id;
    try { localStorage.setItem(ACTIVE_NOTE_KEY, id); } catch {}
    setRender((n) => n + 1);
  }, []);

  return { activeNote, setActiveNote };
}
