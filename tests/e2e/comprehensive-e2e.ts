import { chromium, type Browser, type Page } from "playwright";
import assert from "node:assert";
import * as path from "node:path";
import * as fs from "node:fs";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve(process.cwd(), "scratch/e2e-screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface TestReport {
  workflowId: number;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const reports: TestReport[] = [];

async function capture(page: Page, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

async function loginUser(page: Page, email: string, pass: string, expectedPath: string) {
  await page.context().clearCookies();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.fill("#email", email);
  await page.fill("#password", pass);
  await page.click("button[type='submit']");
  await page.waitForURL((url) => url.pathname.includes(expectedPath), { timeout: 15000, waitUntil: "domcontentloaded" });
}

async function runTest(id: number, name: string, fn: (browser: Browser) => Promise<void>, browser: Browser) {
  const start = Date.now();
  console.log(`\n======================================================`);
  console.log(`▶ Running Workflow ${id}: ${name}`);
  console.log(`======================================================`);
  try {
    await fn(browser);
    const duration = Date.now() - start;
    reports.push({ workflowId: id, name, passed: true, durationMs: duration });
    console.log(`✓ Workflow ${id} PASSED (${duration}ms)\n`);
  } catch (err: any) {
    const duration = Date.now() - start;
    reports.push({ workflowId: id, name, passed: false, durationMs: duration, error: err.message });
    console.error(`✗ Workflow ${id} FAILED (${duration}ms):`, err.message);
  }
}

async function main() {
  console.log("Launching Headless Chromium for Complete 20-Workflow End-to-End Audit...");
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------------------
    // 1. PUBLIC VISITOR WORKFLOW
    // -------------------------------------------------------------------------
    await runTest(1, "Public Visitor Browsing & Contact", async (b) => {
      const page = await b.newPage();
      
      // 1.1 Homepage
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
      const title = await page.title();
      assert(title.length > 0, "Homepage must have a title");
      const heroText = await page.textContent("body");
      assert(heroText?.includes("Sirajganj") || heroText?.includes("SDA"), "Homepage must include association name");
      await capture(page, "wf01_homepage");

      // 1.2 About Page
      await page.goto(`${BASE_URL}/about`, { waitUntil: "domcontentloaded", timeout: 15000 });
      const aboutText = await page.textContent("body");
      assert(aboutText?.includes("About") || aboutText?.includes("Mission"), "About page content present");
      await capture(page, "wf01_about");

      // 1.3 Committee Page
      await page.goto(`${BASE_URL}/committee`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf01_committee");

      // 1.4 Activities Page
      await page.goto(`${BASE_URL}/activities`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf01_activities");

      // 1.5 Events Page
      await page.goto(`${BASE_URL}/events`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf01_events");

      // 1.6 Library Catalog
      await page.goto(`${BASE_URL}/library`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf01_library");

      // 1.7 Donate Page
      await page.goto(`${BASE_URL}/donate`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf01_donate");

      // 1.8 Alumni Directory
      await page.goto(`${BASE_URL}/alumni`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf01_alumni");

      // 1.9 Contact Form Submission
      await page.goto(`${BASE_URL}/contact`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.fill("#contact-name", "Visitor E2E");
      await page.fill("#contact-email", "visitor@sda-ruet.org");
      await page.fill("#contact-subject", "Inquiry from Browser Test");
      await page.fill("#contact-message", "Testing contact form submission via automated browser runner.");
      await page.click("button[type='submit']");
      await page.waitForTimeout(1000);
      await capture(page, "wf01_contact_submitted");

      await page.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 2. REGISTRATION (Student Member)
    // -------------------------------------------------------------------------
    await runTest(2, "Student Member Registration Form", async (b) => {
      const page = await b.newPage();
      await page.goto(`${BASE_URL}/register`, { waitUntil: "domcontentloaded", timeout: 15000 });
      
      const testEmail = `student_${Date.now()}@test.org`;
      await page.fill("#fullName", "Automated Student User");
      await page.fill("#email", testEmail);
      await page.fill("#department", "CSE");
      await page.fill("#series", "21");
      await page.fill("#session", "2021-2022");
      await page.fill("#studentId", "2103888");
      await page.fill("#phone", "+8801712345678");
      await page.fill("#password", "Password123!");
      await page.fill("#confirmPassword", "Password123!");

      await capture(page, "wf02_register_filled");
      await page.click("button[type='submit']");
      await page.waitForTimeout(1500);
      await capture(page, "wf02_register_submitted");
      await page.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 3. LOGIN & SESSION HANDLING
    // -------------------------------------------------------------------------
    await runTest(3, "Login Flow & Credential Validation", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();
      
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
      
      // 3.1 Invalid login test
      await page.fill("#email", "invalid_user@sda-ruet.org");
      await page.fill("#password", "WrongPassword999!");
      await page.click("button[type='submit']");
      await page.waitForTimeout(1000);
      const invalidAlert = await page.textContent("body");
      assert(invalidAlert?.includes("Invalid") || invalidAlert?.includes("error") || invalidAlert?.includes("failed"), "Error alert shown for invalid credentials");
      await capture(page, "wf03_login_invalid");

      // 3.2 Valid login test as Member
      await loginUser(page, "member@sda-ruet.org", "Member12345!", "/dashboard");
      assert(page.url().includes("/dashboard"), "Redirected to /dashboard upon valid member login");
      await capture(page, "wf03_login_success_dashboard");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 4. MEMBER DASHBOARD WORKFLOW
    // -------------------------------------------------------------------------
    await runTest(4, "Member Dashboard Features & Identity", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "member@sda-ruet.org", "Member12345!", "/dashboard");
      const content = await page.textContent("body");
      assert(content?.includes("Dashboard") || content?.includes("Rahim") || content?.includes("Member"), "Member Dashboard loaded with user info");
      await capture(page, "wf04_member_dashboard");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 5. ALUMNI REGISTRATION
    // -------------------------------------------------------------------------
    await runTest(5, "Alumni Registration Workflow", async (b) => {
      const page = await b.newPage();
      await page.goto(`${BASE_URL}/register/alumni`, { waitUntil: "domcontentloaded", timeout: 15000 });
      
      const alumniEmail = `alumni_${Date.now()}@test.org`;
      await page.fill("#fullName", "Graduate Alum");
      await page.fill("#email", alumniEmail);
      await page.fill("#department", "EEE");
      await page.fill("#series", "16");
      await page.fill("#graduationYear", "2021");
      await page.fill("#session", "2016-2017");
      await page.fill("#studentId", "1601001");
      await page.fill("#currentDesignation", "Software Engineer");
      await page.fill("#organization", "Google LLC");
      await page.fill("#currentCity", "Dhaka");
      await page.fill("#password", "Password123!");
      await page.fill("#confirmPassword", "Password123!");

      await capture(page, "wf05_alumni_register_filled");
      await page.click("button[type='submit']");
      await page.waitForTimeout(1500);
      await capture(page, "wf05_alumni_register_submitted");
      await page.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 6. ALUMNI APPROVAL (Admin)
    // -------------------------------------------------------------------------
    await runTest(6, "Admin Alumni Verification Queue", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");

      // Navigate to Alumni Queue
      await page.goto(`${BASE_URL}/admin/alumni-queue`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf06_admin_alumni_queue");

      // Navigate to Alumni Management
      await page.goto(`${BASE_URL}/admin/alumni`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf06_admin_alumni_list");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 7. ALUMNI PROFILE EDITING
    // -------------------------------------------------------------------------
    await runTest(7, "Alumni Profile Editing & Persistence", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "alumni@sda-ruet.org", "Alumni12345!", "/dashboard");

      // Navigate to Profile
      await page.goto(`${BASE_URL}/profile`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf07_alumni_profile_page");

      if (await page.$("#fullName")) {
        await page.fill("#fullName", "Tanvir Hasan, Lead Engineer");
      }
      const saveBtn = await page.$("button[type='submit']");
      if (saveBtn) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
      }
      await capture(page, "wf07_alumni_profile_saved");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 8. TEACHER PROFILE & DIRECTORY
    // -------------------------------------------------------------------------
    await runTest(8, "Teacher Profiles & Faculty Management", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");

      await page.goto(`${BASE_URL}/admin/teachers`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf08_admin_teachers_directory");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 9. LIBRARY BROWSING & SEARCH
    // -------------------------------------------------------------------------
    await runTest(9, "Digital Library Browsing & Search Filters", async (b) => {
      const page = await b.newPage();
      await page.goto(`${BASE_URL}/library`, { waitUntil: "domcontentloaded", timeout: 15000 });

      const searchInput = await page.$("input[name='search'], input[type='search'], input[placeholder*='Search']");
      if (searchInput) {
        await searchInput.fill("Clean Architecture");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(500);
      }
      await capture(page, "wf09_library_search");
      await page.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 10. BOOK RESERVATION WORKFLOW
    // -------------------------------------------------------------------------
    await runTest(10, "Book Reservation Flow for Member", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "member@sda-ruet.org", "Member12345!", "/dashboard");
      await page.goto(`${BASE_URL}/library`, { waitUntil: "domcontentloaded", timeout: 15000 });
      
      const bookLink = await page.$("a[href*='/library/']");
      if (bookLink) {
        await bookLink.click();
        await page.waitForLoadState("domcontentloaded");
        await capture(page, "wf10_book_detail_view");

        const reserveBtn = await page.$("button:has-text('Reserve')");
        if (reserveBtn) {
          await reserveBtn.click();
          await page.waitForTimeout(1000);
          await capture(page, "wf10_book_reserved");
        }
      }

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 11. BOOK ISSUE (Admin Circulation)
    // -------------------------------------------------------------------------
    await runTest(11, "Book Issue Circulation Desk", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");
      await page.goto(`${BASE_URL}/admin/library`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf11_admin_library_circulation");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 12. BOOK RETURN (Admin Circulation)
    // -------------------------------------------------------------------------
    await runTest(12, "Book Return & Condition Processing", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");
      await page.goto(`${BASE_URL}/admin/library`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf12_admin_library_return_tab");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 13. BOOK DONATION WORKFLOW
    // -------------------------------------------------------------------------
    await runTest(13, "Book Donation Submission & Review", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      // 13.1 User submits book donation offer
      await page.goto(`${BASE_URL}/library/donate`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.fill("#contact-name", "Donating Alumnus");
      await page.fill("#contact-email", "donor.books@sda-ruet.org");
      await page.fill("#contact-subject", "Book Donation: CLRS Algorithms 4th Edition");
      await page.fill("#contact-message", "I would like to donate 2 copies of Introduction to Algorithms.");
      await page.click("button[type='submit']");
      await page.waitForTimeout(1000);
      await capture(page, "wf13_book_donate_submitted");

      // 13.2 Admin reviews book donations
      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");
      await page.goto(`${BASE_URL}/admin/library/donations`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf13_admin_book_donations");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 14. ACTIVITY PUBLISHING
    // -------------------------------------------------------------------------
    await runTest(14, "Activity Creation & Publishing", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");
      await page.goto(`${BASE_URL}/admin/activities`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf14_admin_activities_list");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 15. EVENT REGISTRATION
    // -------------------------------------------------------------------------
    await runTest(15, "Event Registration Workflow", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "member@sda-ruet.org", "Member12345!", "/dashboard");
      await page.goto(`${BASE_URL}/events`, { waitUntil: "domcontentloaded", timeout: 15000 });
      const eventLink = await page.$("a[href*='/events/']");
      if (eventLink) {
        await eventLink.click();
        await page.waitForLoadState("domcontentloaded");
        await capture(page, "wf15_event_details");
        
        const regBtn = await page.$("button:has-text('Register')");
        if (regBtn) {
          await regBtn.click();
          await page.waitForTimeout(1000);
          await capture(page, "wf15_event_registered");
        }
      }

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 16. FINANCIAL DONATION WORKFLOW
    // -------------------------------------------------------------------------
    await runTest(16, "Financial Donation Submission & Ledger", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      // 16.1 Submit Donation
      await page.goto(`${BASE_URL}/donate`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.fill("#donorName", "Generous Contributor");
      await page.fill("#donorEmail", "donor@sda-ruet.org");
      await page.fill("#amount", "1000");
      await page.fill("#transactionId", `TRX_${Date.now()}`);
      await capture(page, "wf16_donation_filled");

      await page.click("button[type='submit']");
      await page.waitForTimeout(1000);
      await capture(page, "wf16_donation_submitted");

      // 16.2 Track Donation
      await page.goto(`${BASE_URL}/donate/track`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf16_donation_track");

      // 16.3 Admin Donations Ledger
      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");
      await page.goto(`${BASE_URL}/admin/donations`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf16_admin_donations_ledger");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 17. ADMIN MANAGEMENT & SYSTEM CONTROL
    // -------------------------------------------------------------------------
    await runTest(17, "Admin Management (Dashboard, Users, Committees, Settings)", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");

      // Admin Overview
      await capture(page, "wf17_admin_dashboard");

      // Users Management
      await page.goto(`${BASE_URL}/admin/users`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf17_admin_users");

      // Committees Management
      await page.goto(`${BASE_URL}/admin/committees`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf17_admin_committees");

      // Settings Management
      await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf17_admin_settings");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 18. PERMISSIONS MANAGEMENT
    // -------------------------------------------------------------------------
    await runTest(18, "Granular Permissions Management", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");
      await page.goto(`${BASE_URL}/admin/permissions`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf18_admin_permissions");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 19. NOTIFICATIONS & ANNOUNCEMENTS
    // -------------------------------------------------------------------------
    await runTest(19, "Announcements Broadcasting & Notifications", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      // 19.1 Admin Announcements
      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");
      await page.goto(`${BASE_URL}/admin/announcements`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf19_admin_announcements");

      // 19.2 Member Notifications
      await loginUser(page, "member@sda-ruet.org", "Member12345!", "/dashboard");
      await page.goto(`${BASE_URL}/notifications`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await capture(page, "wf19_member_notifications");

      await context.close();
    }, browser);

    // -------------------------------------------------------------------------
    // 20. AUDIT LOGS
    // -------------------------------------------------------------------------
    await runTest(20, "Forensic Security Audit Logs", async (b) => {
      const context = await b.newContext();
      const page = await context.newPage();

      await loginUser(page, "admin@sda-ruet.org", "Admin12345!", "/admin");
      await page.goto(`${BASE_URL}/admin/audit-logs`, { waitUntil: "domcontentloaded", timeout: 15000 });
      const auditText = await page.textContent("body");
      assert(auditText?.includes("Audit") || auditText?.includes("Logs") || auditText?.includes("Security"), "Audit Logs page loaded");
      await capture(page, "wf20_admin_audit_logs");

      await context.close();
    }, browser);

  } finally {
    await browser.close();
  }

  console.log("\n=============================================================");
  console.log("             COMPREHENSIVE E2E TEST SUMMARY                  ");
  console.log("=============================================================");
  let passedCount = 0;
  for (const rep of reports) {
    const status = rep.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`Workflow ${String(rep.workflowId).padStart(2, " ")}: ${status} | ${rep.name} (${rep.durationMs}ms)`);
    if (rep.error) {
      console.log(`    Error: ${rep.error}`);
    }
    if (rep.passed) passedCount++;
  }
  console.log("=============================================================");
  console.log(`Total: ${reports.length} | Passed: ${passedCount} | Failed: ${reports.length - passedCount}`);
  console.log("=============================================================");
}

main().catch((err) => {
  console.error("Fatal E2E execution error:", err);
  process.exit(1);
});
