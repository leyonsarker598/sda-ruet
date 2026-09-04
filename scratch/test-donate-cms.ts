import { chromium } from "playwright";
import { getDonatePageCms } from "../src/services/cmsService";

async function testDonatePageCms() {
  console.log("==================================================");
  console.log("▶ Testing Donate Page Customization via Website Content CMS");
  console.log("==================================================\n");

  // 1. Verify Service Defaults
  console.log("1. Verifying initial Donate CMS Data...");
  const initialCms = await getDonatePageCms();
  console.log("Initial Hero Headline:", initialCms.heroHeadline);
  console.log("Initial bKash Number:", initialCms.bkashNumber);

  // 2. Launch Browser to Test Admin CMS and Public /donate
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  try {
    // 2.1 Login as Administrator
    console.log("\n2. Logging in as Admin...");
    await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
    await page.fill("#email", "admin@sda-ruet.org");
    await page.fill("#password", "Admin12345!");
    await page.click("button[type='submit']");
    await page.waitForURL((url) => url.pathname.includes("/admin"), { waitUntil: "domcontentloaded" });
    console.log("✓ Logged in as Admin!");

    // 2.2 Go to Website Content CMS
    console.log("\n3. Navigating to Website Content CMS (/admin/content)...");
    await page.goto("http://localhost:3000/admin/content", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    console.log("Current Admin URL:", page.url());
    await page.screenshot({ path: "scratch/e2e-screenshots/debug_admin_content_nav.png" });
    await page.waitForSelector("h1:has-text('Website Content Management')", { timeout: 15000 });

    // 2.3 Switch to 'Donate & Welfare Page' Tab
    console.log("Selecting 'Donate & Welfare Page' tab...");
    const donateTab = page.locator("button:has-text('Donate & Welfare Page')");
    await donateTab.click();
    await page.waitForSelector("#heroHeadline", { timeout: 10000 });
    console.log("✓ 'Donate & Welfare Page' CMS tab opened!");

    // 2.4 Fill customized donation information
    const customHeadline = "SDA Welfare Fund & Emergency Student Aid 2026";
    const customBkash = "01712-345678";
    const customNagad = "01812-345678";
    const customRocket = "01912-345678-5";
    const customBankAcc = "2050998877665544";
    const customTransparency = "All donations are strictly audited by the SDA RUET Financial Advisory Board.";

    console.log("Filling updated donation details in CMS...");
    await page.fill("#heroHeadline", customHeadline);
    await page.fill("#bkashNumber", customBkash);
    await page.fill("#bkashReference", "SDA-EMERGENCY");
    await page.fill("#nagadNumber", customNagad);
    await page.fill("#rocketNumber", customRocket);
    await page.fill("#bankAccountNumber", customBankAcc);
    await page.fill("#transparencyNotice", customTransparency);

    await page.screenshot({ path: "scratch/e2e-screenshots/admin_donate_cms_editor.png" });
    console.log("✓ Saved screenshot: scratch/e2e-screenshots/admin_donate_cms_editor.png");

    // 2.5 Submit Form
    console.log("Submitting updated Donate CMS form...");
    await page.click("button[type='submit']:has-text('Save Donate Page CMS')");
    await page.waitForSelector("text=Donate page narratives and payment channels updated successfully", { timeout: 15000 });
    console.log("✓ CMS Form saved successfully with confirmation alert!");

    // 2.6 Visit public /donate page as a visitor
    console.log("\n4. Visiting public /donate page to verify live updates...");
    const visitorPage = await browser.newPage();
    await visitorPage.setViewportSize({ width: 1280, height: 900 });
    await visitorPage.goto("http://localhost:3000/donate", { waitUntil: "domcontentloaded" });

    // Verify updated elements on the live page
    await visitorPage.waitForSelector(`text=${customHeadline}`, { timeout: 10000 });
    await visitorPage.waitForSelector(`text=${customBkash}`, { timeout: 10000 });
    await visitorPage.waitForSelector(`text=${customNagad}`, { timeout: 10000 });
    await visitorPage.waitForSelector(`text=${customRocket}`, { timeout: 10000 });
    await visitorPage.waitForSelector(`text=${customBankAcc}`, { timeout: 10000 });
    await visitorPage.waitForSelector(`text=${customTransparency}`, { timeout: 10000 });

    await visitorPage.screenshot({ path: "scratch/e2e-screenshots/public_donate_page_customized.png", fullPage: true });
    console.log("✓ Saved screenshot: scratch/e2e-screenshots/public_donate_page_customized.png");

    console.log("\n==================================================");
    console.log("✓ DONATE PAGE CMS CUSTOMIZATION FULLY VERIFIED (100%)");
    console.log("==================================================");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testDonatePageCms();
