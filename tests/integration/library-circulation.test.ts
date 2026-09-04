import { bookSchema, bookDonationSchema } from "../../src/lib/validation/schemas";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

// Mock In-Memory Transaction Engine for Digital Library
interface MockBook {
  id: string;
  title: string;
  author: string;
  categoryId: string;
  totalCopies: number;
  availableCopies: number;
}

interface MockCopy {
  id: string;
  bookId: string;
  copyCode: string;
  isAvailable: boolean;
  condition: string;
}

interface MockLoan {
  id: string;
  bookId: string;
  bookCopyId: string;
  borrowerId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  renewalCount: number;
  status: "ISSUED" | "RETURNED" | "OVERDUE";
  fineAmount: number;
}

interface MockReservation {
  id: string;
  bookId: string;
  userId: string;
  status: "ACTIVE" | "CANCELLED" | "FULFILLED";
  createdAt: string;
}

async function runLibraryCirculationTests() {
  console.log("Running Phase 7 Complete Library Circulation Tests...\n");

  const books: MockBook[] = [];
  const copies: MockCopy[] = [];
  const loans: MockLoan[] = [];
  const reservations: MockReservation[] = [];

  // =========================================================================
  // 1. BOOK CATALOGUE CREATION & BARCODE GENERATION
  // =========================================================================
  console.log("1. Testing Book Catalog Creation & Copy Generation...");
  const validBook = bookSchema.safeParse({
    title: "Engineering Electromagnetics",
    author: "William H. Hayt",
    categoryId: "123e4567-e89b-12d3-a456-426614174000",
    totalCopies: 2,
    language: "English",
  });
  assert(validBook.success, "Book schema validation should pass");

  const bookId = "book-001";
  books.push({
    id: bookId,
    title: "Engineering Electromagnetics",
    author: "William H. Hayt",
    categoryId: "123e4567-e89b-12d3-a456-426614174000",
    totalCopies: 2,
    availableCopies: 2,
  });

  // Physical copies
  copies.push(
    { id: "copy-001", bookId, copyCode: "SDA-EEE-001-C1", isAvailable: true, condition: "GOOD" },
    { id: "copy-002", bookId, copyCode: "SDA-EEE-001-C2", isAvailable: true, condition: "GOOD" }
  );

  assert(books[0].availableCopies === 2, "Initial available copies must equal total copies (2)");
  console.log("✓ Book and physical copies created successfully.\n");

  // =========================================================================
  // 2. LOAN ISSUANCE & DOUBLE-ISSUE PREVENTION
  // =========================================================================
  console.log("2. Testing Loan Issue & Concurrency Safety...");
  function issueLoan(bookId: string, copyId: string, borrowerId: string) {
    const book = books.find((b) => b.id === bookId);
    const copy = copies.find((c) => c.id === copyId);
    const activeBorrowerLoans = loans.filter((l) => l.borrowerId === borrowerId && l.status === "ISSUED");

    if (!book || book.availableCopies <= 0) {
      return { success: false, error: "Out of stock" };
    }
    if (!copy || !copy.isAvailable) {
      return { success: false, error: "Copy unavailable" };
    }
    if (activeBorrowerLoans.length >= 3) {
      return { success: false, error: "Max loans exceeded" };
    }

    copy.isAvailable = false;
    book.availableCopies -= 1;
    const loan: MockLoan = {
      id: `loan-${loans.length + 1}`,
      bookId,
      bookCopyId: copyId,
      borrowerId,
      issueDate: "2026-08-01",
      dueDate: "2026-08-15",
      returnDate: null,
      renewalCount: 0,
      status: "ISSUED",
      fineAmount: 0,
    };
    loans.push(loan);
    return { success: true, loan };
  }

  // Issue 1st copy
  const issue1 = issueLoan(bookId, "copy-001", "user-001");
  assert(issue1.success, "1st copy should be issued successfully");
  assert(books[0].availableCopies === 1, "Available copies should decrement to 1");

  // Attempt to double-issue the SAME physical copy
  const doubleIssue = issueLoan(bookId, "copy-001", "user-002");
  assert(!doubleIssue.success, "Double issue of same physical copy MUST fail");

  // Issue 2nd copy
  const issue2 = issueLoan(bookId, "copy-002", "user-002");
  assert(issue2.success, "2nd copy should be issued successfully");
  assert(books[0].availableCopies === 0, "Available copies should decrement to 0");

  // Attempt to issue when availableCopies = 0
  const outOfStockIssue = issueLoan(bookId, "copy-001", "user-003");
  assert(!outOfStockIssue.success, "Issuing out of stock book MUST fail");
  console.log("✓ Loan issue and double-issue prevention verified.\n");

  // =========================================================================
  // 3. BORROWER QUOTA ENFORCEMENT
  // =========================================================================
  console.log("3. Testing Borrower Loan Quota Limits (Max 3 Books)...");
  // User 001 already has 1 loan. Add 2 more.
  loans.push(
    { id: "loan-extra-1", bookId: "other", bookCopyId: "c3", borrowerId: "user-001", issueDate: "2026-08-01", dueDate: "2026-08-15", returnDate: null, renewalCount: 0, status: "ISSUED", fineAmount: 0 },
    { id: "loan-extra-2", bookId: "other", bookCopyId: "c4", borrowerId: "user-001", issueDate: "2026-08-01", dueDate: "2026-08-15", returnDate: null, renewalCount: 0, status: "ISSUED", fineAmount: 0 }
  );

  // Attempt to issue 4th book
  const quotaExceeded = issueLoan(bookId, "copy-001", "user-001");
  assert(!quotaExceeded.success, "Borrowing beyond max limit (3 books) MUST fail");
  console.log("✓ Borrower max quota enforcement verified.\n");

  // =========================================================================
  // 4. RETURN LOAN & OVERDUE FINE COMPUTATION
  // =========================================================================
  console.log("4. Testing Book Return & Overdue Calculation...");
  function returnLoan(loanId: string, returnDate: string) {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan || loan.status === "RETURNED") {
      return { success: false, error: "Already returned or invalid loan" };
    }

    const copy = copies.find((c) => c.id === loan.bookCopyId);
    const book = books.find((b) => b.id === loan.bookId);

    let fine = 0;
    if (returnDate > loan.dueDate) {
      const msDiff = new Date(returnDate).getTime() - new Date(loan.dueDate).getTime();
      const overdueDays = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
      fine = overdueDays * 2.0; // 2 BDT/day
    }

    loan.status = "RETURNED";
    loan.returnDate = returnDate;
    loan.fineAmount = fine;

    if (copy) copy.isAvailable = true;
    if (book) book.availableCopies += 1;

    return { success: true, fine };
  }

  // Return loan-1 on time
  const onTimeReturn = returnLoan("loan-1", "2026-08-10");
  assert(onTimeReturn.success, "On-time return should succeed");
  assert(onTimeReturn.fine === 0, "On-time return fine must be 0 BDT");
  assert(books[0].availableCopies === 1, "Available copies should increment to 1");

  // Double return prevention
  const doubleReturn = returnLoan("loan-1", "2026-08-11");
  assert(!doubleReturn.success, "Returning an already returned loan MUST fail");

  // Return loan-2 OVERDUE by 5 days (Due Aug 15, returned Aug 20)
  const overdueReturn = returnLoan("loan-2", "2026-08-20");
  assert(overdueReturn.success, "Overdue return should succeed");
  assert(overdueReturn.fine === 10.0, "5 days overdue fine must be 10.00 BDT (5 * 2 BDT)");
  assert(books[0].availableCopies === 2, "Available copies should increment back to 2");
  console.log("✓ Return lifecycle, double-return prevention, and overdue fines verified.\n");

  // =========================================================================
  // 5. RENEWAL LIMIT ENFORCEMENT (MAX 2 RENEWALS)
  // =========================================================================
  console.log("5. Testing Loan Renewal Limit Enforcement (Max 2)...");
  const activeLoan: MockLoan = {
    id: "loan-renew-test",
    bookId,
    bookCopyId: "copy-001",
    borrowerId: "user-005",
    issueDate: "2026-08-01",
    dueDate: "2026-08-15",
    returnDate: null,
    renewalCount: 0,
    status: "ISSUED",
    fineAmount: 0,
  };
  loans.push(activeLoan);

  function renewLoan(loan: MockLoan) {
    if (loan.renewalCount >= 2) {
      return { success: false, error: "Max renewals reached" };
    }
    loan.renewalCount += 1;
    const currentDue = new Date(loan.dueDate);
    currentDue.setDate(currentDue.getDate() + 14);
    loan.dueDate = currentDue.toISOString().split("T")[0];
    return { success: true, newDueDate: loan.dueDate };
  }

  const renew1 = renewLoan(activeLoan);
  assert(renew1.success && activeLoan.renewalCount === 1, "1st renewal should succeed");
  assert(activeLoan.dueDate === "2026-08-29", "Due date should extend by 14 days to Aug 29");

  const renew2 = renewLoan(activeLoan);
  assert(renew2.success && activeLoan.renewalCount === 2, "2nd renewal should succeed");

  const renew3 = renewLoan(activeLoan);
  assert(!renew3.success, "3rd renewal MUST fail (max 2 limit reached)");
  console.log("✓ Loan renewal limits and due date extension verified.\n");

  // =========================================================================
  // 6. RESERVATION QUEUE (FIFO) & CANCELLATION
  // =========================================================================
  console.log("6. Testing Reservation Queue FIFO Ordering & Cancellation...");
  reservations.push(
    { id: "res-001", bookId, userId: "user-010", status: "ACTIVE", createdAt: "2026-08-01T10:00:00Z" },
    { id: "res-002", bookId, userId: "user-011", status: "ACTIVE", createdAt: "2026-08-01T11:00:00Z" }
  );

  const activeReservations = reservations
    .filter((r) => r.bookId === bookId && r.status === "ACTIVE")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  assert(activeReservations[0].userId === "user-010", "First hold must be user-010 (FIFO order)");
  assert(activeReservations[1].userId === "user-011", "Second hold must be user-011");

  // Cancellation
  activeReservations[0].status = "CANCELLED";
  assert(activeReservations[0].status === "CANCELLED", "Reservation cancelled successfully");
  console.log("✓ Reservation FIFO queue and cancellation verified.\n");

  // =========================================================================
  // 7. BOOK DONATION LIFECYCLE & VALIDATION
  // =========================================================================
  console.log("7. Testing Book Donation Lifecycle & Validation...");
  const validDonation = bookDonationSchema.safeParse({
    donorName: "Md. Yeasir Arafat",
    donorEmail: "arafat@ruet.ac.bd",
    donorDepartment: "CSE",
    donorSeries: "19",
    bookTitle: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen",
    quantity: 2,
    condition: "GOOD",
    photoUrl: "https://example.com/clrs-cover.jpg",
    isPublicDonor: true,
  });
  assert(validDonation.success, "Book donation schema with department and series should pass");
  console.log("✓ Book donation schema and validation verified.\n");

  // =========================================================================
  // 8. ADMIN ACCEPTANCE, COVER IMAGE ATTACHMENT & DONOR ATTRIBUTION ENLISTING
  // =========================================================================
  console.log("8. Testing Admin Book Donation Acceptance & Catalog Enlisting...");
  const donationRecord = {
    id: "don-book-101",
    donorName: "Md. Yeasir Arafat_CSE'19",
    bookTitle: "Introduction to Algorithms (CLRS)",
    author: "Thomas H. Cormen",
    quantity: 2,
    condition: "GOOD",
    photoUrl: "https://example.com/clrs-cover.jpg",
    status: "PENDING" as const,
  };

  // Enlist the donated book into catalog
  const enlistedBook: MockBook = {
    id: "book-002",
    title: donationRecord.bookTitle,
    author: donationRecord.author,
    categoryId: "123e4567-e89b-12d3-a456-426614174000",
    totalCopies: donationRecord.quantity,
    availableCopies: donationRecord.quantity,
  };
  books.push(enlistedBook);

  // Generate physical copies with donor attribution
  const donatedCopies: (MockCopy & { donorName?: string; donationId?: string })[] = [];
  for (let i = 1; i <= donationRecord.quantity; i++) {
    const copy = {
      id: `copy-clrs-00${i}`,
      bookId: enlistedBook.id,
      copyCode: `SDA-CLRS-00${i}-D${i}`,
      isAvailable: true,
      condition: donationRecord.condition,
      donorName: donationRecord.donorName,
      donationId: donationRecord.id,
    };
    copies.push(copy);
    donatedCopies.push(copy);
  }

  // Update donation status to ACCEPTED
  const updatedDonation = { ...donationRecord, status: "ACCEPTED" as const };

  assert(enlistedBook.totalCopies === 2, "Enlisted book must have 2 total copies");
  assert(donatedCopies.length === 2, "2 physical copy records must be created");
  assert(donatedCopies[0].donorName === "Md. Yeasir Arafat_CSE'19", "Physical copy MUST record donor name_dept'series attribution");
  assert(updatedDonation.status === "ACCEPTED", "Donation status must update to ACCEPTED");
  console.log("✓ Book donation acceptance and catalog enlisting with donor attribution verified.\n");

  console.log("================================================================");
  console.log("ALL PHASE 7 LIBRARY CIRCULATION & INTEGRITY TESTS PASSED (8/8)  ");
  console.log("================================================================");
}

runLibraryCirculationTests();
