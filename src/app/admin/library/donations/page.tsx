import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requirePermissionOrRole } from "@/lib/auth/guards";
import { getAdminDonations } from "@/services/adminLibraryService";
import { getBookCategories } from "@/services/libraryService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ReviewDonationButton,
  AcceptAndEnlistDonationModal,
} from "@/features/admin/LibraryForms";
import { HeartHandshake, ArrowLeft, CheckCircle2, XCircle, Clock, BookOpen, ImageIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book Donations Queue | Admin Console",
  description: "Review, accept, and catalog textbook contributions from alumni and donors.",
};

export default async function AdminBookDonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermissionOrRole("library.manage_donations", ["ADMIN", "LIBRARIAN"]);
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "ALL";

  const [{ donations, count }, categories] = await Promise.all([
    getAdminDonations({ status: currentStatus }),
    getBookCategories(),
  ]);

  const statusTabs = [
    { id: "ALL", label: `All (${count})` },
    { id: "PENDING", label: "Pending Review" },
    { id: "ACCEPTED", label: "Accepted & Enlisted" },
    { id: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="space-y-8">
      {/* Back Link & Quick Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
          <Link href="/admin/library" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Circulation Desk
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/admin/library/books">Catalog Inventory</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/admin/library">Circulation Desk</Link>
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
          Textbook Donation Offerings
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Review voluntary book donations submitted by student members and alumni. Accept to automatically enlist into library catalog.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D9] pb-4">
        {statusTabs.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <a
              key={tab.id}
              href={`/admin/library/donations?status=${tab.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#7B2D26] text-white shadow-xs"
                  : "bg-white border border-[#E8E2D9] text-[#1E293B] hover:bg-[#FAF5F5]"
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Donations Table */}
      {donations.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake className="w-6 h-6 text-[#7B2D26]" />}
          title="No Donations Found"
          description="There are currently no book donation offers matching this status."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offered Textbook</TableHead>
              <TableHead>Donor Attribution</TableHead>
              <TableHead>Quantity &amp; Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Audit &amp; Enlist Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="flex items-start gap-3">
                    {d.photo_url ? (
                      <div className="relative w-10 h-14 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <Image
                          src={d.photo_url}
                          alt={d.book_title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-14 rounded bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#0F172A]">{d.book_title}</div>
                      <div className="text-[11px] text-[#64748B]">
                        Author: {d.author} {d.isbn ? `· ISBN: ${d.isbn}` : ""}
                      </div>
                      {d.message && (
                        <div className="text-[11px] text-[#64748B] italic mt-0.5 line-clamp-1">
                          &ldquo;{d.message}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    {d.donor_name}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {d.donor_email} {d.donor_phone ? `· ${d.donor_phone}` : ""}
                  </div>
                </TableCell>

                <TableCell className="text-xs">
                  <span className="font-bold">{d.quantity} {d.quantity === 1 ? "copy" : "copies"}</span>
                  <div className="text-[11px] text-[#64748B] capitalize">
                    Condition: {d.condition?.toLowerCase() || "Good"}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      d.status === "ACCEPTED" || d.status === "CATALOGUED"
                        ? "success"
                        : d.status === "REJECTED"
                        ? "destructive"
                        : "warning"
                    }
                    size="sm"
                    dot
                  >
                    {d.status === "ACCEPTED" ? "Enlisted in Catalog" : d.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  {formatDate(d.created_at)}
                </TableCell>

                <TableCell className="text-right">
                  {d.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-1.5">
                      <AcceptAndEnlistDonationModal donation={d} categories={categories} />
                      <ReviewDonationButton donationId={d.id} decision="REJECTED" />
                    </div>
                  )}
                  {d.status === "ACCEPTED" && (
                    <span className="text-xs font-semibold text-[#15803D] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enlisted in Library
                    </span>
                  )}
                  {d.status === "REJECTED" && (
                    <span className="text-xs font-medium text-slate-400">
                      Declined
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
