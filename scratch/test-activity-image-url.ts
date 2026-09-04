import { chromium } from "playwright";
import assert from "node:assert";

async function testActivityImageUrlField() {
  console.log("==================================================");
  console.log("▶ Testing Activity Creation with Image URL Field");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Log in as Admin
  console.log("1. Logging in as Admin...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.fill("#email", "admin@sda-ruet.org");
  await page.fill("#password", "Admin12345!");
  await page.click("button[type='submit']");
  await page.waitForURL((url) => url.pathname.includes("/admin"), { timeout: 15000, waitUntil: "domcontentloaded" });

  // 2. Navigate to Admin Activities Management
  console.log("2. Navigating to /admin/activities...");
  await page.goto("http://localhost:3000/admin/activities", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("button:has-text('Write New Story')", { timeout: 15000 });

  // 3. Open Create Activity Modal
  console.log("3. Opening 'Write New Story' modal...");
  await page.click("button:has-text('Write New Story')");
  await page.waitForSelector("#coverImageUrl", { timeout: 5000 });
  console.log("✓ Found #coverImageUrl field in the modal!");

  const slug = `reunion-fest-${Date.now()}`;
  const testImageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80";

  console.log("4. Filling out activity details with Image URL...");
  await page.fill("#title", "Grand Annual Reunion & Cultural Gala 2026");
  await page.fill("#slug", slug);
  await page.fill("#activityDate", "2026-09-15");
  await page.fill("#location", "RUET Central Auditorium, Kazla");
  await page.fill("#coverImageUrl", testImageUrl);
  await page.fill("#shortDescription", "A grand evening celebrating the timeless bond of Sirajganj engineers with musical performances, fellowship, and gala dinner.");
  await page.fill("#content", "The Grand Annual Reunion 2026 brought together hundreds of alumni, respected faculty members, and current undergraduate students from across the country for an unforgettable celebration of heritage, unity, and excellence.");
  await page.fill("#tags", "Reunion, Gala, Cultural, RUET");
  await page.check("input[name='isPublished']");

  await page.screenshot({ path: "scratch/e2e-screenshots/activity_modal_filled.png" });
  console.log("✓ Captured screenshot of filled modal: scratch/e2e-screenshots/activity_modal_filled.png");

  // 5. Submit Form
  console.log("5. Submitting activity...");
  await page.click("button[type='submit']:has-text('Save Activity')");
  await page.waitForTimeout(2000);

  // 6. Verify in Public Activities List
  console.log("6. Checking public activities catalog (/activities)...");
  await page.goto("http://localhost:3000/activities", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1", { timeout: 15000 });

  const cardWithImage = page.locator(`img[src='${testImageUrl}']`);
  const cardCount = await cardWithImage.count();
  console.log("Card image count on /activities:", cardCount);
  assert(cardCount > 0, "Activity card on /activities must display the cover image");

  await page.screenshot({ path: "scratch/e2e-screenshots/public_activities_with_image.png" });
  console.log("✓ Captured screenshot of public activities: scratch/e2e-screenshots/public_activities_with_image.png");

  // 7. Verify in Public Activity Single Detail Page
  console.log(`7. Checking single activity detail page (/activities/${slug})...`);
  await page.goto(`http://localhost:3000/activities/${slug}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("h1", { timeout: 15000 });

  const heroImage = page.locator(`img[src='${testImageUrl}']`);
  const heroCount = await heroImage.count();
  console.log("Hero banner image count on detail page:", heroCount);
  assert(heroCount > 0, "Activity detail page must display the hero banner image");

  await page.screenshot({ path: "scratch/e2e-screenshots/public_activity_detail_hero.png" });
  console.log("✓ Captured screenshot of activity detail hero: scratch/e2e-screenshots/public_activity_detail_hero.png");

  await browser.close();
  console.log("\n==================================================");
  console.log("✓ ACTIVITY IMAGE URL FIELD TEST PASSED (100%)");
  console.log("==================================================");
}

testActivityImageUrlField().catch((err) => {
  console.error("Activity image url test failed:", err);
  process.exit(1);
});
