import { useEffect, useRef } from "react";

// Screen colors (they follow the theme in index.css) and the shared input style.
// Print/export colors are C in SyllabusBuilder.jsx, don't mix them up.
export const UI = {
  wash: "var(--wash)",
  paper: "var(--paper)",
  tint: "var(--tint)",
  line: "var(--line)",
  ink: "var(--ink)",
  slate: "var(--slate)",
  muted: "var(--muted)",
  navy: "var(--navy)",
  orange: "var(--orange)",
  orangeText: "var(--orange-text)", // use for orange text/icons, plain orange is too faint on light themes
  fieldLine: "var(--field-line)",
  good: "var(--good)",
  goodBg: "var(--goodBg)",
  warn: "var(--warn)",
  warnBg: "var(--warnBg)",
};

// the field look is a css class (.input-base) so the stylesheet can change it
export const inputBase = "input-base";

export const reduceMotion = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// height animations: each returns null when motion is off, so the caller finishes right away
const EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";
const canAnimate = (el) => el?.animate && !reduceMotion();
export const glideHeight = (el, from, to, opts) => canAnimate(el)
  ? el.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 260, easing: EASE, ...opts }) : null;
// a box's open and shut sizes; min-height and padding fold too, or it stops short and pops
const boxSizes = (el) => {
  const cs = getComputedStyle(el);
  const open = { height: `${el.getBoundingClientRect().height}px`, minHeight: cs.minHeight, marginBottom: cs.marginBottom,
    paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, overflow: "hidden" };
  const shut = { height: "0px", minHeight: "0px", marginBottom: "0px", paddingTop: "0px", paddingBottom: "0px", overflow: "hidden" };
  return { open, shut };
};
// a box growing open from nothing
export const foldIn = (el) => {
  if (!canAnimate(el)) return null;
  const { open, shut } = boxSizes(el);
  return el.animate([{ ...shut, opacity: 0 }, { ...open, opacity: 1 }], { duration: 260, easing: EASE });
};
// fades first, then folds shut; holds the end state until the caller cancels it
export const foldOut = (el) => {
  if (!canAnimate(el)) return null;
  const { open, shut } = boxSizes(el);
  return el.animate([{ ...open, opacity: 1 }, { ...open, opacity: 0, offset: 0.4 }, { ...shut, opacity: 0 }],
    { duration: 340, easing: EASE, fill: "forwards" });
};

// closes on Escape, and on a click outside ref when one is given
export function useDismiss(open, close, ref) {
  const latest = useRef(close);
  latest.current = close;
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (ref?.current && !ref.current.contains(e.target)) latest.current(); };
    const esc = (e) => { if (e.key === "Escape") latest.current(); };
    if (ref) document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, [open, ref]);
}

// numbers an element's children (--i, and --n for the count) so the staircase css can delay each by its place
export const stairRef = (el) => {
  if (!el || el.stairObserver) return;
  const number = () => {
    el.style.setProperty("--n", el.children.length);
    [...el.children].forEach((c, i) => c.style.setProperty("--i", i));
  };
  el.stairObserver = new MutationObserver(number);
  el.stairObserver.observe(el, { childList: true });
  number();
};
