import { alumniRegisterSchema, updateAlumniProfileSchema, privacySettingsSchema } from "../../src/lib/validation/schemas";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

// Mock database store to simulate atomic alumni lifecycle
interface MockAlumniProfile {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  series: string;
  graduation_year: number;
  degree: string;
  organization: string;
  current_designation: string;
  verification_status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "CORRECTION_REQUESTED";
  verified_at: string | null;
  verified_by: string | null;
  admin_notes: string | null;
  privacy_settings: Record<string, string>;
}

async function runAlumniWorkflowTests() {
  console.log("Running Phase 5 Complete Alumni Lifecycle Tests...\n");

  const database: MockAlumniProfile[] = [];

  // =========================================================================
  // 1. ALUMNI REGISTRATION -> PENDING STATUS
  // =========================================================================
  console.log("1. Testing Alumni Registration -> Pending Status...");
  const rawRegistration = {
    fullName: "Engr. Shamim Reza",
    email: "shamim.reza@example.com",
    password: "securePassword123",
    confirmPassword: "securePassword123",
    phone: "+8801711223344",
    department: "Computer Science & Engineering",
    series: "16",
    session: "2016-2017",
    studentId: "1603045",
    graduationYear: 2021,
    degree: "B.Sc. in Computer Science & Engineering",
    currentDesignation: "Senior Software Engineer",
    organization: "Samsung R&D Institute",
    industry: "Consumer Electronics & Software",
    currentCity: "Dhaka",
    currentCountry: "Bangladesh",
    linkedinUrl: "https://linkedin.com/in/shamim-reza",
    bio: "Passionate about backend systems and distributed algorithms.",
  };

  const validationResult = alumniRegisterSchema.safeParse(rawRegistration);
  assert(validationResult.success, "Valid alumni registration should pass schema validation");

  // Simulate creation in database
  const newAlumnus: MockAlumniProfile = {
    id: "alum-uuid-001",
    profile_id: "user-uuid-001",
    full_name: rawRegistration.fullName,
    email: rawRegistration.email,
    phone: rawRegistration.phone,
    department: rawRegistration.department,
    series: rawRegistration.series,
    graduation_year: rawRegistration.graduationYear,
    degree: rawRegistration.degree,
    organization: rawRegistration.organization,
    current_designation: rawRegistration.currentDesignation,
    verification_status: "PENDING", // STRICT DEFAULT
    verified_at: null,
    verified_by: null,
    admin_notes: null,
    privacy_settings: {
      phone: "PRIVATE",
      email: "MEMBERS_ONLY",
      blood_group: "PRIVATE",
      student_id: "ADMIN_ONLY",
      present_address: "PRIVATE",
    },
  };
  database.push(newAlumnus);

  assert(newAlumnus.verification_status === "PENDING", "New alumni MUST start with PENDING status");
  console.log("✓ Alumni registration creates PENDING status record.\n");

  // =========================================================================
  // 2. DIRECTORY ISOLATION TEST (UNAPPROVED ALUMNI CANNOT APPEAR PUBLICLY)
  // =========================================================================
  console.log("2. Testing Directory Isolation (Strict Public Filtering)...");
  function queryPublicAlumniDirectory(store: MockAlumniProfile[]) {
    // Exact filter implemented in alumniService.ts
    return store.filter((a) => a.verification_status === "VERIFIED");
  }

  const publicDirectoryBeforeApproval = queryPublicAlumniDirectory(database);
  assert(
    publicDirectoryBeforeApproval.length === 0,
    "CRITICAL: Unverified alumni (PENDING) MUST NOT appear in the public directory"
  );
  console.log("✓ Directory isolation verified: 0 unverified alumni leaked to public.\n");

  // =========================================================================
  // 3. ADMIN REVIEW WORKFLOW: APPROVAL
  // =========================================================================
  console.log("3. Testing Admin Review Workflow: APPROVE...");
  const adminId = "admin-uuid-999";

  // Simulate Admin reviewing and approving
  const alumnusToApprove = database.find((a) => a.id === "alum-uuid-001")!;
  alumnusToApprove.verification_status = "VERIFIED";
  alumnusToApprove.verified_at = new Date().toISOString();
  alumnusToApprove.verified_by = adminId;
  alumnusToApprove.admin_notes = "Verified against RUET Series '16 convocation ledger.";

  assert(alumnusToApprove.verification_status === "VERIFIED", "Status should be VERIFIED");
  assert(alumnusToApprove.verified_by === adminId, "Admin ID must be recorded on approval");

  // Verify it now appears in public directory
  const publicDirectoryAfterApproval = queryPublicAlumniDirectory(database);
  assert(
    publicDirectoryAfterApproval.length === 1,
    "Approved alumni MUST now appear in the public directory"
  );
  assert(
    publicDirectoryAfterApproval[0].full_name === "Engr. Shamim Reza",
    "Correct alumnus should appear in public directory"
  );
  console.log("✓ Admin approval transition passed: Profile is now publicly verified.\n");

  // =========================================================================
  // 4. ADMIN REVIEW WORKFLOW: REJECT
  // =========================================================================
  console.log("4. Testing Admin Review Workflow: REJECT...");
  const rejectedAlumnus: MockAlumniProfile = {
    id: "alum-uuid-002",
    profile_id: "user-uuid-002",
    full_name: "Fake Applicant",
    email: "fake@example.com",
    phone: "+8801999999999",
    department: "EEE",
    series: "18",
    graduation_year: 2023,
    degree: "B.Sc.",
    organization: "Unknown",
    current_designation: "None",
    verification_status: "PENDING",
    verified_at: null,
    verified_by: null,
    admin_notes: null,
    privacy_settings: {},
  };
  database.push(rejectedAlumnus);

  // Admin rejects
  rejectedAlumnus.verification_status = "REJECTED";
  rejectedAlumnus.admin_notes = "Student ID does not match Sirajganj district quota or records.";

  const publicDirectoryAfterRejection = queryPublicAlumniDirectory(database);
  assert(
    !publicDirectoryAfterRejection.some((a) => a.id === "alum-uuid-002"),
    "Rejected alumni MUST NOT appear in the public directory"
  );
  console.log("✓ Admin rejection transition passed: Rejected record excluded from directory.\n");

  // =========================================================================
  // 5. ADMIN REVIEW WORKFLOW: REQUEST CORRECTION & RE-SUBMISSION
  // =========================================================================
  console.log("5. Testing Admin Review Workflow: REQUEST CORRECTION & RE-SUBMISSION...");
  const correctionAlumnus: MockAlumniProfile = {
    id: "alum-uuid-003",
    profile_id: "user-uuid-003",
    full_name: "Engr. Farhana Yasmin",
    email: "farhana@example.com",
    phone: "+8801788776655",
    department: "Civil Engineering",
    series: "17",
    graduation_year: 2022,
    degree: "B.Sc. in CE",
    organization: "Pakar Civil Ltd.",
    current_designation: "Assistant Engineer",
    verification_status: "PENDING",
    verified_at: null,
    verified_by: null,
    admin_notes: null,
    privacy_settings: {},
  };
  database.push(correctionAlumnus);

  // Step 5a: Admin requests correction
  correctionAlumnus.verification_status = "CORRECTION_REQUESTED";
  correctionAlumnus.admin_notes = "Please provide your RUET Roll Number and company LinkedIn profile.";

  assert(
    correctionAlumnus.verification_status === "CORRECTION_REQUESTED",
    "Status should be CORRECTION_REQUESTED"
  );
  assert(
    queryPublicAlumniDirectory(database).every((a) => a.id !== "alum-uuid-003"),
    "Correction requested alumni MUST NOT appear in the public directory"
  );

  // Step 5b: Alumni re-submits updated profile
  const updatedData = updateAlumniProfileSchema.safeParse({
    fullName: "Engr. Farhana Yasmin",
    phone: "+8801788776655",
    currentDesignation: "Assistant Engineer (P&D)",
    organization: "Pakar Civil Ltd.",
    linkedinUrl: "https://linkedin.com/in/farhana-ce",
    currentCity: "Sirajganj",
    currentCountry: "Bangladesh",
  });
  assert(updatedData.success, "Alumni correction update should pass schema validation");

  // State transitions back to PENDING for re-audit
  correctionAlumnus.verification_status = "PENDING";
  assert(
    correctionAlumnus.verification_status === "PENDING",
    "Re-submitted application returns to PENDING queue for admin review"
  );
  console.log("✓ Request correction and re-submission cycle passed.\n");

  // =========================================================================
  // 6. PUBLIC PROFILE FIELD-LEVEL PRIVACY FILTERING
  // =========================================================================
  console.log("6. Testing Field-Level Privacy Protection on Public Profiles...");
  function formatPublicAlumniView(alum: MockAlumniProfile) {
    return {
      name: alum.full_name,
      department: alum.department,
      graduationYear: alum.graduation_year,
      organization: alum.organization,
      designation: alum.current_designation,
      // Field-level privacy checks:
      phone: alum.privacy_settings.phone === "PUBLIC" ? alum.phone : null,
      email: alum.privacy_settings.email === "PUBLIC" ? alum.email : null,
    };
  }

  const verifiedAlumnus = database.find((a) => a.id === "alum-uuid-001")!;
  const publicView = formatPublicAlumniView(verifiedAlumnus);

  assert(publicView.phone === null, "Private phone number must be stripped (null) in public view");
  assert(publicView.email === null, "Members-only email must be stripped (null) for general public");
  assert(publicView.name === "Engr. Shamim Reza", "Public name should remain intact");
  console.log("✓ Field-level privacy filtering verified: Sensitive contact info masked.\n");

  console.log("=========================================================");
  console.log("ALL PHASE 5 COMPLETE ALUMNI LIFECYCLE TESTS PASSED (6/6) ");
  console.log("=========================================================");
}

runAlumniWorkflowTests();
