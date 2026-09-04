import { z } from "zod";

// ==============================================================================
// AUTHENTICATION & REGISTRATION SCHEMAS
// ==============================================================================
export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  department: z.string().min(2, "Department is required"),
  series: z.string().min(2, "Series/Batch is required (e.g. '19')"),
  session: z.string().min(4, "Session is required (e.g. '2019-2020')"),
  studentId: z.string().min(4, "Student ID is required"),
  hall: z.string().optional(),
  bloodGroup: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const alumniRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  department: z.string().min(2, "Department is required"),
  series: z.string().min(2, "Series/Batch is required"),
  session: z.string().min(4, "Session is required"),
  studentId: z.string().min(4, "Student ID is required"),
  graduationYear: z.coerce.number().min(1964).max(2035),
  degree: z.string().default("B.Sc. in Engineering"),
  currentDesignation: z.string().optional(),
  organization: z.string().optional(),
  industry: z.string().optional(),
  currentCity: z.string().optional(),
  currentCountry: z.string().default("Bangladesh"),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ==============================================================================
// PHASE 4: USER PROFILE EDITING SCHEMAS
// ==============================================================================
export const updateMemberProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  avatarUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  hall: z.string().optional().or(z.literal("")),
  currentSemester: z.string().optional().or(z.literal("")),
  presentAddress: z.string().optional().or(z.literal("")),
  permanentAddress: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
});

export const updateAlumniProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  avatarUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  currentDesignation: z.string().optional().or(z.literal("")),
  organization: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  currentCity: z.string().optional().or(z.literal("")),
  currentCountry: z.string().default("Bangladesh"),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  achievements: z.string().optional().or(z.literal("")),
  presentAddress: z.string().optional().or(z.literal("")),
  permanentAddress: z.string().optional().or(z.literal("")),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional().or(z.literal("")),
});

export const updateTeacherProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  avatarUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  designation: z.string().min(2, "Designation is required"),
  officeLocation: z.string().optional().or(z.literal("")),
  researchInterests: z.string().optional().or(z.literal("")),
  presentAddress: z.string().optional().or(z.literal("")),
  permanentAddress: z.string().optional().or(z.literal("")),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional().or(z.literal("")),
});

export const achievementItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Achievement title is required (at least 2 chars)"),
  description: z.string().min(3, "Achievement description is required"),
  image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")).nullable(),
  date: z.string().optional().nullable(),
});

export const activityItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Activity title is required (at least 2 chars)"),
  description: z.string().min(3, "Activity description is required"),
  image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")).nullable(),
  date: z.string().optional().nullable(),
});

export const positionItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Position title is required (at least 2 chars)"),
  organization: z.string().min(2, "Organization name is required (at least 2 chars)"),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_current: z.boolean().default(false),
  description: z.string().optional().nullable(),
  image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")).nullable(),
});

export const privacyVisibilitySchema = z.enum(["PUBLIC", "MEMBERS_ONLY", "PRIVATE", "ADMIN_ONLY"]);

export const privacySettingsSchema = z.object({
  phone: privacyVisibilitySchema.default("PRIVATE"),
  email: privacyVisibilitySchema.default("MEMBERS_ONLY"),
  blood_group: privacyVisibilitySchema.default("PRIVATE"),
  student_id: privacyVisibilitySchema.default("ADMIN_ONLY"),
  present_address: privacyVisibilitySchema.default("PRIVATE"),
  permanent_address: privacyVisibilitySchema.default("ADMIN_ONLY"),
  bio: privacyVisibilitySchema.default("PUBLIC"),
  social_links: privacyVisibilitySchema.default("PUBLIC"),
});

export const socialLinksSchema = z.object({
  facebook: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  github: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});

export const notificationPreferencesSchema = z.object({
  libraryDueAlerts: z.boolean().default(true),
  committeeNotices: z.boolean().default(true),
  generalEvents: z.boolean().default(true),
  bloodDonationRequests: z.boolean().default(true),
});

// ==============================================================================
// PHASE 6: EXECUTIVE COMMITTEE SCHEMAS
// ==============================================================================
export const committeeSchema = z.object({
  termName: z.string().min(3, "Term name is required (e.g. 'Executive Committee 2025–2026')"),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  isCurrent: z.boolean().default(false),
  description: z.string().optional().or(z.literal("")),
  bannerImageUrl: z.string().optional().or(z.literal("")),
});

export const committeeMemberSchema = z.object({
  committeeId: z.string().uuid("Please select a valid committee term"),
  name: z.string().min(2, "Member name is required"),
  positionId: z.string().min(2, "Please select an executive position"),
  customPositionTitle: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  series: z.string().optional().or(z.literal("")),
  session: z.string().optional().or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

// ==============================================================================
// DIGITAL LIBRARY SCHEMAS
// ==============================================================================
export const bookSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional(),
  author: z.string().min(2, "Author is required"),
  coAuthors: z.array(z.string()).default([]),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  edition: z.string().optional(),
  language: z.string().default("English"),
  categoryId: z.string().uuid("Please select a valid category"),
  description: z.string().optional(),
  shelfLocation: z.string().optional(),
  totalCopies: z.coerce.number().int().min(1, "Must have at least 1 copy"),
  coverImageUrl: z.string().optional(),
});

export const bookDonationSchema = z.object({
  donorName: z.string().min(2, "Donor name is required"),
  donorEmail: z.string().email("Valid email is required"),
  donorPhone: z.string().optional(),
  donorDepartment: z.string().optional(),
  donorSeries: z.string().optional(),
  bookTitle: z.string().min(2, "Book title is required"),
  author: z.string().min(2, "Author name is required"),
  isbn: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  categoryId: z.string().optional(),
  condition: z.enum(["NEW", "GOOD", "FAIR", "DAMAGED", "LOST"]).default("GOOD"),
  photoUrl: z.string().optional(),
  message: z.string().optional(),
  isPublicDonor: z.boolean().default(true),
});

export const bookLoanIssueSchema = z.object({
  borrowerId: z.string().uuid("Please select a valid borrower"),
  copyId: z.string().uuid("Please select a valid book copy"),
  loanDays: z.coerce.number().int().min(1).max(90).default(14),
});

// ==============================================================================
// ACTIVITIES & EVENTS SCHEMAS
// ==============================================================================
export const activitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  categoryId: z.string().uuid("Select category"),
  shortDescription: z.string().min(10, "Short description is required"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  activityDate: z.string(),
  location: z.string().optional(),
  isPublished: z.boolean().default(false),
  coverImageUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().min(10, "Description is required"),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional().or(z.literal("")),
  location: z.string().min(2, "Location / Venue is required"),
  registrationRequired: z.boolean().default(false),
  registrationDeadline: z.string().optional().or(z.literal("")),
  maxParticipants: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  feeAmount: z.coerce.number().min(0).default(0),
  bannerImageUrl: z.string().optional().or(z.literal("")),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED", "DRAFT"]).default("UPCOMING"),
});

export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(6, "Valid phone number is required"),
  department: z.string().optional().or(z.literal("")),
  series: z.string().optional().or(z.literal("")),
  studentId: z.string().optional().or(z.literal("")),
  guestCount: z.coerce.number().int().min(0, "Guest count cannot be negative").default(0),
  tshirtSize: z.string().optional().or(z.literal("")),
  dietaryPreference: z.string().optional().or(z.literal("")),
  transactionId: z.string().optional().or(z.literal("")),
  paymentMethod: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// ==============================================================================
// FINANCIAL DONATION SCHEMAS
// ==============================================================================
export const donationSchema = z.object({
  fundId: z.string().min(1, "Please select a fund"),
  donorName: z.string().min(2, "Donor name is required"),
  donorEmail: z.string().email("Valid email is required"),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "MANUAL_CASH"]),
  transactionId: z.string().min(3, "Transaction ID or Reference is required"),
  paymentReference: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
});

// ==============================================================================
// COMMUNICATIONS & CONTACT SCHEMAS
// ==============================================================================
export const contactMessageSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const announcementSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  targetAudience: z.enum(["ALL", "MEMBER", "ALUMNI", "TEACHER", "ADMIN"]).default("ALL"),
  expiryDate: z.string().optional(),
  isActive: z.boolean().default(true),
});
