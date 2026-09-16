# TDS Field Guide: project rules

A website for students who are about to take **Tools in Data Science (TDS)** at IIT Madras BS.
It is not a solver and not an answer dump. Live at https://angadseth.github.io/tds-field-guide/

Read `PROJECT-LOG.md` before touching anything. It records what was done, what was decided, and what is still open.
Add to it as you work, not at the end.

## Rules Angad set (2026-09-16)

1. **Audience = newcomers.** Keep it non-technical. They want to know what to expect and how to handle a GA,
   not how to write a FastAPI server. If a sentence needs a programmer to understand it, rewrite it.
2. **Language = simple English, the tone of a friendly senior.** No Hinglish on the site (students from all
   over India read it). Chat replies to Angad stay in roman Hinglish.
3. **Guides AND solvers, with source code** (changed 2026-09-16, Angad + Bharat). Link Bharat's (github.com/HypeMonk)
   and Angad's (github.com/angadseth) GitHub, their guides, solutions and solvers, plus GT Indian's TDS Portal Solver
   with its source. Every solver entry gets a warning that it was built for last term's questions. Open every link
   before adding it.
4. **"Everything is allowed except in the End Term"** is a headline message (the ink slab under the hero). Keep the
   boundary line with it: hack the questions, not people or IITM's other systems.
   **End Term:** official rules + the May 2026 pattern from Bharat's ET prep site, attributed to it.
   **GA0 is a self-check, not a gate** (Angad + Bharat): skipping or a low score does not stop anyone continuing.
5. **Design is ours, not AI-default.** "Senior's notebook": graph paper, ink, yellow highlighter on key numbers,
   red pen for mistakes, handwritten margin notes (Kalam). No purple gradients, glass cards, emoji-heavy cards,
   or generic hero-with-three-feature-cards layout.
6. **Every fact needs a source.** Numbers (weights, dates, eligibility) come from the official course page or
   the grading document. See `docs/sources.md`. If a fact cannot be checked, say "last term" or leave it out.
7. **Never publish secrets.** Angad's TDS memory has API keys and tokens. None of it goes anywhere near this repo.

## Stack

Plain HTML + CSS + JS. No build step. GitHub Pages serves the `main` branch root.

- `index.html`: the whole handbook (12 chapters)
- `assets/style.css`: tokens, layout, light and dark themes
- `assets/app.js`: chapter index highlight, marks calculator, doubts search, theme toggle
- `tests/check.mjs`: Playwright check (desktop + mobile, both themes: overflow, console errors, calculator maths, links)

## Verify before saying done

Run `node tests/check.mjs` against the local server AND the live URL. Look at the screenshots.
