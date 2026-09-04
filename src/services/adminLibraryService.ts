import { createClient } from "@/lib/supabase/server";

export interface LibraryStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  activeLoans: number;
  overdueLoans: number;
  pendingDonations: number;
  activeReservations: number;
}

export interface AdminBookItem {
  id: string;
  isbn?: string | null;
  title: string;
  subtitle?: string | null;
  author: string;
  co_authors?: string[];
  publisher?: string | null;
  publication_year?: number | null;
  edition?: string | null;
  language: string;
  category_id: string;
  description?: string | null;
  cover_image_url?: string | null;
  shelf_location?: string | null;
  total_copies: number;
  available_copies: number;
  status: "AVAILABLE" | "OUT_OF_STOCK" | "ARCHIVED" | "DISCONTINUED";
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  copies?: Array<{
    id: string;
    copy_code: string;
    condition: string;
    is_available: boolean;
    donor_name?: string | null;
  }>;
}

export interface AdminLoanItem {
  id: string;
  book_id: string;
  book_copy_id: string;
  borrower_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  renewal_count: number;
  status: "ISSUED" | "RETURNED" | "OVERDUE" | "LOST" | "DAMAGED";
  fine_amount: number;
  fine_paid: boolean;
  issued_by: string;
  returned_to?: string | null;
  notes?: string | null;
  book?: {
    id: string;
    title: string;
    author: string;
  };
  copy?: {
    copy_code: string;
  };
  borrower?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    department: string | null;
    student_id: string | null;
  };
}

export interface AdminDonationItem {
  id: string;
  donor_id?: string | null;
  donor_name: string;
  donor_email: string;
  donor_phone?: string | null;
  book_title: string;
  author: string;
  isbn?: string | null;
  quantity: number;
  category_id?: string | null;
  condition: "NEW" | "GOOD" | "FAIR" | "DAMAGED" | "LOST";
  photo_url?: string | null;
  message?: string | null;
  status: "PENDING" | "RECEIVED" | "ACCEPTED" | "REJECTED" | "CATALOGUED";
  is_public_donor: boolean;
  created_at: string;
  category?: {
    name: string;
  };
}

export interface AdminReservationItem {
  id: string;
  book_id: string;
  user_id: string;
  status: "ACTIVE" | "FULFILLED" | "CANCELLED" | "EXPIRED";
  expires_at: string;
  created_at: string;
  book?: {
    id: string;
    title: string;
    author: string;
    available_copies: number;
  };
  user?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    student_id: string | null;
  };
}

export interface LibrarySettingsItem {
  id: string;
  max_books_per_member: number;
  max_books_per_alumni: number;
  default_loan_days: number;
  max_renewals: number;
  fine_per_day: number;
  max_overdue_days: number;
  reservation_valid_hours: number;
}

export const DEFAULT_LIBRARY_SETTINGS: LibrarySettingsItem = {
  id: "default",
  max_books_per_member: 2,
  max_books_per_alumni: 1,
  default_loan_days: 14,
  max_renewals: 1,
  fine_per_day: 2.0,
  max_overdue_days: 30,
  reservation_valid_hours: 48,
};

export async function getLibraryStats(): Promise<LibraryStats> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: books } = await (supabase as any).from("books").select("total_copies, available_copies");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: loans } = await (supabase as any).from("book_loans").select("status, due_date");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: donations } = await (supabase as any).from("book_donations").select("status");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reservations } = await (supabase as any).from("book_reservations").select("status");

    const totalBooks = books?.length || 0;
    const totalCopies = books?.reduce((sum: number, b: { total_copies: number }) => sum + (b.total_copies || 0), 0) || 0;
    const availableCopies = books?.reduce((sum: number, b: { available_copies: number }) => sum + (b.available_copies || 0), 0) || 0;

    const todayStr = new Date().toISOString().split("T")[0];
    let activeLoans = 0;
    let overdueLoans = 0;

    loans?.forEach((l: { status: string; due_date: string }) => {
      if (l.status === "ISSUED" || l.status === "OVERDUE") {
        activeLoans++;
        if (l.due_date < todayStr || l.status === "OVERDUE") {
          overdueLoans++;
        }
      }
    });

    const pendingDonations = donations?.filter((d: { status: string }) => d.status === "PENDING").length || 0;
    const activeReservations = reservations?.filter((r: { status: string }) => r.status === "ACTIVE").length || 0;

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      activeLoans,
      overdueLoans,
      pendingDonations,
      activeReservations,
    };
  } catch {
    return {
      totalBooks: 0,
      totalCopies: 0,
      availableCopies: 0,
      activeLoans: 0,
      overdueLoans: 0,
      pendingDonations: 0,
      activeReservations: 0,
    };
  }
}

export async function getAdminBooks(params?: {
  search?: string;
  categoryId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ books: AdminBookItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("books")
      .select("*, category:book_categories(id, name, slug), copies:book_copies(id, copy_code, condition, is_available, donor_name)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.categoryId && params.categoryId !== "ALL") {
      query = query.eq("category_id", params.categoryId);
    }

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%,isbn.ilike.%${params.search}%`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, count, error } = await query;
    if (error) return { books: [], count: 0 };
    return { books: data || [], count: count || (data || []).length };
  } catch {
    return { books: [], count: 0 };
  }
}

export async function getAdminBookById(id: string): Promise<AdminBookItem | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("books")
      .select("*, category:book_categories(id, name, slug), copies:book_copies(id, copy_code, condition, is_available, donor_name)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createBookWithCopies(data: {
  title: string;
  subtitle?: string;
  author: string;
  coAuthors?: string[];
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  language?: string;
  categoryId: string;
  description?: string;
  coverImageUrl?: string;
  shelfLocation?: string;
  totalCopies: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Insert book record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: book, error: bookError } = await (supabase as any)
      .from("books")
      .insert({
        title: data.title,
        subtitle: data.subtitle || null,
        author: data.author,
        co_authors: data.coAuthors || [],
        isbn: data.isbn || null,
        publisher: data.publisher || null,
        publication_year: data.publicationYear || null,
        edition: data.edition || null,
        language: data.language || "English",
        category_id: data.categoryId,
        description: data.description || null,
        cover_image_url: data.coverImageUrl || null,
        shelf_location: data.shelfLocation || null,
        total_copies: data.totalCopies,
        available_copies: data.totalCopies,
        status: "AVAILABLE",
      })
      .select("id")
      .single();

    if (bookError || !book) {
      return { success: false, error: bookError?.message || "Failed to create book" };
    }

    // 2. Generate copy barcodes
    const copies = [];
    const prefix = data.title.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase() || "BOOK";
    for (let i = 1; i <= data.totalCopies; i++) {
      copies.push({
        book_id: book.id,
        copy_code: `SDA-${prefix}-${Math.floor(100 + Math.random() * 900)}-C${i}`,
        condition: "GOOD",
        is_available: true,
        acquisition_type: "PURCHASE",
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: copyError } = await (supabase as any).from("book_copies").insert(copies);
    if (copyError) {
      return { success: false, error: copyError.message };
    }

    const { logBookCreated } = await import("@/services/auditLogService");
    await logBookCreated("system-admin", book.id, {
      title: data.title,
      author: data.author,
      totalCopies: data.totalCopies,
    });

    return { success: true, id: book.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating book";
    return { success: false, error: msg };
  }
}

export async function updateBook(
  id: string,
  data: {
    title: string;
    subtitle?: string;
    author: string;
    isbn?: string;
    publisher?: string;
    publicationYear?: number;
    edition?: string;
    categoryId: string;
    description?: string;
    shelfLocation?: string;
    coverImageUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("books")
      .update({
        title: data.title,
        subtitle: data.subtitle || null,
        author: data.author,
        isbn: data.isbn || null,
        publisher: data.publisher || null,
        publication_year: data.publicationYear || null,
        edition: data.edition || null,
        category_id: data.categoryId,
        description: data.description || null,
        shelf_location: data.shelfLocation || null,
        cover_image_url: data.coverImageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating book";
    return { success: false, error: msg };
  }
}

export async function deleteBook(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Check if there are active loans
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: activeLoans } = await (supabase as any)
      .from("book_loans")
      .select("id")
      .eq("book_id", id)
      .in("status", ["ISSUED", "OVERDUE"]);

    if (activeLoans && activeLoans.length > 0) {
      return {
        success: false,
        error: `Cannot delete book: There are ${activeLoans.length} active checked-out loans for this title.`,
      };
    }

    // Delete copies then book
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("book_copies").delete().eq("book_id", id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("books").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    const { logBookDeleted } = await import("@/services/auditLogService");
    await logBookDeleted("system-admin", id, { deletedAt: new Date().toISOString() });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting book";
    return { success: false, error: msg };
  }
}

export async function issueBookLoan(
  librarianId: string,
  data: {
    bookId: string;
    bookCopyId: string;
    borrowerId: string;
    loanDays?: number;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string; loanId?: string }> {
  try {
    const supabase = await createClient();
    const loanDays = data.loanDays || 14;

    // 1. Transaction-safe check: Is copy available?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: copy, error: copyError } = await (supabase as any)
      .from("book_copies")
      .select("id, book_id, is_available, condition")
      .eq("id", data.bookCopyId)
      .single();

    if (copyError || !copy) {
      return { success: false, error: "Selected book copy not found." };
    }

    if (!copy.is_available) {
      return { success: false, error: "This physical copy is currently checked out or unavailable." };
    }

    // 2. Check book availability
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: book, error: bookError } = await (supabase as any)
      .from("books")
      .select("id, available_copies")
      .eq("id", data.bookId)
      .single();

    if (bookError || !book || book.available_copies <= 0) {
      return { success: false, error: "No available copies left in the library catalog." };
    }

    // 3. Check borrower active loans limit (default 2 for student)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: borrowerLoans } = await (supabase as any)
      .from("book_loans")
      .select("id")
      .eq("borrower_id", data.borrowerId)
      .in("status", ["ISSUED", "OVERDUE"]);

    if (borrowerLoans && borrowerLoans.length >= 3) {
      return {
        success: false,
        error: "Borrower has reached the maximum allowed concurrent book loans (3 books).",
      };
    }

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + loanDays);

    const issueDateStr = today.toISOString().split("T")[0];
    const dueDateStr = dueDate.toISOString().split("T")[0];

    // 4. Create loan record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: loan, error: loanError } = await (supabase as any)
      .from("book_loans")
      .insert({
        book_id: data.bookId,
        book_copy_id: data.bookCopyId,
        borrower_id: data.borrowerId,
        issue_date: issueDateStr,
        due_date: dueDateStr,
        status: "ISSUED",
        issued_by: librarianId,
        notes: data.notes || null,
        fine_amount: 0,
        fine_paid: false,
      })
      .select("id")
      .single();

    if (loanError || !loan) {
      return { success: false, error: loanError?.message || "Failed to create loan." };
    }

    // 5. Mark copy as unavailable
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("book_copies")
      .update({ is_available: false })
      .eq("id", data.bookCopyId);

    // 6. Decrement book available copies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("books")
      .update({
        available_copies: Math.max(0, book.available_copies - 1),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.bookId);

    // 7. Dispatch in-app notification & email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: borrowerProfile } = await (supabase as any)
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", data.borrowerId)
      .single();

    if (borrowerProfile) {
      const { notifyBookIssued } = await import("@/services/notificationService");
      await notifyBookIssued({
        userId: borrowerProfile.id,
        userName: borrowerProfile.full_name,
        userEmail: borrowerProfile.email,
        bookTitle: book.title,
        dueDate: dueDateStr,
      });
    }

    const { logBookIssued } = await import("@/services/auditLogService");
    await logBookIssued(librarianId, loan.id, data.borrowerId, data.bookCopyId, book.title);

    return { success: true, loanId: loan.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error issuing book";
    return { success: false, error: msg };
  }
}

export async function returnBookLoan(
  librarianId: string,
  data: {
    loanId: string;
    condition?: "GOOD" | "FAIR" | "DAMAGED" | "LOST";
    finePaid?: boolean;
  }
): Promise<{ success: boolean; fineAmount?: number; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Fetch loan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: loan, error: loanError } = await (supabase as any)
      .from("book_loans")
      .select("*, copy:book_copies(id), book:books(id, available_copies)")
      .eq("id", data.loanId)
      .single();

    if (loanError || !loan) {
      return { success: false, error: "Loan record not found." };
    }

    if (loan.status === "RETURNED") {
      return { success: false, error: "This book loan has already been returned." };
    }

    const todayStr = new Date().toISOString().split("T")[0];
    let fineAmount = 0;

    // Calculate overdue fine (2 BDT / day overdue)
    if (todayStr > loan.due_date) {
      const msDiff = new Date(todayStr).getTime() - new Date(loan.due_date).getTime();
      const overdueDays = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
      fineAmount = overdueDays * 2.0;
    }

    // 2. Update loan record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateLoanError } = await (supabase as any)
      .from("book_loans")
      .update({
        status: "RETURNED",
        return_date: todayStr,
        returned_to: librarianId,
        fine_amount: fineAmount,
        fine_paid: data.finePaid || fineAmount === 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.loanId);

    if (updateLoanError) {
      return { success: false, error: updateLoanError.message };
    }

    // 3. Mark copy as available & update condition if provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const copyUpdates: Record<string, any> = { is_available: true };
    if (data.condition) copyUpdates.condition = data.condition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("book_copies")
      .update(copyUpdates)
      .eq("id", loan.book_copy_id);

    // 4. Increment book available copies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (loan.book) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("books")
        .update({
          available_copies: (loan.book.available_copies || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", loan.book_id);
    }

    const { logBookReturned } = await import("@/services/auditLogService");
    await logBookReturned(
      librarianId,
      data.loanId,
      loan.borrower_id,
      data.condition || "GOOD",
      fineAmount
    );

    return { success: true, fineAmount };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error returning book";
    return { success: false, error: msg };
  }
}

export async function renewBookLoan(
  loanId: string,
  extraDays = 14,
  borrowerId?: string
): Promise<{ success: boolean; newDueDate?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: loan, error: loanError } = await (supabase as any)
      .from("book_loans")
      .select("id, borrower_id, due_date, renewal_count, status")
      .eq("id", loanId)
      .single();

    if (loanError || !loan) {
      return { success: false, error: "Loan record not found." };
    }

    // IDOR Security Protection: Ensure caller owns the loan unless an admin/librarian executes it
    if (borrowerId && loan.borrower_id !== borrowerId) {
      return {
        success: false,
        error: "Unauthorized: You can only renew your own active book loans.",
      };
    }

    if (loan.status !== "ISSUED") {
      return { success: false, error: "Only active issued loans can be renewed." };
    }

    if (loan.renewal_count >= 2) {
      return { success: false, error: "Maximum renewal limit reached (2 renewals allowed)." };
    }

    const currentDue = new Date(loan.due_date);
    currentDue.setDate(currentDue.getDate() + extraDays);
    const newDueDateStr = currentDue.toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("book_loans")
      .update({
        due_date: newDueDateStr,
        renewal_count: loan.renewal_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", loanId);

    if (updateError) return { success: false, error: updateError.message };
    return { success: true, newDueDate: newDueDateStr };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error renewing loan";
    return { success: false, error: msg };
  }
}

export async function getAdminLoans(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ loans: AdminLoanItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("book_loans")
      .select("*, book:books(id, title, author), copy:book_copies(copy_code), borrower:profiles!borrower_id(id, full_name, email, phone, department, student_id)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, count, error } = await query;
    if (error) return { loans: [], count: 0 };
    return { loans: data || [], count: count || (data || []).length };
  } catch {
    return { loans: [], count: 0 };
  }
}

export async function getUserLibraryLoans(
  userId: string
): Promise<{ activeLoans: AdminLoanItem[]; pastLoans: AdminLoanItem[] }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: loans, error } = await (supabase as any)
      .from("book_loans")
      .select("*, book:books(id, title, author, cover_image_url), copy:book_copies(copy_code)")
      .eq("borrower_id", userId)
      .order("created_at", { ascending: false });

    if (error || !loans) return { activeLoans: [], pastLoans: [] };

    const activeLoans = loans.filter((l: AdminLoanItem) => l.status === "ISSUED" || l.status === "OVERDUE");
    const pastLoans = loans.filter((l: AdminLoanItem) => l.status === "RETURNED" || l.status === "LOST" || l.status === "DAMAGED");

    return { activeLoans, pastLoans };
  } catch {
    return { activeLoans: [], pastLoans: [] };
  }
}

export async function getUserReservations(userId: string): Promise<AdminReservationItem[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("book_reservations")
      .select("*, book:books(id, title, author, available_copies)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function reserveBook(
  userId: string,
  bookId: string
): Promise<{ success: boolean; reservationId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Check if user already has active reservation for this book
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("book_reservations")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .eq("status", "ACTIVE")
      .single();

    if (existing) {
      return { success: false, error: "You already have an active reservation hold for this textbook." };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3-day hold queue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error } = await (supabase as any)
      .from("book_reservations")
      .insert({
        book_id: bookId,
        user_id: userId,
        status: "ACTIVE",
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, reservationId: inserted?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error reserving book";
    return { success: false, error: msg };
  }
}

export async function cancelReservation(
  reservationId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("book_reservations")
      .update({ status: "CANCELLED" })
      .eq("id", reservationId);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error cancelling reservation";
    return { success: false, error: msg };
  }
}

export async function getAdminDonations(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ donations: AdminDonationItem[]; count: number }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("book_donations")
      .select("*, category:book_categories(name)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, count, error } = await query;
    if (error) return { donations: [], count: 0 };
    return { donations: data || [], count: count || (data || []).length };
  } catch {
    return { donations: [], count: 0 };
  }
}

export async function reviewDonation(
  librarianId: string,
  donationId: string,
  decision: "ACCEPTED" | "REJECTED" | "CATALOGUED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("book_donations")
      .update({
        status: decision,
        reviewed_by: librarianId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", donationId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error reviewing donation";
    return { success: false, error: msg };
  }
}

export async function acceptAndEnlistBookDonation(
  librarianId: string,
  donationId: string,
  options?: {
    title?: string;
    author?: string;
    categoryId?: string;
    shelfLocation?: string;
    coverImageUrl?: string;
    condition?: "NEW" | "GOOD" | "FAIR" | "DAMAGED" | "LOST";
  }
): Promise<{ success: boolean; bookId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Fetch donation record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: donation, error: donationError } = await (supabase as any)
      .from("book_donations")
      .select("*")
      .eq("id", donationId)
      .single();

    if (donationError || !donation) {
      return { success: false, error: "Book donation record not found." };
    }

    const bookTitle = options?.title || donation.book_title;
    const authorName = options?.author || donation.author;
    const coverUrl = options?.coverImageUrl || donation.photo_url || null;
    const condition = options?.condition || donation.condition || "GOOD";
    const quantity = donation.quantity || 1;

    // Resolve category
    let categoryId = options?.categoryId || donation.category_id;
    if (!categoryId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: defaultCat } = await (supabase as any)
        .from("book_categories")
        .select("id")
        .limit(1)
        .single();
      categoryId = defaultCat?.id;
    }

    // 2. Check if a book with matching title & author exists in catalog
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bookQuery = (supabase as any)
      .from("books")
      .select("id, total_copies, available_copies, cover_image_url")
      .ilike("title", bookTitle.trim())
      .ilike("author", authorName.trim());

    const { data: existingBooks } = await bookQuery;
    let targetBookId: string;

    if (existingBooks && existingBooks.length > 0) {
      const existingBook = existingBooks[0];
      targetBookId = existingBook.id;

      // Update existing book copies count and cover if missing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("books")
        .update({
          total_copies: existingBook.total_copies + quantity,
          available_copies: existingBook.available_copies + quantity,
          cover_image_url: existingBook.cover_image_url || coverUrl,
          status: "AVAILABLE",
        })
        .eq("id", targetBookId);
    } else {
      // Insert new book into catalog
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newBook, error: insertBookError } = await (supabase as any)
        .from("books")
        .insert({
          title: bookTitle.trim(),
          author: authorName.trim(),
          isbn: donation.isbn || null,
          category_id: categoryId,
          cover_image_url: coverUrl,
          shelf_location: options?.shelfLocation || "Donation Section",
          total_copies: quantity,
          available_copies: quantity,
          status: "AVAILABLE",
          language: "English",
        })
        .select("id")
        .single();

      if (insertBookError || !newBook) {
        return { success: false, error: insertBookError?.message || "Failed to enlist book in catalog." };
      }
      targetBookId = newBook.id;
    }

    // 3. Generate physical copy barcodes attributed to the donor
    const prefix = bookTitle.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase() || "DON";
    const copies = [];
    for (let i = 1; i <= quantity; i++) {
      copies.push({
        book_id: targetBookId,
        copy_code: `SDA-${prefix}-${Math.floor(100 + Math.random() * 900)}-D${i}`,
        condition,
        is_available: true,
        acquisition_type: "DONATION",
        donation_id: donation.id,
        donor_name: donation.donor_name, // e.g. Md. Yeasir Arafat_CSE'19
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: copyError } = await (supabase as any).from("book_copies").insert(copies);
    if (copyError) {
      return { success: false, error: copyError.message };
    }

    // 4. Update donation record status to ACCEPTED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("book_donations")
      .update({
        status: "ACCEPTED",
        reviewed_by: librarianId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", donationId);

    // 5. Notify donor if registered
    if (donation.donor_id) {
      try {
        const { createNotification } = await import("@/services/notificationService");
        await createNotification({
          userId: donation.donor_id,
          title: "Book Donation Enlisted in Library!",
          message: `Your textbook "${bookTitle}" has been inspected and officially added to the SDA RUET lending catalog. Thank you for empowering junior students!`,
          type: "DONATION_VERIFIED",
          linkUrl: `/library/${targetBookId}`,
        });
      } catch {
        // Non-blocking notification
      }
    }

    return { success: true, bookId: targetBookId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error enlisting donated book";
    return { success: false, error: msg };
  }
}

