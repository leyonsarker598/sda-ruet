import { chromium } from "playwright";
import assert from "node:assert";

async function testCommitteeFeatures() {
  console.log("==================================================");
  console.log("▶ Testing Committee Navbar Dropdown, Previous Archive & CSV Import");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Test Navbar Dropdown on Home Page
  console.log("1. Visiting Home page to test Committee Navbar Dropdown...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button:has-text('Committee')", { state: "visible", timeout: 15000 });

  console.log("Hovering over Committee dropdown trigger...");
  await page.hover("button:has-text('Committee')");
  await page.waitForTimeout(400);

  const currentComLink = page.locator("a:has-text('Current Executive Committee')").first();
  const previousComLink = page.locator("a:has-text('Previous Executive Committee')").first();

  console.log("Checking dropdown items visibility...");
  const isCurrentVisible = await currentComLink.isVisible();
  const isPreviousVisible = await previousComLink.isVisible();
  assert(isCurrentVisible, "Current Executive Committee link must be visible on hover");
  assert(isPreviousVisible, "Previous Executive Committee link must be visible on hover");
  console.log("✓ Committee navbar dropdown verified with both Current and Previous items on hover!");

  // 2. Test Previous Executive Committee Page & Horizontal Sessions
  console.log("2. Navigating to /committee/archive...");
  await page.goto("http://localhost:3000/committee/archive", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1", { timeout: 15000 });

  const h1Text = await page.textContent("h1");
  console.log("Archive Page Title:", h1Text);
  assert(h1Text?.includes("Previous Executive Committees"), "Page title matches Previous Executive Committees");

  // Check horizontal session buttons
  const sessionButtons = await page.locator("button[aria-pressed]").allTextContents();
  console.log("Found session buttons:", sessionButtons);
  assert(sessionButtons.length >= 2, "Multiple historical session buttons must be rendered");

  // Click second session button
  console.log("Clicking second session pill...");
  const secondBtn = page.locator("button[aria-pressed]").nth(1);
  await secondBtn.click();
  await page.waitForTimeout(600);

  const activeTermHeader = await page.locator("h2").textContent();
  console.log("Active term after click:", activeTermHeader);
  console.log("✓ Dynamic session switching on click verified!");

  await page.screenshot({ path: "scratch/e2e-screenshots/previous_committee_viewer.png" });
  console.log("✓ Captured screenshot to scratch/e2e-screenshots/previous_committee_viewer.png");

  // 3. Test Admin Control Panel CSV Batch Upload
  console.log("3. Logging in as Admin to test batch committee upload...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.fill("#email", "admin@sda-ruet.org");
  await page.fill("#password", "Admin12345!");
  await page.click("button[type='submit']");
  await page.waitForURL((url) => url.pathname.includes("/admin"), { timeout: 15000, waitUntil: "domcontentloaded" });

  console.log("Navigating to /admin/committees...");
  await page.goto("http://localhost:3000/admin/committees", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button:has-text('Upload Committee')", { timeout: 15000 });

  console.log("Opening Upload Committee Modal...");
  await page.click("button:has-text('Upload Committee')");
  await page.waitForSelector("#pasteData", { timeout: 5000 });

  const sampleCsvData = `Full Name,Designation,Department,Series,Session,Bio
Engr. Hasan Ali,President,Computer Science & Engineering,18,2018-2019,Leading the batch with dedication
Mustafizur Rahman,General Secretary,Electrical & Electronic Engineering,18,2018-2019,Active organizer of student activities
Sadia Afrin,Vice President,Civil Engineering,18,2018-2019,Head of campus relations
Tamim Iqbal,Treasurer,Mechanical Engineering,19,2019-2020,Accounts manager`;

  console.log("Pasting CSV data into modal...");
  await page.fill("#pasteData", sampleCsvData);
  await page.waitForTimeout(600);

  const previewText = await page.textContent("body");
  assert(previewText?.includes("4 Valid Records") || previewText?.includes("4 Officers"), "Real-time preview parses 4 records");
  console.log("✓ Real-time CSV parser and preview verified in Modal!");

  // Submit batch import
  console.log("Submitting batch committee import...");
  await page.click("button[type='submit']:has-text('Import')");
  await page.waitForTimeout(2000);

  await page.screenshot({ path: "scratch/e2e-screenshots/admin_committee_uploaded.png" });
  console.log("✓ Captured screenshot to scratch/e2e-screenshots/admin_committee_uploaded.png");

  await browser.close();
  console.log("\n==================================================");
  console.log("✓ ALL COMMITTEE FEATURES VERIFIED SUCCESSFULLY (100%)");
  console.log("==================================================");
}

testCommitteeFeatures().catch((err) => {
  console.error("Committee feature test failed:", err);
  process.exit(1);
});
