// Renders the link-preview image (assets/og.png, 1200x630) from the live page's own hero.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
const BASE = process.argv[2] || "http://localhost:8765/";
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1200, height: 630 }, colorScheme: "light" })).newPage();
await pg.goto(BASE, { waitUntil: "networkidle" });
await pg.evaluate(() => document.fonts.ready);
await pg.addStyleTag({ content: `
  .topbar, .disclaimer, .lede, .term, .book, .foot, .hero__note .hand { display: none !important; }
  .hero { padding: 84px 64px 0; max-width: none; }
  .hero__grid { grid-template-columns: 1.35fr 1fr !important; gap: 48px !important; align-items: center !important; }
  .hero h1 { font-size: 5.3rem; margin-bottom: 0; }
  .og-url { position: fixed; left: 64px; bottom: 40px; font: 500 20px/1 var(--f-mono); color: var(--ink-2); letter-spacing: .02em; }
  .og-url b { color: var(--ink); font-weight: 600; }
`});
await pg.evaluate(() => { const d = document.createElement("div"); d.className = "og-url"; d.innerHTML = "angadseth.github.io/<b>tds-field-guide</b>"; document.body.appendChild(d); });
await pg.screenshot({ path: fileURLToPath(new URL("../assets/og.png", import.meta.url)) });
await b.close(); console.log("assets/og.png written");
