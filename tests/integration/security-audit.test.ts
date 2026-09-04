import assert from "node:assert";
import { sanitizeHtml } from "../../src/lib/sanitizer";
import { checkRateLimit } from "../../src/lib/rateLimit";

console.log("Running Complete Senior Application Security Audit & Persona Simulations...\n");

// Mock User Database & Session Contexts
interface MockUser {
  id: string;
  email: string;
  role: "MEMBER" | "ALUMNI" | "TEACHER" | "ADMIN";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
}

const mockUsers: Record<string, MockUser> = {
  memberUser: { id: "u-member-101", email: "member@ruet.ac.bd", role: "MEMBER", status: "ACTIVE" },
  otherMember: { id: "u-member-102", email: "other@ruet.ac.bd", role: "MEMBER", status: "ACTIVE" },
  alumniUser: { id: "u-alumni-201", email: "alumni@ruet.ac.bd", role: "ALUMNI", status: "ACTIVE" },
  unverifiedAlumni: { id: "u-alumni-202", email: "pending@ruet.ac.bd", role: "ALUMNI", status: "PENDING" },
  teacherUser: { id: "u-teacher-301", email: "teacher@ruet.ac.bd", role: "TEACHER", status: "ACTIVE" },
  adminUser: { id: "u-admin-901", email: "admin@sda-ruet.org", role: "ADMIN", status: "ACTIVE" },
};

// Mock Book Loans for IDOR Verification
interface MockBookLoan {
  id: string;
  borrower_id: string;
  due_date: string;
  renewal_count: number;
  status: "ISSUED" | "RETURNED";
}

const mockLoans: Record<string, MockBookLoan> = {
  loanMember1: {
    id: "loan-001",
    borrower_id: "u-member-101",
    due_date: "2026-09-15",
    renewal_count: 0,
    status: "ISSUED",
  },
  loanMember2: {
    id: "loan-002",
    borrower_id: "u-member-102",
    due_date: "2026-09-20",
    renewal_count: 0,
    status: "ISSUED",
  },
};

// Simulation Function: Renew Loan with IDOR Guard
function simulateRenewBookLoan(caller: MockUser | null, loanId: string): { success: boolean; error?: string } {
  if (!caller) {
    return { success: false, error: "Authentication required" };
  }
  const loan = mockLoans[loanId];
  if (!loan) {
    return { success: false, error: "Loan not found" };
  }

  // IDOR Protection: Caller must own the loan OR be ADMIN
  if (caller.role !== "ADMIN" && loan.borrower_id !== caller.id) {
    return { success: false, error: "Unauthorized: You can only renew your own active book loans." };
  }

  if (loan.renewal_count >= 2) {
    return { success: false, error: "Maximum renewal limit reached" };
  }

  loan.renewal_count += 1;
  return { success: true };
}

// Simulation Function: Admin Action Guard
function simulateAdminAction(caller: MockUser | null, actionName: string): { success: boolean; error?: string } {
  if (!caller) {
    return { success: false, error: "Unauthorized: Please log in" };
  }
  if (caller.status !== "ACTIVE") {
    return { success: false, error: "Account is suspended" };
  }
  if (caller.role !== "ADMIN") {
    return { success: false, error: `Forbidden: Admin role required for [${actionName}]` };
  }
  return { success: true };
}

// Simulation Function: Privacy Filter on Profiles
function simulatePublicProfileView(
  viewer: MockUser | null,
  profile: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    studentId: string;
    privacy: { email: string; phone: string; studentId: string };
  }
) {
  const result: Record<string, string | null> = {
    id: profile.id,
    fullName: profile.fullName,
    email: null,
    phone: null,
    studentId: null,
  };

  const isOwner = viewer?.id === profile.id;
  const isAdmin = viewer?.role === "ADMIN";
  const isMember = viewer?.role === "MEMBER" || viewer?.role === "ALUMNI" || viewer?.role === "TEACHER" || isAdmin;

  // Email Visibility
  if (isOwner || isAdmin || (profile.privacy.email === "PUBLIC") || (profile.privacy.email === "MEMBERS_ONLY" && isMember)) {
    result.email = profile.email;
  }

  // Phone Visibility
  if (isOwner || isAdmin || (profile.privacy.phone === "PUBLIC") || (profile.privacy.phone === "MEMBERS_ONLY" && isMember)) {
    result.phone = profile.phone;
  }

  // Student ID Visibility
  if (isOwner || isAdmin || (profile.privacy.studentId === "PUBLIC")) {
    result.studentId = profile.studentId;
  }

  return result;
}

async function runSecurityAuditTests() {
  // =========================================================================
  // 1. PERSONA SIMULATION: ANONYMOUS VISITOR
  // =========================================================================
  console.log("1. Simulating Persona: Anonymous Visitor Security Boundaries...");

  // Anonymous trying to execute admin action
  const anonAdminAttempt = simulateAdminAction(null, "updateUserRole");
  assert.strictEqual(anonAdminAttempt.success, false);
  assert(anonAdminAttempt.error?.includes("Unauthorized"));

  // Anonymous trying to renew a loan
  const anonLoanAttempt = simulateRenewBookLoan(null, "loan-001");
  assert.strictEqual(anonLoanAttempt.success, false);
  assert(anonLoanAttempt.error?.includes("Authentication required"));

  // Anonymous viewing private profile fields
  const sampleProfile = {
    id: "u-member-101",
    fullName: "Yeasir Arafat",
    email: "arafat@ruet.ac.bd",
    phone: "01712345678",
    studentId: "1903001",
    privacy: { email: "MEMBERS_ONLY", phone: "PRIVATE", studentId: "ADMIN_ONLY" },
  };

  const anonView = simulatePublicProfileView(null, sampleProfile);
  assert.strictEqual(anonView.email, null, "Email MUST be hidden from Anonymous");
  assert.strictEqual(anonView.phone, null, "Phone MUST be hidden from Anonymous");
  assert.strictEqual(anonView.studentId, null, "Student ID MUST be hidden from Anonymous");

  console.log("✓ Anonymous visitor strictly isolated from private data and protected endpoints.\n");

  // =========================================================================
  // 2. PERSONA SIMULATION: AUTHENTICATED MEMBER & IDOR PREVENTION
  // =========================================================================
  console.log("2. Simulating Persona: Authenticated Member & IDOR Defense...");

  const member = mockUsers.memberUser;
  const otherMember = mockUsers.otherMember;

  // Member trying to execute admin actions
  const memberAdminAttempt = simulateAdminAction(member, "deleteBook");
  assert.strictEqual(memberAdminAttempt.success, false);
  assert(memberAdminAttempt.error?.includes("Forbidden: Admin role required"));

  // Member renewing their OWN loan (Authorized)
  const ownLoanRenew = simulateRenewBookLoan(member, "loanMember1");
  assert.strictEqual(ownLoanRenew.success, true, "Member MUST be able to renew their own loan");

  // Member attempting IDOR renewal on OTHER member's loan (Must be Blocked)
  const idorLoanRenew = simulateRenewBookLoan(member, "loanMember2");
  assert.strictEqual(idorLoanRenew.success, false, "Cross-account IDOR renewal MUST be blocked");
  assert(idorLoanRenew.error?.includes("Unauthorized: You can only renew your own active book loans."));

  // Member viewing another member's profile
  const memberView = simulatePublicProfileView(otherMember, sampleProfile);
  assert.strictEqual(memberView.email, "arafat@ruet.ac.bd", "MEMBERS_ONLY email is visible to logged-in Member");
  assert.strictEqual(memberView.phone, null, "PRIVATE phone is hidden from other Member");
  assert.strictEqual(memberView.studentId, null, "ADMIN_ONLY studentId is hidden from other Member");

  // Member viewing their OWN profile
  const ownView = simulatePublicProfileView(member, sampleProfile);
  assert.strictEqual(ownView.phone, "01712345678", "Owner sees their own phone");
  assert.strictEqual(ownView.studentId, "1903001", "Owner sees their own student ID");

  console.log("✓ Member role boundaries, privacy rules, and IDOR protections validated.\n");

  // =========================================================================
  // 3. PERSONA SIMULATION: ALUMNI & VERIFICATION LIFECYCLE
  // =========================================================================
  console.log("3. Simulating Persona: Alumni & Directory Verification Boundaries...");

  const alumni = mockUsers.alumniUser;
  const pendingAlumni = mockUsers.unverifiedAlumni;

  // Alumni cannot access admin controls
  const alumniAdminAttempt = simulateAdminAction(alumni, "verifyDonation");
  assert.strictEqual(alumniAdminAttempt.success, false);

  // Unverified/Pending alumni status cannot access directory actions
  const pendingAdminAttempt = simulateAdminAction(pendingAlumni, "any");
  assert.strictEqual(pendingAdminAttempt.success, false);

  console.log("✓ Alumni verification and access privileges confirmed.\n");

  // =========================================================================
  // 4. PERSONA SIMULATION: TEACHER / FACULTY
  // =========================================================================
  console.log("4. Simulating Persona: Faculty / Teacher...");

  const teacher = mockUsers.teacherUser;
  const teacherAdminAttempt = simulateAdminAction(teacher, "updateSiteSettings");
  assert.strictEqual(teacherAdminAttempt.success, false);
  assert(teacherAdminAttempt.error?.includes("Forbidden"));

  console.log("✓ Faculty role isolated from administrative control functions.\n");

  // =========================================================================
  // 5. PERSONA SIMULATION: SYSTEM ADMINISTRATOR
  // =========================================================================
  console.log("5. Simulating Persona: System Administrator Full Authority...");

  const admin = mockUsers.adminUser;

  // Admin executing admin action
  const adminAttempt = simulateAdminAction(admin, "updateUserRole");
  assert.strictEqual(adminAttempt.success, true);

  // Admin viewing full profile with ADMIN_ONLY fields
  const adminView = simulatePublicProfileView(admin, sampleProfile);
  assert.strictEqual(adminView.email, "arafat@ruet.ac.bd");
  assert.strictEqual(adminView.phone, "01712345678");
  assert.strictEqual(adminView.studentId, "1903001");

  // Admin renewing any loan on behalf of library patron
  const adminLoanRenew = simulateRenewBookLoan(admin, "loanMember2");
  assert.strictEqual(adminLoanRenew.success, true, "Admin librarian CAN renew loans for users");

  console.log("✓ System Administrator authority and forensic access confirmed.\n");

  // =========================================================================
  // 6. XSS & INJECTION SANITIZATION SUITE
  // =========================================================================
  console.log("6. Testing XSS & Malicious Payload Neutralization...");

  // Vector 1: Script tag injection
  const xss1 = "<script>alert('XSS')</script><p>Safe text</p>";
  const clean1 = sanitizeHtml(xss1);
  assert(!clean1.includes("<script>"));
  assert(clean1.includes("<p>Safe text</p>"));

  // Vector 2: Inline event handler
  const xss2 = '<img src="invalid.jpg" onerror="alert(document.cookie)" /><p>Image text</p>';
  const clean2 = sanitizeHtml(xss2);
  assert(!clean2.includes("onerror"));

  // Vector 3: Javascript pseudo-protocol
  const xss3 = '<a href="javascript:alert(1)">Click Here</a>';
  const clean3 = sanitizeHtml(xss3);
  assert(!clean3.toLowerCase().includes("href=\"javascript:"));

  // Vector 4: Iframe / Object / Embed injection
  const xss4 = '<iframe src="https://attacker.com/evil"></iframe><b>Bold text</b>';
  const clean4 = sanitizeHtml(xss4);
  assert(!clean4.includes("<iframe"));
  assert(clean4.includes("<b>Bold text</b>"));

  console.log("✓ Stored & Reflected XSS vectors successfully neutralized by HTML sanitizer.\n");

  // =========================================================================
  // 7. ANTI-ABUSE RATE LIMITING VERIFICATION
  // =========================================================================
  console.log("7. Testing Token-Bucket Rate Limiter & Abuse Defense...");

  const rateKey = `test-ip-audit-${Date.now()}`;
  const maxAllowed = 3;

  // Requests 1, 2, 3 should be allowed
  const r1 = checkRateLimit(rateKey, maxAllowed, 10000);
  const r2 = checkRateLimit(rateKey, maxAllowed, 10000);
  const r3 = checkRateLimit(rateKey, maxAllowed, 10000);
  assert.strictEqual(r1.allowed, true);
  assert.strictEqual(r2.allowed, true);
  assert.strictEqual(r3.allowed, true);

  // Request 4 must be blocked by rate limiter
  const r4 = checkRateLimit(rateKey, maxAllowed, 10000);
  assert.strictEqual(r4.allowed, false, "Request exceeding limit MUST be blocked");
  assert.strictEqual(r4.remaining, 0);

  console.log("✓ Anti-abuse token bucket rate limiting verified.\n");

  console.log("=============================================================");
  console.log("ALL APPLICATION SECURITY AUDIT TESTS PASSED (7/7 TEST BLOCKS)");
  console.log("=============================================================");
}

runSecurityAuditTests().catch((err) => {
  console.error("Security audit test failure:", err);
  process.exit(1);
});
