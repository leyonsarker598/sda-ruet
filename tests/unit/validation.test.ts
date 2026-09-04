import assert from "node:assert";
import {
  loginSchema,
  registerSchema,
  alumniRegisterSchema,
  bookSchema,
  donationSchema,
  contactMessageSchema,
} from "../../src/lib/validation/schemas";

console.log("Running Phase 1 Foundation Validation Tests...\n");

// 1. Test Login Schema
console.log("1. Testing Login Schema...");
const validLogin = loginSchema.safeParse({
  email: "member@sda-ruet.org",
  password: "password123",
});
assert.strictEqual(validLogin.success, true, "Valid login should pass validation");

const invalidLogin = loginSchema.safeParse({
  email: "invalid-email",
  password: "123",
});
assert.strictEqual(invalidLogin.success, false, "Invalid email & short password should fail");
console.log("✓ Login Schema passed.\n");

// 2. Test Register Schema with password mismatch
console.log("2. Testing Register Schema...");
const mismatchedRegister = registerSchema.safeParse({
  fullName: "Yeasir Arafat",
  email: "student@sda-ruet.org",
  password: "password123",
  confirmPassword: "differentPassword",
  department: "CSE",
  series: "19",
  session: "2019-2020",
  studentId: "1903001",
});
assert.strictEqual(mismatchedRegister.success, false, "Password mismatch should fail registration");

const validRegister = registerSchema.safeParse({
  fullName: "Yeasir Arafat",
  email: "student@sda-ruet.org",
  password: "password123",
  confirmPassword: "password123",
  department: "CSE",
  series: "19",
  session: "2019-2020",
  studentId: "1903001",
});
assert.strictEqual(validRegister.success, true, "Valid registration data should pass");
console.log("✓ Register Schema passed.\n");

// 3. Test Alumni Register Schema
console.log("3. Testing Alumni Register Schema...");
const validAlumni = alumniRegisterSchema.safeParse({
  fullName: "Engr. Alumnus",
  email: "alumni@sda-ruet.org",
  password: "password123",
  confirmPassword: "password123",
  department: "EEE",
  series: "15",
  session: "2015-2016",
  studentId: "1502001",
  graduationYear: 2020,
  degree: "B.Sc. in Electrical & Electronic Engineering",
  organization: "Tech Corp",
  currentCity: "Dhaka",
});
assert.strictEqual(validAlumni.success, true, "Valid alumni registration should pass");
console.log("✓ Alumni Register Schema passed.\n");

// 4. Test Book Schema
console.log("4. Testing Book Schema...");
const validBook = bookSchema.safeParse({
  title: "Introduction to Algorithms",
  author: "Thomas H. Cormen",
  categoryId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  totalCopies: 3,
  language: "English",
});
assert.strictEqual(validBook.success, true, "Valid book schema should pass");

const zeroCopiesBook = bookSchema.safeParse({
  title: "Introduction to Algorithms",
  author: "Thomas H. Cormen",
  categoryId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  totalCopies: 0,
});
assert.strictEqual(zeroCopiesBook.success, false, "Zero copies should fail validation");
console.log("✓ Book Schema passed.\n");

// 5. Test Donation Schema
console.log("5. Testing Donation Schema...");
const validDonation = donationSchema.safeParse({
  fundId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  donorName: "Generous Alumnus",
  donorEmail: "donor@sda-ruet.org",
  amount: 5000,
  paymentMethod: "BKASH",
  transactionId: "TXN12345678",
});
assert.strictEqual(validDonation.success, true, "Valid donation should pass");

const negativeDonation = donationSchema.safeParse({
  fundId: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
  donorName: "Donor",
  donorEmail: "donor@sda-ruet.org",
  amount: -100,
  paymentMethod: "BKASH",
  transactionId: "TXN12345678",
});
assert.strictEqual(negativeDonation.success, false, "Negative donation amount should fail");
console.log("✓ Donation Schema passed.\n");

// 6. Test Contact Message Schema
console.log("6. Testing Contact Message Schema...");
const validContact = contactMessageSchema.safeParse({
  name: "Visitor Name",
  email: "visitor@gmail.com",
  subject: "General Inquiry",
  message: "Hello SDA RUET team, I would like to inquire about the next meeting.",
});
assert.strictEqual(validContact.success, true, "Valid contact message should pass");
console.log("✓ Contact Message Schema passed.\n");

console.log("=========================================");
console.log("ALL PHASE 1 VALIDATION TESTS PASSED (6/6)");
console.log("=========================================");
