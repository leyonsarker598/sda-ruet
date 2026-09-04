import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import {
  getDonationStats,
  getAdminDonations,
  generateDonationsCSVReport,
} from "@/services/adminDonationService";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  VerifyDonationButton,
  RejectDonationButton,
  ExportCSVButton,
} from "@/features/donations/AdminDonationActions";
import { DollarSign, CheckCircle2, Clock, XCircle, HeartHandshake, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Donation Audit & Financial Reports | Admin Console",
  description: "Verify transactions, credit welfare fund accounts, and generate audit reports.",
};

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "PENDING";

  const stats = await getDonationStats();
  const { donations, count } = await getAdminDonations({
    status: currentStatus,
    search: resolvedParams.q,
  });

  const csvData = await generateDonationsCSVReport();

  const statusTabs = [
    { id: "PENDING", label: `Pending Verification (${stats.pendingCount})`, icon: <Clock className="w-3.5 h-3.5 text-[#B45309]" /> },
    { id: "VERIFIED", label: `Verified (${stats.verifiedCount})`, icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" /> },
    { id: "REJECTED", label: `Rejected (${stats.rejectedCount})`, icon: <XCircle className="w-3.5 h-3.5 text-[#DC2626]" /> },
    { id: "ALL", label: `All (${stats.totalDonationsCount})`, icon: <DollarSign className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Donations &amp; Financial Audit
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit student welfare payments, verify bank/bKash receipts, and export treasurer balance sheets.
          </p>
        </div>

        <ExportCSVButton csvData={csvData} />
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block">
                Total Raised
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#15803D] font-heading block">
                {stats.totalRaisedBDT.toLocaleString()} BDT
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#15803D] shrink-0 shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider block">
                Pending Audit
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {stats.pendingCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#7B2D26] uppercase tracking-wider block">
                Verified Gifts
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {stats.verifiedCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-[#E8E2D9] shadow-xs">
          <CardContent className="py-3 px-4 sm:px-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider block">
                Rejected
              </span>
              <span className="text-2xl font-bold text-[#0F172A] font-heading block">
                {stats.rejectedCount}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0 shadow-2xs">
              <XCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {statusTabs.map((tab) => {
            const isActive = currentStatus === tab.id;
            const searchParam = resolvedParams.q ? `&q=${encodeURIComponent(resolvedParams.q)}` : "";
            return (
              <a
                key={tab.id}
                href={`/admin/donations?status=${tab.id}${searchParam}`}
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

        <form method="GET" action="/admin/donations" className="flex items-center gap-2">
          <input type="hidden" name="status" value={currentStatus} />
          <input
            type="text"
            name="q"
            defaultValue={resolvedParams.q || ""}
            placeholder="Search donor, email, TrxID..."
            className="px-3 py-1.5 bg-white border border-[#E8E2D9] rounded-lg text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#7B2D26] w-52 sm:w-60"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
          {resolvedParams.q && (
            <a
              href={`/admin/donations?status=${currentStatus}`}
              className="px-2 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A]"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Transactions Table */}
      {donations.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake className="w-6 h-6 text-[#7B2D26]" />}
          title="No Transactions Found"
          description={
            resolvedParams.q
              ? `No transactions found matching query "${resolvedParams.q}".`
              : `No financial transactions matching status "${currentStatus}".`
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor Information</TableHead>
              <TableHead>Purpose / Fund</TableHead>
              <TableHead>Amount (BDT)</TableHead>
              <TableHead>Method &amp; TrxID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Audit Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    {d.donor_name}
                    {d.is_anonymous && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">
                        <EyeOff className="w-2.5 h-2.5" /> Anonymous on Wall
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {d.donor_email} {d.donor_phone ? `· ${d.donor_phone}` : ""}
                  </div>
                  {d.message && (
                    <div className="text-[11px] text-[#64748B] italic mt-0.5 line-clamp-1">
                      &ldquo;{d.message}&rdquo;
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-xs font-semibold text-[#0F172A]">
                  {d.fund?.name || "General Welfare Fund"}
                </TableCell>

                <TableCell className="text-xs font-bold text-[#15803D]">
                  ৳ {d.amount.toLocaleString()} BDT
                </TableCell>

                <TableCell className="text-xs">
                  <Badge variant="secondary" size="sm">
                    {d.payment_method}
                  </Badge>
                  <div className="font-mono text-[11px] text-[#7B2D26] mt-0.5 font-bold">
                    {d.transaction_id || "N/A"}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      d.status === "VERIFIED"
                        ? "success"
                        : d.status === "REJECTED"
                        ? "destructive"
                        : "warning"
                    }
                    size="sm"
                    dot
                  >
                    {d.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  <div>{formatDate(d.created_at)}</div>
                  {d.status === "VERIFIED" && d.verified_at && (
                    <div className="text-[10px] text-[#15803D] mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Verified {d.verifier?.full_name ? `by ${d.verifier.full_name}` : ""}
                    </div>
                  )}
                  {d.status === "REJECTED" && d.payment_reference && (
                    <div className="text-[10px] text-rose-600 mt-0.5 line-clamp-1">
                      {d.payment_reference}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {(d.status === "PENDING" || d.status === "SUBMITTED") && (
                    <div className="flex items-center justify-end gap-1.5">
                      <VerifyDonationButton
                        donationId={d.id}
                        donorName={d.donor_name}
                        amount={d.amount}
                        fundName={d.fund?.name || "General Welfare Fund"}
                      />
                      <RejectDonationButton donationId={d.id} />
                    </div>
                  )}
                  {d.status === "VERIFIED" && (
                    <span className="text-xs font-medium text-[#15803D] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Credited
                    </span>
                  )}
                  {d.status === "REJECTED" && (
                    <span className="text-xs font-medium text-slate-400">
                      Rejected
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
