// Reads the registrar's academic calendar page into { "Spring 2027": [["January 7", "Classes begin"], ...] }.
// The page is one <h2>term</h2> heading per term, each followed by a two-column table.
const CALENDAR_URL = "https://www.utm.edu/academics/academic-calendar/";
const TERM = /^(Spring|Summer|Fall|Maymester|Winter)\b.*\b20\d\d$/;
const CACHE_MS = 6 * 60 * 60 * 1000; // the page rarely changes, so don't hit utm.edu on every visit

let cached = null;

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—" };
const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/﻿/g, "").replace(/\s+/g, " ").trim();

// tidy a cell: no "*" markers, no leftover "...Academic Calendar-->" from a broken comment, "August 04" -> "August 4"
const tidy = (s) => s
  .replace(/\S*\s*\d{4} Academic Calendar\s*-->/gi, "").replace(/-->/g, "")
  .replace(/\*/g, "")
  .replace(/\b0(\d)\b/g, "$1")
  .replace(/\s+/g, " ").trim();

export function parseCalendar(html) {
  const page = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "");
  const heads = [...page.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  const terms = {};
  heads.forEach((h, i) => {
    const name = text(h[1]);
    if (!TERM.test(name)) return;
    const body = page.slice(h.index + h[0].length, heads[i + 1]?.index ?? page.length);
    const rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
      .map((r) => [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => tidy(text(c[1]))))
      .filter((cells) => cells.length >= 2 && cells[0] && cells[1])
      .map(([date, event]) => [date, event]);
    if (rows.length) terms[name] = rows;
  });
  return terms;
}

export async function fetchCalendar() {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.terms;
  const res = await fetch(CALENDAR_URL, { headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" } });
  if (!res.ok) throw new Error(`utm.edu answered ${res.status}`);
  const terms = parseCalendar(await res.text());
  if (!Object.keys(terms).length) throw new Error("No terms found on the calendar page");
  cached = { at: Date.now(), terms };
  return terms;
}
