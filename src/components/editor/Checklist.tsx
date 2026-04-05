"use client";

import { useState } from "react";

function ChecklistItem({ checked: initial = false, children }: { checked?: boolean; children: React.ReactNode }) {
  const [checked, setChecked] = useState(initial);

  return (
    <div className={`checklist-item ${checked ? "is-checked" : ""}`}>
      <button
        onClick={() => setChecked(!checked)}
        className={`check-circle ${checked ? "checked" : ""}`}
        aria-label={checked ? "Uncheck item" : "Check item"}
      >
        ✓
      </button>
      <span>{children}</span>
    </div>
  );
}

export default function Checklist({ items }: { items: { text: React.ReactNode; checked?: boolean }[] }) {
  return (
    <div className="checklist">
      {items.map((item, i) => (
        <ChecklistItem key={i} checked={item.checked}>
          {item.text}
        </ChecklistItem>
      ))}
    </div>
  );
}
