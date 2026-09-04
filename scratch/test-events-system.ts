import { chromium } from "playwright";
import assert from "node:assert";

async function testEventsSystem() {
  console.log("==================================================");
  console.log("▶ Testing Events Section, CMS, Landing Pages & Registration");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // 1. Log in as Admin
  console.log("1. Logging in as Admin (http://localhost:3000/login)...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.fill("#email", "admin@sda-ruet.org");
  await page.fill("#password", "Admin12345!");
  await page.click("button[type='submit']");
  await page.waitForURL((url) => url.pathname.includes("/admin"), { timeout: 30000, waitUntil: "domcontentloaded" });
  console.log("✓ Logged in as Admin!");

  // 2. Check Header Navbar Navigation
  console.log("2. Checking navbar 'Events' navigation on frontend...");
  await page.goto("http://localhost:3000/events", { waitUntil: "domcontentloaded", timeout: 60000 });
  const eventsNavLink = page.locator("header nav a[href='/events']").first();
  await eventsNavLink.waitFor({ state: "visible", timeout: 15000 });
  console.log("✓ Found 'Events' link in desktop header navigation!");

  // 3. Navigate to Admin Events CMS
  console.log("3. Navigating to /admin/events...");
  await page.goto("http://localhost:3000/admin/events", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("button:has-text('Launch New Event')", { timeout: 30000 });

  const eventSlug = `gala-${Date.now()}`;
  const bannerUrl = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80";

  // 4. Open Launch New Event CMS Modal
  console.log("4. Opening Launch New Event CMS modal...");
  await page.click("button:has-text('Launch New Event')");
  await page.waitForSelector("#title", { timeout: 10000 });

  console.log("5. Filling out CMS details...");
  await page.fill("#title", "SDA RUET Grand Career Conclave & Alumni Gala 2026");
  await page.fill("#slug", eventSlug);
  await page.fill("#bannerImageUrl", bannerUrl);
  await page.fill("#location", "RUET Central Auditorium & Lawn");
  await page.fill("#eventDate", "2026-10-25");
  await page.fill("#startTime", "09:30");
  await page.fill("#endTime", "19:00");
  await page.fill("#feeAmount", "100");
  await page.fill("#maxParticipants", "200");
  await page.fill(
    "#description",
    "Join top industry leaders, distinguished alumni executives, and esteemed faculty for an intensive day of career mentorship, workshops, executive keynote panels, and celebratory feast."
  );

  await page.screenshot({ path: "scratch/e2e-screenshots/events_admin_cms_modal.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/events_admin_cms_modal.png");

  // 5. Submit Event Creation
  console.log("6. Submitting event CMS creation...");
  await page.click("button[type='submit']:has-text('Launch Event & Landing Page')");
  await page.waitForTimeout(3000);

  // 6. Verify in Public Events Catalog
  console.log("7. Checking public events catalog (/events)...");
  await page.goto("http://localhost:3000/events", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("h1", { timeout: 30000 });

  const eventCardTitle = page.locator("text=SDA RUET Grand Career Conclave & Alumni Gala 2026").first();
  await eventCardTitle.waitFor({ state: "visible", timeout: 15000 });
  console.log("✓ Event card is rendered on public /events catalog!");

  await page.screenshot({ path: "scratch/e2e-screenshots/events_public_catalog.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/events_public_catalog.png");

  // 7. Open Dedicated Event Landing Page
  console.log(`8. Navigating to event landing page (/events/${eventSlug})...`);
  await page.goto(`http://localhost:3000/events/${eventSlug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("h1", { timeout: 30000 });

  const headingText = await page.locator("h1").innerText();
  console.log("Landing Page Heading:", headingText);
  assert(headingText.includes("Grand Career Conclave"), "Heading must match event title");

  await page.screenshot({ path: "scratch/e2e-screenshots/events_landing_page_top.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/events_landing_page_top.png");

  // 8. Register on Landing Page
  console.log("9. Submitting registration form on the landing page...");
  await page.fill("#reg-phone", "01711223344");
  await page.fill("#reg-dept", "Electrical & Electronic Engineering");
  await page.fill("#reg-series", "19");
  await page.fill("#reg-studentId", "1901045");
  await page.selectOption("#reg-guests", "1");
  await page.selectOption("#reg-tshirt", "XL");
  await page.fill("#reg-txId", "BKASH998877");
  await page.fill("#reg-notes", "Looking forward to meeting senior alumni in power & semiconductor fields.");

  await page.screenshot({ path: "scratch/e2e-screenshots/events_registration_form_filled.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/events_registration_form_filled.png");

  await page.click("button[type='submit']:has-text('Confirm & Register')");
  await page.waitForSelector("text=Official Admission Pass", { timeout: 20000 });
  console.log("✓ Digital Admission Pass successfully generated on landing page!");

  await page.screenshot({ path: "scratch/e2e-screenshots/events_digital_admission_pass.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/events_digital_admission_pass.png");

  // 9. Verify in Admin Roster
  console.log("10. Checking admin attendee roster...");
  await page.goto("http://localhost:3000/admin/events", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.click(`a[href*='/admin/events/']:has-text('Roster')`);
  await page.waitForSelector("text=Registered Attendees", { timeout: 20000 });
  const rowCount = await page.locator("table tbody tr").count();
  console.log("Attendee rows in admin roster:", rowCount);
  assert(rowCount >= 1, "Admin roster should show at least 1 registered attendee");

  await page.screenshot({ path: "scratch/e2e-screenshots/events_admin_roster.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/events_admin_roster.png");

  await browser.close();
  console.log("\n==================================================");
  console.log("✓ ALL EVENTS SYSTEM TESTS PASSED (100%)");
  console.log("==================================================");
}

testEventsSystem().catch((err) => {
  console.error("Events system test failed:", err);
  process.exit(1);
});
