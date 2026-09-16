// Look at the chapter index with a chapter active, in both themes. Also asserts the active title has
// nothing painted behind it and enough contrast against the page.
import { chromium } from "playwright";
const BASE = process.argv[2] || "http://localhost:8765/";
const b = await chromium.launch();
let bad = 0;
for (const scheme of ["dark", "light"]) {
  const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: scheme })).newPage();
  await pg.goto(BASE, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready);
  for (const id of ["different", "pre-skills"]) {
    await pg.evaluate((i) => document.getElementById(i).scrollIntoView({ behavior: "instant" }), id);
    await pg.waitForTimeout(900);
    const r = await pg.evaluate(() => {
      const a = document.querySelector('#toc a[aria-current="true"]');
      if (!a) return null;
      const b = a.querySelector("b"), cs = getComputedStyle(b), span = getComputedStyle(a.querySelector("span"));
      const rgb = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
      const lum = ([r, g, bl]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
      const fg = lum(rgb(cs.color)), bg = lum(rgb(getComputedStyle(document.body).backgroundColor));
      const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
      return { href: a.getAttribute("href"), bgImage: cs.backgroundImage, ratio: Math.round(ratio * 10) / 10, ring: span.borderTopColor };
    });
    const ok = r && r.href === "#" + id && r.bgImage === "none" && r.ratio >= 7 && r.ring !== "rgba(0, 0, 0, 0)";
    if (!ok) bad++;
    console.log(`  ${ok ? "PASS" : "FAIL"} ${scheme} #${id}: ${JSON.stringify(r)}`);
    await pg.locator(".toc").screenshot({ path: `shots/toc-${scheme}-${id}.png` });
  }
}
await b.close();
console.log(bad ? `${bad} FAILED` : "ALL PASSED"); process.exit(bad ? 1 : 0);
