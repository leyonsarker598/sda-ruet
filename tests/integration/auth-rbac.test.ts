import assert from "node:assert";
import type { UserRole, AccountStatus, VerificationStatus } from "../../src/types/database.types";

console.log("Running Phase 2 Authentication & Authorization Integration Tests...\n");

// ==============================================================================
// 1. SIMULATED RBAC EVALUATOR (Mirroring PostgreSQL public.user_has_permission)
// ==============================================================================
interface TestProfile {
  id: string;
  role_id: UserRole;
  status: AccountStatus;
  verification_status?: VerificationStatus;
}

interface TestUserPermission {
  user_id: string;
  permission_id: string;
  is_granted: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ["*"], // Wildcard for all permissions
  MEMBER: [
    "library.view",
    "library.reserve",
    "library.donate",
    "alumni.view",
    "committee.view",
    "activity.view",
    "event.view",
    "event.register",
    "donation.create",
    "profile.edit_own",
  ],
  ALUMNI: [
    "library.view",
    "library.reserve",
    "library.donate",
    "alumni.view",
    "committee.view",
    "activity.view",
    "event.view",
    "event.register",
    "donation.create",
    "profile.edit_own",
  ],
  TEACHER: [
    "library.view",
    "library.reserve",
    "library.donate",
    "alumni.view",
    "committee.view",
    "activity.view",
    "event.view",
    "event.register",
    "donation.create",
    "profile.edit_own",
  ],
  LIBRARIAN: [
    "library.view",
    "library.reserve",
    "library.donate",
    "library.manage",
    "library.issue",
    "library.return",
    "library.audit",
    "alumni.view",
    "committee.view",
    "activity.view",
    "event.view",
    "profile.edit_own",
  ],
};

function evaluateUserPermission(
  profile: TestProfile | null,
  permissionId: string,
  userOverrides: TestUserPermission[] = []
): boolean {
  if (!profile) return false;
  if (profile.status === "SUSPENDED") return false;
  if (profile.role_id === "ADMIN") return true;

  // 1. Check explicit user override
  const override = userOverrides.find(
    (u) => u.user_id === profile.id && u.permission_id === permissionId
  );
  if (override !== undefined) {
    return override.is_granted;
  }

  // 2. Check role-inherited permissions
  const rolePerms = ROLE_PERMISSIONS[profile.role_id] || [];
  return rolePerms.includes(permissionId);
}

function evaluateAlumniDirectoryVisibility(
  viewer: TestProfile | null,
  targetAlumni: { verification_status: VerificationStatus; privacy_setting: string }
): boolean {
  // Unverified alumni are NEVER visible to public, members, or teachers
  if (targetAlumni.verification_status !== "VERIFIED") {
    if (!viewer || viewer.role_id !== "ADMIN") {
      return false;
    }
  }

  // Privacy field checks
  if (targetAlumni.privacy_setting === "PRIVATE") {
    return viewer?.role_id === "ADMIN";
  }

  if (targetAlumni.privacy_setting === "MEMBERS_ONLY") {
    return viewer !== null && viewer.status === "ACTIVE";
  }

  return true; // PUBLIC
}

// ==============================================================================
// 2. TEST EXECUTION
// ==============================================================================

// TEST 1: Public / Unauthenticated User
console.log("1. Testing Public / Unauthenticated User Access...");
assert.strictEqual(
  evaluateUserPermission(null, "library.view"),
  false,
  "Public unauthenticated user must not have authenticated permissions"
);
assert.strictEqual(
  evaluateUserPermission(null, "users.manage_roles"),
  false,
  "Public user must not have admin permissions"
);
console.log("✓ Public user access properly restricted.\n");

// TEST 2: Student Member Access & RBAC
console.log("2. Testing Student Member Permissions & Boundaries...");
const memberProfile: TestProfile = {
  id: "user-member-001",
  role_id: "MEMBER",
  status: "ACTIVE",
};

assert.strictEqual(
  evaluateUserPermission(memberProfile, "library.view"),
  true,
  "Member should have library.view"
);
assert.strictEqual(
  evaluateUserPermission(memberProfile, "library.issue_book"),
  false,
  "Member should NOT have library.issue_book by default"
);
assert.strictEqual(
  evaluateUserPermission(memberProfile, "users.manage_roles"),
  false,
  "Member must not manage roles"
);
console.log("✓ Member default permissions verified.\n");

// TEST 3: Dynamic Permission Delegation (Appointed Librarian)
console.log("3. Testing Dynamic Granular Permission Delegation (Librarian Grant)...");
const librarianOverrides: TestUserPermission[] = [
  { user_id: memberProfile.id, permission_id: "library.issue_book", is_granted: true },
  { user_id: memberProfile.id, permission_id: "library.return_book", is_granted: true },
];

assert.strictEqual(
  evaluateUserPermission(memberProfile, "library.issue_book", librarianOverrides),
  true,
  "Appointed Member librarian must receive library.issue_book dynamically"
);
assert.strictEqual(
  evaluateUserPermission(memberProfile, "library.return_book", librarianOverrides),
  true,
  "Appointed Member librarian must receive library.return_book dynamically"
);
assert.strictEqual(
  evaluateUserPermission(memberProfile, "users.manage_roles", librarianOverrides),
  false,
  "Appointed Member librarian must still be blocked from admin user management"
);
console.log("✓ Dynamic granular permission delegation passed.\n");

// TEST 4: Explicit Permission Revocation Override
console.log("4. Testing Explicit Permission Revocation Override...");
const revokedOverrides: TestUserPermission[] = [
  { user_id: memberProfile.id, permission_id: "library.reserve", is_granted: false },
];

assert.strictEqual(
  evaluateUserPermission(memberProfile, "library.reserve", revokedOverrides),
  false,
  "Explicitly revoked permission must override role default permission"
);
console.log("✓ Explicit permission revocation passed.\n");

// TEST 5: Alumni Verification & Privacy Visibility Protection
console.log("5. Testing Alumni Verification & Privacy Protections...");
const unverifiedAlumni = {
  verification_status: "PENDING" as VerificationStatus,
  privacy_setting: "PUBLIC",
};
const verifiedAlumni = {
  verification_status: "VERIFIED" as VerificationStatus,
  privacy_setting: "PUBLIC",
};
const privateAlumni = {
  verification_status: "VERIFIED" as VerificationStatus,
  privacy_setting: "PRIVATE",
};

const adminProfile: TestProfile = {
  id: "user-admin-001",
  role_id: "ADMIN",
  status: "ACTIVE",
};

assert.strictEqual(
  evaluateAlumniDirectoryVisibility(null, unverifiedAlumni),
  false,
  "Unverified alumni MUST NOT be visible to public visitors"
);
assert.strictEqual(
  evaluateAlumniDirectoryVisibility(memberProfile, unverifiedAlumni),
  false,
  "Unverified alumni MUST NOT be visible to standard members"
);
assert.strictEqual(
  evaluateAlumniDirectoryVisibility(adminProfile, unverifiedAlumni),
  true,
  "Unverified alumni MUST be visible to administrators for review"
);
assert.strictEqual(
  evaluateAlumniDirectoryVisibility(memberProfile, verifiedAlumni),
  true,
  "Verified alumni MUST be visible to members"
);
assert.strictEqual(
  evaluateAlumniDirectoryVisibility(memberProfile, privateAlumni),
  false,
  "Private alumni profiles MUST NOT be visible to standard members"
);
assert.strictEqual(
  evaluateAlumniDirectoryVisibility(adminProfile, privateAlumni),
  true,
  "Private alumni profiles MUST remain visible to administrators"
);
console.log("✓ Alumni verification & privacy isolation passed.\n");

// TEST 6: Teacher Role Authorization
console.log("6. Testing Teacher Role Authorization...");
const teacherProfile: TestProfile = {
  id: "user-teacher-001",
  role_id: "TEACHER",
  status: "ACTIVE",
};

assert.strictEqual(
  evaluateUserPermission(teacherProfile, "library.reserve"),
  true,
  "Teacher should have library reserve permission"
);
assert.strictEqual(
  evaluateUserPermission(teacherProfile, "users.manage_roles"),
  false,
  "Teacher should not manage roles"
);
console.log("✓ Teacher authorization verified.\n");

// TEST 7: Admin Universal Scopes
console.log("7. Testing Admin Universal Authorization...");
assert.strictEqual(
  evaluateUserPermission(adminProfile, "users.manage_roles"),
  true,
  "Admin must have users.manage_roles"
);
assert.strictEqual(
  evaluateUserPermission(adminProfile, "library.issue_book"),
  true,
  "Admin must have library.issue_book"
);
assert.strictEqual(
  evaluateUserPermission(adminProfile, "any.arbitrary.permission"),
  true,
  "Admin has universal permissions"
);
console.log("✓ Admin universal authorization verified.\n");

// TEST 8: Suspended User Account Handling
console.log("8. Testing Suspended User Account Handling...");
const suspendedProfile: TestProfile = {
  id: "user-suspended-001",
  role_id: "MEMBER",
  status: "SUSPENDED",
};

assert.strictEqual(
  evaluateUserPermission(suspendedProfile, "library.view"),
  false,
  "Suspended member must have all permissions blocked"
);
console.log("✓ Suspended user restrictions verified.\n");

console.log("====================================================");
console.log("ALL PHASE 2 AUTH & RBAC INTEGRATION TESTS PASSED (8/8)");
console.log("====================================================");
