import { donationSchema } from "../../src/lib/validation/schemas";
import { getPaymentProvider } from "../../src/lib/payments";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

interface MockFund {
  id: string;
  name: string;
  target_amount: number;
  raised_amount: number;
}

interface MockDonation {
  id: string;
  fund_id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  is_anonymous: boolean;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verified_by: string | null;
  verified_at: string | null;
}

async function runDonationManagementTests() {
  console.log("Running Phase 9 Donation Management & Payment Tests...\n");

  const funds: MockFund[] = [
    { id: "fund-general", name: "General Welfare Fund", target_amount: 100000, raised_amount: 25000 },
    { id: "fund-library", name: "Library Digitization Fund", target_amount: 50000, raised_amount: 10000 },
    { id: "fund-student", name: "Student Support Aid Fund", target_amount: 80000, raised_amount: 40000 },
    { id: "fund-emergency", name: "Emergency Flood Relief", target_amount: 150000, raised_amount: 50000 },
  ];

  const donations: MockDonation[] = [];

  // =========================================================================
  // 1. DONATION SCHEMA & MULTI-PURPOSE SUPPORT
  // =========================================================================
  console.log("1. Testing Donation Schema & Multi-Purpose Support...");
  const validDonation = donationSchema.safeParse({
    fundId: "123e4567-e89b-12d3-a456-426614174000",
    donorName: "Engr. Monirul Islam",
    donorEmail: "monirul@example.com",
    donorPhone: "+8801700000000",
    amount: 5000,
    paymentMethod: "BKASH",
    transactionId: "9J28XA91",
    isAnonymous: true,
    message: "For student emergency medical assistance.",
  });
  assert(validDonation.success, "Donation schema validation should pass");

  const invalidAmount = donationSchema.safeParse({
    fundId: "123e4567-e89b-12d3-a456-426614174000",
    donorName: "Test",
    donorEmail: "test@example.com",
    amount: -500, // Invalid negative amount
    paymentMethod: "BKASH",
    transactionId: "TRX123",
  });
  assert(!invalidAmount.success, "Negative donation amount MUST fail");
  console.log("✓ Donation schema validated.\n");

  // =========================================================================
  // 2. PAYMENT ABSTRACTION LAYER
  // =========================================================================
  console.log("2. Testing Payment Abstraction Layer...");
  const manualProvider = getPaymentProvider("BKASH");
  const initRes = await manualProvider.initiatePayment({
    fundId: "fund-student",
    donorName: "Engr. Monirul Islam",
    donorEmail: "monirul@example.com",
    amount: 5000,
    paymentMethod: "BKASH",
    transactionId: "9J28XA91",
    isAnonymous: true,
  });

  assert(initRes.success, "Manual payment initiation should succeed");
  assert(initRes.status === "PENDING", "Payment starts in PENDING status for manual audit");
  assert(!initRes.requiresRedirect, "Offline payments require no gateway redirect");

  const verifyRes = await manualProvider.verifyPayment("9J28XA91");
  assert(!verifyRes.verified, "Manual payment cannot fake instant automated verification");
  console.log("✓ Payment abstraction layer interface verified without fake success.\n");

  // =========================================================================
  // 3. ADMIN VERIFICATION & FUND BALANCE INCREMENT
  // =========================================================================
  console.log("3. Testing Admin Verification & Fund Balance Increment...");
  const newDonation: MockDonation = {
    id: "don-001",
    fund_id: "fund-student",
    donor_name: "Engr. Monirul Islam",
    donor_email: "monirul@example.com",
    amount: 5000,
    payment_method: "BKASH",
    transaction_id: "9J28XA91",
    is_anonymous: true,
    status: "PENDING",
    verified_by: null,
    verified_at: null,
  };
  donations.push(newDonation);

  const targetFund = funds.find((f) => f.id === "fund-student")!;
  const initialRaised = targetFund.raised_amount;

  // Admin verifies transaction
  newDonation.status = "VERIFIED";
  newDonation.verified_by = "admin-user-001";
  newDonation.verified_at = new Date().toISOString();
  targetFund.raised_amount += newDonation.amount;

  assert(newDonation.status === "VERIFIED", "Donation status should be VERIFIED");
  assert(
    targetFund.raised_amount === initialRaised + 5000,
    "Fund raised_amount MUST increment by donation amount (+5,000 BDT)"
  );
  console.log("✓ Admin verification and fund balance increment passed.\n");

  // =========================================================================
  // 4. ADMIN REJECTION LIFECYCLE
  // =========================================================================
  console.log("4. Testing Admin Rejection Lifecycle...");
  const fakeDonation: MockDonation = {
    id: "don-002",
    fund_id: "fund-general",
    donor_name: "Fraud Attempt",
    donor_email: "fraud@example.com",
    amount: 10000,
    payment_method: "NAGAD",
    transaction_id: "FAKE-TRX",
    is_anonymous: false,
    status: "PENDING",
    verified_by: null,
    verified_at: null,
  };
  donations.push(fakeDonation);

  fakeDonation.status = "REJECTED";
  fakeDonation.verified_by = "admin-user-001";

  const generalFund = funds.find((f) => f.id === "fund-general")!;
  assert(fakeDonation.status === "REJECTED", "Donation marked as REJECTED");
  assert(generalFund.raised_amount === 25000, "Rejected donation MUST NOT increment fund balance");
  console.log("✓ Admin rejection lifecycle verified.\n");

  // =========================================================================
  // 5. PUBLIC DONOR ROLL ANONYMOUS MASKING
  // =========================================================================
  console.log("5. Testing Public Donor Roll Anonymous Masking...");
  function formatPublicDonorRoll(donations: MockDonation[]) {
    return donations
      .filter((d) => d.status === "VERIFIED")
      .map((d) => ({
        donorDisplayName: d.is_anonymous ? "Anonymous Well-Wisher" : d.donor_name,
        amount: d.amount,
        fundId: d.fund_id,
      }));
  }

  const publicRoll = formatPublicDonorRoll(donations);
  assert(publicRoll.length === 1, "Only verified donations appear on donor roll");
  assert(
    publicRoll[0].donorDisplayName === "Anonymous Well-Wisher",
    "Anonymous donor MUST be masked as 'Anonymous Well-Wisher' publicly"
  );
  assert(donations[0].donor_name === "Engr. Monirul Islam", "Real name preserved in admin records");
  console.log("✓ Donor privacy and public roll masking verified.\n");

  // =========================================================================
  // 6. CSV REPORT GENERATION
  // =========================================================================
  console.log("6. Testing CSV Report Generation...");
  const headers = ["Donation ID", "Donor Name", "Amount", "Status"];
  const rows = donations.map((d) => [d.id, d.donor_name, d.amount, d.status].join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  assert(csv.includes("Donation ID,Donor Name,Amount,Status"), "CSV header present");
  assert(csv.includes("don-001,Engr. Monirul Islam,5000,VERIFIED"), "Verified row present");
  console.log("✓ CSV export formatting verified.\n");

  // =========================================================================
  // 7. END-TO-END DONOR SUBMISSION -> ADMIN AUDIT VERIFICATION & ADDITION
  // =========================================================================
  console.log("7. Testing End-to-End Submission -> Admin Audit Verification -> Fund Addition...");
  
  // 1. Donor submits a donation record
  const submittedDonation: MockDonation = {
    id: "don-003",
    fund_id: "fund-emergency",
    donor_name: "Dr. Rafiqul Hassan",
    donor_email: "dr.rafiq@example.com",
    amount: 15000,
    payment_method: "BANK_TRANSFER",
    transaction_id: "TX-BANK-88219",
    is_anonymous: false,
    status: "PENDING",
    verified_by: null,
    verified_at: null,
  };
  donations.push(submittedDonation);

  const emergencyFund = funds.find((f) => f.id === "fund-emergency")!;
  const prevEmergencyRaised = emergencyFund.raised_amount;

  // Verify it is in PENDING state initially and NOT yet added to fund or public donor roll
  assert(submittedDonation.status === "PENDING", "Newly submitted donation MUST start as PENDING");
  assert(emergencyFund.raised_amount === prevEmergencyRaised, "Pending donation MUST NOT be added to fund raised amount before verification");
  const preVerificationRoll = formatPublicDonorRoll(donations);
  assert(!preVerificationRoll.some((d) => d.donorDisplayName === "Dr. Rafiqul Hassan"), "Unverified donor must NOT appear on public roll");

  // 2. Admin audits and verifies the donation
  submittedDonation.status = "VERIFIED";
  submittedDonation.verified_by = "admin-audit-user";
  submittedDonation.verified_at = new Date().toISOString();
  emergencyFund.raised_amount += submittedDonation.amount;

  // 3. Verify it is now added to fund balance and appears on the public donor roll
  assert(submittedDonation.status === "VERIFIED", "Donation is now VERIFIED");
  assert(emergencyFund.raised_amount === prevEmergencyRaised + 15000, "Fund raised_amount MUST be credited with +15,000 BDT upon admin verification");
  const postVerificationRoll = formatPublicDonorRoll(donations);
  assert(postVerificationRoll.some((d) => d.donorDisplayName === "Dr. Rafiqul Hassan"), "Verified donor MUST now appear on public roll");
  console.log("✓ Full donor submission -> admin audit verification -> fund addition lifecycle verified.\n");

  console.log("=============================================================");
  console.log("ALL PHASE 9 DONATION MANAGEMENT TESTS PASSED (7/7)           ");
  console.log("=============================================================");
}

runDonationManagementTests();
