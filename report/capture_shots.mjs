import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "assets");
const URL = "http://127.0.0.1:8765/";

const shots = [
  { name: "01_hero_triad", sel: "#triad", full: false, scrollTop: true },
  { name: "02_status_rules", sel: "#rules", pad: true },
  { name: "03_ma", sel: "#ma" },
  { name: "04_vix_margin", sel: "#margin" },
  { name: "05_fed", sel: "#fed-intent" },
  { name: "06_token", sel: "#token" },
  { name: "07_inventory", sel: "#inventory" },
  { name: "08_fms", sel: "#fms" },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500); // charts render

// Full page overview
await page.screenshot({
  path: path.join(OUT, "00_fullpage.png"),
  fullPage: true,
});

// Top viewport (hero + triad visible)
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({
  path: path.join(OUT, "01_top.png"),
  fullPage: false,
});

for (const s of shots.slice(1)) {
  const el = await page.$(s.sel);
  if (!el) {
    console.warn("missing", s.sel);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await el.screenshot({ path: path.join(OUT, `${s.name}.png`) });
  console.log("ok", s.name);
}

// Extra: inventory alone already covered; capture status table
const status = await page.$("#status");
if (status) {
  await status.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await status.screenshot({ path: path.join(OUT, "02b_status.png") });
}

await browser.close();
console.log("done →", OUT);
