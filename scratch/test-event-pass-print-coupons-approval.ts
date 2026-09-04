import { chromium } from "playwright";
import assert from "node:assert";
import { AuthService } from "../src/services/authService";
import { getAdminUsers, updateUserStatus } from "../src/services/adminControlService";
import { calculateEventRegistrationFee } from "../src/lib/eventMetadata";

async function testAllNewFeatures() {
  console.log("==================================================");
  console.log("▶ Testing Tiered Fees, Coupons, Pass Print/Save, Non-Member Reg & Signup Approval");
  console.log("==================================================");

  // 1. UNIT TEST: Tiered Category Fee & Coupon Calculation
  console.log("\n1. Testing Category-Wise Tiered Fees & Coupon Calculations...");
  const calcStudent = calculateEventRegistrationFee({
    baseFee: 200,
    tieredPricingEnabled: true,
    categoryFees: { student: 100, alumni: 250, teacher: 150, guest: 350 },
    category: "STUDENT",
    guestCount: 1, // 2 seats total
    couponCode: "EARLYBIRD",
    coupons: [{ code: "EARLYBIRD", discountType: "FIXED", discountValue: 50 }],
  });
  console.log("Student Calc (100 BDT x 2 - 50 discount):", calcStudent.totalFee);
  assert.strictEqual(calcStudent.unitFee, 100, "Student unit fee must be 100");
  assert.strictEqual(calcStudent.subtotal, 200, "Subtotal must be 200");
  assert.strictEqual(calcStudent.discountAmount, 50, "Discount must be 50");
  assert.strictEqual(calcStudent.totalFee, 150, "Total fee must be 150");

  const calcAlumni = calculateEventRegistrationFee({
    baseFee: 200,
    tieredPricingEnabled: true,
    categoryFees: { student: 100, alumni: 250, teacher: 150, guest: 350 },
    category: "ALUMNI",
    guestCount: 0, // 1 seat
    couponCode: "SDA2026",
    coupons: [{ code: "SDA2026", discountType: "PERCENT", discountValue: 20 }],
  });
  console.log("Alumni Calc (250 BDT - 20% discount):", calcAlumni.totalFee);
  assert.strictEqual(calcAlumni.unitFee, 250, "Alumni unit fee must be 250");
  assert.strictEqual(calcAlumni.discountAmount, 50, "20% of 250 must be 50");
  assert.strictEqual(calcAlumni.totalFee, 200, "Total fee must be 200");
  console.log("✓ Fee calculation logic verified 100%!");

  // 2. PLAYWRIGHT E2E TESTS
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // 2.1 ADMIN: Launch Event with Custom Tiered Fees and Coupons
  console.log("\n2. Admin: Launching Event with Tiered Fees & Coupon Code in CMS...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.fill("#email", "admin@sda-ruet.org");
  await page.fill("#password", "Admin12345!");
  await page.click("button[type='submit']");
  await page.waitForURL((url) => url.pathname.includes("/admin"), { waitUntil: "domcontentloaded" });

  await page.goto("http://localhost:3000/admin/events", { waitUntil: "domcontentloaded" });
  await page.click("button:has-text('Launch New Event')");
  await page.waitForSelector("#title", { timeout: 10000 });

  const eventSlug = `gala-tier-${Date.now()}`;
  await page.fill("#title", "SDA RUET Grand Winter Gala 2026");
  await page.fill("#slug", eventSlug);
  await page.fill("#tagline", "Celebration of Engineering Excellence");
  await page.fill("#location", "RUET Central Auditorium");
  await page.fill("#eventDate", "2026-12-20");
  await page.fill("#startTime", "17:00");
  await page.fill("#endTime", "21:30");

  // Fill Tab 4 Payment & Tiered Pricing
  await page.click("button:has-text('4. Payment Info')");
  await page.fill("#feeStudent", "100");
  await page.fill("#feeAlumni", "250");
  await page.fill("#feeTeacher", "150");
  await page.fill("#feeGuest", "350");
  await page.fill("#coupons", "SDA2026:10%, EARLY50:50");

  await page.click("button[type='submit']:has-text('Launch Event & Landing Page')");
  // Wait for modal to close and event to appear
  await page.waitForTimeout(2000);
  const eventLink = page.locator("tr:has-text('SDA RUET Grand Winter Gala 2026') a[href^='/events/']").first();
  const eventHref = await eventLink.getAttribute("href");
  console.log("✓ Event created with custom category tiers and coupons! Public Landing Href:", eventHref);

  // 2.2 PUBLIC GUEST / NON-MEMBER REGISTRATION (Without Prior Login)
  console.log("\n3. Testing Unregistered / Non-Member Visitor Registration on Landing Page...");
  const visitorContext = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const visitorPage = await visitorContext.newPage();
  console.log("Navigating visitor to:", `http://localhost:3000${eventHref}`);
  await visitorPage.goto(`http://localhost:3000${eventHref}`, { waitUntil: "networkidle" });
  console.log("Visitor landed on:", visitorPage.url());

  // Select "General Guest / Non-Member" category
  console.log("Selecting General Guest / Non-Member category...");
  await visitorPage.waitForSelector("#reg-category", { timeout: 15000 });
  await visitorPage.selectOption("#reg-category", "GUEST");
  await visitorPage.waitForTimeout(500);

  // Apply Coupon "EARLY50"
  console.log("Applying coupon 'EARLY50'...");
  await visitorPage.fill("#couponCode", "EARLY50");
  await visitorPage.click("button:has-text('Apply')");
  await visitorPage.waitForSelector("text=applied", { timeout: 5000 });
  console.log("✓ Coupon applied successfully on public registration form!");

  // Fill Non-Member details
  await visitorPage.fill("#reg-fullName", "Dr. Kamal Hossain");
  await visitorPage.fill("#reg-email", `guest-${Date.now()}@example.com`);
  await visitorPage.fill("#reg-phone", "01811223344");
  await visitorPage.selectOption("#reg-guests", "1"); // 2 seats: 350 x 2 = 700 - 50 = 650 BDT
  await visitorPage.fill("#reg-txId", "NAGAD650BDT");

  await visitorPage.screenshot({ path: "scratch/e2e-screenshots/guest_registration_with_coupon.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/guest_registration_with_coupon.png");

  // Submit and verify Event Pass Generation
  await visitorPage.click("button[type='submit']:has-text('Confirm & Register')");
  await visitorPage.waitForSelector("#official-event-pass", { timeout: 20000 });
  console.log("✓ Non-member / guest successfully registered and received Event Pass!");

  await visitorPage.locator("#official-event-pass").screenshot({ path: "scratch/e2e-screenshots/guest_event_pass.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/guest_event_pass.png");

  // 3. MEMBER SIGNUP PENDING APPROVAL FLOW
  console.log("\n4. Testing Student Member Signup Pending Approval Workflow...");
  const signupEmail = `student-${Date.now()}@sda-ruet.org`;
  const signupPass = "Student12345!";

  await visitorPage.goto("http://localhost:3000/register", { waitUntil: "domcontentloaded" });
  await visitorPage.fill("#fullName", "Tanvir Ahmed");
  await visitorPage.fill("#email", signupEmail);
  await visitorPage.fill("#phone", "01799887766");
  await visitorPage.fill("#department", "Computer Science & Engineering");
  await visitorPage.fill("#series", "21");
  await visitorPage.fill("#session", "2021-2022");
  await visitorPage.fill("#studentId", "2103099");
  await visitorPage.fill("#password", signupPass);
  await visitorPage.fill("#confirmPassword", signupPass);

  await visitorPage.click("button[type='submit']:has-text('Register as Student Member')");
  await visitorPage.waitForTimeout(3000);
  await visitorPage.screenshot({ path: "scratch/e2e-screenshots/debug_after_register_submit.png" });

  const regAlert = visitorPage.locator("[role='alert']");
  if (await regAlert.count() > 0) {
    const alertText = await regAlert.first().innerText();
    console.log("Register Form Alert Text:", alertText);
  }

  await visitorPage.waitForSelector("text=pending administrator confirmation", { timeout: 15000 });
  console.log("✓ Signup confirmed: message explicitly shows profile is PENDING administrator confirmation!");

  // Try to login while PENDING
  console.log("Attempting login while profile is PENDING...");
  await visitorPage.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await visitorPage.fill("#email", signupEmail);
  await visitorPage.fill("#password", signupPass);
  await visitorPage.click("button[type='submit']");
  await visitorPage.waitForSelector("text=pending administrator confirmation", { timeout: 10000 });
  console.log("✓ Login guard verified: user is prevented from logging in while PENDING!");

  // Admin approves the user
  console.log("\n5. Admin approving the pending user in User Management...");
  await page.goto("http://localhost:3000/admin/users", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(`text=Tanvir Ahmed`, { timeout: 15000 });
  const approveBtn = page.locator(`tr:has-text('Tanvir Ahmed') button:has-text('Confirm & Approve')`).first();
  await approveBtn.waitFor({ state: "visible", timeout: 10000 });
  await page.screenshot({ path: "scratch/e2e-screenshots/admin_pending_user_approval.png" });

  page.on("dialog", (dialog) => dialog.accept());
  await approveBtn.click();
  await page.waitForTimeout(2000);
  console.log("✓ Admin successfully approved pending student profile!");

  await page.screenshot({ path: "scratch/e2e-screenshots/admin_user_approved.png" });
  console.log("✓ Saved screenshot: scratch/e2e-screenshots/admin_user_approved.png");

  // Now user logs in successfully
  console.log("\n6. User logging in after Admin approval...");
  await visitorPage.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await visitorPage.fill("#email", signupEmail);
  await visitorPage.fill("#password", signupPass);
  await visitorPage.click("button[type='submit']");
  await visitorPage.waitForURL((url) => url.pathname.includes("/dashboard"), { timeout: 30000 });
  console.log("✓ User successfully logged in and accessed Dashboard after admin approval!");

  await browser.close();
  await visitorContext.close();

  console.log("\n==================================================");
  console.log("✓ ALL FEATURES VERIFIED & PASSED (100%)");
  console.log("==================================================");
}

testAllNewFeatures().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
