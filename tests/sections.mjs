// Screenshot each section separately so it can be looked at properly.
import { chromium, devices } from "playwright";
import fs from "node:fs";
const BASE = process.argv[2] || "http://localhost:8765/";
const only = process.argv[3]; // optional filter, e.g. "phone"
fs.mkdirSync("shots/sec", { recursive: true });
const b = await chromium.launch();
const setups = [
  ["d", { viewport: { width: 1440, height: 900 }, colorScheme: "light" }],
  ["dk", { viewport: { width: 1440, height: 900 }, colorScheme: "dark" }],
  ["p", { ...devices["iPhone 13"], colorScheme: "light" }],
];
for (const [n, c] of setups) {
  if (only && !only.split(",").includes(n)) continue;
  const ctx = await b.newContext(c); const pg = await ctx.newPage();
  await pg.goto(BASE, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready);
  const ids = ["term", ...(await pg.$$eval(".chapter", (s) => s.map((x) => x.id))), "foot"];
  for (const id of ids) {
    const loc = id === "term" ? pg.locator(".term") : id === "foot" ? pg.locator(".foot") : pg.locator("#" + id);
    await loc.screenshot({ path: `shots/sec/${n}-${id}.png` });
  }
  await ctx.close();
}
await b.close(); console.log("done");
