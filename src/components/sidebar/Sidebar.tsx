"use client";

import { lastEditedDate, notes } from "../../data/notes";

interface SidebarProps {
  onSelectNote: (id: string) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDayMs(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function parseLastEditedDateUtcMs(value: string): number | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const parsed = Date.UTC(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

function getSidebarDateBucket(latestEditedUtcMs: number, now: Date): string {
  const todayUtcMs = startOfUtcDayMs(now);
  const diffDays = Math.floor((todayUtcMs - latestEditedUtcMs) / DAY_MS);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 Days";
  if (diffDays <= 30) return "Previous 30 Days";
  const latestDay = new Date(latestEditedUtcMs);
  if (latestDay.getUTCFullYear() === now.getUTCFullYear()) {
    return latestDay.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  }
  return String(latestDay.getUTCFullYear());
}

function FolderIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9l-1.42-1.42A2 2 0 0 0 7.11 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <path d="M6 9.5h12" />
    </svg>
  );
}

export default function Sidebar({ onSelectNote }: SidebarProps) {
  const now = new Date();
  const latestEditedUtcMs = parseLastEditedDateUtcMs(lastEditedDate) ?? startOfUtcDayMs(now);
  const dayLabel = getSidebarDateBucket(latestEditedUtcMs, now);

  return (
    <aside className="sidebar">
      <div className="sidebar-cloud-label">iCloud</div>
      <div className="sidebar-titlebar">
        <div className="sidebar-folder-row">
          <span className="sidebar-folder-icon"><FolderIcon /></span>
          <span className="sidebar-folder-name">Notes</span>
          <span className="sidebar-folder-count">{notes.length}</span>
        </div>
      </div>

      <div style={{ height: "20px", flexShrink: 0 }} />
      <div className="sidebar-day-label">{dayLabel}</div>
      <div className="sidebar-note-list">
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className="note-preview"
            data-note={note.id}
            aria-label={`Open ${note.title}`}
          >
            <div className="np-title">{note.title}</div>
            <div className="np-row2">
              <span className="np-date">{note.date}</span>
              <span className="np-snippet">{note.snippet}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
