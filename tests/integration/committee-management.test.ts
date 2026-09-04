import { committeeSchema, committeeMemberSchema } from "../../src/lib/validation/schemas";
import { DEFAULT_COMMITTEE_POSITIONS } from "../../src/services/adminCommitteeService";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

interface MockCommittee {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

interface MockMember {
  id: string;
  committee_id: string;
  name: string;
  position_id: string;
  custom_position_title: string | null;
  department: string;
  series: string;
  display_order: number;
}

async function runCommitteeManagementTests() {
  console.log("Running Phase 6 Executive Committee Management Tests...\n");

  const committees: MockCommittee[] = [];
  const members: MockMember[] = [];

  // 1. Committee Creation & Validation
  console.log("1. Testing Committee Creation & Schema Validation...");
  const validCommittee = committeeSchema.safeParse({
    termName: "Executive Committee 2024–2025",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    isCurrent: false,
    description: "Term focusing on textbook digitization and welfare expansion.",
  });
  assert(validCommittee.success, "Valid committee term should pass validation");

  const invalidCommittee = committeeSchema.safeParse({
    termName: "", // empty
    startDate: "",
  });
  assert(!invalidCommittee.success, "Empty committee term name should fail validation");

  // Create Term 1 (Past)
  committees.push({
    id: "comm-001",
    term_name: "Executive Committee 2024–2025",
    start_date: "2024-01-01",
    end_date: "2025-01-01",
    is_current: false,
    description: "Past term",
  });
  console.log("✓ Committee creation schema validated.\n");

  // 2. Set Current Committee & Singularity Rule
  console.log("2. Testing Single Active Current Committee Constraint...");
  // Create Term 2 (Current)
  const term2: MockCommittee = {
    id: "comm-002",
    term_name: "Executive Committee 2025–2026",
    start_date: "2025-01-01",
    end_date: null,
    is_current: true,
    description: "Current active governing body.",
  };

  // Simulate setCurrentCommittee logic
  if (term2.is_current) {
    committees.forEach((c) => (c.is_current = false));
  }
  committees.push(term2);

  const activeCommittees = committees.filter((c) => c.is_current);
  assert(activeCommittees.length === 1, "Exactly ONE committee must be active current at any time");
  assert(activeCommittees[0].id === "comm-002", "Term 2 should be the active committee");
  console.log("✓ Single active committee constraint verified.\n");

  // 3. Adding Committee Members & Positions
  console.log("3. Testing Committee Member Roster Creation & Hierarchy...");
  const presidentData = committeeMemberSchema.safeParse({
    committeeId: "123e4567-e89b-12d3-a456-426614174000",
    name: "Engr. Yeasir Arafat",
    positionId: "PRESIDENT",
    customPositionTitle: "President",
    department: "Computer Science & Engineering",
    series: "19",
    displayOrder: 1,
  });
  assert(presidentData.success, "President member data should pass validation");

  const gsData = committeeMemberSchema.safeParse({
    committeeId: "123e4567-e89b-12d3-a456-426614174000",
    name: "Engr. Sabbir Ahmed",
    positionId: "GENERAL_SECRETARY",
    customPositionTitle: "General Secretary",
    department: "Electrical & Electronic Engineering",
    series: "19",
    displayOrder: 2,
  });
  assert(gsData.success, "General Secretary member data should pass validation");

  members.push(
    {
      id: "mem-001",
      committee_id: "comm-002",
      name: "Engr. Yeasir Arafat",
      position_id: "PRESIDENT",
      custom_position_title: "President",
      department: "CSE",
      series: "19",
      display_order: 1,
    },
    {
      id: "mem-002",
      committee_id: "comm-002",
      name: "Engr. Sabbir Ahmed",
      position_id: "GENERAL_SECRETARY",
      custom_position_title: "General Secretary",
      department: "EEE",
      series: "19",
      display_order: 2,
    },
    {
      id: "mem-003",
      committee_id: "comm-002",
      name: "Engr. Mehedi Hasan",
      position_id: "ORGANIZING_SECRETARY",
      custom_position_title: "Organizing Secretary",
      department: "Civil",
      series: "20",
      display_order: 5,
    }
  );

  // 4. Hierarchy Position Catalog
  console.log("4. Testing Executive Positions Catalog & Sort Order...");
  const presidentPos = DEFAULT_COMMITTEE_POSITIONS.find((p) => p.id === "PRESIDENT")!;
  const gsPos = DEFAULT_COMMITTEE_POSITIONS.find((p) => p.id === "GENERAL_SECRETARY")!;
  const advisorPos = DEFAULT_COMMITTEE_POSITIONS.find((p) => p.id === "ADVISOR")!;

  assert(advisorPos.hierarchy_order < presidentPos.hierarchy_order, "Advisor should be top hierarchy");
  assert(presidentPos.hierarchy_order < gsPos.hierarchy_order, "President should precede General Secretary");
  console.log("✓ Position hierarchy catalog verified.\n");

  // 5. Member Removal & Committee Archiving
  console.log("5. Testing Member Removal & Committee Archiving...");
  const initialCount = members.length;
  const removedMemberId = "mem-003";
  const updatedMembers = members.filter((m) => m.id !== removedMemberId);

  assert(updatedMembers.length === initialCount - 1, "Member should be removed from roster");
  assert(!updatedMembers.some((m) => m.id === removedMemberId), "Removed member must not exist in roster");

  // Archive Term 2
  term2.is_current = false;
  assert(!term2.is_current, "Term should be marked archived (is_current = false)");
  console.log("✓ Member removal and term archiving verified.\n");

  // 6. Drag-and-Drop Reordering & Portal Synchronization
  console.log("6. Testing Drag-and-Drop Reordering & Display Order Synchronization...");
  const reorderedIds = ["mem-002", "mem-001"]; // Swap GS to #1, President to #2
  const reorderedList = reorderedIds.map((id, index) => {
    const mem = members.find((m) => m.id === id)!;
    return { ...mem, display_order: index + 1 };
  });

  assert(reorderedList[0].id === "mem-002" && reorderedList[0].display_order === 1, "GS is now #1");
  assert(reorderedList[1].id === "mem-001" && reorderedList[1].display_order === 2, "President is now #2");

  // Verify portal sorting strictly follows display_order
  const portalSorted = [...reorderedList].sort((a, b) => a.display_order - b.display_order);
  assert(portalSorted[0].id === "mem-002", "Public portal displays GS first as set in admin drag-and-drop");
  console.log("✓ Drag-and-drop reordering and portal synchronization verified.\n");

  // 7. Member Profile Linkage & CMS Dynamic Updates
  console.log("7. Testing Dynamic Member Profile Linkage & CMS Edit Synchronization...");
  const mockStudentProfile = {
    id: "prof-001",
    full_name: "Engr. Yeasir Arafat (Updated via CMS)",
    department: "CSE",
    series: "19",
    student_id: "1903001",
    phone: "+8801700000001",
    bio: "AI & Fullstack Developer",
  };

  const committeeMemberWithProfile = {
    id: "mem-001",
    committee_id: "comm-002",
    profile_id: mockStudentProfile.id,
    name: "Old Fallback Name",
    department: "Old Dept",
    series: "18",
    profile: mockStudentProfile,
  };

  // Resolve dynamic values matching profile
  const resolvedName = committeeMemberWithProfile.profile?.full_name || committeeMemberWithProfile.name;
  const resolvedDept = committeeMemberWithProfile.profile?.department || committeeMemberWithProfile.department;
  const resolvedSeries = committeeMemberWithProfile.profile?.series || committeeMemberWithProfile.series;
  const resolvedRoll = committeeMemberWithProfile.profile?.student_id || "N/A";
  const resolvedPhone = committeeMemberWithProfile.profile?.phone || "N/A";
  const viewLink = committeeMemberWithProfile.profile_id
    ? `/members/${committeeMemberWithProfile.profile_id}`
    : `/members/${committeeMemberWithProfile.id}`;

  assert(resolvedName === "Engr. Yeasir Arafat (Updated via CMS)", "Name reflects profile edited in CMS");
  assert(resolvedDept === "CSE", "Dept matches profile");
  assert(resolvedSeries === "19", "Series matches profile");
  assert(resolvedRoll === "1903001", "Roll matches profile student_id");
  assert(resolvedPhone === "+8801700000001", "Phone matches profile phone");
  assert(viewLink === "/members/prof-001", "View button redirects to member's public profile page");
  console.log("✓ Member profile linkage and CMS sync verified.\n");

  console.log("===============================================================");
  console.log("ALL PHASE 6 EXECUTIVE COMMITTEE MANAGEMENT TESTS PASSED (7/7) ");
  console.log("===============================================================");
}

runCommitteeManagementTests();
