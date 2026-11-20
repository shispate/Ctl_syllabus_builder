import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import {
  BookOpen, User, MessageSquare, Target, Library, Scale, Gavel, ShieldCheck, CalendarDays, FileDown,
  Check, AlertTriangle, Plus, Trash2, Save, Printer, Lock, ChevronRight,
  Maximize2, Minimize2, FlaskConical, X, Loader2, Download, FileText, Keyboard, ClipboardCheck, Gauge,
} from "lucide-react";
import { flushSync } from "react-dom";
import { UI, inputBase, reduceMotion, useDismiss, glideHeight, foldIn, foldOut, stairRef } from "./ui.js";
import Dropdown, { MorphChevron, SlideHighlight, SuggestList } from "./Dropdown.jsx";
import DateField from "./DateField.jsx";
import PagedPreview, { previewSpot, previewSpots, PAGE_CSS, countPages, pagesHtml } from "./PagedPreview.jsx";
import { SUBJECTS } from "./subjectCodes.js";
import WaveBackground from "./WaveBackground.jsx";

/* ============================================================
   UTM SYLLABUS BUILDER  ·  Center for Teaching and Learning
   Fill in the left. Watch the right. Export to Word or PDF.
   No accounts, no server, no stored data.
   ============================================================ */



const LOGO = "data:image/png;base64,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";

const UtmMark = ({ style, textColor = "#fff" }) => (
  <svg viewBox="0 0 177.1 41.5" style={style} role="img" aria-label="The University of Tennessee at Martin">
    <path fill={textColor} d="M74.7,30.3c0,0.5-0.6,0.5-0.9,0.5c-0.2,0-0.5,0-0.9,0c-0.9-0.1-2.1-0.1-3.2,0 c-0.4,0-0.8,0.1-1.2,0.1c-0.4,0-0.6-0.3-0.6-0.5c0-0.5,0.4-0.7,0.8-0.8c0.5-0.2,1.1-0.4,1-1.6l-0.3-11.2c0-0.5-0.1-0.8-0.1-0.9 c-0.1,0-0.3,0.2-0.5,0.7l-6,12.2c0,0.1-0.1,0.2-0.1,0.3c-0.4,0.9-0.7,1.3-1,1.3c-0.4,0-0.6-0.6-0.8-0.9l0-0.1l-6.2-12.9 c0-0.1,0-0.1-0.1-0.1c0,0,0,0.1,0,0.2l-0.3,10.1c-0.1,2.3,0.9,2.6,1.7,2.8c0.4,0.1,0.9,0.2,0.9,0.8c0,0.6-0.7,0.6-1,0.6 c-0.2,0-0.5,0-0.8,0c-0.5,0-1.2-0.1-1.7-0.1c-0.9,0-1.5,0-1.9,0.1c-0.2,0-0.4,0-0.6,0c-0.3,0-0.5-0.2-0.5-0.6c0-0.5,0.4-0.7,0.7-0.8 c0.5-0.1,1.2-0.3,1.3-2.1c0.1-1.3,0.2-2.5,0.3-3.6c0.2-2.8,0.4-5,0.4-7.2c0-4.8-1.4-5.2-2.1-5.5c-0.3-0.1-0.7-0.2-0.7-0.7c0-0.2,0.1-0.6,0.7-0.6c0.3,0,0.5,0,0.8,0.1c0.5,0.1,1,0.1,1.5,0c0.3,0,0.5-0.1,0.8-0.1c0.5,0,0.6,0.4,0.7,0.7 c0,0.1,0.1,0.1,0.1,0.2l7,14.9c0.1,0.2,0.2,0.5,0.3,0.5c0.1-0.2,0.4-0.8,0.7-1.3l0-0.1L69.9,11c0-0.1,0.1-0.1,0.1-0.2 c0.2-0.4,0.4-0.9,0.8-0.9c0.2,0,0.6,0,0.9,0.1c0.2,0,0.4,0,0.5,0c0.3,0,0.6,0,0.8-0.1c0.2,0,0.4-0.1,0.6-0.1c0.3,0,0.5,0.3,0.5,0.6 c0,0.5-0.4,0.6-0.8,0.7c-0.7,0.2-1.5,0.3-1.4,2.4l0.4,14.4c0.1,1.3,0.7,1.4,1.4,1.6C74.1,29.6,74.7,29.7,74.7,30.3z M98.5,30.3 c0,0.5-0.5,0.5-0.6,0.5c-0.6,0-1.2,0-1.8-0.1c-1,0-2-0.1-2.9,0c-0.4,0-0.8,0.1-1.2,0.1c-0.6,0-0.9-0.2-0.9-0.5 c0-0.5,0.5-0.6,0.9-0.8c0.5-0.2,0.9-0.3,0.9-0.7c0-0.4-0.4-1.3-0.6-2.1c-0.1-0.2-0.2-0.4-0.2-0.6L91,23.8c-0.3-0.7-0.4-0.9-1-0.9 h-6.4c-0.6,0-0.9,0-1.1,0.5l-1.9,4.1c-0.1,0.2-0.2,0.6-0.2,0.9c0,1.1,0.6,1.2,1.2,1.3c0.4,0.1,0.9,0.2,0.9,0.6 c0,0.5-0.2,0.7-0.7,0.7l-0.3,0c-0.4,0-0.8,0-1.2-0.1c-0.8-0.1-1.6-0.1-2.4,0c-0.4,0-0.8,0.1-1.2,0.1c-0.3,0-0.5-0.2-0.5-0.6c0-0.4,0.4-0.5,0.7-0.6c0.4-0.1,1-0.3,1.5-1.2l6.9-14.8c0.4-0.9,0.7-1.6,1-2.2c0.8-1.8,0.9-2.1,1.4-2.1c0.4,0,0.6,0.6,0.8,1.1 c0,0.1,0,0.1,0,0.2l6,14.9c0.1,0.3,0.2,0.6,0.3,0.9c0.3,0.8,0.6,1.7,1.1,2.4c0.4,0.7,1.1,0.8,1.6,0.9C98,29.7,98.5,29.8,98.5,30.3z M89.8,20.8l-2.8-7c0,0,0,0,0,0c0,0,0,0,0,0l-3.3,7c0,0.1-0.1,0.1-0.1,0.2c0,0,0,0,0,0c0,0,0.1,0,0.2,0h5.7c0.3,0,0.3,0,0.3,0 C89.9,21,89.9,21,89.8,20.8z M118.9,30.3c0,0.3-0.3,0.6-2.1,0.6c-2.2,0-3.4-1.5-4.5-3.2l-3.2-5.1c-0.1-0.2-0.2-0.3-0.3-0.5 c-0.6-1-0.6-1-2.5-1l-0.8,0c-0.3,0-0.4,0.1-0.5,0.1c-0.1,0.1-0.1,0.2,0,0.3c0,0,0,0.1,0,0.1v6.1c0,1.3,0.9,1.5,1.8,1.7 c0.6,0.1,1.2,0.3,1.2,0.8c0,0.2-0.1,0.5-0.5,0.5l-0.2,0c-0.1,0-0.2,0-0.3,0c-0.4,0-1.2-0.1-3-0.1c-0.5,0-1.1,0-1.6,0.1 c-0.5,0-1.1,0.1-1.7,0.1c-0.3,0-0.5-0.2-0.5-0.6c0-0.4,0.4-0.6,0.8-0.7c0.6-0.3,1.3-0.5,1.3-1.8V13c0-1.5-0.8-1.7-1.5-1.8 c-0.4-0.1-1-0.2-1-0.8c0-0.3,0.4-0.6,0.8-0.6c0.2,0,0.3,0,0.5,0c0.2,0,0.5,0.1,1.4,0.1c0.9,0,1.7,0,2.5-0.1c0.8,0,1.6-0.1,2.3-0.1l0.1,0c0.1,0,0.3,0,0.6,0c1.9,0,6.4,0.5,6.4,5.3c0,2.1-1.4,4.2-3.5,5.1l4.7,7.1c1.3,2,2.4,2.3,2.9,2.4 C118.5,29.8,118.9,29.8,118.9,30.3z M106.2,11.3l-0.3,0c-0.9,0-1.1,0-1.1,0.8v7.4c0,0,0.2,0.2,1.4,0.2h0c0.2,0,0.5,0,0.7,0 c0.2,0,0.5,0,0.7,0c0.9,0,3.8-0.3,3.8-3.9C111.5,11.7,107.8,11.3,106.2,11.3z M136.1,10.9c0-0.8-0.3-1.1-1.1-1.1c-0.1,0-0.4,0-0.8,0 c-1.2,0-3.7,0.1-7.6,0.1c-2.1,0-3.7,0-5.1-0.1c-1.1,0-2.1,0-3.1,0c-0.7,0-0.7,0.8-0.8,1.2l-0.3,3c0,0.3,0.2,0.6,0.5,0.6 c0.5,0,0.6-0.4,0.7-0.7l0.1-0.3c0.5-1.4,0.5-1.7,2.1-1.7l4.7,0c0,0,0.1,0.2,0.1,1c0,0.1,0,0.1,0,0.1v15.1c0,0.9-0.7,1.2-1.4,1.4 c-0.5,0.2-0.9,0.3-0.9,0.8c0,0.4,0.2,0.6,0.6,0.6c0,0,0.1,0,0.2,0c0.3,0,1.2-0.1,3.8-0.1c0.4,0,0.9,0,1.3,0.1c0.4,0,0.7,0.1,1.1,0.1 c0.2,0,0.3-0.1,0.4-0.1c0.1-0.1,0.1-0.3,0.1-0.4c0-0.5-0.5-0.6-0.9-0.7c-0.7-0.2-1.4-0.3-1.4-1.6V13.1l0-0.4c0-0.3,0-0.7,0-0.7 c0,0,0.3,0,0.4,0l4.6,0c1.6,0,1.7,0.7,1.8,1.3c0,0.4,0.1,0.9,0.7,0.9c0.2,0,0.3-0.1,0.4-0.2c0.2-0.2,0.2-0.5,0.1-0.7L136.1,10.9zM144.8,29.5c-0.9-0.2-1.5-0.4-1.5-1.4V12.6c0-1.2,0.7-1.4,1.3-1.6c0.4-0.1,0.8-0.2,0.8-0.7c0-0.5-0.5-0.5-0.8-0.5 c-0.5,0-0.9,0-1.4,0.1c-1,0.1-2,0.1-2.9,0c-0.5,0-1.1-0.1-1.6-0.1c-0.5,0-0.5,0.3-0.5,0.6c0,0.4,0.4,0.5,0.9,0.6 c0.7,0.2,1.5,0.4,1.5,1.5v14.8c0,1.7-0.8,1.9-1.4,2.1c-0.4,0.1-0.8,0.2-0.8,0.7c0,0.6,0.4,0.7,0.8,0.7c0.1,0,0.3,0,0.5,0 c0.4,0,1.1-0.1,2.3-0.1c0.7,0,1.4,0,2,0.1c0.4,0,0.8,0,1.1,0c0.3,0,0.8,0,0.8-0.5C145.9,29.8,145.3,29.6,144.8,29.5z M168.2,9.9 c-0.3,0-0.8,0-1.2,0.1c-0.5,0-1.2,0.1-1.7,0.1c-0.5,0-0.9,0-1.3-0.1c-0.4,0-0.9-0.1-1.3-0.1c-0.3,0-0.6,0.2-0.6,0.5 c0,0.5,0.5,0.6,1,0.8c0.9,0.2,2.2,0.5,2.2,2.9v12c0,0,0,0,0,0l-13.8-15.4c0,0-0.1-0.1-0.1-0.1c-0.2-0.3-0.5-0.6-0.8-0.6 c-0.2,0-0.5,0-0.7,0.1c-0.5,0.1-0.9,0.1-1.3,0c-0.2,0-0.5-0.1-0.7-0.1c-0.2,0-0.7,0.2-0.7,0.5c0,0.5,0.5,0.6,0.9,0.7 c1,0.2,2.6,0.6,2.6,4.7v10.7c0,2.5-1,2.8-1.7,3c-0.4,0.1-0.8,0.2-0.8,0.8c0,0.4,0.2,0.6,0.6,0.6c0.1,0,0.3,0,0.5,0 c0.6,0,1.5-0.1,2.2-0.1c0.8,0,1.5,0,2,0.1c0.4,0,0.7,0,1,0c0.1,0,0.6,0,0.6-0.6c0-0.5-0.5-0.6-0.9-0.6c-0.8-0.1-1.6-0.3-1.6-1.7V16 c0-0.2,0-0.3,0-0.4c0.1,0.1,0.2,0.2,0.3,0.3c0,0,0.1,0.1,0.1,0.1l12.5,14c0.6,0.6,0.9,0.9,1.3,0.9c0.5,0,0.5-0.7,0.5-1.5V12.7 c0-1.2,0.5-1.4,1-1.6c0.3-0.1,0.7-0.3,0.7-0.7C168.7,10.1,168.5,9.9,168.2,9.9z" />
    <path fill="#FF8200" d="M38.5,17v13.9h-6V9.5h16.1c-0.3,0.3-0.2,0.8-0.7,1.5c-0.6,0.8-1.2,0.4-1.7,1 c-0.4,0.5-0.3,1.1-0.7,1.7c-0.6,0.8-1.5,0.5-2.2,1.3c-0.5,0.7-0.5,1.3-1,2H38.5z" />
    <path fill="#FF8200" d="M24.1,9.5c-0.3,0.3-0.2,0.9-0.7,1.5c-0.6,0.8-1.2,0.4-1.7,1c-0.4,0.5-0.3,1.1-0.7,1.6 c-0.6,0.8-1.5,0.5-2.2,1.3c-0.5,0.7-0.5,1.3-1,2h7.8v7h-6.5c-0.5,0-1,0.1-1.3-0.3c-0.3-0.3-0.3-0.6-0.3-1l0-13.1h-6.9l0,15.1 c0,1.8,1.2,3.5,1.8,4.1c0.8,0.8,2.5,2.2,4.5,2.2h9.1l5.5-6.3l0-15.1h34.1z" />
  </svg>
);

/** Ear with a behind-the-ear hearing aid, drawn to match the lucide icons (lucide has no hearing-aid icon).
 *  Accepts the same size and style props, so it can be used in TABS like any other icon. */
const EarHearingAid = ({ size = 24, style, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" style={style} {...rest}>
    {/* the ear (lucide "ear" paths, shifted left to make room for the hearing aid) */}
    <g transform="translate(-3 1)">
      <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
      <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4" />
    </g>
    {/* the hearing aid body behind the ear, and its tube over the top */}
    <rect x="18" y="5" width="4" height="9" rx="2" fill="currentColor" />
    <path d="M20 5c0-2.2-1.8-3.6-4-3.4" />
  </svg>
);

const C = {
  navy: "#0B2240",      // UT Martin PMS 289
  orange: "#FF8300",    // UT Martin PMS 151
  orangeText: "#B35900", // darker orange for small text: 4.8:1 on white (UT Orange is 2.5:1, below WCAG's 4.5:1)
  ink: "#1a1a1a",
  slate: "#4A5568",
  line: "#D8DEE7",
  paper: "#FFFFFF",
  wash: "#F4F6F9",
  good: "#1E7A46",
  warn: "#B45309",
  bad: "#C0392B",
};

// colors are the slices of each theme's circle. Update them if the theme changes in index.css.
const THEMES = [
  { id: "light", label: "Light", colors: ["#FFFFFF", "#4A5568", "#1A1A1A", "#E8ECF2"] },
  { id: "dark", label: "Dark", colors: ["#1A2333", "#CBD5E1", "#E5E7EB", "#0F1724"] },
  { id: "blue", label: "Blue Light", colors: ["#FBF4E6", "#5A4F3C", "#2A2318", "#EEDDBE"] },
  { id: "blue+", label: "Blue Light+", colors: ["#F7E8CC", "#5C4A2E", "#2E2415", "#E6CC9C"] },
];
// shrinks the text until it fits on one line (the theme name in the sidebar)
function FitText({ text, className }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.fontSize = "";
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth && size > 7) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  }, [text]);
  return <div ref={ref} className={className} aria-live="polite"><span key={text}>{text}</span></div>;
}

const quadrants = ([a, b, c, d]) => `conic-gradient(${a} 0 25%, ${b} 0 50%, ${c} 0 75%, ${d} 0)`;

/* ---------- Institutional content maintained by CTL ---------- */

const SLO_PRIMER = `A student learning outcome describes what a student will be able to DO by the end of this course. It is not a list of what you will cover. That difference is the whole thing. "We will cover the causes of the Cold War" is a topic. "Students will evaluate competing explanations for the outbreak of the Cold War using primary sources" is an outcome, because you can point to a specific assignment that shows whether a student did it or not.

Three tests for a workable outcome:

1. Can you see it? Use verbs a person can observe: analyze, construct, evaluate, compare, design, defend, calculate, diagnose. Avoid understand, appreciate, know, and be familiar with. Nothing a student does can prove or disprove those.

2. Can you grade it? Every outcome should connect to at least one assignment, exam, project, or performance in this course. If nothing in your grade breakdown produces evidence for an outcome, then either the outcome or the assessment plan needs to change. This builder checks that for you.

3. Would a student recognize it? Outcomes are written for students, not for reviewers. A student reading the list should come away knowing what they are being asked to get good at.

Three to six outcomes is the usual range. Past that they stop working as a guide and start reading as a wall.

WHY THE GENERAL EDUCATION OUTCOMES ARE ALSO LISTED

If this course carries General Education credit, it is doing two jobs at once. It teaches your discipline, and it also delivers outcomes that belong to UTM's General Education curriculum as a whole. Those Gen Ed outcomes are what the university reports to SACSCOC and THEC as evidence that the curriculum actually works, and that evidence comes from courses like this one. Listing them next to your own outcomes does two useful things. It tells a student why this course satisfies a requirement they did not personally choose, and it tells the next person reviewing the program exactly where that requirement gets met.

You still write your own course outcomes. The Gen Ed set sits alongside them, not instead of them.

Delete this box once your outcomes are written. It is here to explain, not to print.`;

const OUTCOME_LIBRARY = [
  {
    group: "General Education · Social and Behavioral Sciences",
    note: "UTM General Education curriculum outcomes. Include verbatim if this course carries Gen Ed credit.",
    items: [
      "Students will describe the influence of geographic, political, economic, cultural, and/or family institutions on the individual and society.",
      "Students will explain the connection between social/behavioral science research and everyday life.",
      "Students will analyze key ethical issues as examined by the social/behavioral sciences.",
    ],
  },
  {
    group: "Program example · Political Science and Global Studies",
    note: "Shown as a worked example of program-level outcomes. CTL loads your department's set on request.",
    items: [
      "Describe political structures and processes, including those relating to elections, policy making, and policy implementation.",
      "Demonstrate an understanding of global political dynamics, encompassing an appreciation for the interconnectedness of international political, economic, and social activity.",
      "Produce a research project demonstrating analytical skills while applying contemporary methods of political science research.",
      "Write and present findings from an original research or critical thinking project.",
    ],
  },
];

// title and one-line description for the AI tier list (on screen only; the syllabus text is in AI_POLICIES)
const AI_TIER_TEXT = {
  mixed: ["Mixed use", "Students can use AI only on assignments you mark."],
  open: ["Unrestricted use", "Students can use AI on any assignment."],
  prohibited: ["Prohibited", "Students can't use AI in this course."],
  custom: ["Write my own", "Write your own policy for this course."],
};
const AI_POLICIES = {
  mixed: {
    label: "Mixed use · permitted on designated assignments",
    text: `In this course, students are permitted to use generative AI tools only for specific assignments, as designated by the instructor.

Understand tool limitations. AI tools may not always provide accurate or up-to-date information. They can draw on plagiarized sources and produce fictional citations. Treat anything they give you as a starting point for further research and verification, never as a finished answer.

Cite AI use. If you incorporate AI-generated information, cite it as "Generated using [AI tool]." Paraphrase and synthesize in your own words, and list the exact prompt you used as part of your citation.

Engage in original thought. AI tools supplement critical thinking and independent research. They do not replace them.

Respect academic integrity. All work must adhere to the academic integrity policies of this course and the university. Unpermitted use of AI is a form of academic misconduct under the UTM Student Code of Conduct.

Ask. If you are unsure whether a particular use is permitted, ask before you submit. That conversation is always easier before the fact than after.`,
  },
  open: {
    label: "Unrestricted use · AI permitted throughout",
    text: `In this course, you may use generative AI tools to support your learning and research. These tools can be genuinely useful, and part of what you are here to learn is how to use them well. Use them responsibly.

Understand tool limitations. AI tools are powerful but not reliable. They may return inaccurate or outdated information, draw on uncited sources, and invent citations that look real. Verify everything you intend to use.

Cite AI use. If AI-generated material informs your work, cite it as "Generated using [AI tool]" and include the prompt you used. Copying output without attribution is plagiarism.

Engage in original thought. Use these tools to extend your thinking, not to stand in for it. Your own analysis and voice are what is being assessed.

Respect academic integrity. All collaborative and AI-assisted work remains subject to the academic integrity policies of this course and the UTM Student Code of Conduct.

Ask. If you have questions about how to use a tool for a particular task, come talk to me.`,
  },
  prohibited: {
    label: "Prohibited · no AI use in this course",
    text: `Use of AI tools is not permitted in this course on any assignment. All work in this course will be produced by the student. Use of AI tools will be considered a violation of academic integrity and will be handled under the UTM Student Code of Conduct.`,
  },
  custom: { label: "Write my own", text: "" },
};

const LATE_POLICIES = [
  {
    label: "Grace period",
    text: "Assignments may be submitted up to 48 hours after the deadline without penalty. After the grace period, late work is not accepted unless an extension has been arranged with the instructor. Contact me as early as possible if you need additional time.",
  },
  {
    label: "Daily late penalty",
    text: "Late assignments lose 10 percentage points per calendar day, up to five days after the deadline. Work submitted more than five days late is not accepted. Contact me before the deadline if circumstances may affect your ability to submit on time.",
  },
  {
    label: "Extensions by request",
    text: "You may request an extension before an assignment deadline. Include the assignment name and the amount of additional time you need; I will confirm a revised due date. Please contact me as early as you can so we can make a plan.",
  },
  {
    label: "Make-up work for excused absences",
    text: "Students who miss an exam or assignment because of an excused absence should contact me as soon as possible to arrange make-up work. We will agree on a reasonable completion date. For planned absences, please reach out in advance whenever possible.",
  },
  {
    label: "Late assignments and make-up exams",
    text: "Assignments may be submitted up to seven days late with a 10 percent penalty per day. Make-up exams are available for excused absences; contact me promptly to arrange a time. If you anticipate missing a deadline or exam, please get in touch as early as possible.",
  },
];

const LOCKED = {
  integrity: {
    title: "Academic Integrity",
    text: `The University of Tennessee at Martin has chosen as its primary objective quality undergraduate education. That commitment obligates every member of the university community to promote and protect the highest standards of integrity in study, research, instruction, and evaluation. Integrity of the academic process requires fair and impartial evaluation by faculty and honest academic conduct by students.

Cheating and plagiarism will not be tolerated. Violations may result in a failing grade on the assignment, failure in the course, and a report to university administration. Students should review the UTM Standards of Conduct and the UTM Academic Integrity policy.

If you are ever unsure whether something crosses a line, ask before you submit.`,
  },
  accessibility: {
    title: "Digital Accessibility and Course Materials",
    text: `The University of Tennessee at Martin is committed to ensuring equal access to course content for all students in accordance with Title II of the Americans with Disabilities Act, the ADA Title II Final Rule (2024), and Section 504 of the Rehabilitation Act. This course works toward meeting WCAG 2.1 Level AA digital accessibility standards across all materials, including documents, slides, videos, and any linked content posted through Canvas or other course platforms.

If you encounter any course material that presents an accessibility barrier, meaning it is difficult or impossible to access using assistive technology, please notify me directly and contact the UTM Accessibility Resource Center (ARC) as soon as possible. Do not wait until an assignment deadline to report an issue. I want to make sure you are never disadvantaged while a resolution is in process.

The ARC serves as the university's coordinating office for all disability-related access needs and will partner with us to find the right solution.

Accessibility Resource Center (ARC)
206-209 Clement Hall  |  Phone: 731-881-7195  |  Email: ARC@utm.edu
Office Hours: Monday through Friday, 8:00 a.m. to 5:00 p.m.
utm.edu/offices-and-services/accessibility-resource-center/

For students with formally approved disability accommodations, please send your accommodation letter to me through the AIM portal at the start of the semester and follow up with me directly so we can discuss how your accommodations will be implemented in this course.`,
  },
  support: {
    title: "Student Resources and Support",
    text: `Learning Commons (Writing Center, tutoring, and Supplemental Instruction) — Paul Meek Library 
    https://liveutk.sharepoint.com/sites/LibraryLearningCommons

Accessibility Resource Center — Student Success Center, 206-209 Clement Hall, 731-881-7195, ARC@utm.edu

Student Health and Counseling Services — utm.edu/departments/shcs/
Counseling walk-in hours: Monday through Friday, 10:00 a.m. to 2:00 p.m.

College can be a demanding stretch, and asking for help early is a normal part of getting through it. These offices exist for exactly that.`,
  },
  crisis: {
    title: "Crisis and Emergency Support",
    text: `Pathways Crisis Line: 1-800-372-0693
988 Suicide and Crisis Lifeline: call or text 988
National Sexual Assault Hotline: 1-800-656-4673
UTM Department of Public Safety: 731-881-7777
Emergency: 911`,
  },
  changes: {
    title: "Syllabus Subject to Change",
    text: `This syllabus lays out a general plan for the course. It is not final, and adjustments may be necessary. Any changes will be communicated through Canvas announcements, and you are responsible for checking Canvas regularly. Major assignment dates will not move without reasonable advance notice.`,
  },
};

// saved copy, only used when utm.edu can't be reached or doesn't list the term
const SAVED_REGISTRAR_DATES = { "Spring 2027": [
  ["January 7", "Classes Begin"],
  ["January 18", "Martin Luther King Holiday"],
  ["February 22", "Midterm progress report"],
  ["March 22-28", "Spring Break"],
  ["March 26", "Spring Holiday"],
  ["April 23", "Classes End"],
  ["April 26-30", "Final exams"],
  ["May 1", "Commencement"],
] };

const SUMMER_SCHEDULES = {
  "summer-full": { label: "Full summer schedule", start: "2026-06-02", end: "2026-08-06" },
  "summer-first-half": { label: "First half summer schedule", start: "2026-06-02", end: "2026-07-01" },
  "summer-second-half": { label: "Second half summer schedule", start: "2026-07-06", end: "2026-08-06" },
};

const formatWeekday = (date) => date.toLocaleDateString("en-US", { weekday: "long" });
const formatMonthDay = (date) => date.toLocaleDateString("en-US", { month: "long", day: "numeric" });

const buildSummerScheduleRows = (key) => {
  const { start, end } = SUMMER_SCHEDULES[key] || SUMMER_SCHEDULES["summer-full"];
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const rows = [];
  let cursor = new Date(startDate);
  let week = 1;

  while (cursor <= endDate) {
    while (cursor <= endDate && (cursor.getDay() === 0 || cursor.getDay() === 6)) {
      cursor.setDate(cursor.getDate() + 1);
    }
    if (cursor > endDate) break;

    const dates = [];
    let current = new Date(cursor);
    while (current <= endDate && current.getDay() !== 0 && current.getDay() !== 6) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    if (dates.length) {
      const first = dates[0];
      const last = dates[dates.length - 1];
      const rangeText = dates.length > 1
        ? `${formatWeekday(first)}, ${formatMonthDay(first)} to ${formatWeekday(last)}, ${formatMonthDay(last)}`
        : `${formatWeekday(first)}, ${formatMonthDay(first)}`;

      rows.push({ label: `Week ${week}`, dates: rangeText, topics: "", due: "" });
      week += 1;
      cursor = new Date(current);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return rows;
};

/* Registrar's academic calendar, one entry per term. Dates are "YYYY-MM-DD".
   noClass: holidays and breaks. The schedule skips these on the days a class meets. */

const ACADEMIC_CALENDARS = {
  "Fall 2026": {
    start: "2026-08-24", end: "2026-12-04",
    finals: ["2026-12-07", "2026-12-11"],
    noClass: [
      ["2026-09-07", "2026-09-07", "Labor Day holiday"],
      ["2026-10-12", "2026-10-13", "Fall Break"],
      ["2026-11-25", "2026-11-29", "Thanksgiving holiday"],
    ],
  },
  "Spring 2027": {
    start: "2027-01-07", end: "2027-04-23",
    finals: ["2027-04-26", "2027-04-30"],
    noClass: [
      ["2027-01-18", "2027-01-18", "Martin Luther King holiday"],
      ["2027-03-22", "2027-03-28", "Spring Break"], // includes the March 26 Spring Holiday
    ],
  },
  "Maymester 2027": {
    start: "2027-05-10", end: "2027-05-28",
    noClass: [],
  },
  "Summer 2027 (Part of Term 1)": summer2027("2027-06-02", "2027-08-06"),
  "Summer 2027 (Part of Term 2)": summer2027("2027-06-02", "2027-07-01"),
  "Summer 2027 (Part of Term 3)": summer2027("2027-07-06", "2027-08-06"),
  "Fall 2027": {
    start: "2027-08-23", end: "2027-12-03",
    finals: ["2027-12-06", "2027-12-10"],
    noClass: [
      ["2027-09-06", "2027-09-06", "Labor Day holiday"],
      ["2027-10-11", "2027-10-12", "Fall Break"],
      ["2027-11-24", "2027-11-28", "Thanksgiving holiday"],
    ],
  },
};

function summer2027(start, end) {
  return {
    start, end,
    noClass: [
      ["2027-05-31", "2027-05-31", "Memorial Day holiday"],
      ["2027-06-18", "2027-06-18", "Juneteenth holiday"],
      // Registrar lists "July 02 or 5". Confirm which day is observed.
      ["2027-07-05", "2027-07-05", "July 4 holiday observed"],
    ],
  };
}

/* ---------- calendar helpers ---------- */

// day numbers match Date.getDay(): 0 = Sunday, first like a US calendar
const CLASS_DAYS = [[0, "Sun"], [1, "Mon"], [2, "Tue"], [3, "Wed"], [4, "Thu"], [5, "Fri"], [6, "Sat"]];
const byWeek = (a, b) => a - b;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

// Parse as local time. new Date("2026-08-24") is UTC and lands a day early in US time zones.
const parseDate = (iso) => { const [y, m, dd] = iso.split("-").map(Number); return new Date(y, m - 1, dd); };
const isoDate = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const shortDate = (iso) => { const dt = parseDate(iso); return `${MONTHS[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`; };
const longRange = (a, b) => {
  const x = parseDate(a), y = parseDate(b);
  const first = `${MONTHS[x.getMonth()]} ${x.getDate()}`;
  if (a === b) return first;
  return x.getMonth() === y.getMonth() ? `${first} to ${y.getDate()}` : `${first} to ${MONTHS[y.getMonth()]} ${y.getDate()}`;
};

// One row per calendar week that has a meeting day, plus a finals row.
// Holidays are only listed when they land on a day this class meets.
function buildWeeks(cal, days) {
  if (!cal || !days.length) return [];
  const start = parseDate(cal.start), end = parseDate(cal.end);
  const sunday = new Date(start.getFullYear(), start.getMonth(), start.getDate() - start.getDay());
  const weeks = new Map();
  for (const dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    if (!days.includes(dt.getDay())) continue;
    const iso = isoDate(dt);
    const n = Math.floor(Math.round((dt - sunday) / 864e5) / 7); // round absorbs DST
    if (!weeks.has(n)) weeks.set(n, { meets: [], off: new Map() });
    const w = weeks.get(n);
    const hol = cal.noClass.find(([a, b]) => iso >= a && iso <= b);
    if (hol) w.off.set(hol[2], [...(w.off.get(hol[2]) || []), iso]);
    else w.meets.push(iso);
  }
  const rows = [...weeks.values()].map((w, i) => ({
    label: `Week ${i + 1}`,
    dates: w.meets.map(shortDate).join(", "),
    off: [...w.off].map(([name, isos]) =>
      `No class ${isos.map((x) => `${DAY_NAMES[parseDate(x).getDay()]}, ${shortDate(x)}`).join(" and ")}: ${name}`),
  }));
  if (cal.finals) rows.push({ label: "Finals", dates: longRange(...cal.finals), off: [] });
  return rows;
}

/* ---------- schedule date helpers ---------- */
const FALL_2026_START = "2026-08-24";

const formatScheduleDate = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(date);

const buildWeekDates = (startDate, count = 15) => {
  if (!startDate) return [];
  const start = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(start.getTime())) return [];

  return Array.from({ length: count }, (_, i) => {
    const from = new Date(start);
    from.setDate(start.getDate() + i * 7);
    const to = new Date(from);
    to.setDate(from.getDate() + 4);
    return `${formatScheduleDate(from)} to ${formatScheduleDate(to)}`;
  });
};

/* ---------- weight helpers ---------- */
const parseWeight = (s) => {
  // Strip "%", whitespace, letters so "20%", " 20 ", "20 percent" → 20
  const n = parseFloat(String(s ?? "").replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fmtWeight = (n) => {
  // Round to 2 decimals, drop trailing zeros:
  // 100.00000000000001 → "100", 33.333 → "33.33"
  const r = Math.round(n * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString();
};

/* ---------- initial state ---------- */


// Guesses the term people are planning for: once a term is a month in, it's the next one.
// Only used until Banner says which term is open, or if Banner can't be reached.
function defaultTerm(today = new Date()) {
  const y = today.getFullYear();
  const terms = [y - 1, y, y + 1].flatMap((yr) => [
    { label: `Spring ${yr}`, start: new Date(yr, 0, 7) },
    { label: `Summer ${yr}`, start: new Date(yr, 5, 1) },
    { label: `Fall ${yr}`, start: new Date(yr, 7, 22) },
  ]);
  let last = 0;
  terms.forEach((t, i) => {
    const monthIn = new Date(t.start.getFullYear(), t.start.getMonth() + 1, t.start.getDate());
    if (monthIn <= today) last = i;
  });
  return terms[last + 1].label;
}

// backup term list for when Banner is down
function nearbyTerms(today = new Date()) {
  const seasons = ["Spring", "Summer", "Fall"];
  const [season, year] = defaultTerm(today).split(" ");
  let i = seasons.indexOf(season) - 1, y = Number(year);
  if (i < 0) { i = 2; y -= 1; }
  const out = [];
  for (let k = 0; k < 5; k++) {
    out.push(`${seasons[i]} ${y}`);
    if (++i > 2) { i = 0; y += 1; }
  }
  return out.reverse();
}

// Departments and their subjects, checked against utm.edu.
// Also the fallback when Banner's department info is wrong.
const DEPARTMENT_DATA = [
  { college: "College of Agriculture and Applied Sciences", departments: [
    { name: "Agriculture, Geosciences, and Natural Resources", subjects: ["AGEC", "AGED", "AGET", "AGRI", "ANSC", "GEOL", "GEOS", "METR", "NRM", "PARK", "PLSC", "SOIL", "VET", "WBIO"] },
    { name: "Family and Consumer Sciences", subjects: ["FCS", "CFS", "FCSE", "FASH", "GERO", "HPMG", "FSMG", "NUTR"] },
    { name: "Military Science and Leadership", subjects: ["MSL"] },
  ] },
  { college: "College of Business and Global Affairs", departments: [
    { name: "School of Business", subjects: ["ACCT", "ECON", "FIN", "MGT", "MKTG", "BCOM", "INFS", "SPMG", "BLAW"] },
  ] },
  { college: "College of Education, Health, and Behavioral Sciences", departments: [
    { name: "Behavioral Sciences", subjects: ["CJ", "SWRK", "SOC"] },
    { name: "Educational Studies", subjects: ["EDST", "ELED", "ECED", "SEDU", "SPED", "COUN", "TCED", "EDFN", "READ"] },
    { name: "Health and Human Performance", subjects: ["HHP", "EXSC", "HPER", "ATRN", "HPED", "HLTH", "PACT"] },
    { name: "Interdisciplinary Studies", subjects: ["IDST"] },
    { name: "Nursing", subjects: ["NURS"] },
    { name: "Psychology", subjects: ["PSYC"] },
  ] },
  { college: "College of Engineering and Natural Sciences", departments: [
    { name: "Biological Sciences", subjects: ["BIOL", "ZOOL", "BOT", "MBIO", "BCHE"] },
    { name: "Chemistry and Physics", subjects: ["CHEM", "PHYS", "ASTR"] },
    { name: "Computer Science", subjects: ["CSCI", "CYBR"] },
    { name: "Engineering", subjects: ["ENGR", "CIEG", "CMGT"] },
    { name: "Mathematics and Statistics", subjects: ["MATH", "STAT"] },
  ] },
  { college: "College of Humanities and Fine Arts", departments: [
    { name: "English and Modern Foreign Languages", subjects: ["ENGL", "FREN", "GERM", "JAPN", "SPAN"] },
    { name: "History and Philosophy", subjects: ["AAST", "HIST", "PHIL", "RLST", "WMST"] },
    { name: "Mass Media and Strategic Communication", subjects: ["MMSC"] },
    { name: "Music", subjects: ["MUS", "MUAP", "MUED", "MUEN"] },
    { name: "Political Science and Global Studies", subjects: ["POSC", "INST"] },
    { name: "Visual and Theatre Arts", subjects: ["ART", "ARTE", "ARTH", "DANC", "DNED", "THEA", "GDES"] },
  ] },
];

// grouped list for the Department dropdown
const DEPARTMENTS = DEPARTMENT_DATA.map(({ college, departments }) => ({
  college, names: departments.map((d) => d.name),
}));

// true when the live lookup can't be reached at all (no server, or Banner is down),
// not when Banner just didn't find anything
const liveLookupUnreachable = (res) =>
  res.status >= 500 || !(res.headers.get("content-type") || "").includes("application/json");

const SUBJECT_DEPARTMENTS = new Map();
for (const { departments } of DEPARTMENT_DATA) {
  for (const { name, subjects } of departments) {
    for (const code of subjects) SUBJECT_DEPARTMENTS.set(code, `Department of ${name}`);
  }
}

// Builds a fresh blank draft. Returning a new object each time keeps the
// initial state and every reset independent of each other.
const createBlank = () => ({
  code: "", title: "", crn: "", section: "", term: defaultTerm(), modality: "In person", semester: "Full Semester",
  credits: "3", meetingTime: "",
  location: "", exlocation: "", dept: "", prereq: "",
  instructor: "", email: "", phone: "", office: "", hours: "", address: "",
  subjectLine: "",
  description: "", welcome: "", customDescriptions: [],
  showPrimer: true, outcomes: [""],
  texts: "", costNote: "", tech: "",
  materials: { provided: false, hardcopy: false, online: false, acquire: "" },
  extraMaterials: [],
  gradingMethod: "percentage",
  items: [{ name: "", weight: "", points: "", due: "", desc: "", slos: [] }],
  scale: "A 90 to 100  ·  B 80 to 89  ·  C 70 to 79  ·  D 60 to 69  ·  F below 60",
  attendance: "", late: "", lateSample: "", lateAdditional: [], participation: "",
  aiTier: "mixed", aiCustom: "", profNote: "", customPolicies: [],
  inc: { integrity: true, accessibility: true, support: true, crisis: true, changes: true },
  meetDays: [], // 0 = Sunday, 1 = Monday ... 6 = Saturday
  scheduleType: "weekly",
  semesterStart: FALL_2026_START,
  weeks: [{ label: "Week 1", dates: "", topics: "", due: "" }],
  calNote: true,
  hasLab: false,
  lab: {
    crn: "", meetDays: [], meeting: "", location: "", instructor: "",
    description: "", gradeNote: "", attendance: "",
    safety: "", supplies: "", makeup: "",
  },
});

// Read-only baseline used to tell whether the draft has been edited.
const blank = createBlank();

/* ---------- small UI atoms ---------- */

const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const trimEnds = (s) => s.replace(/^[._-]+|[._-]+$/g, "");

const sanitizePart = (s) => {
  const out = trimEnds(
    trimEnds(
      String(s ?? "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")   // é -> e
        .replace(/[^A-Za-z0-9._-]/g, "_")  // whitelist
        .replace(/_+/g, "_")               // collapse runs
    ).slice(0, 60)                         // length cap
  );
  return RESERVED.test(out) ? `${out}_` : out;
};


// turns labels into sentence case but keeps acronyms like CRN
const sentenceCase = (s) => typeof s !== "string" ? s
  : s.split(" ").map((w, i) => (i === 0 || w === "I" || /^[A-Z0-9]{2,}/.test(w) ? w : w.toLowerCase())).join(" ");



// the sidebar's selected and hover highlights; 40 is each tab's height
const railPill = { position: "absolute", left: 8, right: 8, top: 8, height: 40, borderRadius: 999, pointerEvents: "none" };


/* Rich-text fields are stored as a small HTML subset. Browsers wrap each new
   line in a <div>, so those blocks are kept (without attributes) while the
   editor is being typed in; blocksToBreaks() flattens them on blur so the value
   survives a round trip through JSON and the document builder. */
const allowedEditorTags = ["B", "STRONG", "I", "EM", "U"];

const stripAttributes = (node) => {
  Array.from(node.attributes).forEach((attr) => node.removeAttribute(attr.name));
};

const sanitizeEditorContent = (html = "") => {
  if (!html) return "";

  const temp = document.createElement("div");
  temp.innerHTML = html;

  Array.from(temp.querySelectorAll("*")).forEach((node) => {
    if (!node.parentNode) return;
    const tag = node.tagName.toUpperCase();
    if (allowedEditorTags.includes(tag) || tag === "DIV" || tag === "P" || tag === "BR") {
      stripAttributes(node);
      return;
    }
    while (node.firstChild) node.parentNode.insertBefore(node.firstChild, node);
    node.remove();
  });

  return temp.innerHTML;
};

const blocksToBreaks = (html = "") => {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;

  Array.from(temp.querySelectorAll("div, p")).forEach((node) => {
    if (!node.parentNode) return;
    const br = document.createElement("br");
    node.parentNode.insertBefore(br, node);
    while (node.firstChild) node.parentNode.insertBefore(node.firstChild, node);
    node.remove();
  });

  // A leading block (a first line that has content) leaves a leading break.
  if (temp.firstChild && temp.firstChild.nodeName === "BR") temp.removeChild(temp.firstChild);

  return temp.innerHTML;
};

const TextEditor = ({ value, onChange, placeholder, rows = 1, mono = false, singleLine = false, onBlur }) => {
  const editorRef = useRef(null);

  // before paint, so a box that's reused for the next item (after a delete) never shows the old text
  useLayoutEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const persistValue = () => {
    const raw = editorRef.current?.innerHTML || "";
    const safe = sanitizeEditorContent(raw);
    editorRef.current.innerHTML = safe;
    onChange(safe);
  };

  const handleKeyDown = (event) => {
    const isModifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (!isModifier) return;

    const map = {
      b: "bold",
      i: "italic",
      u: "underline",
    };

    if (map[key]) {
      event.preventDefault();
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      document.execCommand(map[key], false, null);
      persistValue();
    }
  };

  const isEmpty = !String(value || "").replace(/<[^>]*>/g, "").trim();

  return (
    <div
      data-multiline={singleLine ? undefined : "true"}
      className={inputBase}
      style={{
        position: "relative",
        minHeight: singleLine ? 40 : rows * 23,
        height: singleLine ? 40 : undefined,
        overflow: "hidden",
        padding: 0,
        // placeholder and text share one grid cell so the box fits whichever is taller
        display: singleLine ? "flex" : "grid",
        alignItems: "stretch",
      }}
    >
      {isEmpty && placeholder && (
        <div
          aria-hidden="true"
          style={singleLine ? {
            position: "absolute",
            top: 8,
            left: 16,
            right: 16,
            color: UI.muted,
            pointerEvents: "none",
            lineHeight: 1.5,
            whiteSpace: singleLine ? "nowrap" : "pre-wrap",
            fontFamily: mono ? "ui-monospace, monospace" : "inherit",
          } : {
            gridArea: "1 / 1", padding: "8px 16px", color: UI.muted, pointerEvents: "none", lineHeight: 1.5,
            whiteSpace: "pre-wrap", fontFamily: mono ? "ui-monospace, monospace" : "inherit",
          }}
        >
          {placeholder}
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={placeholder || "Text editor"}
        onInput={(e) => onChange(sanitizeEditorContent(e.currentTarget.innerHTML))}
        onBlur={() => {
          const safe = blocksToBreaks(sanitizeEditorContent(editorRef.current?.innerHTML || ""));
          editorRef.current.innerHTML = safe;
          onChange(safe);
          onBlur?.();
        }}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          gridArea: "1 / 1",
          minHeight: singleLine ? 40 : rows * 23,
          height: singleLine ? 40 : undefined,
          maxHeight: singleLine ? 40 : 480, // grows with the text, scrolls past this
          overflow: singleLine ? "hidden" : "auto",
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
          background: "transparent",
          lineHeight: 1.5,
          whiteSpace: singleLine ? "nowrap" : "pre-wrap",
          fontFamily: mono ? "ui-monospace, monospace" : "inherit",
          color: UI.ink, // theme variable, so typed text is readable in every theme
          padding: "8px 16px",
          outline: "none",
        }}
      />
    </div>
  );
};

/* Single-line fields are identifiers, dates, and phone numbers: keep the native
   input so type="date"/"tel", maxLength, and onBlur keep working. Rich text is
   for the multi-line fields below. */
const T = ({ value, onChange, placeholder, mono, type = "text", onBlur, maxLength }) => (
  <input type={type} className={inputBase} style={mono ? { fontFamily: "ui-monospace, monospace" } : undefined}
    value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
);

const normalizeRichHtml = (value = "") => {
  const normalized = String(value)
    .replace(/<div>/gi, "\n")
    .replace(/<\/div>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ");

  const escapeText = (text = "") =>
    text.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const walk = (node) => {
    if (!node) return "";
    if (node.nodeType === 3) return escapeText(node.textContent || "");
    if (node.nodeType !== 1) return "";

    const tag = node.nodeName.toUpperCase();
    if (tag === "BR") return "<br/>";
    if (["DIV", "P", "SPAN"].includes(tag)) {
      return Array.from(node.childNodes).map(walk).join("");
    }
    if (["B", "STRONG"].includes(tag)) {
      return `<strong>${Array.from(node.childNodes).map(walk).join("")}</strong>`;
    }
    if (["I", "EM"].includes(tag)) {
      return `<em>${Array.from(node.childNodes).map(walk).join("")}</em>`;
    }
    if (tag === "U") {
      return `<u>${Array.from(node.childNodes).map(walk).join("")}</u>`;
    }
    return Array.from(node.childNodes).map(walk).join("");
  };

  const template = document.createElement("template");
  template.innerHTML = normalized;
  return Array.from(template.content.childNodes).map(walk).join("");
};

const formatRichText = (value = "") => normalizeRichHtml(value);

/* Turns a rich-text value back into the plain text the professor sees, for the
   accessibility checks: <br> and <div>/<p> blocks become line breaks, tags such as
   <b>/<i>/<u> are dropped, and entities (&amp;, &nbsp; …) are decoded. Line breaks
   follow the same rules normalizeRichHtml uses for the document, so a blank line
   here is a paragraph break there. A template is inert, so nothing in it runs or loads. */
const richToPlain = (value = "") => {
  const s = String(value ?? "");
  if (!/[<&]/.test(s)) return s; // already plain text
  const tpl = document.createElement("template");
  tpl.innerHTML = s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p)>\s*<(div|p)\b[^>]*>/gi, "\n")
    .replace(/<(div|p)\b[^>]*>/gi, "\n")
    .replace(/<\/(div|p)>/gi, "");
  return tpl.content.textContent.replace(/ /g, " ").replace(/^\n/, "");
};

const A = ({ value, onChange, placeholder, rows = 4, onBlur }) => (
  <TextEditor value={value} onChange={onChange} placeholder={placeholder} rows={rows} onBlur={onBlur} />
);

/** Groups a label, hint, and form control into one consistent field. */
// src: the data this field edits, matching data-src in the preview (see docBody)
const Field = ({ label, hint, src, children }) => (
  <div className="field" data-src={src}>
    <span className="field-label" title={hint || undefined}>{sentenceCase(label)}</span>
    <div className="field-input">{children}</div>
  </div>
);

// card for things people add (sections, policies) with a heading and a trash button
const CardField = ({ title, onTitle, titlePlaceholder, titleLabel, label, onRemove, removeLabel, children, ...rest }) => (
  <div className="field card-field" {...rest}>
    <div className="card-field-head">
      {onTitle
        ? <input className="card-field-title" value={title} onChange={(e) => onTitle(e.target.value)} placeholder={titlePlaceholder} aria-label={titleLabel} />
        : <span className="card-field-label">{label}</span>}
      {onRemove && <button type="button" className="card-field-remove" onClick={onRemove} aria-label={removeLabel} title="Remove"><Trash2 size={15} /></button>}
    </div>
    {children}
  </div>
);

// a label with an on/off switch
const SwitchRow = ({ checked, onChange, src, children }) => (
  // stops the focus ring from sticking after a click
  <label className="toggle-row" data-src={src} onMouseDown={(e) => e.preventDefault()}>
    <span>{children}</span>
    <input type="checkbox" role="switch" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
  </label>
);

// pop-up alert, closes on outside click or Escape
const Dialog = ({ onClose, labelId, width = 300, children }) => {
  useDismiss(true, onClose);
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={labelId}
        style={{ width: `min(100%, ${width}px)` }} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

// gray helper text
const Caption = ({ children }) => <div className="caption">{children}</div>;

// full-width add button (can take a different icon)
const AddRow = ({ onClick, icon: I = Plus, children }) => (
  <button type="button" className="add-row" onClick={onClick}><I size={16} aria-hidden="true" />{children}</button>
);

// mon-sat day toggles
// one control for the week; picked days next to each other join into one pill,
// and a hover pill slides under the days like the lists' highlight
const DayPicker = ({ days, onToggle }) => {
  const [hover, setHover] = useState(null);
  const slid = useRef(false); // the first hover fades in where it is, later ones slide
  const slide = slid.current && hover != null;
  useEffect(() => { slid.current = hover != null; });
  return (
    <span className="day-picker" role="group" aria-label="Meeting days" onMouseLeave={() => setHover(null)}>
      <span className="day-slide" aria-hidden="true" style={{ opacity: hover == null ? 0 : 1,
        transform: `translateX(${(hover ?? 0) * 100}%)`, transition: slide ? undefined : "opacity 0.15s ease" }} />
      {CLASS_DAYS.map(([n, letter], i) => {
        const on = days.includes(n);
        const joins = (j) => on && CLASS_DAYS[j] && days.includes(CLASS_DAYS[j][0]);
        return (
          <button key={n} type="button" aria-pressed={on} aria-label={DAY_NAMES[n]} title={DAY_NAMES[n]}
            className={`${joins(i - 1) ? "join-prev" : ""} ${joins(i + 1) ? "join-next" : ""}`.trim() || undefined}
            onMouseEnter={() => setHover(i)} onClick={() => onToggle(n)}>{letter}</button>
        );
      })}
    </span>
  );
};

// a row that opens to show more
// openSummary: different right-side text while open; the two slide past each other
const ExpandRow = ({ open, onToggle, label, summary, openSummary, children }) => (
  <div className={`expand-group${open ? " is-open" : ""}`}>
    <button className="list-row" onClick={onToggle} aria-expanded={open}>
      <span className="row-label">{label}</span>
      {openSummary == null
        ? <span className="row-detail">{summary}</span>
        : <span className="row-detail detail-swap">
            <span aria-hidden={open || undefined}>{summary}</span>
            <span aria-hidden={!open || undefined}>{openSummary}</span>
          </span>}
      <MorphChevron open={open} />
    </button>
    <div className="expand-more" inert={open ? undefined : ""}><div ref={stairRef} className={open ? "stair-reveal" : undefined}>{children}<SlideHighlight /></div></div>
  </div>
);

// sample texts as a row that opens to list them, like the export rows; picking one inserts it
// the right side says which sample is in the box, and "Edited" once it's been changed
const plainText = (v) => richToPlain(v || "").replace(/\s+/g, " ").trim();
const SampleRows = ({ label, options, current, onChange }) => {
  const [open, setOpen] = useState(false);
  const now = plainText(current);
  const match = now ? options.find((o) => plainText(o.text ?? o.value) === now) : null;
  const [lastUsed, setLastUsed] = useState(null);
  useEffect(() => { if (match) setLastUsed(match.label); }, [match?.label]);
  const summary = match ? match.label : lastUsed && now ? `${lastUsed} · Edited` : `${options.length} samples`;
  return (
    <ExpandRow open={open} onToggle={() => setOpen((o) => !o)} label="Start from a sample" summary={summary}>
      {options.map((o) => (
        <button key={o.label} type="button" className="list-item" aria-label={`${label}: ${o.label}`}
          onClick={() => { setOpen(false); onChange(o.value); }}>
          <span style={{ flex: 1 }}>{o.label}</span>
          <span className="item-go">Use<ChevronRight size={13} aria-hidden="true" /></span>
        </button>
      ))}
    </ExpandRow>
  );
};

/* ============================================================ */

/**
 * Builds the syllabus editor, live preview, readiness checklist, and export actions.
 * The component keeps all draft data in local React state and passes that state to
 * the document builder so the preview and downloaded files always match.
 */
export default function SyllabusBuilder() {
  const [d, setD] = useState(createBlank);


  // adds a warning before the user leaves the page changes will not be saved.
  const hasUnsavedChanges = JSON.stringify(d) !== JSON.stringify(blank);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);
  const [tab, setTab] = useState(0);
  const [hoverTab, setHoverTab] = useState(null);
  // remembered so the hover highlight slides from where it was last, not from the top
  const lastHoverTab = useRef(0);
  if (hoverTab !== null) lastHoverTab.current = hoverTab;
  // starts in light or dark based on the computer
  // starts in light or dark based on the computer
  const systemDark = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const [theme,setTheme] = useState(() => (systemDark() ? "dark" : "light"));
  const themePicked = useRef(false); // once someone picks a theme, stop following the computer
  const [glass, setGlass] = useState(true);
  const [panelsHidden, setPanelsHidden] = useState(false);
  const wavesOnly = panelsHidden && glass;
  const [hoverTheme, setHoverTheme] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPeek, setPickerPeek] = useState(false); // hovered or focused, which also shows the swatches
  const pickerRef = useRef(null);
  useDismiss(pickerOpen, () => setPickerOpen(false), pickerRef);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.toggleAttribute("data-glass", glass);
  }, [glass]);
  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  // fades between themes, just switches if the browser can't
  const changeLook = (apply) => {
    const reduce = reduceMotion();
    if (!document.startViewTransition || reduce) { apply(); return; }
    // the new theme has to be on the page before the fade starts
    document.startViewTransition(() => flushSync(apply));
  };
  const applyTheme = (id) => changeLook(() => {
    document.documentElement.setAttribute("data-theme", id);
    setTheme(id);
  });
  const pickTheme = (id) => { themePicked.current = true; applyTheme(id); };
  const toggleGlass = () => { glassPicked.current = true; hideNotice(); changeLook(() => {
    document.documentElement.toggleAttribute("data-glass", !glass);
    setGlass(!glass);
  }); };
  // follow the computer switching between light and dark mode while the app is open
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return undefined;
    const onChange = (e) => { if (!themePicked.current) applyTheme(e.matches ? "dark" : "light"); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // performance mode: turns Glass off if the page gets choppy (the waves and blur are what cost)
  // once someone flips Glass themselves, leave it alone
  const glassPicked = useRef(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const noticeRef = useRef(null);
  // slides the notice back out before removing it
  const hideNotice = () => {
    const el = noticeRef.current;
    const reduce = reduceMotion();
    if (!el || reduce || !el.animate) { setSlowNotice(false); return; }
    el.animate([{ transform: "none", opacity: 1 }, { transform: "translateX(calc(100% + 24px))", opacity: 0 }],
      { duration: 250, easing: "ease-in", fill: "forwards" }).finished.then(() => setSlowNotice(false));
  };
  const glassTooSlow = () => {
    if (glassPicked.current) return;
    setGlass(false);
    setSlowNotice(true);
  };
  useEffect(() => {
    if (!slowNotice) return undefined;
    const t = setTimeout(hideNotice, 10000);
    return () => clearTimeout(t);
  }, [slowNotice]);
  // under 24 fps for 6 seconds straight = too slow (not 30, battery saver caps at 30)
  // skips the first 3 seconds and gaps over half a second so one hiccup doesn't count
  useEffect(() => {
    if (!glass || glassPicked.current) return undefined;
    let raf, last = performance.now(), windowStart = last, frames = 0, slow = 0;
    const began = last;
    const tick = (now) => {
      if (now - last > 500) { windowStart = now; frames = 0; } else frames++;
      last = now;
      if (now - windowStart >= 2000) {
        const fps = (frames * 1000) / (now - windowStart);
        slow = fps < 24 && now - began > 3000 ? slow + 1 : 0;
        windowStart = now; frames = 0;
        if (slow >= 3) { glassTooSlow(); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [glass]);
  const [showPrinted, setShowPrinted] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  // our version of confirm(), use: if (!(await askConfirm({...}))) return
  const [confirmBox, setConfirmBox] = useState(null);
  const askConfirm = (opts) => new Promise((resolve) => setConfirmBox({ ...opts, resolve }));
  const answerConfirm = (yes) => { confirmBox?.resolve(yes); setConfirmBox(null); };
  const [weekCount, setWeekCount] = useState("15");
  const [weekCountWarning, setWeekCountWarning] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  // preview zoom: null fits the width, otherwise a size from 50% to 200%
  const [previewZoom, setPreviewZoom] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [showDone, setShowDone] = useState(false);
  const [labReveal, setLabReveal] = useState(false); // staircase the lab fields in, only right after the switch turns on
  const [labLeaving, setLabLeaving] = useState(false); // and back out (bottom first) before they're removed
  const toggleLab = (on) => {
    if (on) { setLabLeaving(false); setLabReveal(true); set("hasLab", true); return; }
    if (reduceMotion()) { set("hasLab", false); return; }
    setLabReveal(false);
    setLabLeaving(true);
    setTimeout(() => { setLabLeaving(false); set("hasLab", false); }, 10 * 35 + 200); // last row's delay + its fade
  };
  const [fullPolicies, setFullPolicies] = useState([]); // policies with Show more open
  const policyTextRefs = useRef({});
  const [policyClosing, setPolicyClosing] = useState([]); // closing ones: the label says "more" while the text still shrinks
  // Show more / less glides the text open or closed; closing cuts back to 3 lines only after the glide
  const togglePolicy = (k) => {
    const el = policyTextRefs.current[k];
    const full = fullPolicies.includes(k);
    const flip = () => setFullPolicies((f) => (full ? f.filter((x) => x !== k) : [...f, k]));
    if (!el) { flip(); return; }
    const from = el.getBoundingClientRect().height;
    el.classList.toggle("is-full"); // measure the other size
    const to = el.getBoundingClientRect().height;
    el.classList.toggle("is-full");
    const glide = glideHeight(el, from, to, { duration: 280 });
    if (!glide) { flip(); return; }
    // closing: the label switches now; clamp in the same instant the glide ends, or the full text flashes back for a frame
    if (full) {
      setPolicyClosing((c) => [...c, k]);
      glide.onfinish = () => { el.classList.remove("is-full"); flip(); setPolicyClosing((c) => c.filter((x) => x !== k)); };
    } else flip();
  };
  const [openChecks, setOpenChecks] = useState([]); // export rows that are open
  const [showTextKeybinds, setShowTextKeybinds] = useState(false);

  const [lookupStatus, setLookupStatus] = useState(null);

  const [termOptions, setTermOptions] = useState([]);

  // If the live lookup can't be reached, use the offline JSON catalog instead.
  // Tries live again after 2 minutes so one Banner hiccup doesn't stick.
  const [liveDownUntil, setLiveDownUntil] = useState(0);
  const markLiveDown = () => setLiveDownUntil(Date.now() + 2 * 60 * 1000);
  const liveDown = liveDownUntil > Date.now();

  // offline catalog, only loaded once it's actually needed
  const offlineCatalogRef = useRef(null);
  const loadOfflineCatalog = () => {
    if (!offlineCatalogRef.current) {
      offlineCatalogRef.current = fetch("/utm_course_catalog_26_27.json")
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({}));
    }
    return offlineCatalogRef.current;
  };

  // the registrar's dates for every term on utm.edu/academics/academic-calendar
  const [registrar, setRegistrar] = useState({ status: "loading", terms: {} });
  useEffect(() => {
    let cancelled = false;
    fetch("/api/banner?action=calendar")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((payload) => { if (!cancelled) setRegistrar({ status: "ok", terms: payload.terms || {} }); })
      .catch(() => { if (!cancelled) setRegistrar({ status: "failed", terms: {} }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/banner?action=terms")
      .then((r) => {
        if (liveLookupUnreachable(r)) { markLiveDown(); return { terms: [] }; }
        return r.ok ? r.json() : { terms: [] };
      })
      .then((payload) => {
        if (cancelled) return;
        setTermOptions(payload.terms || []);
        // switch to the term Banner has open, unless the term was already changed
        if (payload.current) setD((p) => (p.term === defaultTerm() ? { ...p, term: payload.current } : p));
      })
      .catch(() => { if (!cancelled) markLiveDown(); });
    return () => { cancelled = true; };
  }, []);



  const [codeSuggestions, setCodeSuggestions] = useState([]);
  const [codeSuggestOpen, setCodeSuggestOpen] = useState(false);
  const [codeSuggestLoading, setCodeSuggestLoading] = useState(false);
  const codeSuggestRef = useRef(null);
  const codeJustSelectedRef = useRef(false);
  // saves search results so retyping doesn't hit Banner again
  const courseListCacheRef = useRef(new Map());

  useDismiss(codeSuggestOpen, () => setCodeSuggestOpen(false), codeSuggestRef);

  const pickCodeSuggestion = (s) => {
    if (s.type === "subject") {
      // picked a subject, so show its courses
      setD((p) => ({ ...p, code: `${s.code} ` }));
    } else {
      // picked a full course, no need to search again
      codeJustSelectedRef.current = true;
      setD((p) => ({ ...p, code: s.code, title: s.title || p.title }));
    }
    setCodeSuggestOpen(false);
  };

  // As you type: letters match subjects locally, subject + numbers searches Banner.
  useEffect(() => {
    if (codeJustSelectedRef.current) { codeJustSelectedRef.current = false; return undefined; }

    const raw = String(d.code || "");
    const match = raw.match(/^\s*([A-Za-z]*)\s*(\d*)/);
    const subjectPart = (match?.[1] || "").toUpperCase();
    const numberPart = match?.[2] || "";

    if (!subjectPart) { setCodeSuggestLoading(false); setCodeSuggestions([]); setCodeSuggestOpen(false); return undefined; }

    const knownSubject = SUBJECTS.some((s) => s.code === subjectPart);

    if (!knownSubject) {
      // still typing the subject, e.g. "CS"
      const matches = SUBJECTS.filter((s) => s.code.startsWith(subjectPart)).slice(0, 8)
        .map((s) => ({ type: "subject", code: s.code, description: s.description }));
      setCodeSuggestLoading(false);
      setCodeSuggestions(matches);
      setCodeSuggestOpen(matches.length > 0);
      return undefined;
    }

    // full subject like "CSCI", so show its courses right away
    // the subject itself is done, so drop the old subject rows while its courses load
    setCodeSuggestions((prev) => prev.filter((x) => x.type === "course"));

    // live lookup is down, so search the offline catalog instead
    if (liveDownUntil > Date.now()) {
      let cancelled = false;
      setCodeSuggestLoading(true);
      setCodeSuggestOpen(true);
      loadOfflineCatalog().then((catalog) => {
        if (cancelled) return;
        const matches = Object.values(catalog)
          .filter((c) => {
            const [subj, num = ""] = String(c.courseCode || "").split(" ");
            return subj === subjectPart && num.startsWith(numberPart);
          })
          .sort((a, b) => a.courseCode.localeCompare(b.courseCode, undefined, { numeric: true }))
          .map((c) => ({ type: "course", code: c.courseCode, title: c.courseTitle }));
        setCodeSuggestLoading(false);
        setCodeSuggestions(matches);
        setCodeSuggestOpen(true);
      });
      return () => { cancelled = true; };
    }

    const cacheKey = `q:${d.term}|${subjectPart}|${numberPart}`;
    const cached = courseListCacheRef.current.get(cacheKey);
    if (cached) {
      setCodeSuggestLoading(false);
      setCodeSuggestions(cached);
      setCodeSuggestOpen(cached.length > 0);
      return undefined;
    }

    // keep the old suggestions up until the new ones arrive, so the list resizes once instead of emptying first
    setCodeSuggestLoading(true);
    setCodeSuggestOpen(true);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const url = `/api/banner?action=course-search&term=${encodeURIComponent(d.term)}&subject=${encodeURIComponent(subjectPart)}&q=${encodeURIComponent(numberPart)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (liveLookupUnreachable(res)) { markLiveDown(); return; }
        if (!res.ok) throw new Error("search failed");
        const payload = await res.json();
        const matches = (payload.courses || []).map((c) => ({ type: "course", code: c.code, title: c.title }));
        courseListCacheRef.current.set(cacheKey, matches);
        setCodeSuggestLoading(false);
        setCodeSuggestions(matches);
        setCodeSuggestOpen(matches.length > 0);
      } catch (error) {
        if (error.name === "AbortError") return;
        if (error instanceof TypeError) { markLiveDown(); return; } // couldn't reach the server
        setCodeSuggestLoading(false); setCodeSuggestions([]); setCodeSuggestOpen(false);
      }
    }, 250);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [d.code, d.term, liveDownUntil]);

  // When offline, fill course info from the offline catalog. Only fills empty
  // fields, unless you switch to a different course.
  const lastOfflineCodeRef = useRef("");
  useEffect(() => {
    if (liveDownUntil <= Date.now()) return undefined;
    const parsed = String(d.code || "").trim().match(/^([A-Za-z]{2,5})\s*-?\s*(\d{3,4}[A-Za-z]?)$/);
    if (!parsed) return undefined;
    const subject = parsed[1].toUpperCase();
    const key = subject + parsed[2].toUpperCase();
    let cancelled = false;
    loadOfflineCatalog().then((catalog) => {
      const course = catalog[key];
      if (cancelled || !course || lastOfflineCodeRef.current === key) return;
      const switching = lastOfflineCodeRef.current !== "";
      lastOfflineCodeRef.current = key;
      setD((p) => ({
        ...p,
        title: (!p.title.trim() || switching) ? (course.courseTitle || "") : p.title,
        description: (!p.description.trim() || switching) ? (course.description || "") : p.description,
        prereq: (!p.prereq.trim() || switching) ? (course.prerequisites || "") : p.prereq,
        credits: (!p.credits.trim() || p.credits === "3" || switching) ? (course.creditHours || "3") : p.credits,
        dept: (!p.dept.trim() || switching) ? (SUBJECT_DEPARTMENTS.get(subject) || p.dept) : p.dept,
      }));
    });
    return () => { cancelled = true; };
  }, [d.code, liveDownUntil]);

  const [sectionSuggestions, setSectionSuggestions] = useState([]);
  const [sectionSuggestOpen, setSectionSuggestOpen] = useState(false);
  const sectionSuggestRef = useRef(null);
  // same idea as the course cache, but for sections
  const sectionListCacheRef = useRef(new Map());

  useDismiss(sectionSuggestOpen, () => setSectionSuggestOpen(false), sectionSuggestRef);

  const sectionCourseRef = useRef(""); // which course the section is for
  const [sectionSuggestLoading, setSectionSuggestLoading] = useState(false);
  const pickSectionSuggestion = (s) => {
    setD((p) => ({ ...p, section: s.section }));
    setSectionSuggestOpen(false);
  };

  // once the course code is complete, show its sections so you don't have to know one
  useEffect(() => {
    const code = String(d.code || "").trim();
    const parsed = code.match(/^([A-Za-z]{2,5})\s*-?\s*(\d{3,4}[A-Za-z]?)$/);
    if (!parsed || liveDownUntil > Date.now()) { setSectionSuggestions([]); setSectionSuggestOpen(false); return undefined; }

    const subject = parsed[1].toUpperCase();
    const courseNumber = parsed[2].toUpperCase();
    // new course = clear the old section and show the new list
    const courseKey = `${subject} ${courseNumber}`;
    const switched = Boolean(sectionCourseRef.current) && sectionCourseRef.current !== courseKey;
    sectionCourseRef.current = courseKey;
    if (switched && String(d.section || "").trim()) setD((p) => ({ ...p, section: "" }));
    const sectionEmpty = switched || !String(d.section || "").trim();
    const cacheKey = `${d.term}|${subject}|${courseNumber}`;
    const cached = sectionListCacheRef.current.get(cacheKey);
    if (cached) {
      setSectionSuggestions(cached);
      if (cached.length && sectionEmpty) setSectionSuggestOpen(true);
      return undefined;
    }

    // clear old sections while the new search runs; open the list now so the spinner shows
    setSectionSuggestions([]);
    setSectionSuggestLoading(true);
    if (sectionEmpty) setSectionSuggestOpen(true);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const url = `/api/banner?action=section-search&term=${encodeURIComponent(d.term)}&subject=${encodeURIComponent(subject)}&courseNumber=${encodeURIComponent(courseNumber)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (liveLookupUnreachable(res)) { markLiveDown(); return; }
        if (!res.ok) throw new Error("search failed");
        const payload = await res.json();
        const sections = payload.sections || [];
        sectionListCacheRef.current.set(cacheKey, sections);
        setSectionSuggestions(sections);
        setSectionSuggestLoading(false);
      } catch (error) {
        if (error.name === "AbortError") return;
        if (error instanceof TypeError) markLiveDown();
        setSectionSuggestions([]);
        setSectionSuggestLoading(false);
        setSectionSuggestOpen(false);
      }
    }, 450);

    return () => { clearTimeout(timer); controller.abort(); setSectionSuggestLoading(false); };
  }, [d.code, d.term, liveDownUntil]);
  const frameRef = useRef(null);
  const previewRef = useRef(null);
  const formRef = useRef(null);
  const lastGradingItemRef = useRef(null);

  // full screen glides: the panel grows to fill the screen while the pages and controls slide to their new spots
  const toggleFullscreen = (on) => {
    const flip = () => setPreviewFullscreen((f) => (on ?? !f));
    if (!document.startViewTransition || reduceMotion()) { flip(); return; }
    document.startViewTransition(() => flushSync(flip));
  };
  useDismiss(previewFullscreen, () => toggleFullscreen(false));

  // Which syllabus heading each editor tab and each repeated section maps to.
  // One entry per tab in TABS, in the same order. null means that tab has no
  // matching section in the preview, so the preview doesn't scroll.
  const SECTION_FOR_TAB = [
    "COURSE INFORMATION",                        // 0 Course
    "COURSE INFORMATION",                        // 1 Instructor
    "WELCOME TO THIS COURSE",                    // 2 Welcome
    "STUDENT LEARNING OUTCOMES",                 // 3 Outcomes
    "REQUIRED MATERIALS",                        // 4 Materials
    null,                                        // 5 Summary
    "ASSESSMENT AND GRADING",                    // 6 Grading
    "COURSE POLICIES",                           // 7 Policies
    "UNIVERSITY POLICIES AND STUDENT SUPPORT",   // 8 University
    "COURSE SCHEDULE",                           // 9 Schedule
    "LABORATORY COMPONENT",                      // 10 Labs
    null,                                        // 11 Export
  ];
  // Maps a repeated text-box key to the syllabus section its preview items live in.
  const SECTION_FOR_BOX = {
    outcomes: "STUDENT LEARNING OUTCOMES",
    customDescriptions: "COURSE INFORMATION",
    extraMaterials: "REQUIRED MATERIALS",
    items: "ASSESSMENT AND GRADING",
    lateAdditional: "COURSE POLICIES",
    customPolicies: "COURSE POLICIES",
    weeks: "COURSE SCHEDULE",
  };

  // The element that actually scrolls the preview: the page itself in normal
  // mode, or its wrapper in fullscreen, where the page is allowed to grow.
  const previewScroller = () => {
    let el = previewRef.current;
    while (el && el !== document.body && el.scrollHeight <= el.clientHeight + 1) {
      el = el.parentElement;
    }
    return el && el !== document.body ? el : null;
  };

  // Scroll the preview to the heading for the section being edited (used when the tab changes).
  const scrollPreviewTo = (sectionName, offsetPixels = 0, behavior = "smooth") => {
    const paper = previewRef.current?.shadowRoot || previewRef.current; // pages are in a shadow root
    if (!sectionName || !paper) return;
    const heading = [...paper.querySelectorAll("h2, h3")]
      .find((h) => h.innerText.trim() === sectionName);
    if (!heading) return;
    const scroller = previewScroller();
    if (!scroller) return;
    const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const spot = previewSpot(heading, scroller);
    if (!spot || spot.visible) return; // already visible
    const rawTop = spot.top - 30 + (Number(offsetPixels) || 0);
    if (Math.abs(rawTop - scroller.scrollTop) <= 8) return;
    const top = rawTop;
    scroller.scrollTo({ top: Math.min(maxScroll, Math.max(0, top)), behavior: behavior === "auto" ? "auto" : "smooth" });
  };

  // The preview follows the form. Each form field and each piece of the preview carry the same
  // data-src key ("welcome", "lab.safety", "outcomes:2" for boxes), so editing a field glides the
  // preview to that exact spot. Nothing rendered yet (an empty field) falls back to the section heading.
  const activeSrc = useRef(null);
  const findInPreview = (key) => {
    const paper = previewRef.current?.shadowRoot;
    if (!paper || !key) return null;
    // every page holds a full copy of the document; previewSpot works out which page really shows it
    const hit = paper.querySelector(`.preview-page[data-page="0"] [data-src~="${key}"]`);
    if (hit) return hit;
    const section = SECTION_FOR_BOX[key.split(":")[0]] || SECTION_FOR_TAB[tab];
    return [...paper.querySelectorAll('.preview-page[data-page="0"] h2')]
      .find((h) => h.textContent.trim().toUpperCase() === section) || null;
  };
  // how far through its text the caret is (0 to 1), so long text keeps the part being typed in view
  const caretShare = (el) => {
    if (!el) return null;
    if (typeof el.selectionEnd === "number" && typeof el.value === "string") {
      return el.value.length ? el.selectionEnd / el.value.length : null;
    }
    const editor = el.closest?.("[contenteditable]");
    const sel = window.getSelection();
    if (!editor || !sel?.rangeCount || !editor.contains(sel.focusNode)) return null;
    const before = document.createRange();
    before.selectNodeContents(editor);
    before.setEnd(sel.focusNode, sel.focusOffset);
    const total = editor.textContent.length;
    return total ? before.toString().length / total : null;
  };
  const revealInPreview = (key, { caret = null, behavior = "smooth" } = {}) => {
    const el = findInPreview(key);
    const scroller = previewScroller();
    // a block can run across pages, so it comes back as one piece per page, in reading order
    const parts = el && scroller ? previewSpots(el, scroller) : [];
    if (!parts.length) return;
    const view = scroller.clientHeight, pad = 40;
    let a = parts[0].top, b = parts[0].bottom;
    const total = parts.reduce((n, p) => n + p.bottom - p.top, 0);
    // a tall block: aim at the caret's line (on whichever page it lands) instead of the block's top
    if (caret != null && (parts.length > 1 || total > view / 2)) {
      let left = caret * total;
      const part = parts.find((p) => (left -= p.bottom - p.top) <= 0) || parts[parts.length - 1];
      const y = part.bottom + Math.min(0, left);
      a = y - 60; b = y + 60;
    }
    const top = scroller.scrollTop;
    if (a >= top + pad && b <= top + view - pad) return; // already in view, don't move
    // land it a quarter of the way down, or at the top if it's taller than the view
    const to = b - a > view - pad * 2 ? a - pad : a - view / 4;
    const max = scroller.scrollHeight - view;
    scroller.scrollTo({ top: Math.max(0, Math.min(max, to)), behavior: reduceMotion() ? "auto" : behavior });
  };
  const scrollPreviewToBox = (key, index, behavior = "smooth") => revealInPreview(`${key}:${index}`, { behavior });

  // Auto-scroll on tab changes: clicking any editor tab moves the preview to
  // that tab's syllabus section. (This does not run for every keystroke.)
  const initialMountRef = useRef(true);
  useEffect(() => {
    if (initialMountRef.current) { initialMountRef.current = false; return; }
    const t = setTimeout(() => scrollPreviewTo(SECTION_FOR_TAB[tab]), 0);
    return () => clearTimeout(t);
  }, [tab]);

  const skipNextFocusScrollRef = useRef(false);
  // which data a form element edits: a box's "key:index", or the nearest data-src
  const srcOf = (target) => {
    const box = target?.closest?.("[data-box-key]");
    if (box && Number.isFinite(parseInt(box.dataset.boxIndex, 10))) return `${box.dataset.boxKey}:${box.dataset.boxIndex}`;
    return target?.closest?.("[data-src]")?.dataset.src || null;
  };
  // focus and clicks both count (switches and day buttons don't take focus when clicked)
  useEffect(() => {
    const form = formRef.current;
    if (!form) return undefined;
    const follow = (event) => {
      if (skipNextFocusScrollRef.current) { skipNextFocusScrollRef.current = false; return; }
      const key = srcOf(event.target);
      if (!key) return;
      activeSrc.current = key;
      requestAnimationFrame(() => revealInPreview(key, { caret: caretShare(document.activeElement) }));
    };
    form.addEventListener("focusin", follow);
    form.addEventListener("pointerdown", follow);
    return () => { form.removeEventListener("focusin", follow); form.removeEventListener("pointerdown", follow); };
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { activeSrc.current = null; }, [tab]);

  const set = (k, v) => {
    setD((p) => ({ ...p, [k]: v }));
  };

  const lookupCourseBySection = async (triggerCode, term, subject, courseNumber, section, signal) => {
    try {
      const res = await fetch("/api/banner?action=details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term, subject, courseNumber, section }),
        signal,
      });

      if (liveLookupUnreachable(res)) { markLiveDown(); setLookupStatus(null); return; }
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Lookup failed");
      }

      const payload = await res.json();
      if (!payload.crn || !payload.title) throw new Error("The portal returned no course details");
      setD((p) => {
        // ignore the result if the course, section, or term changed while it was loading
        const stillCurrent = p.code.trim() === triggerCode && p.section.trim() === section && p.term.trim() === term;
        if (!stillCurrent) return p;
        return {
          ...p,
          crn: payload.crn || p.crn,
          code: payload.code || p.code,
          title: payload.title || p.title,
          section: payload.section || p.section,
          term: payload.term || p.term,
          credits: payload.credits || p.credits,
          modality: payload.modality || p.modality,
          // clear these instead of keeping old values from a different course
          // days go to the day buttons (shared with the Schedule tab), the time to Meeting time;
          // if the meetings have different times, Meeting time gets the full "days, time; days, time"
          meetingTime: payload.time || payload.meeting || "",
          meetDays: Array.isArray(payload.days) ? [...payload.days].sort(byWeek) : p.meetDays,
          location: payload.location || "",
          // use our department list first, Banner's names are shortened and don't match the dropdown
          dept: SUBJECT_DEPARTMENTS.get(subject) || payload.dept || "",
          prereq: payload.prereq || "",
          instructor: payload.instructor || "",
          email: payload.email || "",
          description: payload.description || "",
        };
      });
      setLookupStatus("ok");
    } catch (error) {
      if (error instanceof TypeError) { markLiveDown(); setLookupStatus(null); return; } // couldn't reach the server
      if (error.name !== "AbortError") {
        setLookupStatus("error");
        // lookup failed, so clear the looked-up fields so old data doesn't stick around
        // (department still uses the subject fallback)
        setD((p) => {
          const stillCurrent = p.code.trim() === triggerCode && p.section.trim() === section && p.term.trim() === term;
          if (!stillCurrent) return p;
          return {
            ...p,
            crn: "",
            title: "",
            meetingTime: "",
            location: "",
            dept: SUBJECT_DEPARTMENTS.get(subject) || "",
            prereq: "",
            instructor: "",
            email: "",
            description: "",
          };
        });
      }
    }
  };

  useEffect(() => {
    const code = String(d.code || "").trim();
    const section = String(d.section || "").trim();
    const term = String(d.term || "").trim();
    const parsed = code.match(/^([A-Za-z]{2,5})\s*-?\s*(\d{3,4}[A-Za-z]?)$/);
    if (!parsed || !section || !term || liveDownUntil > Date.now()) { setLookupStatus(null); return undefined; }

    const controller = new AbortController();
    setLookupStatus("loading");
    const timer = setTimeout(() => {
      lookupCourseBySection(code, term, parsed[1].toUpperCase(), parsed[2].toUpperCase(), section, controller.signal);
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [d.code, d.section, d.term, liveDownUntil]);

  // fills in the email subject line from the course code until you type in it yourself
  const subjectLineAutoRef = useRef(true);
  useEffect(() => {
    const code = String(d.code || "").trim();
    if (!subjectLineAutoRef.current || !/^[A-Za-z]{2,5}\s*-?\s*\d{3,4}[A-Za-z]?$/.test(code)) return;
    setD((p) => ({ ...p, subjectLine: `${code} - [your question]` }));
  }, [d.code]);
  // Update one property inside a repeated array item, such as an assignment or week.
  const setDeep = (k, i, key, v) => {
    setD((p) => { const a = [...p[k]]; a[i] = { ...a[i], [key]: v }; return { ...p, [k]: a }; });
  };
  // adds an item to a repeated section: the new box grows in and the form glides to show it
  // focus uses preventScroll so the browser doesn't jump before our own scroll
  const push = (k, obj) => {
    const newItemIndex = Array.isArray(d[k]) ? d[k].length : 0;
    // render now and start growing before the first paint, or it shows at full size for a frame first
    flushSync(() => setD((p) => ({ ...p, [k]: [...(p[k] || []), obj] })));
    const added = [...(formRef.current?.querySelectorAll(`[data-box-key="${k}"]`) || [])].at(-1);
    const grow = added && foldIn(added);
    activeSrc.current = `${k}:${newItemIndex}`; // typing in the new box keeps the preview following it
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
      const container = formRef.current;
      if (!container) return;
      const boxes = [...container.querySelectorAll(`[data-box-key="${k}"]`)];
      const last = boxes[boxes.length - 1];
      if (!last) return;
      // the new box grows open, then the form glides just far enough to show it (no jump)
      const reduce = reduceMotion();
      const reveal = () => last.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      if (grow) grow.finished.then(reveal, () => {}); else reveal();
      // an empty box isn't in the preview yet, so this lands on its section (custom descriptions have none)
      if (k !== "customDescriptions") scrollPreviewToBox(k, newItemIndex, reduce ? "auto" : "smooth");
      const field = last.querySelector("input, textarea, select, [contenteditable]");
      if (field) {
        skipNextFocusScrollRef.current = true;
        field.focus({ preventScroll: true });
      }
      });
    });
  };
  const applySummerPreset = (key) => setD((p) => ({
    ...p,
    scheduleType: key,
    weeks: buildSummerScheduleRows(key),
  }));
  const addGradingItem = () => {
    push("items", { name: "", weight: "", points: "", due: "", desc: "", slos: [] });
  };
  const entryHasContent = (entry) => typeof entry === "string"
    ? entry.trim().length > 0
    : Object.values(entry).some((value) => Array.isArray(value) ? value.length > 0 : String(value ?? "").trim().length > 0);

  // Remove entry i from section k. Deleting an outcome also reindexes the
  // assignment links that pointed at it, so no link is left dangling.
  const applyDrop = (k, i) => setD((p) => {
    const next = { ...p, [k]: p[k].filter((_, j) => j !== i) };
    if (k === "outcomes" && p.outcomes[i].trim()) {
      const gone = p.outcomes.slice(0, i).filter((o) => o.trim()).length;
      next.items = p.items.map((x) => ({
        ...x,
        slos: x.slos.filter((z) => z !== gone).map((z) => (z > gone ? z - 1 : z)),
      }));
    }
    return next;
  });

  // the box fades and folds shut so the ones below slide up, then it's really removed
  const fadeOutDrop = (k, i) => {
    const box = formRef.current?.querySelector(`[data-box-key="${k}"][data-box-index="${i}"]`);
    if (box?.dataset.leaving) return;
    const anim = foldOut(box);
    if (!anim) { applyDrop(k, i); return; }
    box.dataset.leaving = "1";
    box.style.pointerEvents = "none";
    anim.onfinish = () => {
      // boxes are keyed by index, so this node gets reused by the next item: reset it in the same commit
      flushSync(() => applyDrop(k, i));
      anim.cancel();
      delete box.dataset.leaving;
      box.style.pointerEvents = "";
    };
  };

  const drop = (k, i) => {
    if (entryHasContent(d[k][i])) {
      setPendingDelete({ k, i });
      return;
    }
    fadeOutDrop(k, i);
  };

  const confirmDrop = () => {
    if (!pendingDelete) return;
    const { k, i } = pendingDelete;
    setPendingDelete(null);
    fadeOutDrop(k, i);
  };

  const setLab = (k, v) => setD((p) => ({ ...p, lab: { ...p.lab, [k]: v } }));
  const toggleLabDay = (n) => setD((p) => ({
    ...p,
    lab: {
      ...p.lab,
      meetDays: (p.lab.meetDays || []).includes(n)
        ? p.lab.meetDays.filter((x) => x !== n)
        : [...(p.lab.meetDays || []), n].sort(byWeek),
    },
  }));

  function calculateWeightTotal(items) {
    const total = items.reduce((sum, item) => sum + parseWeight(item.weight), 0);
    return Math.round(total * 100) / 100;
  }

  function calculatePointsTotal(items) {
    const total = items
      .filter((item) => item.name.trim())
      .reduce((sum, item) => sum + parseWeight(item.points), 0);

    return Math.round(total * 100) / 100;
  }

  const autofillScheduleDates = () => {
    const dates = buildWeekDates(d.semesterStart, Math.max(15, d.weeks.length));
    if (!dates.length) return;
    setD((p) => ({
      ...p,
      weeks: p.weeks.map((w, i) => ({
        ...w,
        label: w.label || `Week ${i + 1}`,
        dates: dates[i] || w.dates,
      })),
    }));
    setTimeout(() => scrollPreviewTo("COURSE SCHEDULE"), 0);
  };

  const buildSemesterSchedule = () => {
    const dates = buildWeekDates(d.semesterStart, 15);
    if (!dates.length) return;
    setD((p) => ({
      ...p,
      weeks: Array.from({ length: 15 }, (_, i) => ({
        ...(p.weeks[i] || {}),
        label: p.weeks[i]?.label || `Week ${i + 1}`,
        dates: dates[i],
        topics: p.weeks[i]?.topics || "",
        due: p.weeks[i]?.due || "",
      })),
    }));
    setTimeout(() => scrollPreviewTo("COURSE SCHEDULE"), 0);
  };

  const weightTotal = useMemo(
    () => calculateWeightTotal(d.items), [d.items]);

  const pointsTotal = useMemo(
    () => calculatePointsTotal(d.items), [d.items]);

  const validPoints = d.items.some((item) => item.name.trim()) &&
    d.items.every((item) =>
      (!item.name.trim() && !item.points.trim()) ||
      (item.name.trim() &&
        item.points.trim() !== "" &&
        Number.isFinite(Number(item.points)) &&
        Number(item.points) > 0)
    );

  const realOutcomes = d.outcomes.filter((o) => o.trim());
  // When a section goes from empty to having content, nudge the preview to
  // that section's heading so the new content comes into view.
  const prevRealOutcomesRef = useRef(realOutcomes.length);
  useEffect(() => {
    if (realOutcomes.length > prevRealOutcomesRef.current) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPreviewToBox("outcomes", Math.max(0, d.outcomes.length - 1), "smooth");
        });
      });
      void t;
    }
    prevRealOutcomesRef.current = realOutcomes.length;
  }, [realOutcomes.length]);

  const countedItems = d.items.filter((x) => x.name).length;
  const prevItemsRef = useRef(countedItems);
  useEffect(() => {
    if (countedItems > prevItemsRef.current) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPreviewToBox("items", Math.max(0, d.items.length - 1), "smooth");
        });
      });
      void t;
    }
    prevItemsRef.current = countedItems;
  }, [countedItems]);

  const prevWelcomeRef = useRef(Boolean(d.welcome && d.welcome.trim()));
  useEffect(() => {
    const now = Boolean(d.welcome && d.welcome.trim());
    if (now && !prevWelcomeRef.current) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPreviewTo("WELCOME TO THIS COURSE", 0, "auto");
        });
      });
      void t;
    }
    prevWelcomeRef.current = now;
  }, [d.welcome]);

  const countedCustomDescriptions = d.customDescriptions.filter((item) => (item.title || "").trim() || (item.description || "").trim()).length;
  const prevCustomDescriptionsRef = useRef(countedCustomDescriptions);
  useEffect(() => {
    if (countedCustomDescriptions > prevCustomDescriptionsRef.current) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPreviewToBox("customDescriptions", Math.max(0, d.customDescriptions.length - 1), "smooth");
        });
      });
      void t;
    }
    prevCustomDescriptionsRef.current = countedCustomDescriptions;
  }, [countedCustomDescriptions]);
  const mappedSlos = new Set(d.items.flatMap((x) => x.slos));
  const unmapped = realOutcomes.map((_, i) => i).filter((i) => !mappedSlos.has(i));

  const aiText = d.aiTier === "custom" ? d.aiCustom : AI_POLICIES[d.aiTier].text;
  const lateText = [d.late, ...d.lateAdditional.map((policy) => policy.text)]
    .filter((text) => text.trim()).join("\n\n");

  // With meeting days picked, week rows and their dates come from the registrar
  // calendar; topics and due dates still come from d.weeks by position.
  const cal = ACADEMIC_CALENDARS[d.term];
  // "Summer 2027 (Part of Term 1)" is listed on utm.edu as "Summer 2027"
  const regTerm = String(d.term || "").replace(/\s*\(.*\)$/, "");
  const liveDates = registrar.terms[d.term] || registrar.terms[regTerm];
  const savedDates = SAVED_REGISTRAR_DATES[d.term];
  const regDates = liveDates || savedDates || null;
  // live: from utm.edu; saved: our copy because utm.edu failed or doesn't list it; none: nothing to add
  const regSource = liveDates ? "live" : savedDates && registrar.status !== "loading" ? "saved" : savedDates ? "loading" : "none";
  // the schedule's week dates come from ACADEMIC_CALENDARS, so check its first day against utm.edu's
  const MONTH_NUM = Object.fromEntries(MONTHS.map((m, i) => [m, i + 1]));
  const liveStart = liveDates?.find(([, what]) => /classes begin|first day of classes/i.test(what))?.[0].match(/([A-Z][a-z]+)\.?\s+(\d{1,2})/);
  const startMismatch = Boolean(cal && liveStart && MONTH_NUM[liveStart[1]]
    && (MONTH_NUM[liveStart[1]] !== Number(cal.start.slice(5, 7)) || Number(liveStart[2]) !== Number(cal.start.slice(8, 10))));
  const regWarning = registrar.status === "failed"
    ? `Couldn't reach the registrar's calendar on utm.edu${savedDates ? ", so these are saved dates and may be out of date." : ", so no dates were added."}`
    : registrar.status === "ok" && !liveDates
      ? `${d.term} isn't on utm.edu's academic calendar${savedDates ? ", so these are saved dates and may be out of date." : ", so no dates were added."}`
      : startMismatch
        ? `utm.edu says classes begin ${liveStart[0]}, but the schedule's week dates start ${MONTHS[Number(cal.start.slice(5, 7)) - 1]} ${Number(cal.start.slice(8, 10))}. Check the week dates.`
        : "";
  const autoWeeks = useMemo(() => buildWeeks(cal, d.meetDays), [cal, d.meetDays]);
  // Modular schedules are hand-built, so the registrar calendar drives weekly ones only.
  const auto = d.scheduleType !== "modular" && !String(d.scheduleType).startsWith("summer") && autoWeeks.length > 0;
  const schedRows = auto
    ? autoWeeks.map((w, i) => ({ ...w, topics: d.weeks[i]?.topics || "", due: d.weeks[i]?.due || "" }))
    : d.weeks.map((w) => ({ ...w, off: [] }));
  const setWeek = (i, key, v) => setD((p) => {
    const a = [...p.weeks];
    while (a.length <= i) a.push({ label: `Week ${a.length + 1}`, dates: "", topics: "", due: "" });
    a[i] = { ...a[i], [key]: v };
    return { ...p, weeks: a };
  });

  const countedMaterials = d.extraMaterials.filter((m) => (m.title || "").trim() || (m.description || "").trim()).length;
  const prevMaterialsRef = useRef(countedMaterials);
  useEffect(() => {
    if (countedMaterials > prevMaterialsRef.current) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPreviewToBox("extraMaterials", Math.max(0, d.extraMaterials.length - 1), "smooth");
        });
      });
      void t;
    }
    prevMaterialsRef.current = countedMaterials;
  }, [countedMaterials]);

  const countedWeeks = schedRows.filter((w) => (w.label || "").trim() || (w.topics || "").trim() || (w.dates || "").trim()).length;
  const prevWeeksRef = useRef(countedWeeks);
  useEffect(() => {
    if (countedWeeks > prevWeeksRef.current) {
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollPreviewToBox("weeks", Math.max(0, d.weeks.length - 1), "smooth");
        });
      });
      void t;
    }
    prevWeeksRef.current = countedWeeks;
  }, [countedWeeks]);
  const toggleDay = (n) => set("meetDays",
    d.meetDays.includes(n) ? d.meetDays.filter((x) => x !== n) : [...d.meetDays, n].sort(byWeek));

  // Determine whether this is a weekly or modular schedule.
  const isWeeklySchedule = d.scheduleType !== "modular";

  // Use the Build Weeks input for manual schedules.
  // Automatically generated schedules use their actual calendar row count.
  const expectedWeekCount = schedRows.length;

  // Find weeks with missing topics. Modular schedules skip this validation.
  const missingWeeks = isWeeklySchedule
    ? schedRows
        .map((w, i) => ({ w, n: i + 1 }))
        .filter(({ w, n }) =>
          n <= expectedWeekCount && !w.topics?.trim()
        )
        .map(({ n }) => n)
    : [];

    
  // Convert consecutive missing week numbers into readable ranges.
  const formatWeekRanges = (weeks) => {
    if (weeks.length === 0) return "";

    const ranges = [];
    let start = weeks[0];
    let end = weeks[0];

    for (let i = 1; i < weeks.length; i++) {
      if (weeks[i] === end + 1) {
        end = weeks[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = end = weeks[i];
      }
    }

    ranges.push(start === end ? `${start}` : `${start}-${end}`);

    return ranges.join(", ");
  };


  // Weekly schedules are complete when the expected number of weeks
  // exists and all expected weeks have topics.
  const weeklyScheduleReady = !isWeeklySchedule ||
    (
      Number.isInteger(expectedWeekCount) &&
      expectedWeekCount > 0 &&
      schedRows.length >= expectedWeekCount &&
      missingWeeks.length === 0
    );

  const weeklyScheduleLabel = !isWeeklySchedule
    ? "Modular schedule (weekly validation skipped)"
    : weeklyScheduleReady
      ? `All ${expectedWeekCount} weeks are filled in`
      : schedRows.length < expectedWeekCount
        ? `Schedule has ${schedRows.length} of ${expectedWeekCount} weeks`
        : `Week${missingWeeks.length > 1 ? "s" : ""} ${formatWeekRanges(missingWeeks)} missing topics`;

  // days from the day buttons, unless Meeting time already names them
  const meetingTimeText = String(d.meetingTime || "").trim();
  const meetingDays = /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(meetingTimeText)
    ? "" : [...d.meetDays].sort(byWeek).map((day) => DAY_NAMES[day]).join(", ");
  const meetingDisplay = [meetingDays, meetingTimeText].filter(Boolean).join(", ");
  const labMeetingDays = [...(d.lab.meetDays || [])].sort(byWeek).map((day) => DAY_NAMES[day]).join(", ");
  const labMeetingDisplay = [labMeetingDays, String(d.lab.meeting || "").trim()]
    .filter(Boolean)
    .join(", ") || String(d.lab.meeting || "").trim();

  /* ---------- readiness: report whether required syllabus content is complete ---------- */
  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  const checks = [
    ["Course code, title, term, and credit hours", [d.code, d.title, d.term, d.credits].every(hasText), "Course"],
    ["Meeting time and modality stated", hasText(d.modality) && (d.modality.startsWith("Online") || hasText(meetingDisplay)), "Course"],
    ["Instructor name and email", hasText(d.instructor) && hasText(d.email), "Instructor"],
    ["Office hours and how to reach you", hasText(d.hours), "Instructor"],
    ["Course description", hasText(d.description), "Welcome"],
    ["Why this course matters, in your voice", hasText(d.welcome), "Welcome"],
    ["At least three learning outcomes", realOutcomes.length >= 3, "Outcomes"],
    ["Every outcome is graded by an assessment", realOutcomes.length > 0 && unmapped.length === 0, "Outcomes"],
    ["Required materials listed", hasText(d.texts) || d.materials.provided || d.materials.hardcopy || d.materials.online || hasText(d.materials.acquire), "Materials"],
    [
      d.gradingMethod === "percentage"
        ? "Assessment weights total 100 percent"
        : "All assignments have valid point values",
      d.gradingMethod === "percentage"
        ? Math.abs(weightTotal - 100) < 0.01
        : validPoints,
      "Grading",
    ],
    ["Grading scale", hasText(d.scale), "Grading"],
    ["Attendance policy", hasText(d.attendance), "Policies"],
    ["Late work and make-up policy", hasText(lateText), "Policies"],
    ["AI policy (required by UTM policy)", hasText(aiText), "Policies"],
    ["Accessibility statement included", d.inc.accessibility, "University"],
    ["Academic integrity included", d.inc.integrity, "University"],
    ["Crisis resources included", d.inc.crisis, "University"],
    ["Schedule has at least one entry", auto || d.weeks.some((w) => hasText(w.topics) || hasText(w.dates)), "Schedule"],
    ...(d.calNote ? [["Registrar dates confirmed on utm.edu", regSource === "live" && !startMismatch, "Schedule"]] : []),
    ...(isWeeklySchedule ? [
      [
        missingWeeks.length === 0
          ? "Every week in the schedule has topics"
          : `Topics missing for week${missingWeeks.length > 1 ? "s" : ""} ${missingWeeks.join(", ")}`,
        missingWeeks.length === 0,
        "Schedule",
      ],
      [weeklyScheduleLabel, weeklyScheduleReady, "Schedule"]
    ] : []),
    ...(d.hasLab ? [
      ["Lab meeting time and location", hasText(d.lab.meeting) && hasText(d.lab.location), "Labs"],
      ["How the lab counts toward the course grade", hasText(d.lab.gradeNote), "Labs"],
      ["Lab safety expectations stated", hasText(d.lab.safety), "Labs"],
    ] : []),
  ];
  const passed = checks.filter((c) => c[1]).length;
  const doneTabs = new Set(
    [...new Set(checks.map((c) => c[2]))].filter((t) => checks.filter((c) => c[2] === t).every((c) => c[1]))
  );

  /* ---------- accessibility: Panorama-style checks on the professor's own writing ---------- */

  // Every free-text box the professor writes in, tagged with the tab and label where it
  // lives, so each problem can say exactly where to fix it. inList marks text that the
  // document already puts inside a real numbered list (the learning outcomes).
  const a11yFields = useMemo(() => {
    const f = (tab, label, text, inList = false) =>
      ({ tab, label, text: typeof text === "string" ? richToPlain(text) : "", inList });
    const titled = (base, i, title) => `${base} ${i + 1}${title?.trim() ? ` (${title.trim()})` : ""}`;
    return [
      f("Instructor", "Office hours", d.hours),
      f("Welcome", "Why this course matters", d.welcome),
      f("Welcome", "Course description", d.description),
      ...d.customDescriptions.map((x, i) => f("Welcome", titled("Custom description", i, x.title), x.description)),
      ...d.outcomes.map((o, i) => f("Outcomes", `Outcome ${i + 1}`, o, true)),
      f("Materials", "Required texts", d.texts),
      f("Materials", "Cost note", d.costNote),
      f("Materials", "Technology and platforms", d.tech),
      f("Materials", "Access details", d.materials.acquire),
      ...d.extraMaterials.map((x, i) => f("Materials", titled("Material section", i, x.title), x.description)),
      ...d.items.map((x, i) => f("Grading", `${x.name?.trim() || `Assignment ${i + 1}`} description`, x.desc)),
      f("Grading", "Grading scale", d.scale),
      f("Policies", "Attendance", d.attendance),
      f("Policies", "What engagement looks like here", d.participation),
      f("Policies", "Late work and make-up", d.late),
      ...d.lateAdditional.map((x, i) => f("Policies", `Additional late policy ${i + 1}`, x.text)),
      ...(d.aiTier === "custom" ? [f("Policies", "Custom AI policy", d.aiCustom)] : []),
      f("Policies", "A note from your professor", d.profNote),
      ...d.customPolicies.map((x, i) => f("Policies", titled("Custom policy", i, x.title), x.text)),
      ...d.weeks.flatMap((w, i) => [
        f("Schedule", `Week ${i + 1} topics`, w.topics),
        f("Schedule", `Week ${i + 1} due`, w.due),
      ]),
      ...(d.hasLab ? [
        f("Labs", "What happens in lab", d.lab.description),
        f("Labs", "How the lab counts toward the course grade", d.lab.gradeNote),
        f("Labs", "Lab attendance", d.lab.attendance),
        f("Labs", "Lab safety", d.lab.safety),
        f("Labs", "Supplies and protective equipment", d.lab.supplies),
        f("Labs", "Missed labs and make-up", d.lab.makeup),
      ] : []),
    ].filter((x) => x.text.trim());
  }, [d]);

  // Shortens a line of the professor's text for display in a result.
  const excerpt = (s, n = 50) => {
    const t = s.trim().replace(/\s+/g, " ");
    return t.length > n ? `${t.slice(0, n)}…` : t;
  };

  // A line that starts like a typed bullet or number: "- ", "-Item", "* ", "• ", "1. ", "1.Item",
  // "2) ", "a) " … A symbol or number counts with or without a space as long as a letter follows,
  // so "-5 points" and "1.5 hours" are not mistaken for bullets.
  const FAKE_BULLET = /^\s*(?:[-*•–—→▪◦·](?:\s+|(?=[a-z]))|\d{1,2}[.)](?:\s+|(?=[a-z]))|[a-z]\)\s+)/i;

  // Wording that only makes sense for a clickable link. The export has no links, so in print
  // and in a screen reader these phrases point at nothing.
  const VAGUE_LINK = /\b(click here|click the link|click this link|tap here|follow this link|this link|the link below|link below)\b/i;
  // Four or more of the same symbol in a row, used as a divider: ----, ****, ====, ____
  const DECORATIVE_RUN = /([-*=_~#+])\1{3,}/;
  // Web addresses: https://…, www.…, or a bare domain such as utm.edu/calendar
  const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:edu|com|org|gov|net|io)(?:\/\S*)?/gi;
  // A tab, or three or more spaces, between two pieces of text: columns lined up by hand.
  const FAKE_COLUMNS = /\S(?:\t+| {3,})\S/;

  // Each check: id, title, level ("fail" or "warn"), why it matters, how to fix,
  // and found = the places where the problem appears (empty means it passes).
  // A found item has tab, label, and either a quote of the text or a note.
  const a11yChecks = useMemo(() => {
    const at = (x, extra) => ({ tab: x.tab, label: x.label, ...extra });
    const lines = (x) => x.text.split("\n");
    const paragraphs = (x) => x.text.split(/\n{2,}/).filter((p) => p.trim());

    const fakeLists = a11yFields.flatMap((x) => {
      const hits = lines(x).filter((l) => FAKE_BULLET.test(l));
      // Two typed bullets make a list. Inside an outcome, even one is a doubled number.
      return hits.length >= (x.inList ? 1 : 2) ? [at(x, { quote: excerpt(hits[0]) })] : [];
    });

    const vagueLinks = a11yFields.flatMap((x) => {
      const line = lines(x).find((l) => VAGUE_LINK.test(l));
      return line ? [at(x, { quote: excerpt(line) })] : [];
    });

    const decorative = a11yFields.flatMap((x) => {
      const line = lines(x).find((l) => DECORATIVE_RUN.test(l));
      return line ? [at(x, { quote: excerpt(line) })] : [];
    });

    // Custom items whose title and text don't match up. In the document a title becomes a
    // heading; text without a title lands under whatever heading came before it.
    const headingProblems = [];
    const pairUp = (list, tab, base, textKey) => list.forEach((item, i) => {
      const title = item.title.trim(); const text = richToPlain(item[textKey] || "").trim();
      const label = `${base} ${i + 1}${title ? ` (${title})` : ""}`;
      if (title && !text) headingProblems.push({ tab, label, note: "has a title but no text, so it prints as an empty heading" });
      if (!title && text) headingProblems.push({ tab, label, note: "has text but no title, so it prints under the previous heading" });
    });
    d.customDescriptions.forEach((item, i) => {
      if (item.title.trim() && !richToPlain(item.description).trim()) headingProblems.push({
        tab: "Welcome", label: `Custom description ${i + 1} (${item.title.trim()})`,
        note: "has a title but no text, so it prints as an empty heading",
      });
    });
    pairUp(d.extraMaterials, "Materials", "Material section", "description");
    pairUp(d.customPolicies, "Policies", "Custom policy", "text");
    if (d.hasLab && ![d.lab.crn, d.lab.meeting, d.lab.location, d.lab.instructor, d.lab.description,
      d.lab.gradeNote, d.lab.attendance, d.lab.safety, d.lab.supplies, d.lab.makeup].some((v) => richToPlain(v).trim())) {
      headingProblems.push({ tab: "Labs", label: "Laboratory component",
        note: "is turned on but empty, so it prints as a heading with nothing under it" });
    }

    const allCaps = a11yFields.flatMap((x) => {
      const line = lines(x).find((l) => {
        const letters = l.match(/[a-z]/gi) || [];
        const upper = l.match(/[A-Z]/g) || [];
        return l.trim().split(/\s+/).length >= 3 && letters.length >= 12 && upper.length / letters.length >= 0.8;
      });
      return line ? [at(x, { quote: excerpt(line) })] : [];
    });

    const longParagraphs = a11yFields.flatMap((x) => paragraphs(x).flatMap((p) => {
      const words = p.trim().split(/\s+/).length;
      return words > 150 ? [at(x, { quote: excerpt(p), note: `${words} words` })] : [];
    }));

    const bareUrls = a11yFields.flatMap((x) => lines(x).flatMap((l) => {
      const withoutEmails = l.replace(/\S+@\S+/g, " ");
      return [...withoutEmails.matchAll(URL_RE)].flatMap(([url]) => {
        // An address is fine when it's short and the sentence around it names the page.
        const wordsAround = withoutEmails.replace(url, " ").trim().split(/\s+/).filter(Boolean).length;
        return url.length > 40 || wordsAround < 3 ? [at(x, { quote: excerpt(url, 60) })] : [];
      });
    }));

    const fakeTables = a11yFields.flatMap((x) => {
      const hits = lines(x).filter((l) => FAKE_COLUMNS.test(l));
      return hits.length >= 2 ? [at(x, { quote: excerpt(hits[0]) })] : [];
    });

    return [
      {
        id: "fake-lists",
        title: "Lists typed with dashes, bullets, or numbers",
        level: "fail",
        why: "The syllabus prints these lines as plain text, so a screen reader reads \"dash\" or \"one period\" instead of announcing a list.",
        fix: "Write the items as a sentence or as short separate paragraphs (leave a blank line between them). In an outcome, delete the number; the syllabus numbers outcomes for you.",
        found: fakeLists,
      },
      {
        id: "vague-links",
        title: "\"Click here\" or \"this link\" wording",
        level: "fail",
        why: "The syllabus has no clickable links, so \"click here\" points at nothing in print, and screen reader users can't tell where it leads.",
        fix: "Say what the page is and give its short address, for example: \"See the UTM Academic Calendar at utm.edu/calendar.\"",
        found: vagueLinks,
      },
      {
        id: "decorative",
        title: "Divider lines made of symbols",
        level: "fail",
        why: "A screen reader reads every character: \"dash dash dash dash…\".",
        fix: "Delete the divider line. Use a blank line to separate paragraphs, or a custom section with its own title.",
        found: decorative,
      },
      {
        id: "headings",
        title: "Empty headings or text without a heading",
        level: "fail",
        why: "Screen reader users jump between headings to find things. An empty heading leads nowhere, and text without a title gets announced as part of the wrong section.",
        fix: "Give every custom section both a title and some text, or remove the one you don't need.",
        found: headingProblems,
      },
      {
        id: "all-caps",
        title: "Text in ALL CAPITALS",
        level: "warn",
        why: "All caps is harder to read, comes across as shouting, and some screen readers spell it out letter by letter.",
        fix: "Use normal sentence case. To stress something, say so in words (\"Important:\") instead.",
        found: allCaps,
      },
      {
        id: "long-paragraphs",
        title: "Very long paragraphs",
        level: "warn",
        why: "Paragraphs over about 150 words are hard to follow, especially for students using screen readers, magnifiers, or reading in a second language.",
        fix: "Break it into two or three shorter paragraphs by leaving a blank line between them.",
        found: longParagraphs,
      },
      {
        id: "bare-urls",
        title: "Long or unexplained web addresses",
        level: "warn",
        why: "Screen readers read web addresses character by character, and a long address on its own doesn't tell students what the page is.",
        fix: "Name the page in your sentence and use the shortest address that works, for example: \"the Writing Center (utm.edu/writing)\".",
        found: bareUrls,
      },
      {
        id: "fake-tables",
        title: "Columns lined up with tabs or spaces",
        level: "warn",
        why: "The syllabus collapses the extra spacing, so the columns fall apart, and screen readers have no table structure to follow.",
        fix: "Put dates and assignments in the Grading or Schedule tables, or write each row as its own sentence.",
        found: fakeTables,
      },
    ];
  }, [a11yFields, d]);

  const a11yFailCount = a11yChecks.filter((c) => c.found.length && c.level === "fail").length;
  const a11yWarnCount = a11yChecks.filter((c) => c.found.length && c.level === "warn").length;
  // One line, shared by the Accessibility tab and the Export tab summary.
  const a11ySummary = a11yFailCount + a11yWarnCount === 0
    ? "No accessibility issues found."
    : [
        a11yFailCount && `${a11yFailCount} accessibility issue${a11yFailCount > 1 ? "s" : ""}`,
        a11yWarnCount && `${a11yWarnCount} warning${a11yWarnCount > 1 ? "s" : ""}`,
      ].filter(Boolean).join(" and ") + " found.";

  /* ---------- document builder: create the HTML shared by preview and exports ---------- */

  const esc = (s = "") => normalizeRichHtml(s);
  const para = (s = "") => formatRichText(s).split(/\n{2,}/).map((p) =>
    `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");

  const docBody = useMemo(() => {
    const h = [];
    const sec = (t) => h.push(`<h2>${esc(t)}</h2>`);
    // data-src names the form field(s) each piece came from, so the preview can follow what's being edited
    // (space-separated; boxes are "key:index"). Exports strip it.
    const tag = (src, html) => `<div data-src="${src}">${html}</div>`;

    h.push(`<table class="hdr" role="presentation"><tr>
      <td class="hdr-l"><img src="${LOGO}" alt="The University of Tennessee at Martin" width="230"/></td>
      <td class="hdr-r"><div class="ct" data-src="code">${esc(d.code || "COURSE 000")}</div>
      <h1 class="tt" data-src="title">${esc(d.title || "Course Title")}</h1>
      <div class="st" data-src="term modality dept">${esc(d.term)}${d.modality ? " &nbsp;|&nbsp; " + esc(d.modality) : ""}${d.dept && d.dept !== "Select a department..." ? " &nbsp;|&nbsp; " + esc(d.dept) : ""}</div></td></tr></table>`);

    // Course facts
    const facts = [
      ["Course", `${d.code} ${d.title}`.trim(), "code title"],
      ["CRN", d.crn, "crn"],
      ["Section", d.section, "section"],
      ["Term", d.term, "term"],
      ["Delivery", d.modality, "modality"],
      ["Semester Length", d.semester, "semester"],
      ["Credit hours", d.credits, "credits"],
      ["Meeting time", meetingDisplay, "meetDays meetingTime"],
      ["Location", d.location, "location"],
      ["Extra Location", d.exlocation, "exlocation"],
      ["Prerequisites", d.prereq, "prereq"],
      ["Instructor", d.instructor, "instructor"],
      ["Email", d.email, "email"],
      ["Phone", d.phone, "phone"],
      ["Office", d.office, "office"],
      ["Office hours", d.hours, "hours"],
    ].filter((r) => r[1] && String(r[1]).trim());
    if (facts.length) {
      sec("Course Information");
      h.push(`<table class="grid">${facts.map((r) =>
        `<tr data-src="${r[2]}"><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join("")}</table>`);
    }

    if (d.welcome) { sec("Welcome to This Course"); h.push(tag("welcome", para(d.welcome))); }
    if (d.description) { sec("Course Description"); h.push(tag("description", para(d.description))); }
    d.customDescriptions.forEach((item, i) => {
      if (item.title.trim() || item.description.trim()) {
        h.push(tag(`customDescriptions:${i}`, `<h2>${esc(item.title.trim() || "Custom Course Description")}</h2>${
          item.description.trim() ? para(item.description) : ""}`));
      }
    });

    if (realOutcomes.length || d.showPrimer) {
      sec("Student Learning Outcomes");
      if (d.showPrimer) h.push(`<div class="primer" data-src="showPrimer"><div class="primer-h">For the instructor: what an SLO is and why it is here</div>${para(SLO_PRIMER)}</div>`);
      if (realOutcomes.length) {
        h.push(`<p>By the end of this course, you should be able to:</p><ol>${
          d.outcomes.map((o, i) => o.trim()
            ? `<li data-src="outcomes:${i}">${esc(o)}</li>`
            : "").join("")}</ol>`);
      }
    }

    const m = d.materials;
    const hasAccess = m.provided || m.hardcopy || m.online || m.acquire;
    const customMaterials = d.extraMaterials.filter(
      (material) => material.title.trim() || material.description.trim()
    );
    if (d.texts || d.costNote || d.tech || hasAccess || customMaterials.length) {
      sec("Required Materials");
      if (d.texts) h.push(tag("texts", para(d.texts)));
      if (d.costNote) h.push(`<p class="soft" data-src="costNote">${esc(d.costNote)}</p>`);
      if (hasAccess) {
        const lines = [];
        if (m.provided) lines.push("These materials will be provided to you at no additional cost.");
        const fmt = m.hardcopy && m.online ? "both hardcopy and online"
          : m.hardcopy ? "hardcopy" : m.online ? "online" : "";
        if (fmt) lines.push(`Format: available in ${fmt}.`);
        if (m.acquire) lines.push(`Where to acquire: ${m.acquire}`);
        h.push(`<ul data-src="materials">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`);
      }
      if (d.tech) h.push(tag("tech", `<h3>Technology you will need</h3>${para(d.tech)}`));
      d.extraMaterials.forEach((material, i) => {
        if (!material.title.trim() && !material.description.trim()) return;
        h.push(tag(`extraMaterials:${i}`, `${material.title ? `<h3>${esc(material.title)}</h3>` : ""}${
          material.description ? para(material.description) : ""}`));
      });
    }

    const live = d.items.filter((x) => x.name);
    const isPoints = d.gradingMethod === "points";
    if (live.length) {
      const hasDueDates = live.some((x) => x.due?.trim());
      sec("Assessment and Grading");
      h.push(`<table class="grid"><tr><th scope="col">Assignment or category</th><th scope="col" class="w">${isPoints ? "Points" : "Weight"}</th>${hasDueDates ? '<th scope="col" class="assignment-due">Due date</th>' : ""}<th scope="col">What it is</th></tr>${live.map((x) => `<tr data-src="items:${d.items.indexOf(x)}"><td><strong>${esc(x.name)}</strong>${x.slos.length ? `<div class="tag">Outcome${x.slos.length > 1 ? "s" : ""} ${x.slos.map((i) => i + 1).join(", ")}</div>` : ""
        }</td><td class="w">${isPoints
          ? fmtWeight(parseWeight(x.points))
          : `${fmtWeight(parseWeight(x.weight))}%`}</td>${hasDueDates ? `<td class="assignment-due">${esc(x.due || "")}</td>` : ""}<td>${esc(x.desc)}</td></tr>`).join("")
        }<tr class="tot"><td>Total</td><td class="w">${isPoints
          ? fmtWeight(pointsTotal)
          : `${fmtWeight(weightTotal)}%`}</td>${hasDueDates ? "<td></td>" : ""}<td></td></tr></table>`);
      if (d.scale) h.push(tag("scale", `<h3>Grading scale</h3>${para(d.scale)}`));
    }

    if (d.hasLab) {
      const L = d.lab;
      sec("Laboratory Component");
      const lf = [
        ["Lab section / CRN", L.crn, "lab.crn"],
        ["Lab meeting time", labMeetingDisplay, "lab.meetDays lab.meeting"],
        ["Lab location", L.location, "lab.location"],
        ["Lab instructor", L.instructor, "lab.instructor"],
      ].filter((r) => r[1] && String(r[1]).trim());
      if (lf.length) h.push(`<table class="grid">${lf.map((r) =>
        `<tr data-src="${r[2]}"><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join("")}</table>`);
      if (L.description) h.push(tag("lab.description", para(L.description)));
      [
        ["How the Lab Counts Toward Your Grade", L.gradeNote, "lab.gradeNote"],
        ["Lab Attendance", L.attendance, "lab.attendance"],
        ["Lab Safety", L.safety, "lab.safety"],
        ["Supplies and Protective Equipment", L.supplies, "lab.supplies"],
        ["Missed Labs and Make-Up", L.makeup, "lab.makeup"],
      ].forEach(([t, b, src]) => {
        if (b && b.trim()) h.push(tag(src, `<h3>${esc(t)}</h3>${para(b)}`));
      });
    }

    const pol = [];
    if (d.attendance) pol.push(["Attendance and Participation", d.attendance, "attendance"]);
    if (d.participation) pol.push(["What Engagement Looks Like Here", d.participation, "participation"]);
    if (lateText) pol.push(["Late Work and Make-Up Policy", lateText, ["late", ...d.lateAdditional.map((_, i) => `lateAdditional:${i}`)].join(" ")]);
    if (d.subjectLine || d.address)
      pol.push(["Reaching Me", [
        d.subjectLine && `Use this subject line on every email: ${d.subjectLine}`,
        d.address && `You can address me as ${d.address}.`,
      ].filter(Boolean).join("\n"), "subjectLine address"]);
    if (aiText.trim()) pol.push(["Artificial Intelligence Policy", aiText, "ai"]);
      const customPolicies = d.customPolicies.filter((policy) => policy.title.trim() || policy.text.trim());
      if (pol.length || customPolicies.length) {
      sec("Course Policies");
      pol.forEach(([t, b, src]) => h.push(tag(src, `<h3>${esc(t)}</h3>${para(b)}`)));
      if (d.profNote) h.push(`<div class="pnote" data-src="profNote"><strong>A note from your professor.</strong> ${esc(d.profNote)}</div>`);
      d.customPolicies.forEach((policy, i) => {
        if (policy.title.trim() || policy.text.trim()) {
          h.push(tag(`customPolicies:${i}`, `${policy.title.trim() ? `<h3>${esc(policy.title)}</h3>` : ""}${
            policy.text.trim() ? para(policy.text) : ""}`));
        }
      });
    }

    const uni = Object.keys(LOCKED).filter((k) => d.inc[k]);
    if (uni.length) {
      sec("University Policies and Student Support");
      uni.forEach((k) => h.push(tag(`inc.${k}`, `<h3>${esc(LOCKED[k].title)}</h3>${para(LOCKED[k].text)}`)));
    }

    const wk = schedRows.map((w, i) => ({ ...w, i })).filter((w) => w.label || w.topics || w.dates);
    if (wk.length) {
      sec("Course Schedule");
      h.push(`<table class="grid" data-src="scheduleType semesterStart meetDays"><tr><th scope="col" class="wk">${d.scheduleType === "modular" ? "Module" : "Week"}</th><th scope="col">Topics and Readings</th><th scope="col" class="due">Due</th></tr>${
        wk.map((w) => `<tr data-src="weeks:${w.i}"><td class="wk"><strong>${esc(w.label)}</strong>${w.dates ? `<br/><span class="soft">${esc(w.dates)}</span>` : ""}</td><td>${
          w.off.map((o) => `<div class="off">${esc(o)}</div>`).join("")}${esc(w.topics).replace(/\n/g, "<br/>")}</td><td class="due">${esc(w.due).replace(/\n/g, "<br/>")}</td></tr>`).join("")
      }</table>`);
    }

    if (d.calNote && regDates) {
      sec(`${d.term} Dates You Should Know`);
      h.push(`<table class="grid" data-src="calNote">${regDates.map((r) =>
        `<tr><th scope="row" class="wk">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join("")}</table>
        <p class="soft">Registrar's calendar, subject to change. Confirm at utm.edu/academics/academic-calendar/</p>`);
    }

    return h.join("");
  }, [d, weightTotal, pointsTotal, realOutcomes, aiText, meetingDisplay, labMeetingDisplay, schedRows, regDates]);

  // typing: once the preview has the new text, keep the part being edited in view
  useEffect(() => {
    const key = activeSrc.current;
    const el = document.activeElement;
    if (!key || !formRef.current?.contains(el) || srcOf(el) !== key) return undefined;
    const frame = requestAnimationFrame(() => revealInPreview(key, { caret: caretShare(el) }));
    return () => cancelAnimationFrame(frame);
  }, [docBody]); // eslint-disable-line react-hooks/exhaustive-deps

  const DOC_CSS = `
    body{font-family:Cambria,Georgia,serif;font-size:11pt;line-height:1.5;color:#1a1a1a;margin:0}
    .page{padding:0}
    h2{font-family:Cambria,Georgia,serif;font-size:14pt;color:${C.navy};margin:22px 0 8px;
       border-bottom:2px solid ${C.orange};padding-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
    h3{font-family:Cambria,Georgia,serif;font-size:11.5pt;color:${C.navy};margin:14px 0 4px}
    p{margin:0 0 9px}
    ol,ul{margin:0 0 10px 20px;padding:0} li{margin-bottom:5px}
    .soft{color:#5A6A80;font-size:10pt}
    table.hdr{width:100%;border-collapse:collapse;margin-bottom:6px;border-bottom:3px solid ${C.navy}}
    .hdr td{vertical-align:bottom;padding:0 0 10px}
    .hdr-l{width:245px}
    .hdr-r{text-align:right}
    .ct{font-size:10pt;letter-spacing:2px;color:${C.orangeText};font-weight:bold}
    .tt{font-size:19pt;color:${C.navy};line-height:1.15;font-weight:bold;margin:0}
    .st{font-size:10pt;color:#5A6A80;margin-top:3px}
    table.grid{width:100%;border-collapse:collapse;margin:6px 0 12px;font-size:10.5pt}
    .grid th,.grid td{border:1px solid ${C.line};padding:6px 9px;text-align:left;vertical-align:top}
    .grid th{background:#EEF2F7;color:${C.navy};font-weight:bold;width:auto}
    .grid td .tag{font-size:8.5pt;color:${C.orangeText};font-weight:bold;margin-top:3px}
    .grid .w{width:70px;text-align:right}
    .grid .wk{width:110px}
    .grid .due{width:150px}
    .grid .assignment-due{width:90px}
    .grid tr.tot td{background:#EEF2F7;font-weight:bold}
    .primer{border-left:4px solid ${C.orange};background:#FAFBFD;padding:10px 14px;margin:8px 0 14px;font-size:10pt}
    .primer-h{font-weight:bold;color:${C.navy};margin-bottom:6px}
    .pnote{border:1px solid ${C.orange};background:#FFF8F0;padding:10px 14px;margin:10px 0;font-size:10.5pt}
    .off{color:${C.warn};font-weight:bold;font-size:10pt;margin-bottom:3px}
  `;
  const PREVIEW_CSS = `
    .doc-preview{font-family:Cambria,Georgia,serif;font-size:11pt;line-height:1.5;color:#1a1a1a;background:#fff}
    .doc-preview{
       ${DOC_CSS}
    }
    /* dark theme override on the preview only, not the exported document */
    [data-theme="dark"] .doc-preview.themed{background:#242426;color:var(--ink)}
    [data-theme="dark"] .doc-preview.themed h2,
    [data-theme="dark"] .doc-preview.themed h3,
    [data-theme="dark"] .doc-preview.themed .tt{color:var(--navy)}
    [data-theme="dark"] .doc-preview.themed table.hdr{border-bottom-color:var(--navy)}
    [data-theme="dark"] .doc-preview.themed .soft,
    [data-theme="dark"] .doc-preview.themed .st{color:var(--muted)}
    [data-theme="dark"] .doc-preview.themed .grid th,
    [data-theme="dark"] .doc-preview.themed .grid td{border-color:var(--line)}
    [data-theme="dark"] .doc-preview.themed .grid th{background:var(--tint); color:var(--navy)}
    [data-theme="dark"] .doc-preview.themed .grid tr.tot td{background:var(--tint)}
    [data-theme="dark"] .doc-preview.themed .primer{background:var(--tint)}
    [data-theme="dark"] .doc-preview.themed .primer-h{color:var(--navy)}
    [data-theme="dark"] .doc-preview.themed .pnote{background:var(--warnBg)}
    [data-theme="dark"] .doc-preview.themed .off{color:var(--warn)}
    [data-theme="dark"] .doc-preview.themed .hdr-l img{filter:invert(1) hue-rotate(180deg);mix-blend-mode:lighten}
    /* the print's darker text orange is only 3.3:1 on the dark paper; the theme orange is 6.4:1 */
    [data-theme="dark"] .doc-preview.themed .ct,
    [data-theme="dark"] .doc-preview.themed .grid td .tag{color:var(--orange)}
    /* blue light themes: warm paper, so the page isn't the one bright-white thing on screen */
    [data-theme="blue"] .doc-preview.themed{background:#FFFBF3}
    [data-theme="blue+"] .doc-preview.themed{background:#FFF6E6}
    [data-theme="blue"] .doc-preview.themed .grid th, [data-theme="blue"] .doc-preview.themed .grid tr.tot td,
    [data-theme="blue+"] .doc-preview.themed .grid th, [data-theme="blue+"] .doc-preview.themed .grid tr.tot td{background:var(--tint)}
    [data-theme="blue"] .doc-preview.themed .primer, [data-theme="blue+"] .doc-preview.themed .primer{background:var(--paper)}
    [data-theme="blue"] .doc-preview.themed .hdr-l img, [data-theme="blue+"] .doc-preview.themed .hdr-l img{mix-blend-mode:multiply} /* the logo's white box takes the paper color */
  `;

  const fullHtml = () =>
    `<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head>
    <meta charset="utf-8"/><title>${esc(pdfFilename())}</title>
     <style>@page{size:8.5in 11in;margin:0.8in}${DOC_CSS}</style></head>
     <body><div class="page">${docBody.replace(/ data-src="[^"]*"/g, "")}</div></body></html>`;

  /** Downloads a generated browser Blob without sending it to a server. */
  const dl = (blob, name) => {
    const u = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 4000);
  };
  const fname = (ext) => `${sanitizePart(d.code) || "Syllabus"}_${sanitizePart(d.term) || "Term"}.${ext}`;
  const pdfFilename = () => `Syllabus_${sanitizePart(d.term) || "Term"}`;

  /** Downloads the current syllabus as an editable Word-compatible HTML document. */
  const exportWord = () => dl(new Blob(["\ufeff" + fullHtml()], { type: "application/msword" }), fname("doc"));
  const clearForm = async () => {
    if (!(await askConfirm({ title: "Clear the whole syllabus?", text: "Everything you've entered will be erased. You can't undo this, so export first if you want a copy.", action: "Clear", destructive: true }))) return;
    setD(createBlank());
    setTab(0);
    const scroller = previewScroller();
    if (scroller) scroller.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    // Put the cursor back in the first field so the user can start over typing.
    window.requestAnimationFrame(() => {
      formRef.current?.querySelector("input")?.focus({ preventScroll: true });
    });
  };
  /** Resolves once every image in the document has loaded or failed to load. */
  const imagesReady = (doc) => Promise.all([...doc.images].map((img) =>
    img.complete ? null : new Promise((done) => {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    })));

  /** Opens the browser print dialog with the current syllabus formatted for PDF output. */
  // prints the same pages as the preview so the PDF matches
  const exportPdf = async () => {
    const f = frameRef.current; if (!f) return;
    const doc = f.contentWindow.document;
    doc.open();
    // keep the doctype or tables size differently than the preview
    doc.write(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${esc(pdfFilename())}</title>
      <style>@page{size:8.5in 11in;margin:0}body{margin:0}${PREVIEW_CSS}${PAGE_CSS}
      .preview-page{break-after:page;page-break-after:always}.preview-page:last-child{break-after:auto;page-break-after:auto}</style>
      </head><body><div class="doc-preview" style="position:absolute;left:-10000px;top:0"><div class="page-flow" id="measure">${docBody}</div></div></body></html>`);
    doc.close();
    doc.title = pdfFilename();
    // wait for the logo before counting pages
    await imagesReady(doc);
    doc.body.innerHTML = pagesHtml(docBody, countPages(doc.getElementById("measure")), "doc-preview");
    // Wait for the logo, any other images, and fonts to finish loading instead
    // of guessing a delay. The 5-second cap keeps one stuck resource from
    // blocking the export forever.
    const win = f.contentWindow;
    const loaded = Promise.all([imagesReady(doc), doc.fonts ? doc.fonts.ready : null]);
    const cap = new Promise((done) => setTimeout(done, 5000));
    await Promise.race([loaded, cap]);
    // Give the browser one more frame to finish laying out the page.
    await new Promise((done) => window.requestAnimationFrame(() => done()));
    win.focus(); win.print();
  };

 // Warn about missing topics only for weekly schedules.
  const confirmThenExport = async (exportFn) => {
    if (isWeeklySchedule && missingWeeks.length > 0) {
      const ok = await askConfirm({
        title: "Export anyway?",
        text: `Your schedule has no topics for week${missingWeeks.length > 1 ? "s" : ""} ${formatWeekRanges(missingWeeks)}.`,
        action: "Export",
      });
      if (!ok) return;
    }
    exportFn();
  };

  /* ---------- sections ---------- */
  const TABS = [
    { n: "Course", i: BookOpen }, { n: "Instructor", i: User }, { n: "Welcome", i: MessageSquare },
    { n: "Outcomes", i: Target }, { n: "Materials", i: Library }, { n: "Summary", i: ClipboardCheck },
    { n: "Grading", i: Scale }, { n: "Policies", i: Gavel }, { n: "University", i: ShieldCheck },
    { n: "Schedule", i: CalendarDays }, {n: "Labs", i: FlaskConical}, { n: "Accessibility", i: EarHearingAid },
    { n: "Export", i: FileDown },
  ];
  const RAIL_ROW = 40;
  const railY = (i) => i * RAIL_ROW;
  // Look tabs up by name so adding a tab doesn't break hardcoded index numbers.
  const tabIndex = (name) => TABS.findIndex((t) => t.n === name);


  /* ---------- editor layout: navigation, form controls, and matching live preview ---------- */
  return (
    <div className={wavesOnly ? "app-shell panels-hidden" : "app-shell"} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, Inter, ui-sans-serif, system-ui, sans-serif", minHeight: "100vh" }}>
      {glass && <WaveBackground light={theme !== "dark"} onSoftwareGraphics={glassTooSlow} />}
      {slowNotice && (
        <div ref={noticeRef} className="slow-notice app-panel" role="status">
          <span className="notice-icon" aria-hidden="true"><Gauge size={18} /></span>
          <span className="notice-text"><b>Glass turned off</b><span>Things were running slow.</span></span>
          <button type="button" className="pill-button" onClick={toggleGlass}>Undo</button>
          <button type="button" className="notice-close" aria-label="Dismiss" onClick={hideNotice}><X size={11} strokeWidth={3} /></button>
        </div>
      )}
      <iframe ref={frameRef} title="print" style={{ position: "fixed", width: 0, height: 0, border: 0, left: -9999 }} />
      {confirmBox && (
        <Dialog onClose={() => answerConfirm(false)} labelId="confirm-dialog-title">
          <div id="confirm-dialog-title" className="dialog-title">{confirmBox.title}</div>
          {confirmBox.text && <div className="dialog-text">{confirmBox.text}</div>}
          <div className="dialog-buttons">
            <button type="button" className="dialog-button" autoFocus onClick={() => answerConfirm(false)}>Cancel</button>
            <button type="button" className={`dialog-button${confirmBox.destructive ? " is-destructive" : " is-default"}`}
              onClick={() => answerConfirm(true)}>{confirmBox.action || "OK"}</button>
          </div>
        </Dialog>
      )}
      {pendingDelete && (
        <Dialog onClose={() => setPendingDelete(null)} labelId="delete-dialog-title">
          <div id="delete-dialog-title" className="dialog-title">Delete this entry?</div>
          <div className="dialog-text">
            This {({ outcomes: "learning outcome", items: "assignment or category", weeks: "schedule entry" }[pendingDelete.k] || "entry")} has
            information in it. You can't undo this.
          </div>
          <div className="dialog-buttons">
            {/* Cancel is focused so Enter doesn't delete */}
            <button type="button" className="dialog-button" autoFocus onClick={() => setPendingDelete(null)}>Cancel</button>
            <button type="button" className="dialog-button is-destructive" onClick={confirmDrop}>Delete</button>
          </div>
        </Dialog>
      )}
      {showTextKeybinds && (
        <Dialog onClose={() => setShowTextKeybinds(false)} labelId="text-keybinds-title">
          <div id="text-keybinds-title" className="dialog-title">Text keybinds</div>
          <div className="dialog-keys">
            <kbd>Ctrl+B</kbd><span>Bold</span>
            <kbd>Ctrl+U</kbd><span>Underline</span>
            <kbd>Ctrl+I</kbd><span>Italicize</span>
          </div>
          <div className="dialog-buttons">
            <button type="button" className="dialog-button" autoFocus onClick={() => setShowTextKeybinds(false)}>Done</button>
          </div>
        </Dialog>
      )}

      {/* masthead */}
      <div className="app-panel app-masthead">
        <div className="masthead-left">
          {/* keep this the same width as the sidebar so the logo stays centered over it */}
          {glass ? (
            <button type="button" className="masthead-mark masthead-mark-toggle" onClick={() => setPanelsHidden((hidden) => !hidden)}
              aria-pressed={wavesOnly} title={wavesOnly ? "Show the panels" : "Hide the panels"}
              aria-label={wavesOnly ? "Show the panels" : "Hide the panels"}>
              <UtmMark style={{ width: 112 }} textColor="currentColor" />
            </button>
          ) : (
            <div className="masthead-mark"><UtmMark style={{ width: 112 }} textColor="currentColor" /></div>
          )}
          <div className="masthead-title">
            <div className="name">Syllabus Builder</div>
            <div className="tag">Center for Teaching and Learning</div>
          </div>
        </div>
        <div className="masthead-right">
          <div className="progress-ring" title="Readiness checks passed">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <circle cx="9" cy="9" r="7" className="ring-track" />
              <circle cx="9" cy="9" r="7" className="ring-fill" pathLength="100"
                style={{ strokeDasharray: `${(passed / checks.length) * 100} 100` }} />
            </svg>
            <span>{passed} of {checks.length} ready</span>
          </div>
          <button className="cta" onClick={() => setTab(tabIndex("Export"))}>Export syllabus</button>
        </div>
      </div>

      <div className="flex flex-wrap editor-row">
        {/* left rail */}
        <div className="editor-rail app-panel" style={{ width: 184, position: "relative", overflow: "hidden", paddingTop: 8 }}>
          <div style={{
            ...railPill,
            background: "color-mix(in srgb, var(--ink) 10%, transparent)",
            transform: `translateY(${railY(tab)}px)`,
            transition: "transform 0.25s ease",
          }} />
          <div aria-hidden="true" style={{
            ...railPill,
            background: "color-mix(in srgb, var(--ink) 5%, transparent)",
            transform: `translateY(${railY(lastHoverTab.current)}px)`,
            opacity: hoverTab !== null && hoverTab !== tab ? 1 : 0,
            transition: "transform 0.2s ease, opacity 0.2s ease",
          }} />
          {TABS.map((t, i) => {
            const on = tab === i; const done = doneTabs.has(t.n);
            return (
              <button key={t.n} onClick={() => setTab(i)}
                onMouseEnter={() => setHoverTab(i)} onMouseLeave={() => setHoverTab(null)}
                className="relative flex items-center gap-3 w-full text-left"
                style={{ height: RAIL_ROW, paddingLeft: 24, paddingRight: 18, background: "transparent", color: on ? UI.ink : UI.slate, fontSize: 15,
                  fontWeight: on ? 600 : 400, cursor: "pointer" }}>
                <t.i size={17} strokeWidth={1.75} style={{ flexShrink: 0, color: on ? UI.orangeText : UI.muted }} />
                <span style={{ flex: 1 }}>{t.n}</span>
                {done && <Check size={14} style={{ color: UI.good, flexShrink: 0 }} />}
              </button>
            );
          })}
          <div ref={pickerRef} className={pickerOpen ? "theme-picker is-open" : "theme-picker"}
            onMouseEnter={() => setPickerPeek(true)} onMouseLeave={() => { setHoverTheme(null); setPickerPeek(false); }}
            onFocus={() => setPickerPeek(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPickerPeek(false); }}>
            <button type="button" className="theme-summary" onClick={() => setPickerOpen((o) => !o)}
              aria-expanded={pickerOpen} aria-controls="theme-options" title="Change the theme">
              <span className="theme-picker-label" id="theme-picker-label">Theme</span>
              {(() => {
                const base = THEMES.find((t) => t.id === hoverTheme) || currentTheme;
                const withGlass = hoverTheme === "glass" ? !glass : glass;
                const text = base.label + (withGlass ? " + Glass" : "");
                const previewing = hoverTheme !== null && hoverTheme !== theme;
                return (
                  <FitText text={text} className={previewing ? "theme-name is-preview" : "theme-name"} />
                );
              })()}
              <MorphChevron open={pickerOpen || pickerPeek} up size={13} />
            </button>
            <div className="theme-options" id="theme-options"><div>
            <div className="theme-swatches" role="radiogroup" aria-labelledby="theme-picker-label"
              onMouseLeave={() => setHoverTheme(null)}>
              {THEMES.map((t, i) => (
                <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} aria-label={t.label}
                  tabIndex={theme === t.id ? 0 : -1}
                  className="theme-swatch" style={{ background: quadrants(t.colors) }}
                  onClick={() => { if (t.id !== theme) pickTheme(t.id); }}
                  onMouseEnter={() => setHoverTheme(t.id)}
                  onFocus={() => setHoverTheme(t.id)} onBlur={() => setHoverTheme(null)}
                  onKeyDown={(e) => {
                    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
                    if (!dir) return;
                    e.preventDefault();
                    const next = THEMES[(i + dir + THEMES.length) % THEMES.length];
                    pickTheme(next.id);
                    e.currentTarget.parentElement.children[THEMES.indexOf(next)].focus();
                  }} />
              ))}
              <span className="theme-swatch-divider" aria-hidden="true" />
              <button type="button" role="switch" aria-checked={glass} aria-label="Glass"
                className="theme-swatch glass-swatch"
                onClick={toggleGlass}
                onMouseEnter={() => setHoverTheme("glass")}
                onFocus={() => setHoverTheme("glass")} onBlur={() => setHoverTheme(null)}>
                <span style={{ background: quadrants(currentTheme.colors) }} />
              </button>
            </div>
            </div></div>
          </div>
</div>
        {/* form */}
        <div ref={formRef} className="p-5 editor-form app-panel" style={{ flex: "1 1 400px", minWidth: 340 }}>
          {tab === 0 && (<>
            <H>Course</H>
            <div className="flex gap-3 flex-wrap items-end">
              <div style={{ flex: "1 1 150px" }}>
                <Field src="code" label="Course code">
                  <div ref={codeSuggestRef} className={`dropdown${codeSuggestOpen ? " is-open" : ""}`}>
                    <div className="dropdown-control">
                    <input
                      className={inputBase}
                      value={d.code}
                      placeholder="POSC 322"
                      autoComplete="off"
                      onChange={(e) => set("code", e.target.value)}
                      onFocus={() => { if (codeSuggestions.length) setCodeSuggestOpen(true); }}
                    />
                    </div>
                    <SuggestList open={codeSuggestOpen} root={codeSuggestRef} label="Course suggestions"
                      notice={liveDown && (
                        <div className="dropdown-status" style={{ color: UI.warn }}>
                          <AlertTriangle size={13} />Live catalog unavailable. Using offline catalog.
                        </div>
                      )}
                      loading={codeSuggestLoading} loadingText={liveDown ? "Loading offline catalog" : "Searching courses"}
                      emptyText={liveDown && "No matching courses."}
                      items={codeSuggestions} itemKey={(s) => s.type + s.code} onPick={pickCodeSuggestion}
                      title={(s) => s.code} detail={(s) => (s.type === "subject" ? s.description : s.title)} />
                  </div>
                </Field>
              </div>
              <div style={{ flex: "1 1 130px" }}>
                <Field src="section" label="Section">
                  <div ref={sectionSuggestRef} className={`dropdown${sectionSuggestOpen ? " is-open" : ""}`}>
                    <div className="dropdown-control">
                    <input
                      className={inputBase} style={{ paddingRight: lookupStatus ? 34 : 16 }} // room for the lookup icon
                      value={d.section}
                      placeholder="001"
                      autoComplete="off"
                      onChange={(e) => set("section", e.target.value)}
                      onFocus={() => { if (sectionSuggestions.length) setSectionSuggestOpen(true); }}
                    />
                    {lookupStatus === "loading" &&
                      <div style={{ position: "absolute", right: 9, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
                        <Loader2 size={15} className="animate-spin" style={{ color: UI.slate }} />
                      </div>}
                    {lookupStatus === "ok" &&
                      <Check size={15} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: UI.good }} />}
                    {lookupStatus === "error" &&
                      <X size={15} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: UI.warn }} />}
                    </div>
                    <SuggestList open={sectionSuggestOpen} root={sectionSuggestRef} label="Section suggestions"
                      loading={sectionSuggestLoading} loadingText="Searching sections" emptyText="Not offered this term"
                      items={sectionSuggestions} itemKey={(s) => s.crn} onPick={pickSectionSuggestion}
                      title={(s) => `Section ${s.section}`} detail={(s) => <>{s.meeting} &middot; {s.instructor}</>} />
                  </div>
                </Field>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div style={{ flex: "2 1 240px" }}><Field src="title" label="Course title"><T value={d.title} onChange={(v) => set("title", v)} placeholder="American Foreign Policy" /></Field></div>
              <div style={{ flex: "0 0 100px" }}>
                <Field src="crn" label="CRN"><T value={d.crn} onChange={(v) => set("crn", v.replace(/\D/g, "").slice(0, 5))} placeholder="12345" /></Field>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div style={{ flex: "1 1 130px" }}>
                <Field src="term" label="Term" hint="used for the lookup too">
                  {/* terms come from Banner so new ones show up on their own */}
                  <Dropdown value={d.term} onChange={(v) => set("term", v)} placeholder="Select a term"
                    ariaLabel="Term" maxHeight={220}
                    options={(() => {
                      const list = termOptions.length ? termOptions : nearbyTerms();
                      return (d.term && !list.includes(d.term) ? [d.term, ...list] : list).map((t) => ({ value: t, label: t }));
                    })()} />
                </Field>
              </div>
              <div style={{ flex: "1 1 130px" }}><Field src="credits" label="Credit hours"><T value={d.credits} onChange={(v) => set("credits", v)} /></Field></div>
            </div>
            <Field src="semester" label="Semester length" hint="students read this before they register">
              <Dropdown value={d.semester || ""} onChange={(v) => set("semester", v)} ariaLabel="Semester length" placeholder="Select semester length"
                options={["Full Semester", "Half of a Semester", "Third of a Semester"].map((m) => ({ value: m, label: m }))} />
            </Field>
            <Field src="modality" label="Delivery" hint="students read this before they register">
              <Dropdown value={d.modality} onChange={(v) => set("modality", v)} ariaLabel="Delivery"
                options={["In person", "Hybrid", "Online synchronous", "Online asynchronous", "Dual Enrollment", "Internship"].map((m) => ({ value: m, label: m }))} />
            </Field>
            {/* the same days the Schedule tab dates its weeks from */}
            <Field src="meetDays" label="Meeting days" hint="leave blank if fully asynchronous">
              <DayPicker days={d.meetDays} onToggle={toggleDay} />
            </Field>
            <Field src="meetingTime" label="Meeting time" hint="leave blank if fully asynchronous">
              <T
                value={d.meetingTime || ""}
                onChange={(v) => set("meetingTime", v)}
                placeholder="9:30 to 10:45 a.m."
              />
            </Field>
            <Field src="location" label="Room"><T value={d.location} onChange={(v) => set("location", v)} placeholder="Humanities 407" /></Field>
            <Field src="exlocation" label="Other meeting room" hint="Only fill this if some classes take place in other room during the week"><T value={d.exlocation} onChange={(v) => set("exlocation", v)} placeholder="Humanities 409 on Fridays" /></Field>
            <Field src="dept" label="Department" hint="type freely, or pick from the list">
              <Dropdown editable value={d.dept} onChange={(v) => set("dept", v)} placeholder="Department of Computer Science"
                ariaLabel="Department" options={DEPARTMENTS.flatMap((g) => [
                  { header: g.college },
                  ...g.names.map((name) => ({ value: `Department of ${name}`, label: name })),
                ])} />
            </Field>
            <Field src="prereq" label="Prerequisites"><T value={d.prereq} onChange={(v) => set("prereq", v)} placeholder="None" /></Field>
          </>)}

          {tab === 1 && (<>
            <H>Instructor</H>
            <Caption>
              Office hours are the most under-used thing on a syllabus. Students who work shifts or commute from Dresden or Union City
              often can't make a midday block, so naming an alternative, even "email me and we'll find a time," changes who shows up.
            </Caption>
            <Field src="instructor" label="Your name"><T value={d.instructor} onChange={(v) => set("instructor", v)} placeholder="Dr. Jane Doe" /></Field>
            <Field src="email" label="Email"><T value={d.email} onChange={(v) => set("email", v)} onBlur={() => {const email = d.email.trim(); set("email", email ? (email.endsWith("@") ? `${email}utm.edu` : email.includes("@") ? email : `${email}@utm.edu`) : "");}} placeholder="jdoe (autofills @utm.edu)" /></Field>
            <Field src="phone" label="Phone"><T type="tel" value={d.phone} onChange={(v) => set("phone", v)} placeholder="731-555-0123" /></Field>
            <Field src="office" label="Office"><T value={d.office} onChange={(v) => set("office", v)} placeholder="Humanities 212" /></Field>
            <Field src="hours" label="Office hours"><A rows={2} value={d.hours} onChange={(v) => set("hours", v)} placeholder="Monday and Wednesday, 10 a.m. to noon, and by appointment. Email me and we will find a time that works." /></Field>
            <Field src="subjectLine" label="Email subject line you want" hint="cuts your response time"><T value={d.subjectLine} onChange={(v) => { subjectLineAutoRef.current = false; set("subjectLine", v); }} placeholder="POSC 322 - [your question]" /></Field>
            <Field src="address" label="How students should address you"><T value={d.address} onChange={(v) => set("address", v)} placeholder="Dr. Doe" /></Field>
          </>)}

          {tab === 2 && (<>
            <H>Welcome and description</H>
            <Caption>
              The description is what the catalog says. The welcome is what you say, and it shapes how students read
              everything after it, so it's worth four sentences in your own voice.
            </Caption>
            <Field src="welcome" label="Why this course matters" hint="your voice, not the catalog">
              <A rows={6} value={d.welcome} onChange={(v) => set("welcome", v)}
                placeholder="Foreign policy is not something that happens far away in diplomatic corridors. It shapes the price of the goods you buy, the security of the country you live in, and the reputation the United States carries around the world. This course is built around that reality." />
            </Field>
            <Field src="description" label="Course description"><A rows={5} value={d.description} onChange={(v) => set("description", v)} placeholder="Paste the description from the UTM catalog." /></Field>
            <div className="section-title">Custom course descriptions</div>
            {(d.customDescriptions || []).map((item, i) => (
              <CardField key={i} data-box-key="customDescriptions" data-box-index={i}
                title={item.title} onTitle={(v) => setDeep("customDescriptions", i, "title", v)}
                titlePlaceholder="Title, like Course focus" titleLabel={`Custom description ${i + 1} title`}
                onRemove={() => drop("customDescriptions", i)} removeLabel={`Remove custom description ${i + 1}`}>
                <A rows={6} value={item.description} onChange={(v) => setDeep("customDescriptions", i, "description", v)} placeholder="Provide a custom course description." />
              </CardField>
            ))}
            <AddRow onClick={() => push("customDescriptions", { title: "", description: "" })}>Add custom description</AddRow>
          </>)}

          {tab === 3 && (<>
            <H>Learning outcomes</H>
            <div className="group-box">
              <SwitchRow src="showPrimer" checked={d.showPrimer} onChange={(on) => set("showPrimer", on)}>Include the explainer box</SwitchRow>
              <div className="group-note">
                It tells a new faculty member what an SLO is, how to test one, and why the Gen Ed outcomes belong here.
                Turn it off, or delete the box in Word, once your outcomes are written.
              </div>
            </div>
            {d.outcomes.map((o, i) => (
              <CardField key={i} data-box-key="outcomes" data-box-index={i} label={`Outcome ${i + 1}`}
                onRemove={() => drop("outcomes", i)} removeLabel={`Remove outcome ${i + 1}`}>
                <A rows={2} value={o} onChange={(v) => setD((p) => { const a = [...p.outcomes]; a[i] = v; return { ...p, outcomes: a }; })}
                  placeholder="Students will evaluate…" />
              </CardField>
            ))}
            <AddRow onClick={() => push("outcomes", "")}>Add outcome</AddRow>

            <div className="section-title">Outcome library</div>
            {OUTCOME_LIBRARY.map((g) => (
              <div key={g.group} className="group-box">
                <div className="group-head">{g.group}</div>
                <div className="group-note" style={{ marginTop: 0 }}>{g.note}</div>
                {g.items.map((it) => {
                  const added = d.outcomes.includes(it);
                  return (
                    <button key={it} type="button" className="library-row" disabled={added}
                      onClick={() => setD((p) => ({ ...p, outcomes: [...p.outcomes.filter((x) => x.trim()), it] }))}
                      aria-label={added ? `Already added: ${it}` : `Add outcome: ${it}`}>
                      <span style={{ flex: 1 }}>{it}</span>
                      {added
                        ? <Check size={16} strokeWidth={2.5} aria-hidden="true" style={{ color: UI.good, flexShrink: 0 }} />
                        : <span className="library-add" aria-hidden="true"><Plus size={14} strokeWidth={2.5} /></span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </>)}

          {tab === 4 && (<>
            <H>Materials</H>
            <Field src="texts" label="Required texts"><A rows={4} value={d.texts} onChange={(v) => set("texts", v)} placeholder="Hastedt, G. P. (2020). American Foreign Policy: Past, Present, and Future (12th ed.). Rowman and Littlefield." /></Field>
            <Field src="costNote" label="Cost note" hint="tell them the real number, and the free path if there is one"><A rows={2} value={d.costNote} onChange={(v) => set("costNote", v)} placeholder="The textbook runs about $60 used. A copy is on reserve at Paul Meek Library. Tell me before the second week if cost is a barrier." /></Field>
            <Field src="tech" label="Technology and platforms"><A rows={3} value={d.tech} onChange={(v) => set("tech", v)} placeholder="Canvas for all materials and submissions. A phone or laptop microphone is enough for the audio assignments." /></Field>
            <Field src="materials" label="Access details" hint="answer the questions students always ask: will I be given the book, what format, and where do I get it">
              {[
                ["provided", "These materials will be provided to you at no additional cost."],
                ["hardcopy", "Available in hardcopy (print)."],
                ["online", "Available online (digital / e-text)."],
              ].map(([key, text]) => (
                <SwitchRow key={key} src="materials" checked={d.materials[key]} onChange={(on) => set("materials", { ...d.materials, [key]: on })}>{text}</SwitchRow>
              ))}
              <A rows={2} value={d.materials.acquire} onChange={(v) => set("materials", { ...d.materials, acquire: v })} placeholder="Where to acquire them: the UTM Bookstore, a copy on reserve at Paul Meek Library, or the publisher link in Canvas." />
            </Field>
            {d.extraMaterials.map((material, i) => (
              <CardField key={i} data-box-key="extraMaterials" data-box-index={i}
                title={material.title} onTitle={(v) => setDeep("extraMaterials", i, "title", v)}
                titlePlaceholder="Section heading" titleLabel={`Material section ${i + 1} heading`}
                onRemove={() => drop("extraMaterials", i)} removeLabel={`Remove material section ${i + 1}`}>
                <A rows={3} value={material.description} onChange={(v) => setDeep("extraMaterials", i, "description", v)} placeholder="Describe the additional course material." />
              </CardField>
            ))}
            <AddRow onClick={() => push("extraMaterials", { title: "", description: "" })}>Add material section</AddRow>
          </>)}

          {tab === 5 && (<>
            <H>Summary</H>
            <Caption>
              A quick look at your course info and materials. Click any row to go edit it.
            </Caption>
            <ReviewPanel
              onJump={setTab}
              groups={[
                {
                  title: "Course information",
                  rows: [
                    { label: "Course", value: `${d.code} ${d.title}`.trim(), required: true, tab: 0 },
                    { label: "Term", value: d.term, required: true, tab: 0 },
                    { label: "Credit hours", value: d.credits, required: true, tab: 0 },
                    { label: "Delivery", value: d.modality, required: true, tab: 0 },
                    { label: "Meeting time", value: meetingDisplay, required: !d.modality.startsWith("Online"), tab: 0 },
                    { label: "Room", value: d.location, tab: 0 },
                    { label: "CRN / Section", value: [d.crn, d.section].filter(Boolean).join(" / "), tab: 0 },
                    { label: "Instructor", value: d.instructor, required: true, tab: 1 },
                    { label: "Email", value: d.email, required: true, tab: 1 },
                    { label: "Office hours", value: d.hours, required: true, tab: 1 },
                  ],
              },
              {
                title: "Materials",
                rows: [
                  { label: "Required texts", value: d.texts, required: true, tab: 4 },
                  { label: "Cost note", value: d.costNote, tab: 4 },
                  { label: "Technology and platforms", value: d.tech, tab: 4 },
                ],
              },
            ]}
          />
      </>)}


          {tab === 6 && (<>
            <H>Assessment and grading</H>
            <div role="radiogroup" aria-label="Grading method" className="segmented"
              style={{ "--seg": d.gradingMethod === "points" ? 1 : 0 }}>
              <span className="segmented-thumb" aria-hidden="true" />
              {[["percentage", "Percentage (%)"], ["points", "Points (pts)"]].map(([value, label]) => (
                <button key={value} type="button" role="radio" aria-checked={d.gradingMethod === value}
                  onClick={() => set("gradingMethod", value)}>{label}</button>
              ))}
            </div>
            <Caption>
              Use one assessment for a single assignment, like a final paper, or for a category, like quizzes.
              For a category, enter its combined weight.
            </Caption>
            {(() => {
              const isPoints = d.gradingMethod === "points";
              const ok = isPoints ? validPoints : Math.abs(weightTotal - 100) < 0.01;
              const detail = isPoints
                ? (validPoints ? `${fmtWeight(pointsTotal)} points`
                  : d.items.some((item) => !item.name.trim() && item.points.trim()) ? "Name the unnamed assessment" : "Enter points for each assessment")
                : ok ? `${fmtWeight(weightTotal)}%`
                  : `${fmtWeight(weightTotal)}% · ${fmtWeight(Math.abs(100 - weightTotal))} ${weightTotal > 100 ? "over" : "under"}`;
              return (
                <div className="total-row" role="status">
                  <span>Total</span>
                  <span className={ok ? "is-good" : "is-warn"}>
                    {detail}{ok ? <Check size={15} strokeWidth={2.5} aria-hidden="true" /> : <AlertTriangle size={14} aria-hidden="true" />}
                  </span>
                </div>
              );
            })()}
            {d.items.map((x, i) => {
              const isPoints = d.gradingMethod === "points";
              return (
                <div key={i} ref={i === d.items.length - 1 ? lastGradingItemRef : null}>
                  <CardField data-box-key="items" data-box-index={i}
                    title={x.name} onTitle={(v) => setDeep("items", i, "name", v)}
                    titlePlaceholder="Assessment name, like Final paper" titleLabel={`Assessment ${i + 1} name`}
                    onRemove={() => drop("items", i)} removeLabel={`Remove assessment ${i + 1}`}>
                    <label className="inset-row">
                      <span>{isPoints ? "Points" : "Weight"}</span>
                      <span className="inset-value">
                        <input className="inset-input" inputMode="decimal" value={isPoints ? x.points : x.weight}
                          onChange={(e) => setDeep("items", i, isPoints ? "points" : "weight", e.target.value)} placeholder="0" />
                        <span className="inset-unit">{isPoints ? "pts" : "%"}</span>
                      </span>
                    </label>
                    <label className="inset-row">
                      <span>Due date</span>
                      <input className="inset-input" value={x.due} onChange={(e) => setDeep("items", i, "due", e.target.value)} placeholder="Optional" />
                    </label>
                    <A rows={2} value={x.desc} onChange={(v) => setDeep("items", i, "desc", v)} placeholder="Describe the assignment or category." />
                    {realOutcomes.length > 0 && (
                      <div className="inset-row">
                        <span>Outcomes</span>
                        <span className="chips" role="group" aria-label="Outcomes this assessment grades">
                          {realOutcomes.map((_, oi) => {
                            const on = x.slos.includes(oi);
                            return (
                              <button key={oi} type="button" className="chip" aria-pressed={on} title={realOutcomes[oi]}
                                aria-label={`Outcome ${oi + 1}`}
                                onClick={() => setDeep("items", i, "slos", on ? x.slos.filter((z) => z !== oi) : [...x.slos, oi])}>
                                {oi + 1}
                              </button>
                            );
                          })}
                        </span>
                      </div>
                    )}
                  </CardField>
                </div>
              );
            })}
            <AddRow onClick={addGradingItem}>Add assessment</AddRow>
            {unmapped.length > 0 && (
              <div className="warn-row">
                <AlertTriangle size={15} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Outcome{unmapped.length > 1 ? "s" : ""} {unmapped.map((i) => i + 1).join(", ")} {unmapped.length > 1 ? "aren't" : "isn't"} graded
                  by any assessment yet. Turn {unmapped.length > 1 ? "their numbers" : "its number"} on in an assessment, or rewrite the outcome.
                </span>
              </div>
            )}
            <Field src="scale" label="Grading scale"><A rows={2} value={d.scale} onChange={(v) => set("scale", v)} /></Field>
          </>)}

          {tab === 7 && (<>
            <H>Course policies</H>
            <Field src="attendance" label="Attendance">
              <SampleRows label="Sample attendance policy" current={d.attendance}
                options={[
                  ["Graded",
                    'Attendance in this course means that you will be present for all in-person class meetings. Roll will be called/marked at the beginning of each class period. If you are not present during roll call, it is your responsibility to see the professor after class so that you may be marked tardy; otherwise, you will be marked absent for the day. If you need to miss class for a valid reason (school events, family matters, appointments, etc.) you must notify the professor in advance of your absence, or as near as possible to the class period in the event of emergencies. You need not be detailed, a simple "I am out sick today" will suffice!'
                  ],
                  ["Flexible",
                    `Your attendance is beneficial at all scheduled sessions. It's where new introductions to materials will take place, and group activities will facilitate learning. I understand that life happens and you may not be able to attend every class. Therefore, MWF sections have 3 free absences throughout the semester. T/TH sections have 2 free absences. This includes excused absences.`
                  ],
                  ["Online",
                    `This course has no fixed meeting time, so attendance is measured by your activity in Canvas rather than by your presence in a room. You are counted present in a given week if you have submitted that week's work, posted to the discussion board, or otherwise engaged with the week's module by the Sunday deadline. Two consecutive weeks with no Canvas activity will trigger an outreach from me and may be reported to Student Success as a retention concern. Federal financial aid regulations also require that we document academically related activity.`
                  ],
                ].map(([label, text]) => ({ value: text, label }))}
                onChange={async (text) => {
                  if (d.attendance.trim() && !(await askConfirm({ title: "Replace your attendance policy?", text: "The sample will replace what you've written.", action: "Replace" }))) return;
                  set("attendance", text);
                }} />

              <A
                rows={8}
                value={d.attendance}
                onChange={(v) => set("attendance", v)}
                placeholder="Say what counts as present, what happens after an absence, and who to tell."
              />
            </Field> 
            <Field src="participation" label="What engagement looks like here" hint="optional, but it removes a lot of guesswork">
              <SampleRows label="Sample engagement policy" current={d.participation}
                options={[
                  [
                    "Discussion & Q&A",
                    "Merely showing up and sitting through class is not participation. Active engagement means arriving having read the assigned material, asking and answering questions during class discussions, listening respectfully to classmates, and contributing thoughtfully to small-group activities."
                  ],
                  [
                    "Project & Team-Based",
                    "Engagement in this course is measured by how you show up for your team and the work. Contributing to project discussions, meeting agreed-upon team deadlines, participating in peer reviews, and communicating early when you hit a roadblock all count toward participation."
                  ],
                  [
                    "Active Learning & Problem Solving",
                    "This class is built around hands-on practice rather than passive note-taking. Engagement means working through in-class problems, sharing your approach (even when you are not sure it is right yet), collaborating with neighbors during exercises, and putting away distractions during class."
                  ],
                  [
                    "Online & Asynchronous",
                    "In an online course, engagement means staying visibly connected to the class community each week. Logging into Canvas regularly, posting substantive and timely responses on discussion boards, engaging with your peers' ideas, and reaching out during office hours or by email when questions come up all count."
                  ],
                ].map(([label, text]) => ({ value: text, label }))}
                onChange={async (text) => {
                  if (d.participation.trim() && !(await askConfirm({ title: "Replace your engagement policy?", text: "The sample will replace what you've written.", action: "Replace" }))) return;
                  set("participation", text);
                }} />

              <A
                rows={4}
                value={d.participation}
                onChange={(v) => set("participation", v)}
                placeholder="Merely showing up and sitting through the class is not participation. Asking questions during Q and A, contributing to project discussions, and showing up to team meetings all count."
              />
            </Field>
            <Field src="late" label="Late work and make-up" hint="choose a sample, then edit as needed">
              <SampleRows label="Sample late work policy" current={d.late}
                options={LATE_POLICIES.map((policy) => ({ value: policy.label, label: policy.label, text: policy.text }))}
                onChange={async (v) => {
                  const sample = LATE_POLICIES.find((policy) => policy.label === v);
                  if (d.late.trim() && !(await askConfirm({ title: "Replace your late work policy?", text: "The sample will replace what you've written.", action: "Replace" }))) return;
                  set("lateSample", v);
                  set("late", sample?.text || "");
                }} />
              <A rows={3} value={d.late} onChange={(v) => set("late", v)} placeholder="Describe your late work deadlines, penalties, extensions, and make-up arrangements." />
            </Field>
            {d.lateAdditional.map((policy, i) => (
              <CardField key={i} data-box-key="lateAdditional" data-box-index={i} label="Another late work policy"
                onRemove={() => drop("lateAdditional", i)} removeLabel={`Remove late work policy ${i + 2}`}>
                <SampleRows label="Sample late work policy" current={policy.text}
                  options={LATE_POLICIES.map((option) => ({ value: option.label, label: option.label, text: option.text }))}
                  onChange={async (v) => {
                    const sample = LATE_POLICIES.find((option) => option.label === v);
                    if (policy.text.trim() && !(await askConfirm({ title: "Replace this late work policy?", text: "The sample will replace what you've written.", action: "Replace" }))) return;
                    setDeep("lateAdditional", i, "sample", v);
                    setDeep("lateAdditional", i, "text", sample?.text || "");
                  }} />
                <A rows={3} value={policy.text} onChange={(v) => setDeep("lateAdditional", i, "text", v)} placeholder="Describe an additional late work or make-up arrangement." />
              </CardField>
            ))}
            <AddRow onClick={() => push("lateAdditional", { sample: "", text: "" })}>Add another late work policy</AddRow>

            <div className="section-title">Artificial intelligence policy</div>
            <Caption>
              Required. UTM's AI policy (effective July 1, 2025) says every syllabus must state your expectations for student AI use,
              so pick one of its three tiers below or write your own.
            </Caption>
            <div className="choice-list" role="radiogroup" aria-label="AI policy tier" data-src="ai">
              {Object.entries(AI_POLICIES).map(([k]) => {
                const [title, desc] = AI_TIER_TEXT[k];
                return (
                  <label key={k} className="choice-row" onMouseDown={(e) => e.preventDefault()}>
                    <input type="radio" name="ai" checked={d.aiTier === k} onChange={() => set("aiTier", k)} />
                    <span className="choice-text"><span>{title}</span><span className="choice-desc">{desc}</span></span>
                    {d.aiTier === k && <Check size={17} strokeWidth={2.5} aria-hidden="true" className="check-draw" style={{ color: UI.orangeText, flexShrink: 0 }} />}
                  </label>
                );
              })}
              {/* "write my own" opens its text box right here, under the option */}
              <div className={`choice-more${d.aiTier === "custom" ? " is-open" : ""}`} inert={d.aiTier === "custom" ? undefined : ""}>
                <div>
                  <A rows={7} value={d.aiCustom} onChange={(v) => set("aiCustom", v)}
                    placeholder="Your policy must still affirm academic honesty and state that unpermitted AI use is academic misconduct under the Student Code of Conduct." />
                </div>
              </div>
              <SlideHighlight />
            </div>
            <div className="mt-4"><Field src="profNote" label="A note from your professor" hint="optional warm box, sits under the policy">
              <A rows={3} value={d.profNote} onChange={(v) => set("profNote", v)} placeholder="If you are ever unsure whether what you are submitting crosses that line, reach out before you submit. That conversation is always easier before the fact than after." /></Field></div>
            <div className="section-title">Additional policies</div>
            {d.customPolicies.map((policy, i) => (
              <CardField key={i} data-box-key="customPolicies" data-box-index={i} title={policy.title} onTitle={(v) => setDeep("customPolicies", i, "title", v)}
                titlePlaceholder="Policy title, like Classroom conduct" titleLabel={`Custom policy ${i + 1} title`}
                onRemove={() => drop("customPolicies", i)} removeLabel={`Remove custom policy ${i + 1}`}>
                <A rows={3} value={policy.text} onChange={(v) => setDeep("customPolicies", i, "text", v)} placeholder="Describe your expectations for students." />
              </CardField>
            ))}
            <AddRow onClick={() => push("customPolicies", { title: "", text: "" })}>Add custom policy</AddRow>
          </>)}

          {tab === 8 && (<>
            <H>University policies</H>
            <Caption>
              CTL keeps this language current each term, so leave it on. If you edit it in Word after exporting, you own the accuracy of the edit.
            </Caption>
            {Object.entries(LOCKED).map(([k, v]) => {
              const full = fullPolicies.includes(k);
              const showsLess = full && !policyClosing.includes(k); // what the button says
              return (
                <div key={k} className={`group-box${d.inc[k] ? "" : " is-off"}`}>
                  <SwitchRow src={`inc.${k}`} checked={d.inc[k]} onChange={(on) => set("inc", { ...d.inc, [k]: on })}>
                    <span className="policy-title">{v.title}<Lock size={12} aria-label="CTL-maintained language" /></span>
                  </SwitchRow>
                  <div ref={(el) => { policyTextRefs.current[k] = el; }} className={`policy-text${full ? " is-full" : ""}`}>{v.text}</div>
                  <button type="button" className="policy-more" aria-expanded={showsLess}
                    onMouseDown={(e) => e.preventDefault()} onClick={() => togglePolicy(k)}>
                    {/* "more" morphs into "less" in place */}
                    Show <span className="label-swap">
                      <span aria-hidden={showsLess}>more</span>
                      <span aria-hidden={!showsLess}>less</span>
                    </span>
                  </button>
                </div>
              );
            })}
          </>)}

          {tab === 9 && (<>
            <H>Schedule</H>
            <Field src="scheduleType" label="Schedule format">
              <Dropdown value={d.scheduleType || "weekly"} ariaLabel="Schedule format"
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "modular", label: "Modular" },
                  { value: "summer-full", label: "Summer: Full" },
                  { value: "summer-first-half", label: "Summer: First half" },
                  { value: "summer-second-half", label: "Summer: Second half" },
                ]}
                onChange={(next) => {
                if (next === "summer-full" || next === "summer-first-half" || next === "summer-second-half") {
                  applySummerPreset(next);
                  return;
                }
                setD((p) => ({ ...p, scheduleType: next, weeks: p.weeks.map((w) => ({
                  ...w,
                  label: /^(Week|Module) \d+$/.test(w.label)
                    ? w.label.replace(/^(Week|Module)/, next === "modular" ? "Module" : "Week") : w.label,
                })) }));
              }} />
            </Field>
            <Field src="meetDays" label="Class meets on" hint={cal ? `dates come from the ${d.term} registrar calendar` : "pick a term on the Course tab to use the registrar calendar"}>
              <DayPicker days={d.meetDays} onToggle={toggleDay} />
            </Field>
            {auto ? (
              <Caption>
                Weeks and dates come from the days you picked. Holidays on those days are marked "No class." Fill in topics and due dates below.
              </Caption>
            ) : (
              <>
                <Caption>
                  Pick the first day of classes and each week's Monday-to-Friday dates fill in. You can still edit any week afterward.
                </Caption>
                <Field src="semesterStart" label="Semester start" hint="used for automatic week dates">
                  <DateField label="Semester start" value={d.semesterStart} onChange={(v) => set("semesterStart", v)} />
                </Field>
                <AddRow onClick={autofillScheduleDates} icon={CalendarDays}>Autofill dates</AddRow>
                {d.scheduleType !== "modular" && (
                  <AddRow onClick={buildSemesterSchedule} icon={CalendarDays}>Build 15 weeks with dates</AddRow>
                )}
              </>
            )}
            <div className="group-box">
              <SwitchRow src="calNote" checked={d.calNote} onChange={(on) => set("calNote", on)}>Add the {d.term} registrar dates</SwitchRow>
              {regWarning ? (
                <div className="group-note is-warn" role="status"><AlertTriangle size={13} aria-hidden="true" />{regWarning}</div>
              ) : (
                <div className="group-note" role="status">
                  {registrar.status === "loading" ? "Checking the registrar's calendar on utm.edu…"
                    : `${regDates.length} dates from utm.edu/academics/academic-calendar, like add and drop deadlines, breaks, finals, and commencement.`}
                </div>
              )}
            </div>
            {schedRows.map((w, i) => (
              auto ? (
                <CardField key={i} data-box-key="weeks" data-box-index={i}
                  label={<>{w.label} <span className="week-dates">{w.dates}</span></>}>
                  {w.off.map((o) => <div key={o} className="week-off">{o}</div>)}
                  <A rows={3} value={w.topics} onChange={(v) => setWeek(i, "topics", v)} placeholder="Topic and readings" />
                  <A rows={1} value={w.due} onChange={(v) => setWeek(i, "due", v)} placeholder="Due" />
                </CardField>
              ) : (
                <CardField key={i} data-box-key="weeks" data-box-index={i}
                  title={w.label} onTitle={(v) => setDeep("weeks", i, "label", v)}
                  titlePlaceholder={d.scheduleType === "modular" ? `Module ${i + 1}` : `Week ${i + 1}`} titleLabel={`Entry ${i + 1} name`}
                  onRemove={() => drop("weeks", i)} removeLabel={`Remove ${w.label || `entry ${i + 1}`}`}>
                  <label className="inset-row">
                    <span>Dates</span>
                    <input className="inset-input" style={{ width: 200 }} value={w.dates} onChange={(e) => setDeep("weeks", i, "dates", e.target.value)}
                      placeholder={d.scheduleType === "modular" ? "Optional" : "August 24 to 28"} />
                  </label>
                  <A rows={3} value={w.topics} onChange={(v) => setWeek(i, "topics", v)} placeholder="Topic and readings" />
                  <A rows={1} value={w.due} onChange={(v) => setWeek(i, "due", v)} placeholder="Due" />
                </CardField>
              )
            ))}
            {!auto && (<>
              <AddRow onClick={() => {
                const i = d.weeks.length;
                const dates = buildWeekDates(d.semesterStart, i + 1);
                push("weeks", { label: `${d.scheduleType === "modular" ? "Module" : "Week"} ${i + 1}`, dates: dates[i] || "", topics: "", due: "" });
              }}>Add {d.scheduleType === "modular" ? "module" : "week"}</AddRow>
              <div className="group-box">
                <label className="inset-row" style={{ marginTop: 0 }}>
                  <span>Number of {d.scheduleType === "modular" ? "modules" : "weeks"}</span>
                  <span className="inset-value">
                    <input className="inset-input" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="1–15"
                      aria-invalid={weekCountWarning} value={weekCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^[0-9]*$/.test(value)) { setWeekCountWarning(true); return; }
                        setWeekCount(value);
                        setWeekCountWarning(!value || Number(value) < 1 || Number(value) > 15);
                      }} />
                    <button type="button" className="pill-button" onClick={() => {
                      const count = Number(weekCount);
                      if (!/^[0-9]+$/.test(weekCount) || count < 1 || count > 15) { setWeekCountWarning(true); return; }
                      setWeekCountWarning(false);
                      setD((p) => ({
                        ...p,
                        weeks: Array.from({ length: count }, (_, i) => p.weeks[i] || {
                          label: `${p.scheduleType === "modular" ? "Module" : "Week"} ${i + 1}`, dates: "", topics: "", due: "",
                        }),
                      }));
                    }}>Build</button>
                  </span>
                </label>
                <div role="alert" className="group-note" style={{ color: UI.warn, minHeight: weekCountWarning ? undefined : 0, padding: weekCountWarning ? undefined : 0 }}>
                  {weekCountWarning ? "Enter a whole number from 1 to 15." : ""}
                </div>
              </div>
              <button type="button" className="destructive-row" style={{ marginTop: 6 }} onClick={async () => {
                const unit = d.scheduleType === "modular" ? "modules" : "weeks";
                if (d.weeks.length && !(await askConfirm({ title: `Delete all ${unit}?`, text: "Their topics and due dates will be erased. You can't undo this.", action: "Delete", destructive: true }))) return;
                setD((p) => ({ ...p, weeks: [] }));
              }}>Delete all {d.scheduleType === "modular" ? "modules" : "weeks"}</button>
            </>)}
          </>)}

            {tab === 10 && (<>
            <H>Lab component</H>
            <div className="group-box">
              <SwitchRow checked={d.hasLab && !labLeaving} onChange={toggleLab}>This course has a lab</SwitchRow>
              <div className="group-note">Adds a Laboratory Component section to the syllabus.</div>
            </div>
            {d.hasLab && (<div ref={stairRef} className={labLeaving ? "stair-leave" : labReveal ? "stair-reveal" : undefined} onAnimationEnd={(e) => { if (e.target.parentElement === e.currentTarget && !e.target.nextElementSibling) setLabReveal(false); }}>
              <Caption>
                Students always ask three things about a lab: does it count toward my grade, what if I miss one, and what do I bring.
                Answering them here saves you the emails.
              </Caption>
              <div className="flex gap-3 flex-wrap">
                <div style={{ flex: "1 1 130px" }}><Field src="lab.crn" label="Lab section / CRN"><T value={d.lab.crn} onChange={(v) => setLab("crn", v)} placeholder="12346" maxLength={5} /></Field></div>
                <div style={{ flex: "2 1 220px" }}><Field src="lab.instructor" label="Lab instructor" hint="if different from you"><T value={d.lab.instructor} onChange={(v) => setLab("instructor", v)} /></Field></div>
              </div>
              <Field src="lab.meetDays" label="Lab meets on" hint="Select the days this lab meets">
                <DayPicker days={d.lab.meetDays || []} onToggle={toggleLabDay} />
              </Field>
              <Field src="lab.meeting" label="Lab meeting time">
                <T value={d.lab.meeting} onChange={(v) => setLab("meeting", v)} placeholder="2:00 to 4:50 p.m." />
              </Field>
              <Field src="lab.location" label="Lab location"><T value={d.lab.location} onChange={(v) => setLab("location", v)} placeholder="Science Complex 118" /></Field>
              <Field src="lab.description" label="What happens in lab" hint="how it connects to lecture"><A rows={3} value={d.lab.description} onChange={(v) => setLab("description", v)} /></Field>
              <Field src="lab.gradeNote" label="How the lab counts toward the course grade" hint="separate grade, percent of the total, or must pass both"><A rows={3} value={d.lab.gradeNote} onChange={(v) => setLab("gradeNote", v)} placeholder="Lab is 25 percent of your final grade. Lab reports are graded within one week." /></Field>
              <Field src="lab.attendance" label="Lab attendance"><A rows={3} value={d.lab.attendance} onChange={(v) => setLab("attendance", v)} /></Field>
              <Field src="lab.safety" label="Lab safety" hint="required"><A rows={4} value={d.lab.safety} onChange={(v) => setLab("safety", v)} placeholder="Your safety rules, any training students must complete before the first lab, and what happens if the rules are not followed." /></Field>
              <Field src="lab.supplies" label="Supplies and protective equipment"><A rows={3} value={d.lab.supplies} onChange={(v) => setLab("supplies", v)} placeholder="Lab notebook, closed-toe shoes, goggles (available at the bookstore)." /></Field>
              <Field src="lab.makeup" label="Missed labs and make-up"><A rows={3} value={d.lab.makeup} onChange={(v) => setLab("makeup", v)} /></Field>
            </div>)}
          </>)}


          {tab === tabIndex("Accessibility") && (<>
            <H>Accessibility check</H>
            <Caption>
              Looks for common problems that make a syllabus hard to use with a screen reader or hard to read,
              like YuJa Panorama does in Canvas. It runs in your browser, nothing is sent anywhere, and it never blocks export.
            </Caption>
            <div className="group-title" style={{ marginTop: 20 }} role="status">{a11ySummary}</div>
            {/* problems first */}
            <div className="row-list">
              {[...a11yChecks].sort((a, b) => (b.found.length > 0) - (a.found.length > 0)).map((c) => {
                const n = c.found.length;
                return (
                  <div key={c.id} className="expand-group">
                    <div className="list-row" style={{ cursor: "default" }}>
                      <span className="row-label">{c.title}</span>
                      <span className="row-detail" style={n && c.level === "fail" ? { color: UI.warn } : undefined}>
                        {!n ? "" : c.level === "fail" ? `${n} to fix` : `${n} to review`}
                      </span>
                      {!n && <Check size={15} aria-label="Passed" style={{ color: UI.good, flexShrink: 0 }} />}
                    </div>
                    {n > 0 && (
                      <div className="open-list">
                        {c.found.map((p, k) => (
                          <button key={k} className="list-item" onClick={() => setTab(tabIndex(p.tab))}>
                            <span style={{ flex: 1, minWidth: 0 }}>
                              {p.tab} › {p.label}
                              {(p.quote || p.note) && (
                                <span className="item-note">
                                  {p.quote && <>“{p.quote}”</>}{p.quote && p.note && " · "}{p.note}
                                </span>
                              )}
                            </span>
                            <span className="item-go">Fix<ChevronRight size={13} aria-hidden="true" /></span>
                          </button>
                        ))}
                        <div className="detail-text"><b>Why it matters.</b> {c.why}</div>
                        <div className="detail-text"><b>How to fix.</b> {c.fix}</div>
                        <SlideHighlight />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>)}

          {tab === tabIndex("Export") && (<>
            <H>Review and export</H>
            <div className="export-actions" style={{ marginTop: 0 }}>
              <button className="export-button" onClick={() => confirmThenExport(exportWord)}>
                <span className="export-badge" aria-hidden="true"><FileText size={18} strokeWidth={1.75} /></span>
                <span className="export-text"><b>Word</b><small>Keep editing it</small></span>
                <Download size={16} className="export-arrow" aria-hidden="true" />
              </button>
              <button className="export-button" onClick={() => confirmThenExport(exportPdf)}>
                <span className="export-badge" aria-hidden="true"><Printer size={18} strokeWidth={1.75} /></span>
                <span className="export-text"><b>PDF</b><small>Choose Save as PDF</small></span>
                <Download size={16} className="export-arrow" aria-hidden="true" />
              </button>
            </div>
            <Caption>
              Both come out in Cambria with the UT Martin banner and real heading styles, so screen readers can navigate them.
              PDF opens your browser's print dialog. Nothing is saved anywhere, so export before you close this tab.
            </Caption>
            {/* one row per tab, click to go there */}
            <div className="group-title" style={{ marginTop: 20 }}>
              {passed === checks.length ? "Everything's ready" : `${checks.length - passed} left to finish`}
            </div>
            <div className="row-list">
              {[...new Set(checks.filter((c) => !c[1]).map((c) => c[2]))].map((where) => {
                const missing = checks.filter((c) => !c[1] && c[2] === where).map((c) => c[0]);
                const open = openChecks.includes(where);
                const toggle = () => setOpenChecks((o) => (open ? o.filter((w) => w !== where) : [...o, where]));
                return (
                  <ExpandRow key={where} open={open} onToggle={toggle} label={where}
                    summary={missing.join(", ")} openSummary={`${missing.length} missing`}>
                    {missing.map((label) => (
                      <button key={label} className="list-item" onClick={() => setTab(tabIndex(where))}>
                        <span style={{ flex: 1 }}>{label}</span>
                        <span className="item-go">Fix<ChevronRight size={13} aria-hidden="true" /></span>
                      </button>
                    ))}
                  </ExpandRow>
                );
              })}
              <button className="list-row" onClick={() => setTab(tabIndex("Accessibility"))}>
                <span className="row-label">Accessibility</span>
                <span className="row-detail" role="status">{a11ySummary}</span>
                <ChevronRight size={15} aria-hidden="true" style={{ color: UI.muted, flexShrink: 0 }} />
              </button>
              {passed > 0 && (
                <ExpandRow open={showDone} onToggle={() => setShowDone((v) => !v)} label="Completed" summary={`${passed} done`}>
                  {checks.filter((c) => c[1]).map(([label]) => (
                    <div key={label} className="list-item is-done">
                      <span style={{ flex: 1 }}>{label}</span>
                      <Check size={14} aria-hidden="true" style={{ color: UI.good, flexShrink: 0 }} />
                    </div>
                  ))}
                </ExpandRow>
              )}
            </div>
            {a11yFailCount + a11yWarnCount > 0 && (
              <Caption>Fixing accessibility issues is recommended, but you can still export.</Caption>
            )}
            <button className="destructive-row" onClick={clearForm}>Clear form</button>
          </>)}
        </div>

        {/* preview */}
        <div role="region" aria-label="Preview" className={previewFullscreen ? "" : "p-5 app-panel editor-preview"} style={previewFullscreen
          ? { position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", background: UI.wash, viewTransitionName: "preview-panel" }
          : { flex: "1 1 460px", minWidth: 360, viewTransitionName: "preview-panel" }}>
          <div className={previewFullscreen ? undefined : "preview-body"} style={previewFullscreen
            ? { flex: 1, minHeight: 0, overflow: "auto", padding: "24px clamp(16px, 5vw, 72px)", viewTransitionName: "preview-doc" }
            : { viewTransitionName: "preview-doc" }}>
            <PagedPreview ref={previewRef} css={PREVIEW_CSS} fullscreen={previewFullscreen} theme={theme}
              zoom={previewZoom} onScale={setPreviewScale}
              pageClass={showPrinted ? "doc-preview" : "doc-preview themed"}
              html={docBody || `<p class="soft">Start on the left. The document builds itself here.</p>`} />
          </div>
          {/* controls along the bottom: buttons on the left, zoom in the middle */}
          <div className="preview-bar" style={previewFullscreen
            ? { background: UI.paper, borderTop: `1px solid ${UI.line}`, padding: "10px 20px", marginTop: 0 } : undefined}>
            <div className="icon-group">
              {theme !== "light" && (
                <button type="button" className="icon-button" onClick={() => changeLook(() => setShowPrinted((on) => !on))} aria-pressed={showPrinted}
                  aria-label="Show as printed" title={showPrinted ? "Back to the themed preview" : "Show as printed (exports always print on white)"}>
                  <Printer size={16} />
                </button>
              )}
              <button type="button" className="icon-button" onClick={() => setShowTextKeybinds(true)}
                aria-label="Text keybinds" title="Text formatting keybinds">
                <Keyboard size={16} />
              </button>
              <button type="button" className="icon-button" onClick={() => toggleFullscreen()} aria-pressed={previewFullscreen}
                aria-label={previewFullscreen ? "Exit fullscreen preview" : "Fullscreen preview"}
                title={previewFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen preview"}>
                {previewFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
            <div className="icon-group zoom-control">
              <input type="range" className="zoom-slider" min={50} max={200} step={5} aria-label="Zoom"
                value={Math.round(previewScale * 100)} onChange={(e) => setPreviewZoom(Number(e.target.value) / 100)}
                style={{ "--fill": `${Math.max(0, Math.min(100, ((previewScale * 100 - 50) / 150) * 100))}%` }} />
              <button type="button" className="zoom-level" onClick={() => setPreviewZoom(null)} aria-pressed={previewZoom === null}
                title={previewZoom === null ? "Fit to width" : "Back to fit to width"}>
                {Math.round(previewScale * 100)}%
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// tab title
function H({ children }) {
  return <div className="page-title">{children}</div>;
}

function ReviewPanel({ groups, onJump }) {
  const has = (v) => v && String(v).trim();
  // Rich-text fields arrive as HTML; show their text, keeping line breaks.
  const plain = (v) => {
    if (!v) return "";
    const temp = document.createElement("div");
    temp.innerHTML = normalizeRichHtml(v);
    return temp.textContent || "";
  };
  const missing = groups.flatMap((g) => g.rows).filter((r) => r.required && !has(r.value)).length;

  return (<>
    <div className="total-row" role="status">
      <span>Required items</span>
      <span className={missing ? "is-warn" : "is-good"}>
        {missing ? `${missing} missing` : "All filled"}
        {missing ? <AlertTriangle size={14} aria-hidden="true" /> : <Check size={15} strokeWidth={2.5} aria-hidden="true" />}
      </span>
    </div>
    {groups.map((g) => (
      <div key={g.title}>
        <div className="section-title">{g.title}</div>
        <div className="group-box summary-group">
          {g.rows.map((r) => {
            const filled = has(r.value);
            return (
              <button key={r.label} type="button" className="summary-row" onClick={() => onJump(r.tab)}>
                <span className="summary-label">{r.label}</span>
                <span className={`summary-value${filled ? "" : r.required ? " is-missing" : " is-empty"}`}>
                  {filled ? plain(r.value) : r.required ? "Not entered" : "Optional"}
                </span>
                {!filled && r.required
                  ? <span className="item-go" style={{ opacity: 1 }}>Fix<ChevronRight size={13} aria-hidden="true" /></span>
                  : <ChevronRight size={15} aria-hidden="true" className="summary-chevron" />}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </>);
}
