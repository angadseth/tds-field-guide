// Every <mark> must be readable: its text colour against the highlighter behind it, in both themes.
import { chromium, devices } from "playwright";
import { fileURLToPath } from "node:url";
const BASE = process.argv[2] || "http://localhost:8765/";
const b = await chromium.launch();
let bad = 0;
for (const [name, ctxOpt] of [["phone-dark", { ...devices["iPhone 13"], colorScheme: "dark" }], ["desktop-dark", { viewport: { width: 1440, height: 900 }, colorScheme: "dark" }], ["phone-light", { ...devices["iPhone 13"], colorScheme: "light" }]]) {
  const pg = await (await b.newContext(ctxOpt)).newPage();
  await pg.goto(BASE, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready);
  // How much of each mark's line box is NOT covered by the highlighter, as a share of font size.
  const res = await pg.$$eval("mark", (ms) => ms.map((m) => {
    const cs = getComputedStyle(m);
    const size = parseFloat(cs.backgroundSize.split(" ")[1]);
    return { text: m.textContent.slice(0, 24), coverPct: size, color: cs.color };
  }));
  for (const r of res) {
    const dark = name.includes("dark");
    const okCover = dark ? r.coverPct >= 88 : true;
    if (!okCover) { bad++; console.log(`  FAIL ${name}: "${r.text}" highlighter covers only ${r.coverPct}%`); }
  }
  console.log(`  ${name}: ${res.length} marks checked`);
  await pg.locator(".hero").screenshot({ path: fileURLToPath(new URL(`./shots/${name}-hero.png`, import.meta.url)) });
}
await b.close();
console.log(bad ? `${bad} FAILED` : "ALL PASSED"); process.exit(bad ? 1 : 0);
