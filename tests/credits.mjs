// Free AI credits: the corner ticket, the coupon dialog it opens, and the inline coupon in chapter 11.
//   node tests/credits.mjs [url]
import { chromium, devices } from "playwright";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] || "http://localhost:8765/";
const shot = (name) => fileURLToPath(new URL(`./shots/credits-${name}.png`, import.meta.url));
const GUIDE = "https://github.com/HypeMonk/ROE-hunt/blob/main/Free-credits.md";
const MORE = "https://github.com/HypeMonk/Free-Credits";

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? "  PASS" : "  FAIL"}  ${msg}`); if (!cond) failures++; };
const jump = (pg, sel) => pg.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "start", behavior: "instant" }), sel);
const settle = (pg) => pg.waitForTimeout(700);

const b = await chromium.launch();

for (const [name, opts] of [
  ["desktop-light", { viewport: { width: 1440, height: 900 }, colorScheme: "light" }],
  ["desktop-dark", { viewport: { width: 1440, height: 900 }, colorScheme: "dark" }],
  ["phone-dark", { ...devices["iPhone 13"], colorScheme: "dark" }],
  ["phone-light", { ...devices["iPhone 13"], colorScheme: "light" }],
]) {
  console.log(`\n[${name}]`);
  const ctx = await b.newContext(opts);
  const pg = await ctx.newPage();
  const errors = [];
  pg.on("pageerror", (e) => errors.push(String(e)));
  pg.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await pg.goto(BASE, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  await settle(pg);

  const state = () => pg.evaluate(() => {
    const t = document.getElementById("ticket");
    const r = t.getBoundingClientRect();
    return { hidden: t.hidden, away: t.classList.contains("is-away"), opacity: +getComputedStyle(t).opacity,
      inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight };
  });

  let s = await state();
  ok(!s.hidden && s.away, `on the first screen the ticket stays out of the way (${JSON.stringify(s)})`);

  await jump(pg, "#different"); await settle(pg);
  s = await state();
  ok(!s.away && s.opacity === 1 && s.inView, `after the hero it shows, fully inside the screen (${JSON.stringify(s)})`);
  await pg.screenshot({ path: shot(`${name}-ticket`) });

  await jump(pg, "#free-credits"); await settle(pg);
  s = await state();
  ok(s.away, "while the chapter 11 coupon is on screen, the ticket steps aside");
  await pg.locator("#resources .coupon").screenshot({ path: shot(`${name}-coupon`) });

  await jump(pg, "#ga"); await settle(pg);
  await pg.locator("#ticketOpen").click();
  ok(await pg.locator("#creditsDialog").evaluate((d) => d.open), "clicking the ticket opens the coupon dialog");
  const hrefs = await pg.locator("#creditsDialog a").evaluateAll((as) => as.map((a) => a.href));
  ok(hrefs.includes(GUIDE) && hrefs.includes(MORE), "dialog links to both of Bharat's guides");
  const same = await pg.evaluate(() => document.querySelector("#creditsDialog .coupon").textContent === document.querySelector("#resources .coupon").textContent);
  ok(same, "dialog coupon is identical to the chapter 11 coupon");
  await settle(pg);
  await pg.screenshot({ path: shot(`${name}-dialog`) });
  const fit = await pg.locator("#creditsDialog").evaluate((d) => { const r = d.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; });
  ok(fit, "dialog fits the screen width");
  await pg.keyboard.press("Escape");
  ok(!(await pg.locator("#creditsDialog").evaluate((d) => d.open)), "Escape closes it");

  await pg.locator("#ticketOpen").click();
  await pg.locator("#creditsClose").click();
  ok(!(await pg.locator("#creditsDialog").evaluate((d) => d.open)), "the close button closes it");

  await pg.locator("#ticketHide").click();
  ok((await state()).hidden, "the small x hides the ticket");
  await pg.reload({ waitUntil: "networkidle" }); await jump(pg, "#ga"); await settle(pg);
  ok((await state()).hidden, "and it stays hidden after a reload");

  const scroll = await pg.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  ok(scroll, "no sideways scroll");
  ok(errors.length === 0, `no console errors ${errors.join(" ")}`);
  await ctx.close();
}

// Storage blocked: the ticket must still open, and nothing may throw.
{
  console.log("\n[storage blocked]");
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } }));
  const pg = await ctx.newPage();
  const errors = [];
  pg.on("pageerror", (e) => errors.push(String(e)));
  await pg.goto(BASE, { waitUntil: "networkidle" });
  await jump(pg, "#ga"); await settle(pg);
  await pg.locator("#ticketOpen").click();
  ok(await pg.locator("#creditsDialog").evaluate((d) => d.open) && errors.length === 0, `ticket opens with storage blocked ${errors.join(" ")}`);
  await ctx.close();
}

await b.close();
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
