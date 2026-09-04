import { chromium } from "playwright";

async function inspectHome() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.screenshot({ path: "scratch/e2e-screenshots/inspect_home.png" });

  const html = await page.content();
  console.log("HTML length:", html.length);
  console.log("Has <header>:", html.includes("<header"));
  console.log("Snippet:", html.slice(0, 400));

  await browser.close();
}

inspectHome();
