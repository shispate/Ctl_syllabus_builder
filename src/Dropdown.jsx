import React, { useState, useRef, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { UI, inputBase, reduceMotion, useDismiss, glideHeight, stairRef } from "./ui.js";

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
      const W = f.width, H = 44;
      // follow the row's own corners: a pill on its own, square or card-rounded inside a group
      const cs = getComputedStyle(field);
      const corner = (v) => Math.min(H / 2, parseFloat(v) || 0);
      const tl = corner(cs.borderTopLeftRadius), tr = corner(cs.borderTopRightRadius);
      const bl = corner(cs.borderBottomLeftRadius), br = corner(cs.borderBottomRightRadius);
      const ph = Math.max(0, m.bottom - f.top - H); // how far it's dripped
      const full = more.firstElementChild?.scrollHeight || ph || 1;
      // a resize animation (results changed while open) isn't a drip, so keep the shape settled
      const e = more.getAnimations?.().some((a) => a.id === "resize") ? 1 : Math.min(1, ph / full); // 0 to 1
      // curves only move one way or the shape jitters
      const x0 = Math.max(bl, m.left - f.left);
      const R = br + (18 - br) * e; // the row's corner while closed, the list's 18px corner once open
      // elliptical or the start shows a sharp step
      const b = 18 + 14 * (1 - e), by = Math.min(b, ph / 2);
      const c = Math.min(x0 - bl, 16 + 12 * (1 - e)), cy = Math.min(c, ph / 2);
      const y = H + ph;
      setShape({ W, h: y, d: `M${tl},0 H${W - tr} A${tr},${tr} 0 0 1 ${W},${tr} V${y - R} A${R},${R} 0 0 1 ${W - R},${y} `
        + `H${x0 + b} A${b},${by} 0 0 1 ${x0},${y - by} V${H + cy} A${c},${cy} 0 0 0 ${x0 - c},${H} `
        + `H${bl} A${bl},${bl} 0 0 1 0,${H - bl} V${tl} A${tl},${tl} 0 0 1 ${tl},0 Z` });
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
  // works for dropdown options and the clickable rows inside the rows that open (not the plain "done" ones)
  const ITEM = ".dropdown-option, button.list-item, label.choice-row, button.library-row";
  const place = (el) => setBox(el && el.matches?.(ITEM) ? { top: el.offsetTop, h: el.offsetHeight } : null);
  useEffect(() => {
    const list = ref.current?.parentElement;
    if (!list) return undefined;
    const over = (e) => { const o = e.target.closest?.(ITEM); if (o && list.contains(o)) place(o); };
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
  // when the results change while it's open, glide to the new size instead of jumping
  const moreRef = useRef(null);
  const innerRef = useRef(null);
  const openedAt = useRef(0);
  useEffect(() => { openedAt.current = performance.now(); }, [open]);
  useEffect(() => {
    const more = moreRef.current, inner = innerRef.current;
    if (!more || !inner) return undefined;
    let last = null;
    const ro = new ResizeObserver(() => {
      // if it's mid-glide, start the next one from where it is now (not from the old target), so it never jumps
      const running = more.getAnimations().filter((a) => a.id === "resize"); // not the open/close drip
      const now = running.length ? more.getBoundingClientRect().height : last;
      running.forEach((a) => a.cancel());
      const to = more.getBoundingClientRect().height;
      last = to;
      if (now == null || !open || performance.now() - openedAt.current < 350) return; // the open/close drip handles itself
      if (Math.abs(now - to) < 1) return;
      // height only: animating width too makes the text re-wrap every frame
      glideHeight(more, now, to, { id: "resize", duration: 220 });
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [open]);
  const setList = (el) => {
    innerRef.current = el;
    stairRef(el);
    if (typeof listRef === "function") listRef(el); else if (listRef) listRef.current = el;
  };
  return (
    <>
      <MeltShape root={root} />
      {/* 0fr -> 1fr animates the height */}
      <div ref={moreRef} className="dropdown-more" inert={open ? undefined : ""}>
        <div>
          {/* stair-reveal stays on while open, so results that arrive later still step in */}
          <div ref={setList} role="listbox" aria-label={label} className={`dropdown-list${open ? " stair-reveal" : ""}`} style={{ maxHeight }}>
            {children}
            <SlideHighlight active={active} />
          </div>
        </div>
      </div>
    </>
  );
}

// autofill list under a text field: a spinner while searching, a note when nothing's found, two-line rows
export function SuggestList({ open, root, label, notice, loading, loadingText, emptyText, items, itemKey, title, detail, onPick }) {
  return (
    <DropdownList open={open} root={root} label={label}>
      {notice}
      {/* shows even while the old results stay up, so a search always looks like it's running */}
      {loading && <div className="dropdown-status"><Loader2 size={13} className="animate-spin" />{loadingText}&hellip;</div>}
      {!loading && items.length === 0 && emptyText && <div className="dropdown-status">{emptyText}</div>}
      {items.map((s) => (
        <div key={itemKey(s)} role="option" className="dropdown-option is-stacked"
          onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(s)}>
          <div>{title(s)}</div>
          <small>{detail(s)}</small>
        </div>
      ))}
    </DropdownList>
  );
}

// up: for menus that open upward, so it points up while closed
export function MorphChevron({ open, up = false, size = 15 }) {
  const [progress, setProgress] = useState(open ? 1 : 0);
  useEffect(() => {
    const reduced = reduceMotion();
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
  const [a, b] = up ? [15, 9] : [9, 15];
  const path = `M 5 ${mix(a, b)} L 12 ${mix(b, a)} L 19 ${mix(a, b)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      className="dropdown-chevron" style={{ color: open ? UI.orangeText : UI.muted, flexShrink: 0 }}>
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const startsAWord = (text, words) => {
  const parts = text.toLowerCase().split(/[^a-z0-9]+/);
  return words.every((w) => parts.some((p) => p.startsWith(w)));
};
function narrow(options, query) {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const out = [];
  let header = null, headerHit = false, headerShown = false;
  for (const o of options) {
    if (o.header) { header = o; headerHit = startsAWord(o.header, words); headerShown = false; continue; }
    if (!headerHit && !startsAWord(o.label, words)) continue;
    if (header && !headerShown) { out.push(header); headerShown = true; }
    out.push(o);
  }
  return out;
}

export default function Dropdown({ value, onChange, options, placeholder = "", ariaLabel, editable = false,
  style, maxHeight = 260 }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);
  const hasOptions = options.some((o) => !o.header);
  // editable lists narrow as you type: every word has to start a word in the option (or its group's header)
  const [query, setQuery] = useState("");
  const shown = editable && query.trim() ? narrow(options, query) : options;
  const selected = options.find((o) => !o.header && o.value === value);

  useDismiss(open, () => setOpen(false), ref);


  useEffect(() => {
    if (!open || active < 0) return;
    const el = listRef.current?.children[active];
    const list = listRef.current;
    if (!el || !list) return;
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
  }, [open, active]);

  const firstPickable = () => shown.findIndex((o) => !o.header);
  const step = (from, dir) => {
    for (let i = from + dir; i >= 0 && i < shown.length; i += dir) if (!shown[i].header) return i;
    return from;
  };
  const openMenu = () => {
    if (!hasOptions) return;
    setQuery(""); // full list again, so find the picked one in options, not the narrowed list
    const at = options.findIndex((o) => !o.header && o.value === value);
    setActive(at >= 0 ? at : editable ? -1 : options.findIndex((o) => !o.header));
    setOpen(true);
  };
  const pick = (o) => { onChange(o.value); setQuery(""); setOpen(false); };

  const onKeyDown = (e) => {
    if (!open) {
      const opens = editable ? ["ArrowDown", "ArrowUp"] : ["ArrowDown", "ArrowUp", "Enter", " "];
      if (opens.includes(e.key) && hasOptions) { e.preventDefault(); openMenu(); }
      return;
    }
    const last = shown.length - 1;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a < 0 ? firstPickable() : step(a, 1))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a < 0 ? firstPickable() : step(a, -1))); }
    else if (e.key === "Home") { if (!editable) { e.preventDefault(); setActive(firstPickable()); } }
    else if (e.key === "End") { if (!editable) { e.preventDefault(); setActive(shown[last]?.header ? step(last, -1) : last); } }
    else if (e.key === "Enter" || (!editable && e.key === " ")) {
      if (active >= 0 && shown[active] && !shown[active].header) { e.preventDefault(); pick(shown[active]); }
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
              onChange={(e) => { onChange(e.target.value); setQuery(e.target.value); setActive(-1); if (hasOptions) setOpen(true); }}
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
        {shown.length === 0 && <div className="dropdown-status">No matches</div>}
        {shown.map((o, i) => {
          if (o.header) {
            return <div key={"h:" + o.header} role="presentation" className="dropdown-header">{o.header}</div>;
          }
          const on = o.value === value;
          return (
            <div key={o.value} role="option" aria-selected={on}
              className="dropdown-option"
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
