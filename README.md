# TDS Field Guide

**Live: https://angadseth.github.io/tds-field-guide/**

A senior's guide for students about to take **Tools in Data Science** (IIT Madras BS, BSSE2002):
what the course is, how it differs from other courses, what you'll learn, the skills to have first,
GA0 and end-term eligibility, how to do a GA, the ROE (and staying safe), projects, the end term,
what changed in the May 2026 term, links, and common doubts.

It includes a readiness checklist, an eligibility check and a marks calculator. Nothing you type
leaves your browser.

**This is not an official course page.** Facts come from the May 2026 course site
(tds.s-anand.net), the May 2026 grading document and the course faculty's blog. Every source is
listed in [`docs/sources.md`](docs/sources.md). When this page and the official page disagree, the
official page wins.

No answers, no solvers. Only approach guides.

Found something wrong or out of date? [Open an issue](https://github.com/angadseth/tds-field-guide/issues).

## Working on it

Plain HTML, CSS and JS. No build step.

```bash
python -m http.server 8765          # serve locally
cd tests && npm install
node check.mjs                      # layout, themes, calculator maths, links
node check.mjs https://angadseth.github.io/tds-field-guide/
```

Made by Angad Jangir · IIT Madras BS
