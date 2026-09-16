# TDS Field Guide: project log

Newest entry at the top. Rules: `CLAUDE.md`. Sources for every fact: `docs/sources.md`.

---

## 2026-09-16: Project started

**Brief (Angad):** a website that helps newcomers to TDS understand the course. Sections he listed:
what TDS is · how it differs from other courses · topics/skills · pre-skills · GA0 eligibility + doubts ·
GA approach + links · ROE + security · projects · ET · what changed in May 2026 · last term resources · general doubts.
Push to GitHub, host on GitHub Pages. Make it really good. **No AI-looking design.**

**Follow-up:** keep it non-technical. Newcomers need to know how to handle a GA, not deep tech.

**Decisions (asked in one go, answered):**
- Language: simple English, friendly-senior tone.
- ROE "security": both the exam rules (open internet, non-proctored, personalised, Submit + Save) and keeping
  your own setup safe (keys, tokens, power, internet).
- Resources: Angad's approach-only guides + official links. **No solvers.** `Ga6-Guide` is out because it has direct answers.
- End Term: official info only.

**Design direction (mine, approved):** "senior's notebook": graph-paper ground, ink text, yellow highlighter
on the numbers that matter, red pen for common mistakes, handwritten margin notes. Hero = the term drawn as a
railway line (GA0 … ET with real dates). One long handbook with a chapter index. Marks calculator. Searchable doubts.

**Research done:** official site, grading doc, 13 exam bundles (question titles + marks), S Anand blog posts,
Angad's own GA/P1/P2/ROE notes. Discourse needs a login, so it was not used.

**Built (same day):**
- `index.html` (12 chapters), `assets/style.css`, `assets/app.js`, `assets/og.png` (1200x630 share card).
- Interactive: to-scale term chart (13 rows, 17-22 Jul crunch strip), readiness checklist (10 items),
  eligibility check (best 4 of GA0-GA4 >= 40), marks calculator (best 7 of 9, T formula, grade band,
  "ET needed for 40"), doubts search + category chips, Auto/Light/Dark theme. Storage wrapped in try/catch.
- Facts re-checked against the exam bundles' own config: GA0 = 25 questions (not 23), ROE May 2026 = 12.
  Dropped an unverifiable "labs were new" row. P1 overlaps five GAs (not four).
- `tests/check.mjs`: 7 viewports x themes (no sideways scroll, fonts, console errors) + behaviour
  (calculator maths, eligibility, persistence, storage blocked, FAQ filter, theme cycle, anchors, external links).
  **ALL PASSED locally.** Screenshots reviewed by eye: fixed highlighter gap before punctuation, margin notes
  leaking into the next chapter (clearfix), sticky FAQ bar eating phone screen, chart labels over the crunch line.
- Pushed to `angadseth/tds-field-guide` (public), Pages enabled from `main` root.

- **LIVE: https://angadseth.github.io/tds-field-guide/** — `check.mjs` ALL PASSED against the live URL
  (19 external links respond, share image 200).
- Bug found only by looking at the live phone-dark screenshot: the half-height highlighter left the top half of the
  dark headline letters on a dark page (unreadable). Fixed (full-height stroke in dark mode, less bleed so a trailing
  colon stays visible) and added `tests/darkmarks.mjs`. Commit `9e14d85`, re-verified live.

- Credit changed on Angad's request: footer + README now say **"Made by Bharat and Angad Jangir"** (full name added on request),
  checked live on desktop and phone-dark.

- Chapter index fix (Angad's screenshot): the active chapter used a yellow highlighter strip behind light text,
  unreadable in dark mode. Replaced with the chapter number circled in blue pen + bold title, nothing painted
  behind text. `tests/toc.mjs` asserts no background, contrast >= 7 and the ring showing, in both themes.

- **Content change requested by Angad + Bharat (same day), reverses two earlier decisions:**
  - GA0 is a *self-check, not a gate*: skip it or score low and you can still continue (ch05, hero note, FAQ, checklist verdict).
  - New ink slab under the hero: "In TDS, everything is allowed. Except in the End Term." (AI, copying, solvers,
    hacking the questions...). Added one boundary line: hack the questions, not people or IITM's other systems.
  - Resources now include solvers with source code (Angad's GA7 + GA8 solvers, GT Indian's TDS Portal Solver ->
    GyaanFlow/tds-roe-solver-t12026), Bharat's + Angad's GitHub, Bharat's TDS-P2, the P2 Evaluator
    (tds-p2-evaluator.onrender.com), and Bharat's ET prep site (hypemonk.github.io/tds-et-prep).
  - ET chapter: May 2026 pattern (80 marks / 90 min, 30 MCQ/MSQ = 39 + 9 written LLM-graded = 41, no negative),
    attributed to Bharat's ET prep notes.
  - Ch10: new "Offline evaluation" row (P1 half marks offline from agent logs, bot tested after deadline, P2 sections offline).
  - All new links opened first: every one returned 200, all solver source repos are public.

**Still open / not done:**
- Dates are the May 2026 term's. When the Sep 2026 course page publishes its schedule, update the chart (`ROWS` in
  `assets/app.js`), the GA table, ROE/ET dates and the "May 2026 edition" label.
- Discourse is login-only, so no student threads were used. The doubts come from official docs and Angad's notes.
- End term: official rules only, no paper pattern (Angad's choice).
- Grade bands (S 90 … E 40, U below 40) come from the BS handbook via search, not the TDS section of the grading doc.
  The page tells readers to confirm them.
- The WhatsApp link preview has not been tried in the real WhatsApp app (og tags + og.png are live).
