import React, { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { UI, inputBase } from "./ui.js";

// draws the pill + dripping panel as one shape, redrawn every frame
// H and r have to match the 44px field height in index.css
export function MeltShape({ root }) {
  const [shape, setShape] = useState(null);
  useEffect(() => {
    const el = root.current;
    const field = el?.closest(".field");
    const more = el?.querySelector(".dropdown-more");
    if (!field || !more) return undefined;
    const draw = () => {
      const f = field.getBoundingClientRect(), m = more.getBoundingClientRect();
      const W = f.width, H = 44, r = 22;
      const ph = Math.max(0, m.bottom - f.top - H); // how far it's dripped
      const full = more.firstElementChild?.scrollHeight || ph || 1;
      const e = Math.min(1, ph / full); // 0 to 1
      // curves only move one way or the shape jitters
      const x0 = Math.max(r, m.left - f.left);
      const R = 22 - 4 * e;
      // elliptical or the start shows a sharp step
      const b = 18 + 14 * (1 - e), by = Math.min(b, ph / 2);
      const c = Math.min(x0 - r, 16 + 12 * (1 - e)), cy = Math.min(c, ph / 2);
      const y = H + ph;
      setShape({ W, h: y, d: `M${r},0 H${W - r} A${r},${r} 0 0 1 ${W},${r} V${y - R} A${R},${R} 0 0 1 ${W - R},${y} `
        + `H${x0 + b} A${b},${by} 0 0 1 ${x0},${y - by} V${H + cy} A${c},${cy} 0 0 0 ${x0 - c},${H} H${r} A${r},${r} 0 0 1 ${r},0 Z` });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(more); ro.observe(field);
    return () => ro.disconnect();
  }, [root]);
  return (
    <svg className="melt-shape" aria-hidden="true" width={shape?.W || 0} height={shape?.h || 0}>
      {shape && <path d={shape.d} />}
    </svg>
  );
}

// sliding highlight, put it last in a .dropdown-list
// active = keyboard choice (optional)
export function SlideHighlight({ active }) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);
  const shown = useRef(false); // first time it jumps instead of sliding
  const place = (el) => setBox(el && el.classList.contains("dropdown-option") ? { top: el.offsetTop, h: el.offsetHeight } : null);
  useEffect(() => {
    const list = ref.current?.parentElement;
    if (!list) return undefined;
    const over = (e) => { const o = e.target.closest?.(".dropdown-option"); if (o && list.contains(o)) place(o); };
    const out = () => { if (active == null) setBox(null); };
    list.addEventListener("mouseover", over);
    list.addEventListener("mouseleave", out);
    return () => { list.removeEventListener("mouseover", over); list.removeEventListener("mouseleave", out); };
  }, [active]);
  useEffect(() => {
    if (active == null) return;
    place(active >= 0 ? ref.current?.parentElement?.children[active] : null);
  }, [active]);
  const slide = shown.current && box;
  useEffect(() => { shown.current = Boolean(box); });
  return (
    <div ref={ref} className="dropdown-slide" aria-hidden="true" style={{
      opacity: box ? 1 : 0, height: box?.h || 0, transform: `translateY(${box?.top || 0}px)`,
      transition: slide ? undefined : "opacity 0.15s ease",
    }} />
  );
}

// scrolls the form with an opening list so it ends up in view
export function followOpen(root) {
  const field = root?.closest(".field") || root;
  const more = root?.querySelector(".dropdown-more");
  let scroller = field?.parentElement;
  while (scroller && scroller !== document.body && !/auto|scroll/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement;
  if (!more || !scroller || scroller === document.body) return undefined;
  let frame;
  const end = performance.now() + 600; // a little longer than the animation
  const step = () => {
    const s = scroller.getBoundingClientRect();
    const below = more.getBoundingClientRect().bottom + 12 - s.bottom;
    const room = field.getBoundingClientRect().top - s.top - 8; // don't scroll the field off the top
    if (below > 0 && room > 0) scroller.scrollTop += Math.min(below, room);
    if (performance.now() < end) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

// the part that opens (shape, list, highlight), also used by the autofill lists
export function DropdownList({ open, root, label, maxHeight = 260, listRef, active, children }) {
  useEffect(() => (open ? followOpen(root.current) : undefined), [open, root]);
  return (
    <>
      <MeltShape root={root} />
      {/* 0fr -> 1fr animates the height */}
      <div className="dropdown-more" inert={open ? undefined : ""}>
        <div>
          <div ref={listRef} role="listbox" aria-label={label} className="dropdown-list" style={{ maxHeight }}>
            {children}
            <SlideHighlight active={active} />
          </div>
        </div>
      </div>
    </>
  );
}

export function MorphChevron({ open }) {
  const [progress, setProgress] = useState(open ? 1 : 0);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setProgress(open ? 1 : 0);
      return undefined;
    }

    const start = performance.now();
    const from = progress;
    const to = open ? 1 : 0;
    let frame;
    const ease = (value) => {
      if (value <= 0) return 0;
      if (value >= 1) return 1;

      const x1 = 0.5, y1 = 0, x2 = 0.25, y2 = 1;
      let param = value;
      for (let i = 0; i < 8; i++) {
        const oneMinus = 1 - param;
        const x = 3 * oneMinus * oneMinus * param * x1
          + 3 * oneMinus * param * param * x2
          + param * param * param;
        const dx = 3 * oneMinus * oneMinus * x1
          + 6 * oneMinus * param * (x2 - x1)
          + 3 * param * param * (1 - x2);
        if (Math.abs(dx) < 0.0001) break;
        param -= (x - value) / dx;
        param = Math.max(0, Math.min(1, param));
      }

      const oneMinus = 1 - param;
      return 3 * oneMinus * oneMinus * param * y1
        + 3 * oneMinus * param * param * y2
        + param * param * param;
    };
    const animate = (now) => {
      const elapsed = Math.min(1, (now - start) / 300);
      setProgress(from + (to - from) * ease(elapsed));
      if (elapsed < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const mix = (a, b) => a + (b - a) * progress;
  const path = `M 5 ${mix(9, 15)} L 12 ${mix(15, 9)} L 19 ${mix(9, 15)}`;
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      className="dropdown-chevron" style={{ color: open ? UI.orangeText : UI.muted, flexShrink: 0 }}>
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dropdown({ value, onChange, options, placeholder = "", ariaLabel, editable = false,
  style, maxHeight = 260 }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);
  const hasOptions = options.some((o) => !o.header);
  const selected = options.find((o) => !o.header && o.value === value);
  const selectedIndex = selected ? options.indexOf(selected) : -1;

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);


  useEffect(() => {
    if (!open || active < 0) return;
    const el = listRef.current?.children[active];
    const list = listRef.current;
    if (!el || !list) return;
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
  }, [open, active]);

  const firstPickable = () => options.findIndex((o) => !o.header);
  const step = (from, dir) => {
    for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (!options[i].header) return i;
    return from;
  };
  const openMenu = () => {
    if (!hasOptions) return;
    setActive(selectedIndex >= 0 ? selectedIndex : editable ? -1 : firstPickable());
    setOpen(true);
  };
  const pick = (o) => { onChange(o.value); setOpen(false); };

  const onKeyDown = (e) => {
    if (!open) {
      const opens = editable ? ["ArrowDown", "ArrowUp"] : ["ArrowDown", "ArrowUp", "Enter", " "];
      if (opens.includes(e.key) && hasOptions) { e.preventDefault(); openMenu(); }
      return;
    }
    const last = options.length - 1;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a < 0 ? firstPickable() : step(a, 1))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a < 0 ? firstPickable() : step(a, -1))); }
    else if (e.key === "Home") { if (!editable) { e.preventDefault(); setActive(firstPickable()); } }
    else if (e.key === "End") { if (!editable) { e.preventDefault(); setActive(options[last]?.header ? step(last, -1) : last); } }
    else if (e.key === "Enter" || (!editable && e.key === " ")) {
      if (active >= 0 && options[active] && !options[active].header) { e.preventDefault(); pick(options[active]); }
      else if (editable) setOpen(false);
    }
    else if (e.key === "Tab") setOpen(false);
  };

  const chevron = <MorphChevron open={open} />;

  return (
    <div ref={ref} className={`dropdown${open ? " is-open" : ""}`} style={style}>
      <div className="dropdown-control">
        {editable ? (
          <>
            <input
              className={inputBase} style={{ paddingRight: 30 }}
              value={value}
              placeholder={placeholder}
              autoComplete="off"
              aria-label={ariaLabel}
              role="combobox"
              aria-expanded={open}
              onChange={(e) => { onChange(e.target.value); setActive(-1); }}
              onFocus={openMenu}
              onKeyDown={onKeyDown}
            />
            {hasOptions && (
              <button type="button" tabIndex={-1} onClick={() => (open ? setOpen(false) : openMenu())}
                aria-label={`Choose ${ariaLabel ? ariaLabel.toLowerCase() : "an option"}`}
                aria-haspopup="listbox" aria-expanded={open}
                style={{ position: "absolute", right: 6, top: 0, bottom: 0, width: 28, display: "flex",
                  alignItems: "center", justifyContent: "center", background: "transparent", cursor: "pointer" }}>
                {chevron}
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={() => (open ? setOpen(false) : openMenu())} onKeyDown={onKeyDown}
            aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel}
            className={inputBase} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              cursor: "pointer", textAlign: "left" }}>
            <span style={{ color: selected ? UI.ink : UI.muted, minWidth: 0 }}>{selected ? selected.label : placeholder}</span>
            {chevron}
          </button>
        )}
      </div>

      {/* 0fr -> 1fr animates the height */}
      <DropdownList open={open} root={ref} label={ariaLabel} maxHeight={maxHeight} listRef={listRef} active={open ? active : -1}>
        {options.map((o, i) => {
          const stairIndex = options.slice(0, i).filter((option) => !option.header).length;
          if (o.header) {
            return <div key={"h:" + o.header} role="presentation" className="dropdown-header"
              style={{ "--stair-delay": `${stairIndex * 45}ms` }}>{o.header}</div>;
          }
          const on = o.value === value;
          return (
            <div key={o.value} role="option" aria-selected={on}
              className="dropdown-option" style={{ "--stair-delay": `${stairIndex * 45}ms` }}
              onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)} onMouseEnter={() => setActive(i)}>
              <span className="dropdown-check">{on && <Check size={16} strokeWidth={2.5} />}</span>
              {o.label}
            </div>
          );
        })}
      </DropdownList>
    </div>
  );
}
