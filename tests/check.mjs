// Browser check for the TDS Field Guide.
//   node tests/check.mjs                      -> http://localhost:8765/
//   node tests/check.mjs https://angadseth.github.io/tds-field-guide/
// Desktop + phone, light + dark: no sideways scroll, no console errors, screenshots.
// Then the interactive parts are driven and their numbers asserted.
import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] || "http://localhost:8765/";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${msg}`);
  if (!cond) failures++;
};

const browser = await chromium.launch();

const setups = [
  { name: "desktop-light", ctx: { viewport: { width: 1440, height: 900 }, colorScheme: "light" } },
  { name: "desktop-dark", ctx: { viewport: { width: 1440, height: 900 }, colorScheme: "dark" } },
  { name: "laptop-1280", ctx: { viewport: { width: 1280, height: 800 }, colorScheme: "light" } },
  { name: "tablet-820", ctx: { viewport: { width: 820, height: 1180 }, colorScheme: "light" } },
  { name: "phone-light", ctx: { ...devices["iPhone 13"], colorScheme: "light" } },
  { name: "phone-dark", ctx: { ...devices["iPhone 13"], colorScheme: "dark" } },
  { name: "phone-360", ctx: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, colorScheme: "light" } },
];

for (const s of setups) {
  console.log(`\n[${s.name}]`);
  const ctx = await browser.newContext(s.ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("requestfailed", (r) => errors.push(`request failed: ${r.url()} ${r.failure()?.errorText}`));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const overflow = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      // things inside a horizontal scroller are allowed to be wider
      if (el.closest(".term__scroll, .ledger-wrap, .skip")) continue;
      if (r.right > W + 1 || r.left < -1) bad.push(`${el.tagName.toLowerCase()}.${el.className} (${Math.round(r.left)}..${Math.round(r.right)})`);
    }
    return { scroll: document.documentElement.scrollWidth, W, bad: bad.slice(0, 8) };
  });
  ok(overflow.scroll <= overflow.W, `no sideways page scroll (scrollWidth ${overflow.scroll}, viewport ${overflow.W})`);
  ok(overflow.bad.length === 0, `no element sticks out of the viewport ${overflow.bad.length ? overflow.bad.join(", ") : ""}`);

  const fontsOk = await page.evaluate(() => ["Archivo", "IBM Plex Sans", "Kalam"].map((f) => [f, document.fonts.check(`16px "${f}"`)]));
  ok(fontsOk.every(([, v]) => v), `web fonts loaded ${JSON.stringify(fontsOk)}`);

  const rows = await page.locator("#gantt .gantt__row").count();
  ok(rows === 13, `term chart has 13 rows (got ${rows})`);

  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  ok(s.ctx.colorScheme === "dark" ? bg === "rgb(19, 21, 25)" : bg === "rgb(246, 246, 241)", `theme background matches colour scheme (${bg})`);

  await page.screenshot({ path: path.join(SHOTS, `${s.name}-top.png`) });
  await page.screenshot({ path: path.join(SHOTS, `${s.name}-full.png`), fullPage: true });

  ok(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors.slice(0, 5)) : ""}`);
  await ctx.close();
}

/* ---------- behaviour ---------- */
console.log("\n[behaviour]");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });

  // eligibility widget in chapter 05
  const elig = (i) => page.locator(`[data-elig="${i}"]`);
  await elig(0).fill("50");
  await elig(1).fill("30");
  await elig(2).fill("40");
  ok((await page.locator("#eligOut").innerText()).toLowerCase().includes("need 1 more"), "3 scores -> asks for 1 more");
  await elig(3).fill("20");
  let t = await page.locator("#eligOut").innerText();
  ok(/not eligible/i.test(t) && t.includes("35"), `50,30,40,20 -> not eligible, average 35 (${t.replace(/\s+/g, " ")})`);
  await elig(4).fill("80");
  t = await page.locator("#eligOut").innerText();
  ok(/^eligible/i.test(t.trim()) && t.includes("50"), `+80 -> best 4 = 80,50,40,30 -> eligible, 50 (${t.replace(/\s+/g, " ")})`);
  ok((await page.locator('[data-ga="0"]').inputValue()) === "50", "chapter 05 scores also appear in the calculator");

  // calculator in chapter 09
  const gas = [80, 70, 60, 50, 40, 90, 100, 0, 10];
  for (let i = 0; i < 9; i++) await page.locator(`[data-ga="${i}"]`).fill(String(gas[i]));
  await page.locator('[data-part="roe"]').fill("50");
  await page.locator('[data-part="p1"]').fill("60");
  await page.locator('[data-part="p2"]').fill("70");
  const ga = await page.locator("#oGa").innerText();
  ok(ga.startsWith("70"), `best 7 of 9 = (100+90+80+70+60+50+40)/7 = 70 (${ga.split("\n")[0]})`);
  let T = await page.locator("#oT").innerText();
  ok(T.startsWith("50") && T.includes("D"), `T without ET = 0.2*(70+50+60+70) = 50, band D (${T.replace(/\s+/g, " ")})`);
  ok((await page.locator("#oNeed").innerText()).includes("past 40"), "already past 40 -> says so, and that ET is still required");
  await page.locator('[data-part="et"]').fill("30");
  T = await page.locator("#oT").innerText();
  ok(T.startsWith("56"), `with ET 30 -> T = 56 (${T.split("\n")[0]})`);
  ok((await page.locator("#oNeed").innerText()) === "", "need-message disappears once ET is entered");
  const e2 = await page.locator("#oElig").innerText();
  ok(/^eligible/i.test(e2.trim()), `calculator eligibility uses GA0..GA4 = 80,70,60,50,40 -> eligible (${e2.replace(/\s+/g, " ")})`);

  await page.locator('[data-part="et"]').fill("");
  await page.locator('[data-part="roe"]').fill("0");
  await page.locator('[data-part="p1"]').fill("0");
  await page.locator('[data-part="p2"]').fill("0");
  ok((await page.locator("#oNeed").innerText()).includes("even 100"), "impossible target is explained, not shown as a number");

  await page.locator('[data-ga="0"]').fill("150");
  await page.locator('[data-ga="0"]').blur();
  ok((await page.locator('[data-ga="0"]').inputValue()) === "100", "a score above 100 is clamped to 100");

  // persistence
  await page.reload({ waitUntil: "networkidle" });
  ok((await page.locator('[data-ga="6"]').inputValue()) === "100", "scores survive a reload");
  await page.locator("#calcClear").click();
  ok((await page.locator('[data-ga="6"]').inputValue()) === "" && (await page.locator('[data-elig="0"]').inputValue()) === "", "Clear empties both widgets");

  // readiness checklist
  const boxes = page.locator("#readiness input[type=checkbox]");
  for (let i = 0; i < 3; i++) await boxes.nth(i).check();
  ok((await page.locator("#readyVerdict").innerText()).includes("later term"), "3 of 10 -> suggests a later term");
  for (let i = 3; i < 10; i++) await boxes.nth(i).check();
  ok((await page.locator("#readyCount").textContent()) === "10 of 10", "counter reaches 10 of 10");

  // doubts search + chips
  const total = await page.locator("#faq details").count();
  await page.locator("#faqSearch").fill("save");
  const visibleSave = await page.locator("#faq details:not([hidden])").count();
  ok(visibleSave > 0 && visibleSave < total, `search 'save' narrows ${total} -> ${visibleSave}`);
  await page.locator("#faqSearch").fill("zzqx");
  ok(await page.locator("#faqEmpty").isVisible(), "no match shows the empty message");
  await page.locator("#faqSearch").fill("");
  await page.locator('.chip[data-cat="exam"]').click();
  const exam = await page.locator("#faq details:not([hidden])").count();
  const examExpected = await page.locator('#faq details[data-cat="exam"]').count();
  ok(exam === examExpected && exam > 0, `Exams chip shows only exam doubts (${exam})`);

  // theme toggle
  await page.locator("#theme").click();
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === "light", "theme: auto -> light");
  await page.locator("#theme").click();
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === "dark", "theme: light -> dark");
  await page.reload({ waitUntil: "networkidle" });
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === "dark", "theme choice survives reload");
  await page.locator("#theme").click();
  ok((await page.evaluate(() => document.documentElement.dataset.theme)) === undefined, "theme: dark -> auto");

  // every in-page link lands on something
  const anchors = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")))]);
  const missing = await page.evaluate((hs) => hs.filter((h) => h !== "#" && !document.getElementById(h.slice(1))), anchors);
  ok(missing.length === 0, `all ${anchors.length} in-page links have targets ${missing.join(" ")}`);

  // storage blocked: page must still work
  const ctx2 = await browser.newContext();
  await ctx2.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });
  });
  const p2 = await ctx2.newPage();
  const errs = [];
  p2.on("pageerror", (e) => errs.push(String(e)));
  await p2.goto(BASE, { waitUntil: "networkidle" });
  await p2.locator('[data-elig="0"]').fill("90");
  ok(errs.length === 0 && (await p2.locator("#gantt .gantt__row").count()) === 13, `works with storage blocked ${errs.join(" ")}`);
  await ctx2.close();

  // external links answer
  const ext = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="http"]')].map((a) => a.href))]);
  const bad = [];
  await Promise.all(ext.map(async (u) => {
    try {
      const r = await fetch(u, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 tds-field-guide link check" } });
      if (r.status >= 400) bad.push(`${r.status} ${u}`);
    } catch (e) { bad.push(`ERR ${u}`); }
  }));
  // Discourse needs a login and the GitHub repo may not exist before the first push.
  const expected = (b) => /discourse\.onlinedegree|tds-field-guide/.test(b);
  const real = bad.filter((b) => !expected(b));
  console.log(`  info  ${ext.length} external links; login-only / not-yet-published: ${bad.filter(expected).join(", ") || "none"}`);
  ok(real.length === 0, `external links respond ${real.join(", ")}`);

  await ctx.close();
}

await browser.close();
console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
