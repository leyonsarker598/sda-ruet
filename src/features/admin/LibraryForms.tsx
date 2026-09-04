"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  createBookAction,
  issueBookLoanAction,
  returnBookLoanAction,
  renewBookLoanAction,
  reviewDonationAction,
  type AdminLibraryResult,
} from "@/actions/adminLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, BookOpen, RotateCcw, CheckCircle2, ArrowDownLeft, AlertCircle, HeartHandshake } from "lucide-react";
import type { AdminBookItem } from "@/services/adminLibraryService";

export function CreateBookModal({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coverUrl, setCoverUrl] = React.useState("");
  const [state, formAction, isPending] = useActionState<AdminLibraryResult | null, FormData>(
    createBookAction,
    null
  );

  React.useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      setCoverUrl("");
    }
  }, [state?.success]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        leftIcon={<Plus className="w-4 h-4" />}
        className="font-semibold text-xs"
      >
        Catalog New Book
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Book to Digital Library Catalog"
        description="Catalog a new engineering textbook or reference book into the SDA RUET library."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" required>Book Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Higher Engineering Mathematics"
                required
                error={state?.fieldErrors?.title?.[0]}
              />
            </div>

            <div>
              <Label htmlFor="author" required>Primary Author</Label>
              <Input
                id="author"
                name="author"
                placeholder="e.g. B.S. Grewal"
                required
                error={state?.fieldErrors?.author?.[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId" required>Category</Label>
              <Select id="categoryId" name="categoryId" defaultValue={categories[0]?.id}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="edition">Edition / Volume</Label>
              <Input id="edition" name="edition" placeholder="e.g. 44th Edition" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="isbn">ISBN (Optional)</Label>
              <Input id="isbn" name="isbn" placeholder="e.g. 978-8174091955" />
            </div>

            <div>
              <Label htmlFor="shelfLocation">Shelf Location</Label>
              <Input id="shelfLocation" name="shelfLocation" placeholder="e.g. Shelf A-03" />
            </div>

            <div>
              <Label htmlFor="totalCopies" required>Physical Copies</Label>
              <Input
                id="totalCopies"
                name="totalCopies"
                type="number"
                defaultValue="1"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="coverImageUrl">Book Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg or /assets/books/sample.jpg"
            />
          </div>

          {coverUrl && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="relative w-12 h-16 rounded bg-slate-200 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-slate-600">Cover image preview</span>
            </div>
          )}

          <div>
            <Label htmlFor="description">Synopsis / Subject Topics</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Key concepts covered, relevant RUET course codes..."
              rows={2}
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Cataloguing..." : "Add to Library"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function IssueLoanModal({
  books,
  members,
}: {
  books: AdminBookItem[];
  members: Array<{ id: string; full_name: string; student_id: string | null; department: string | null }>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedBookId, setSelectedBookId] = React.useState<string>(books[0]?.id || "");
  const [state, formAction, isPending] = useActionState<AdminLibraryResult | null, FormData>(
    issueBookLoanAction,
    null
  );

  React.useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  const selectedBook = books.find((b) => b.id === selectedBookId) || books[0];
  const availableCopies = selectedBook?.copies?.filter((c) => c.is_available) || [];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        leftIcon={<ArrowDownLeft className="w-4 h-4" />}
        size="sm"
        className="font-semibold text-xs bg-[#15803D] hover:bg-[#166534] text-white"
      >
        Issue Book Loan
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Issue Book Loan"
        description="Check out a physical book copy to an active student, alumnus, or faculty member."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="bookId" required>Select Textbook</Label>
            <Select
              id="bookId"
              name="bookId"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.available_copies} available)
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bookCopyId" required>Available Copy Barcode</Label>
              <Select id="bookCopyId" name="bookCopyId">
                {availableCopies.length === 0 ? (
                  <option value="">No copies available</option>
                ) : (
                  availableCopies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.copy_code} (Condition: {c.condition})
                    </option>
                  ))
                )}
              </Select>
            </div>

            <div>
              <Label htmlFor="loanDays" required>Loan Period</Label>
              <Select id="loanDays" name="loanDays" defaultValue="14">
                <option value="7">7 Days</option>
                <option value="14">14 Days (Standard)</option>
                <option value="21">21 Days</option>
                <option value="30">30 Days (Semester Special)</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="borrowerId" required>Borrower (Member / Teacher)</Label>
            <Select id="borrowerId" name="borrowerId">
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.student_id ? `Roll: ${m.student_id}` : m.department || "Member"})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Librarian Circulation Notes</Label>
            <Input id="notes" name="notes" placeholder="Condition notes upon check-out..." />
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || availableCopies.length === 0}>
              {isPending ? "Checking Out..." : "Confirm & Issue Loan"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function ReturnLoanButton({ loanId }: { loanId: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="xs"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await returnBookLoanAction(loanId);
        });
      }}
      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />}
      className="text-xs"
    >
      {isPending ? "Returning..." : "Check In"}
    </Button>
  );
}

export function RenewLoanButton({ loanId }: { loanId: string }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="xs"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await renewBookLoanAction(loanId);
        });
      }}
      leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#7B2D26]" />}
      className="text-xs text-[#7B2D26]"
    >
      {isPending ? "Renewing..." : "Renew"}
    </Button>
  );
}

export function ReviewDonationButton({
  donationId,
  decision,
}: {
  donationId: string;
  decision: "ACCEPTED" | "REJECTED" | "CATALOGUED";
}) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="xs"
      variant={decision === "ACCEPTED" ? "outline" : "ghost"}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await reviewDonationAction(donationId, decision);
        });
      }}
      className={`text-xs ${
        decision === "ACCEPTED"
          ? "text-[#15803D] border-[#BBF7D0] hover:bg-[#F0FDF4]"
          : "text-[#DC2626] hover:bg-rose-50"
      }`}
    >
      {isPending ? "Updating..." : decision === "ACCEPTED" ? "Accept Only" : "Decline"}
    </Button>
  );
}

export function AcceptAndEnlistDonationModal({
  donation,
  categories = [],
}: {
  donation: {
    id: string;
    book_title: string;
    author: string;
    donor_name: string;
    donor_email: string;
    donor_phone?: string | null;
    quantity: number;
    condition: string;
    photo_url?: string | null;
    category_id?: string | null;
    message?: string | null;
  };
  categories: Array<{ id: string; name: string }>;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState(donation.book_title);
  const [author, setAuthor] = React.useState(donation.author);
  const [categoryId, setCategoryId] = React.useState(donation.category_id || categories[0]?.id || "");
  const [shelfLocation, setShelfLocation] = React.useState("Donation Shelf A");
  const [coverImageUrl, setCoverImageUrl] = React.useState(donation.photo_url || "");
  const [condition, setCondition] = React.useState(donation.condition || "GOOD");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleEnlist = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const { acceptAndEnlistDonationAction } = await import("@/actions/adminLibrary");
      const res = await acceptAndEnlistDonationAction(donation.id, {
        title,
        author,
        categoryId,
        shelfLocation,
        coverImageUrl: coverImageUrl || undefined,
        condition: condition as any,
      });

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-xs text-[#15803D] border-[#BBF7D0] hover:bg-[#F0FDF4] font-semibold"
        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
      >
        Accept &amp; Enlist
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Accept &amp; Enlist Book in Library"
        description="Inspect physical details and officially add this donated textbook to the active student lending catalog."
      >
        <form onSubmit={handleEnlist} className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Donor Attribution Banner */}
          <div className="p-3.5 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] space-y-1 text-xs">
            <div className="font-bold text-[#7B2D26] flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" />
              Donor Attribution: {donation.donor_name}
            </div>
            <div className="text-[#64748B]">
              Contact: {donation.donor_email} {donation.donor_phone ? `· ${donation.donor_phone}` : ""}
            </div>
            <div className="text-[#64748B] text-[11px]">
              Offering: <strong>{donation.quantity} physical {donation.quantity === 1 ? "copy" : "copies"}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="enlistTitle" required>Catalog Book Title</Label>
              <Input
                id="enlistTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="enlistAuthor" required>Author(s)</Label>
              <Input
                id="enlistAuthor"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="enlistCat" required>Subject Category</Label>
              <Select
                id="enlistCat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="enlistCondition">Physical Condition</Label>
              <Select
                id="enlistCondition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="NEW">Brand New / Mint</option>
                <option value="GOOD">Good (Standard)</option>
                <option value="FAIR">Fair (Minor wear)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="enlistShelf">Assigned Shelf Location</Label>
              <Input
                id="enlistShelf"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="e.g. Shelf A-04"
              />
            </div>

            <div>
              <Label htmlFor="enlistCover">Book Cover Image URL</Label>
              <Input
                id="enlistCover"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          {coverImageUrl && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="relative w-12 h-16 rounded bg-slate-200 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImageUrl} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-slate-600">Cover image linked to catalog</span>
            </div>
          )}

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#15803D] hover:bg-[#166534] text-white font-semibold"
            >
              {isPending ? "Enlisting in Library..." : "Confirm & Enlist in Catalog"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
