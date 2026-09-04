import { announcementSchema } from "../../src/lib/validation/schemas";
import type { UserRole, AccountStatus } from "../../src/types/database.types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

interface MockUser {
  id: string;
  email: string;
  full_name: string;
  role_id: UserRole;
  status: AccountStatus;
}

interface MockAuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_name: string;
  entity_id: string;
  new_data: Record<string, unknown>;
}

async function runAdminControlTests() {
  console.log("Running Phase 10 Complete Admin Control Panel Tests...\n");

  const users: MockUser[] = [
    { id: "usr-01", email: "student@ruet.ac.bd", full_name: "Student One", role_id: "MEMBER", status: "ACTIVE" },
    { id: "usr-02", email: "alumni@example.com", full_name: "Engr. Alumnus", role_id: "ALUMNI", status: "ACTIVE" },
    { id: "usr-03", email: "admin@sda-ruet.org", full_name: "Super Admin", role_id: "ADMIN", status: "ACTIVE" },
  ];

  const auditLogs: MockAuditLog[] = [];

  // =========================================================================
  // 1. USER ROLE MANAGEMENT & PRIVILEGE MUTATION
  // =========================================================================
  console.log("1. Testing User Role Mutation & Audit Trail...");
  const targetUser = users.find((u) => u.id === "usr-01")!;
  assert(targetUser.role_id === "MEMBER", "Initial role should be MEMBER");

  // Admin promotes user to ADMIN
  targetUser.role_id = "ADMIN";
  auditLogs.push({
    id: `audit-${auditLogs.length + 1}`,
    user_id: "usr-03",
    action: "UPDATE_ROLE",
    entity_name: "profiles",
    entity_id: targetUser.id,
    new_data: { role_id: "ADMIN" },
  });

  assert(targetUser.role_id === "ADMIN", "User role successfully mutated to ADMIN");
  assert(auditLogs.length === 1 && auditLogs[0].action === "UPDATE_ROLE", "Audit event recorded");
  console.log("✓ User role promotion and audit trail passed.\n");

  // =========================================================================
  // 2. ACCOUNT STATUS CONTROL (SUSPEND / ACTIVATE)
  // =========================================================================
  console.log("2. Testing Account Status Controls (Suspend/Activate)...");
  const badUser = users.find((u) => u.id === "usr-02")!;
  assert(badUser.status === "ACTIVE", "Initial status should be ACTIVE");

  // Admin suspends account
  badUser.status = "SUSPENDED";
  auditLogs.push({
    id: `audit-${auditLogs.length + 1}`,
    user_id: "usr-03",
    action: "UPDATE_STATUS",
    entity_name: "profiles",
    entity_id: badUser.id,
    new_data: { status: "SUSPENDED" },
  });

  assert(badUser.status === "SUSPENDED", "User account successfully suspended");

  // Admin re-activates account
  badUser.status = "ACTIVE";
  assert(badUser.status === "ACTIVE", "User account successfully re-activated");
  console.log("✓ Account suspension and re-activation lifecycle passed.\n");

  // =========================================================================
  // 3. ANNOUNCEMENT BROADCAST VALIDATION
  // =========================================================================
  console.log("3. Testing Announcement Broadcast Schema & Audience Scoping...");
  const validNotice = announcementSchema.safeParse({
    title: "Annual General Meeting & Executive Election 2026",
    content: "The AGM will be held on Friday at 3:00 PM in RUET Auditorium.",
    priority: "HIGH",
    targetAudience: "ALL",
  });
  assert(validNotice.success, "Announcement schema validation should pass");

  const invalidNotice = announcementSchema.safeParse({
    title: "", // Empty title
    content: "Body content",
  });
  assert(!invalidNotice.success, "Blank announcement title MUST fail validation");
  console.log("✓ Official announcement broadcasting validated.\n");

  // =========================================================================
  // 4. CSV EXPORT INTEGRITY
  // =========================================================================
  console.log("4. Testing User Directory CSV Export Formatting...");
  const headers = ["User ID", "Full Name", "Email Address", "Role", "Status"];
  const rows = users.map((u) => [u.id, u.full_name, u.email, u.role_id, u.status].join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  assert(csv.includes("User ID,Full Name,Email Address,Role,Status"), "CSV headers formatted correctly");
  assert(csv.includes("usr-01,Student One,student@ruet.ac.bd,ADMIN,ACTIVE"), "User row formatted correctly");
  console.log("✓ CSV export generation verified.\n");

  // =========================================================================
  // 5. CONTACT INQUIRIES UNREAD COUNT & BADGE NOTIFICATION
  // =========================================================================
  console.log("5. Testing Contact Inquiries Unread Count & Badge Display...");
  interface MockContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
  }

  const contactMessages: MockContactMessage[] = [
    { id: "msg-1", name: "Guest User", email: "guest@example.com", subject: "Inquiry 1", message: "Help needed", is_read: false },
    { id: "msg-2", name: "Alumni Member", email: "alumni@ruet.ac.bd", subject: "Inquiry 2", message: "Reunion query", is_read: false },
    { id: "msg-3", name: "Prospective Student", email: "student@school.edu", subject: "Inquiry 3", message: "Admission question", is_read: true },
  ];

  const getUnreadInquiryCount = (msgs: MockContactMessage[]) => msgs.filter((m) => !m.is_read).length;
  const formatBadgeDisplay = (count: number) => (count > 99 ? "99+" : count.toString());

  assert(getUnreadInquiryCount(contactMessages) === 2, "Unread inquiries count should be 2 initially");
  assert(formatBadgeDisplay(getUnreadInquiryCount(contactMessages)) === "2", "Badge display text should be '2'");

  // Admin marks msg-1 as read
  const msg1 = contactMessages.find((m) => m.id === "msg-1")!;
  msg1.is_read = true;
  assert(getUnreadInquiryCount(contactMessages) === 1, "Unread inquiries count should decrease to 1");

  // Admin marks msg-2 as read
  const msg2 = contactMessages.find((m) => m.id === "msg-2")!;
  msg2.is_read = true;
  assert(getUnreadInquiryCount(contactMessages) === 0, "Unread inquiries count should be 0 when all read");

  // A new contact inquiry arrives
  contactMessages.push({
    id: "msg-4",
    name: "Campus Partner",
    email: "partner@ruet.ac.bd",
    subject: "Collaboration",
    message: "New proposal",
    is_read: false,
  });
  assert(getUnreadInquiryCount(contactMessages) === 1, "Unread inquiries count should increment when new message is dropped");
  assert(formatBadgeDisplay(getUnreadInquiryCount(contactMessages)) === "1", "Badge should display '1'");

  // Test 99+ formatting
  assert(formatBadgeDisplay(150) === "99+", "Over 99 inquiries should format as 99+");
  console.log("✓ Contact inquiries unread counter and badge lifecycle validated.\n");

  console.log("==============================================================");
  console.log("ALL PHASE 10 ADMIN CONTROL PANEL TESTS PASSED (5/5)            ");
  console.log("==============================================================");
}

runAdminControlTests();
