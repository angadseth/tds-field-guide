// Screenshots of the parts changed on 2026-09-16 (rule slab, GA0, ET, changes, resources).
// Chrome will not capture anything below ~16,000px of page, and this page is taller than that.
// So each section is scrolled to the top of a viewport tall enough to hold it, then clipped.
import { chromium, devices } from "playwright";
const BASE = process.argv[2] || "http://localhost:8765/";

async function shoot(pg, selector, file) {
  const vp = pg.viewportSize();
  const h = await pg.locator(selector).evaluate((el) => Math.ceil(el.getBoundingClientRect().height));
  await pg.setViewportSize({ width: vp.width, height: Math.min(h + 2, 7000) });
  const top = await pg.locator(selector).evaluate((el) => { el.scrollIntoView({ block: "start", behavior: "instant" }); return el.getBoundingClientRect().top; });
  await pg.waitForTimeout(150);
  await pg.screenshot({ path: file, clip: { x: 0, y: Math.max(0, top), width: vp.width, height: Math.min(h, 7000) } });
  await pg.setViewportSize(vp);
}

const b = await chromium.launch();
for (const [n, o] of [["d", { viewport: { width: 1440, height: 900 }, colorScheme: "light" }], ["dk", { viewport: { width: 1440, height: 900 }, colorScheme: "dark" }], ["p", { ...devices["iPhone 13"], colorScheme: "light" }], ["pdk", { ...devices["iPhone 13"], colorScheme: "dark" }]]) {
  const pg = await (await b.newContext(o)).newPage();
  await pg.goto(BASE, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready);
  await pg.addStyleTag({ content: "html{scroll-behavior:auto!important}.topbar,.faqtools{position:static!important}" });
  await shoot(pg, ".rule-slab", `shots/new-${n}-slab.png`);
  for (const id of ["ga0", "et", "changed", "resources"]) await shoot(pg, "#" + id, `shots/new-${n}-${id}.png`);
}
await b.close(); console.log("shots done");
