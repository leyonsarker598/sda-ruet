import { chromium } from "playwright";
import assert from "node:assert";

async function testEventPassAndCustomization() {
  console.log("==================================================");
  console.log("▶ Testing Event CMS Customization, Guidelines & Exact Event Pass Generator");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // 1. Log in as Admin
  console.log("1. Logging in as Admin...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.fill("#email", "admin@sda-ruet.org");
  await page.fill("#password", "Admin12345!");
  await page.click("button[type='submit']");
  await page.waitForURL((url) => url.pathname.includes("/admin"), { timeout: 30000, waitUntil: "domcontentloaded" });
  console.log("✓ Logged in as Admin!");

  // 2. Navigate to Admin Events CMS
  console.log("2. Navigating to /admin/events...");
  await page.goto("http://localhost:3000/admin/events", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("button:has-text('Launch New Event')", { timeout: 30000 });

  const eventSlug = `reunion-${Date.now()}`;
  const bannerUrl = "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80";

  // 3. Open Launch New Event CMS Modal
  console.log("3. Opening Launch New Event CMS modal...");
  await page.click("button:has-text('Launch New Event')");
  await page.waitForSelector("#title", { timeout: 10000 });

  // 4. Fill Tab 1: Basic & Schedule
  console.log("4. Filling Tab 1: Basic Info, Tagline, Banner link, and Schedule...");
  await page.fill("#title", "RUET ALUMNI REUNION 2026");
  await page.fill("#slug", eventSlug);
  await page.fill("#tagline", "A day to reconnect, remember, and celebrate");
  await page.fill("#bannerImageUrl", bannerUrl);
  await page.fill("#location", "Rajshahi University of Engineering & Technology");
  await page.fill("#eventDate", "2026-09-18");
  await page.fill("#startTime", "16:00");
  await page.fill("#endTime", "20:00");

  // Verify live image preview
  await page.waitForSelector("text=Live Banner Preview", { timeout: 5000 });
  console.log("✓ Live image preview rendered in CMS modal!");

  // 5. Fill Tab 2: Program Details with Rich Text Editor
  console.log("5. Filling Tab 2: Rich Program Details...");
  await page.click("button:has-text('2. Program Details')");
  await page.fill(
    "#description",
    "Welcome to the prestigious RUET Alumni Reunion 2026.\n\n### Highlights\n- Inspiring talks by industry leaders\n- Campus nostalgic memory walk\n- Gala feast & cultural musical night"
  );

  // 6. Fill Tab 3: Guidelines & Contacts
  console.log("6. Filling Tab 3: Custom Guidelines & Organizer Contacts...");
  await page.click("button:has-text('3. Guidelines & Contacts')");
  await page.fill(
    "#guidelines",
    "• Please present your Digital Admission Pass at the entrance.\n• Formal or traditional cultural attire is recommended.\n• Complimentary feast pass included with seat registration."
  );
  await page.fill("#contactName", "Reunion Organizing Council, SDA RUET");
  await page.fill("#contactPhone", "+880 1711-223344");
  await page.fill("#contactEmail", "reunion2026@sda-ruet.org");

  // 7. Fill Tab 4: Payment Info
  console.log("7. Filling Tab 4: Payment Customization...");
  await page.click("button:has-text('4. Payment Info')");
  await page.fill("#feeAmount", "150");
  await page.fill(
    "#paymentInstructions",
    "Please send 150 BDT per seat via bKash / Nagad to 01711-223344 (Reference: Reunion 26)."
  );

  // 8. Fill Tab 5: Form Customizer
  console.log("8. Filling Tab 5: Registration Form Customizer...");
  await page.click("button:has-text('5. Form Customizer')");
  await page.fill("#maxParticipants", "300");

  await page.screenshot({ path: "scratch/e2e-screenshots/cms_customizer_modal.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/cms_customizer_modal.png");

  // 9. Submit Creation
  console.log("9. Submitting customized event creation...");
  await page.click("button[type='submit']:has-text('Launch Event & Landing Page')");
  await page.waitForTimeout(3000);

  // 10. Navigate to Event Landing Page
  console.log(`10. Navigating to dedicated landing page (/events/${eventSlug})...`);
  await page.goto(`http://localhost:3000/events/${eventSlug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("h1", { timeout: 30000 });

  // Verify dynamic tagline and guidelines
  const taglineEl = page.locator("text=A day to reconnect, remember, and celebrate").first();
  await taglineEl.waitFor({ state: "visible", timeout: 10000 });
  console.log("✓ Dynamic Tagline verified on landing page hero!");

  const guidelinesEl = page.locator("text=Formal or traditional cultural attire").first();
  await guidelinesEl.waitFor({ state: "visible", timeout: 10000 });
  console.log("✓ Custom guidelines verified on landing page!");

  const contactsEl = page.locator("text=+880 1711-223344").first();
  await contactsEl.waitFor({ state: "visible", timeout: 10000 });
  console.log("✓ Custom organizer contact helpline verified on landing page!");

  await page.screenshot({ path: "scratch/e2e-screenshots/landing_page_customized.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/landing_page_customized.png");

  // 11. Fill out Customized Registration Form
  console.log("11. Filling out registration form on landing page...");
  await page.fill("#reg-fullName", "Md. Yeasir Arafat");
  await page.fill("#reg-phone", "01712345678");
  await page.selectOption("#reg-guests", "1");
  await page.fill("#reg-dept", "Computer Science & Engineering");
  await page.fill("#reg-series", "18");
  await page.fill("#reg-studentId", "1803001");
  await page.selectOption("#reg-tshirt", "XL");
  await page.fill("#reg-txId", "BKASH987654");

  await page.screenshot({ path: "scratch/e2e-screenshots/registration_form_filled_custom.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/registration_form_filled_custom.png");

  // 12. Submit Registration & Verify Exact Event Pass Generation
  console.log("12. Submitting registration to generate official event pass...");
  await page.click("button[type='submit']:has-text('Confirm & Register')");
  await page.waitForSelector("#official-event-pass", { timeout: 20000 });
  console.log("✓ Official Event Pass container (#official-event-pass) found on screen!");

  // Verify pass elements matching user's photo
  const passHeader = await page.locator("#official-event-pass").getByText("EVENT PASS").count();
  assert(passHeader > 0, "Pass must contain bold 'EVENT PASS' header");

  const passTitle = await page.locator("#official-event-pass").getByText("RUET ALUMNI REUNION 2026").count();
  assert(passTitle > 0, "Pass must contain event title 'RUET ALUMNI REUNION 2026'");

  const passDate = await page.locator("#official-event-pass").getByText("18 September 2026").count();
  assert(passDate > 0, "Pass must contain formatted date '18 September 2026'");

  const passLocation = await page.locator("#official-event-pass").getByText("Rajshahi University of Engineering").count();
  assert(passLocation > 0, "Pass must contain venue location");

  const printButton = page.locator("button:has-text('Print / Save Pass')").first();
  await printButton.waitFor({ state: "visible", timeout: 5000 });
  console.log("✓ 'Print / Save Pass (PDF)' button is active and ready!");

  await page.screenshot({ path: "scratch/e2e-screenshots/exact_event_pass_generated.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/exact_event_pass_generated.png");

  // Element screenshot of the exact pass card
  await page.locator("#official-event-pass").screenshot({ path: "scratch/e2e-screenshots/pass_card_isolated.png" });
  console.log("✓ Saved isolated pass card: scratch/e2e-screenshots/pass_card_isolated.png");

  await browser.close();
  console.log("\n==================================================");
  console.log("✓ ALL EVENT CMS & PASS GENERATOR TESTS PASSED (100%)");
  console.log("==================================================");
}

testEventPassAndCustomization().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
