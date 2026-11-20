import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// the preview as real pages; the PDF prints these same pages so they always match
// the document flows into page-sized columns and each page shows one column
// it's in a shadow root so the app's css can't change it
const IN = 96;
export const PAGE_W = 8.5 * IN, PAGE_H = 11 * IN, MARGIN = 0.8 * IN;
export const CONTENT_W = PAGE_W - 2 * MARGIN, CONTENT_H = PAGE_H - 2 * MARGIN;
export const GAP = IN; // gap between columns, never shown
export const STRIDE = CONTENT_W + GAP;
const PAGE_GAP = 28; // gap between pages

// page layout for both the preview and the PDF, keep it here
export const PAGE_CSS = `
  .preview-page{position:relative;width:${PAGE_W}px;height:${PAGE_H}px;padding:${MARGIN}px;box-sizing:border-box;flex:none}
  .page-clip{width:${CONTENT_W}px;height:${CONTENT_H}px;overflow:hidden;background:inherit}
  .page-flow{width:${CONTENT_W}px;height:${CONTENT_H}px;column-width:${CONTENT_W}px;column-gap:${GAP}px;column-fill:auto;background:inherit}
`;

// screen only (shadows, page numbers)
const SCREEN_CSS = `
  :host{all:initial;display:block}
  .preview-sizer{margin:0 auto}
  .preview-stack{display:flex;flex-direction:column;transform-origin:top left}
  .preview-page{border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.06),0 8px 24px rgba(0,0,0,.1)}
  :host(.tone-dark) .preview-page{box-shadow:0 0 0 1px rgba(255,255,255,.08),0 8px 24px rgba(0,0,0,.35)} /* lighter so it doesn't blend into the dark panel */
  .page-number{position:absolute;top:100%;left:0;right:0;padding-top:3px;text-align:center;
    font:12px -apple-system,BlinkMacSystemFont,Inter,sans-serif;color:var(--muted)}
`;

// page count
export const countPages = (flow) => Math.max(1, Math.round((flow.scrollWidth + GAP) / STRIDE));

// pages as html for the PDF
export const pagesHtml = (html, count, pageClass) => Array.from({ length: count }, (_, k) =>
  `<div class="preview-page ${pageClass}"><div class="page-clip"><div class="page-flow" style="transform:translateX(${-k * STRIDE}px)">${html}</div></div></div>`
).join("");

// zoom: null fits the pages to the width, a number is the size (1 = real size); onScale hears the size in use
const PagedPreview = forwardRef(function PagedPreview({ html, css, pageClass, fullscreen, theme, zoom = null, onScale }, ref) {
  const [root, setRoot] = useState(null);
  const [pages, setPages] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const scale = zoom ?? fitScale;
  useEffect(() => { onScale?.(scale); }, [scale]); // eslint-disable-line react-hooks/exhaustive-deps
  const hostRef = useRef(null);
  const firstFlowRef = useRef(null);

  const setHost = (el) => {
    hostRef.current = el;
    if (typeof ref === "function") ref(el); else if (ref) ref.current = el;
  };

  useLayoutEffect(() => {
    const host = hostRef.current;
    setRoot(host.shadowRoot || host.attachShadow({ mode: "open" }));
  }, []);

  useLayoutEffect(() => {
    const flow = firstFlowRef.current;
    if (!flow) return;
    const count = countPages(flow);
    if (count !== pages) setPages(count);
  });

  // shrinks the pages to fit; uses scale not zoom so line breaks match the PDF
  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const fit = () => { if (el.clientWidth) setFitScale(Math.min(1, (el.clientWidth - 24) / PAGE_W)); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // zooming keeps whatever was in the middle of the view in the middle (like a PDF viewer),
  // so from fit-to-width the page stays centered instead of jumping to its left edge.
  // the spot is saved as you scroll: zooming out shrinks the pages first, and the browser
  // clamps the scroll position before this code runs, so it can't be read afterward
  const view = useRef(null); // { fx, fy, top }: the middle of the view as a share of the pages
  const lastScale = useRef(scale);
  useLayoutEffect(() => {
    const host = hostRef.current;
    const scroller = fullscreen ? host?.parentElement : host;
    const sizer = root?.querySelector(".preview-sizer");
    if (!scroller || !sizer) return undefined;
    const box = () => {
      const r = sizer.getBoundingClientRect(), s = scroller.getBoundingClientRect();
      return { x: r.left - s.left + scroller.scrollLeft, y: r.top - s.top + scroller.scrollTop, w: r.width, h: r.height };
    };
    const save = () => {
      const b = box();
      view.current = { fx: (scroller.scrollLeft + scroller.clientWidth / 2 - b.x) / b.w,
        fy: (scroller.scrollTop + scroller.clientHeight / 2 - b.y) / b.h, top: scroller.scrollTop === 0 };
    };
    if (lastScale.current !== scale && view.current) {
      const b = box(), v = view.current;
      scroller.scrollLeft = b.x + v.fx * b.w - scroller.clientWidth / 2;
      if (!v.top) scroller.scrollTop = b.y + v.fy * b.h - scroller.clientHeight / 2; // at the top, stay at the top
    }
    lastScale.current = scale;
    save();
    scroller.addEventListener("scroll", save, { passive: true });
    return () => scroller.removeEventListener("scroll", save);
  }, [scale, fullscreen, root]);

  // the shadow root can't see the page theme, so point the theme rules at the host ("+" isn't allowed in a class)
  const tone = (t) => `tone-${t.replace("+", "-plus")}`;
  const shadowCss = SCREEN_CSS + (css + PAGE_CSS).replace(/\[data-theme="([^"]+)"\]/g, (_, t) => `:host(.${tone(t)})`);
  const fullHeight = pages * PAGE_H + (pages - 1) * PAGE_GAP + 24; // + room for the page number
  return (
    <div ref={setHost} className={`preview-pages${fullscreen ? " is-fullscreen" : ""}${theme ? ` ${tone(theme)}` : ""}`}>
      {root && createPortal(
        <>
          <style>{shadowCss}</style>
          <div className="preview-sizer" style={{ width: PAGE_W * scale, height: fullHeight * scale }}>
            <div className="preview-stack" style={{ width: PAGE_W, gap: PAGE_GAP, transform: `scale(${scale})` }}>
              {Array.from({ length: pages }, (_, k) => (
                <div key={k} className={`preview-page ${pageClass}`} data-page={k}>
                  <div className="page-clip">
                    <div ref={k === 0 ? firstFlowRef : undefined} className="page-flow"
                      style={{ transform: `translateX(${-k * STRIDE}px)` }}
                      dangerouslySetInnerHTML={{ __html: html }} />
                  </div>
                  <div className="page-number" aria-hidden="true">{k + 1} / {pages}</div>
                </div>
              ))}
            </div>
          </div>
        </>,
        root,
      )}
    </div>
  );
});

export default PagedPreview;

// every page has a full copy of the document, so this finds the page an element really shows on
export function previewSpot(el, scroller) {
  const page = el.closest(".preview-page");
  const clip = el.closest(".page-clip");
  if (!page || !clip || !scroller) return null;
  const k = Number(page.dataset.page);
  const r = el.getBoundingClientRect(), c = clip.getBoundingClientRect();
  const scale = c.width / CONTENT_W; // current scale
  const column = k + Math.floor((r.left - c.left) / (STRIDE * scale) + 0.001);
  const shown = el.getRootNode().querySelector(`.preview-page[data-page="${column}"] .page-clip`);
  if (!shown) return null;
  const top = shown.getBoundingClientRect().top + (r.top - c.top);
  const s = scroller.getBoundingClientRect();
  return {
    top: top - s.top + scroller.scrollTop,
    bottom: top - s.top + scroller.scrollTop + r.height,
    visible: top >= s.top - 24 && top + r.height <= s.bottom + 24,
  };
}

// the same, but one spot per page a block runs across (a long paragraph split over two pages), in reading order
export function previewSpots(el, scroller) {
  const page = el.closest(".preview-page");
  const clip = el.closest(".page-clip");
  if (!page || !clip || !scroller) return [];
  const k = Number(page.dataset.page);
  const c = clip.getBoundingClientRect(), s = scroller.getBoundingClientRect();
  const scale = c.width / CONTENT_W;
  return [...el.getClientRects()].map((r) => {
    const column = k + Math.floor((r.left - c.left) / (STRIDE * scale) + 0.001);
    const shown = el.getRootNode().querySelector(`.preview-page[data-page="${column}"] .page-clip`);
    if (!shown) return null;
    const top = shown.getBoundingClientRect().top + (r.top - c.top) - s.top + scroller.scrollTop;
    return { column, top, bottom: top + r.height };
  }).filter(Boolean).sort((a, b) => a.column - b.column || a.top - b.top);
}
