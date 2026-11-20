import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// our own calendar since the browser's can't be moved or styled
// value is "YYYY-MM-DD" like <input type="date">
const pad = (n) => String(n).padStart(2, "0");
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function DateField({ value, onChange, label = "Date", placeholder = "Pick a date" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [y0, m0, d0] = (value || "").split("-").map(Number);
  const picked = value && y0 ? new Date(y0, m0 - 1, d0) : null;
  const [view, setView] = useState(() => (picked ? { y: picked.getFullYear(), m: picked.getMonth() } : { y: new Date().getFullYear(), m: new Date().getMonth() }));

  useEffect(() => {
    if (!open) return undefined;
    if (picked) setView({ y: picked.getFullYear(), m: picked.getMonth() });
    const away = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const move = (step) => setView(({ y, m }) => ({ y: y + Math.floor((m + step) / 12), m: (m + step + 12) % 12 }));
  const shown = picked ? `${pad(picked.getMonth() + 1)}/${pad(picked.getDate())}/${picked.getFullYear()}` : "";

  return (
    <div ref={ref} className="date-field">
      <button type="button" className={`date-value${shown ? "" : " is-empty"}`} aria-haspopup="dialog" aria-expanded={open}
        aria-label={`${label}: ${shown || "not set"}`} onClick={() => setOpen((o) => !o)}>
        {shown || placeholder}
      </button>
      {open && (
        <div className="calendar" role="dialog" aria-label={`Choose ${label.toLowerCase()}`}>
          <div className="calendar-head">
            <button type="button" className="icon-button" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeft size={16} /></button>
            <span>{MONTHS[view.m]} {view.y}</span>
            <button type="button" className="icon-button" aria-label="Next month" onClick={() => move(1)}><ChevronRight size={16} /></button>
          </div>
          <div className="calendar-grid">
            {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => <span key={i} className="calendar-weekday" aria-hidden="true">{w}</span>)}
            {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: days }, (_, i) => {
              const key = toKey(view.y, view.m, i + 1);
              return (
                <button key={key} type="button" className={`calendar-day${key === value ? " is-picked" : ""}${key === todayKey ? " is-today" : ""}`}
                  aria-label={`${MONTHS[view.m]} ${i + 1}, ${view.y}`} aria-pressed={key === value}
                  onClick={() => { onChange(key); setOpen(false); }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
