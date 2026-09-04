import type { Metadata } from "next";
import Link from "next/link";
import { requirePermissionOrRole } from "@/lib/auth/guards";
import {
  getLibraryStats,
  getAdminLoans,
  getAdminBooks,
} from "@/services/adminLibraryService";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  IssueLoanModal,
  ReturnLoanButton,
  RenewLoanButton,
} from "@/features/admin/LibraryForms";
import {
  BookOpen,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  BookmarkCheck,
  Settings,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Library Circulation Desk | Admin Console",
  description: "Manage book checkouts, returns, loan renewals, and circulation reports.",
};

export default async function AdminLibraryCirculationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requirePermissionOrRole("library.manage", ["ADMIN", "LIBRARIAN"]);
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "ISSUED";

  const stats = await getLibraryStats();
  const { loans } = await getAdminLoans({
    status: currentStatus,
    search: resolvedParams.q,
  });

  // Fetch available books and active members for Issue Modal
  const { books } = await getAdminBooks({ limit: 100 });
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: members } = await (supabase as any)
    .from("profiles")
    .select("id, full_name, student_id, department")
    .eq("status", "ACTIVE")
    .order("full_name", { ascending: true })
    .limit(100);

  const statusTabs = [
    { id: "ISSUED", label: `Active Loans (${stats.activeLoans})`, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "OVERDUE", label: `Overdue Loans (${stats.overdueLoans})`, icon: <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" /> },
    { id: "RETURNED", label: "Returned History", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: "ALL", label: "All Circulation", icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Library Circulation Desk
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit textbook loans, process book returns, and supervise circulation ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/admin/library/books">Catalog Inventory</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/admin/library/donations">Donations ({stats.pendingDonations})</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/admin/library/reservations">Reservations ({stats.activeReservations})</Link>
          </Button>
          <IssueLoanModal books={books} members={members || []} />
        </div>
      </div>

      {/* Circulation Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#7B2D26] uppercase tracking-wider block">
                Active Loans
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {stats.activeLoans}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider block">
                Overdue Loans
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {stats.overdueLoans}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block">
                Available Copies
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {stats.availableCopies} / {stats.totalCopies}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider block">
                Queued Holds
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {stats.activeReservations}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0 shadow-2xs">
              <BookmarkCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D9] pb-4">
        {statusTabs.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <a
              key={tab.id}
              href={`/admin/library?status=${tab.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#7B2D26] text-white shadow-xs"
                  : "bg-white border border-[#E8E2D9] text-[#1E293B] hover:bg-[#FAF5F5]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </a>
          );
        })}
      </div>

      {/* Circulation Loans Table */}
      {loans.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6 text-[#7B2D26]" />}
          title="No Circulation Records"
          description={`No book circulation transactions matching the filter "${currentStatus}".`}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Textbook &amp; Barcode</TableHead>
              <TableHead>Borrower Information</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status / Fines</TableHead>
              <TableHead className="text-right">Circulation Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => {
              const isOverdue = loan.status === "OVERDUE" || (loan.status === "ISSUED" && loan.due_date < new Date().toISOString().split("T")[0]);
              return (
                <TableRow key={loan.id}>
                  <TableCell>
                    <div className="font-semibold text-[#0F172A]">
                      {loan.book?.title || "Textbook"}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      By {loan.book?.author} · <span className="font-mono font-bold text-[#7B2D26]">{loan.copy?.copy_code}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-[#0F172A]">
                      {loan.borrower?.full_name}
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {loan.borrower?.student_id ? `Roll: ${loan.borrower.student_id}` : loan.borrower?.email}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-[#64748B]">
                    {formatDate(loan.issue_date)}
                  </TableCell>

                  <TableCell className="text-xs">
                    <span className={isOverdue ? "font-bold text-[#DC2626]" : "text-[#0F172A]"}>
                      {formatDate(loan.due_date)}
                    </span>
                    {loan.renewal_count > 0 && (
                      <span className="block text-[10px] text-[#64748B]">
                        (Renewed {loan.renewal_count}x)
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        loan.status === "RETURNED"
                          ? "success"
                          : isOverdue
                          ? "destructive"
                          : "secondary"
                      }
                      size="sm"
                      dot
                    >
                      {loan.status === "RETURNED" ? "Returned" : isOverdue ? "Overdue" : "Issued"}
                    </Badge>
                    {loan.fine_amount > 0 && (
                      <span className="block text-[10px] text-[#DC2626] font-bold mt-0.5">
                        Fine: {loan.fine_amount} BDT
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {loan.status !== "RETURNED" && (
                      <div className="flex items-center justify-end gap-1.5">
                        <RenewLoanButton loanId={loan.id} />
                        <ReturnLoanButton loanId={loan.id} />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
