import {
  updateMemberProfileSchema,
  updateAlumniProfileSchema,
  updateTeacherProfileSchema,
  privacySettingsSchema,
  socialLinksSchema,
  changePasswordSchema,
  notificationPreferencesSchema,
} from "../../src/lib/validation/schemas";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

async function runProfileManagementTests() {
  console.log("Running Phase 4 Profile Management Tests...\n");

  // 1. Member Profile Update Validation
  console.log("1. Testing Member Profile Update Validation...");
  const validMember = updateMemberProfileSchema.safeParse({
    fullName: "Md. Yeasir Arafat",
    phone: "+8801700000000",
    bloodGroup: "B+",
    hall: "Shahid President Ziaur Rahman Hall",
    currentSemester: "4-1",
    presentAddress: "Kazla, Rajshahi",
    permanentAddress: "Belkuchi, Sirajganj",
    bio: "Computer Science undergraduate passionate about full-stack engineering.",
  });
  assert(validMember.success, "Valid member profile update should pass");

  const invalidMemberName = updateMemberProfileSchema.safeParse({
    fullName: "A", // too short
  });
  assert(!invalidMemberName.success, "Single character full name should fail validation");
  console.log("✓ Member profile validation passed.\n");

  // 2. Alumni Profile Update Validation
  console.log("2. Testing Alumni Profile Update Validation...");
  const validAlumni = updateAlumniProfileSchema.safeParse({
    fullName: "Engr. Tanvir Ahmed",
    phone: "+8801800000000",
    bloodGroup: "O+",
    currentDesignation: "Principal Software Engineer",
    organization: "Tech Corp",
    industry: "Information Technology",
    currentCity: "Dhaka",
    currentCountry: "Bangladesh",
    linkedinUrl: "https://linkedin.com/in/tanvir-ahmed",
    portfolioUrl: "https://tanvir.dev",
    achievements: "Winner of National Hackathon 2022",
    bio: "RUET CSE '15 graduate with 6+ years experience.",
  });
  assert(validAlumni.success, "Valid alumni profile update should pass");

  const invalidAlumniUrl = updateAlumniProfileSchema.safeParse({
    fullName: "Engr. Tanvir Ahmed",
    linkedinUrl: "not-a-valid-url",
  });
  assert(!invalidAlumniUrl.success, "Malformed LinkedIn URL should fail validation");
  console.log("✓ Alumni profile validation passed.\n");

  // 3. Teacher Profile Update Validation
  console.log("3. Testing Teacher Profile Update Validation...");
  const validTeacher = updateTeacherProfileSchema.safeParse({
    fullName: "Dr. Rafiqul Islam",
    phone: "+8801900000000",
    bloodGroup: "A+",
    designation: "Professor",
    officeLocation: "Room 304, CSE Building",
    researchInterests: "Machine Learning, Distributed Systems, Cloud Architecture",
    bio: "Professor in Department of CSE, RUET.",
  });
  assert(validTeacher.success, "Valid teacher profile update should pass");

  const invalidTeacher = updateTeacherProfileSchema.safeParse({
    fullName: "Dr. Rafiqul Islam",
    designation: "", // required
  });
  assert(!invalidTeacher.success, "Empty designation should fail validation");
  console.log("✓ Teacher profile validation passed.\n");

  // 4. Privacy Settings & Defaults Testing
  console.log("4. Testing Privacy Settings & Privacy-by-Default...");
  const defaultPrivacy = privacySettingsSchema.parse({});
  assert(defaultPrivacy.phone === "PRIVATE", "Phone number must default to PRIVATE");
  assert(defaultPrivacy.present_address === "PRIVATE", "Present address must default to PRIVATE");
  assert(defaultPrivacy.permanent_address === "ADMIN_ONLY", "Permanent address must default to ADMIN_ONLY");
  assert(defaultPrivacy.student_id === "ADMIN_ONLY", "Student ID must default to ADMIN_ONLY");
  assert(defaultPrivacy.email === "MEMBERS_ONLY", "Email must default to MEMBERS_ONLY");

  const customPrivacy = privacySettingsSchema.safeParse({
    phone: "PUBLIC",
    email: "PUBLIC",
    blood_group: "MEMBERS_ONLY",
    student_id: "ADMIN_ONLY",
    present_address: "MEMBERS_ONLY",
    permanent_address: "ADMIN_ONLY",
    bio: "PUBLIC",
    social_links: "PUBLIC",
  });
  assert(customPrivacy.success, "Custom privacy settings should pass");

  const invalidPrivacy = privacySettingsSchema.safeParse({
    phone: "INVALID_VISIBILITY",
  });
  assert(!invalidPrivacy.success, "Invalid visibility enum should fail");
  console.log("✓ Privacy settings and defaults verified.\n");

  // 5. Social Links Validation
  console.log("5. Testing Social Links Validation...");
  const validSocial = socialLinksSchema.safeParse({
    linkedin: "https://linkedin.com/in/yeasir",
    github: "https://github.com/yeasir",
    facebook: "https://facebook.com/yeasir",
    website: "https://yeasir.me",
    twitter: "https://x.com/yeasir",
  });
  assert(validSocial.success, "Valid social links should pass");

  const invalidSocial = socialLinksSchema.safeParse({
    github: "invalid-url",
  });
  assert(!invalidSocial.success, "Invalid GitHub URL should fail validation");
  console.log("✓ Social links validation passed.\n");

  // 6. Change Password Validation
  console.log("6. Testing Change Password Validation...");
  const validPasswordChange = changePasswordSchema.safeParse({
    currentPassword: "oldpassword123",
    newPassword: "newpassword123",
    confirmNewPassword: "newpassword123",
  });
  assert(validPasswordChange.success, "Matching new passwords should pass");

  const mismatchedPassword = changePasswordSchema.safeParse({
    currentPassword: "oldpassword123",
    newPassword: "newpassword123",
    confirmNewPassword: "differentpassword",
  });
  assert(!mismatchedPassword.success, "Mismatched new password should fail");

  const shortPassword = changePasswordSchema.safeParse({
    currentPassword: "oldpassword123",
    newPassword: "123",
    confirmNewPassword: "123",
  });
  assert(!shortPassword.success, "Short password (< 6 chars) should fail");
  console.log("✓ Change password validation passed.\n");

  // 7. Notification Preferences Validation
  console.log("7. Testing Notification Preferences...");
  const defaultNotifs = notificationPreferencesSchema.parse({});
  assert(defaultNotifs.libraryDueAlerts === true, "Library due alerts should default to true");
  assert(defaultNotifs.bloodDonationRequests === true, "Blood requests should default to true");
  console.log("✓ Notification preferences verified.\n");

  // 8. Profile Photo Link Validation
  console.log("8. Testing Profile Photo Image Link Validation...");
  const memberWithPhoto = updateMemberProfileSchema.safeParse({
    fullName: "Md. Yeasir Arafat",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    phone: "+8801700000000",
  });
  assert(memberWithPhoto.success, "Member profile with image link should pass");
  assert(memberWithPhoto.data?.avatarUrl === "https://images.unsplash.com/photo-1534528741775-53994a69daeb", "Avatar URL preserved");

  const invalidPhoto = updateMemberProfileSchema.safeParse({
    fullName: "Md. Yeasir Arafat",
    avatarUrl: "invalid-not-a-url",
  });
  assert(!invalidPhoto.success, "Invalid image link should fail validation");
  console.log("✓ Profile photo link validation passed.\n");

  // 9. Achievements Dynamic Schema & Array Validation
  console.log("9. Testing Dynamic Achievements Schema Validation...");
  const { achievementItemSchema } = await import("../../src/lib/validation/schemas");
  const validAchievement = achievementItemSchema.safeParse({
    id: "ach_1",
    title: "1st Place - National Hackathon 2024",
    description: "Built an AI-powered automated dispatch platform for emergency disaster relief.",
    image_url: "https://example.com/certificate.jpg",
    date: "Dec 2024",
  });
  assert(validAchievement.success, "Valid achievement entry should pass validation");

  const invalidAchievement = achievementItemSchema.safeParse({
    title: "", // empty
    description: "Short",
  });
  assert(!invalidAchievement.success, "Empty achievement title should fail validation");
  console.log("✓ Achievements schema validation passed.\n");

  // 10. Activities Dynamic Schema & Array Validation
  console.log("10. Testing Dynamic Activities Schema Validation...");
  const { activityItemSchema } = await import("../../src/lib/validation/schemas");
  const validActivity = activityItemSchema.safeParse({
    id: "act_1",
    title: "Executive Vice President - SDA RUET",
    description: "Coordinated textbook donations, blood donation drives, and fresher receptions.",
    image_url: "https://example.com/activity_photo.jpg",
    date: "2024–2025",
  });
  assert(validActivity.success, "Valid activity entry should pass validation");

  const invalidActivity = activityItemSchema.safeParse({
    title: "A", // too short
    description: "",
  });
  assert(!invalidActivity.success, "Invalid activity entry should fail validation");
  console.log("✓ Activities schema validation passed.\n");

  // 11. Positions Dynamic Schema & Array Validation
  console.log("11. Testing Dynamic Career & Association Positions Schema Validation...");
  const { positionItemSchema } = await import("../../src/lib/validation/schemas");
  const validPosition = positionItemSchema.safeParse({
    id: "pos_1",
    title: "Senior Software Engineer",
    organization: "Google LLC",
    start_date: "2022",
    end_date: null,
    is_current: true,
    description: "Building scalable cloud computing platforms.",
    image_url: "https://example.com/google_logo.png",
  });
  assert(validPosition.success, "Valid position entry should pass validation");

  const invalidPosition = positionItemSchema.safeParse({
    title: "", // empty title
    organization: "",
  });
  assert(!invalidPosition.success, "Empty position title and org should fail validation");
  console.log("✓ Career & Association Positions schema validation passed.\n");

  console.log("=====================================================");
  console.log("ALL PHASE 4 PROFILE MANAGEMENT TESTS PASSED (11/11)  ");
  console.log("=====================================================");
}

runProfileManagementTests();
