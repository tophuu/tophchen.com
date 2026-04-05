export default function NoteToolbar() {
  return (
    <div className="note-toolbar" aria-hidden="true">
      <span className="tb-btn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L18.5 9.5a2.12 2.12 0 00-3-3L5 17v3z" /><path d="M13.5 6.5l3 3" /></svg>
      </span>
      <span className="tb-btn tb-aa">Aa</span>
      <span className="tb-btn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7l2 2 4-4" /><line x1="14" y1="7" x2="21" y2="7" /><path d="M4 17l2 2 4-4" /><line x1="14" y1="17" x2="21" y2="17" /></svg>
      </span>
      <span className="tb-btn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
      </span>
      <span className="tb-btn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        <span className="dropdown-caret" aria-hidden="true">▾</span>
      </span>
      <div className="tb-spacer" />
      <span className="tb-btn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
      </span>
      <span className="tb-btn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
        <span className="dropdown-caret" aria-hidden="true">▾</span>
      </span>
      <span className="tb-btn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16,6 12,2 8,6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
      </span>
      <span className="tb-btn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
      </span>
    </div>
  );
}
