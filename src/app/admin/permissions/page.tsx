import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Granular Permissions Matrix | Admin Console",
  description: "Delegated institutional capabilities and permission catalog.",
};

export default async function AdminPermissionsPage() {
  await requireRole(["ADMIN"]);

  const permissions = [
    { id: "library.manage", name: "Manage Library Catalog", module: "Library", description: "Add, edit, or delete book titles and physical copies." },
    { id: "library.issue_book", name: "Issue Book Loans", module: "Library", description: "Issue and check out books to student members." },
    { id: "library.return_book", name: "Process Book Returns", module: "Library", description: "Receive returned books and compute overdue fines." },
    { id: "alumni.verify", name: "Verify Alumni Registrations", module: "Alumni", description: "Audit pending applications, approve, reject, or request corrections." },
    { id: "committee.manage", name: "Manage Executive Committee", module: "Committee", description: "Create committee terms, assign positions, and archive years." },
    { id: "activity.create", name: "Publish Activities & Blog", module: "Activities", description: "Write news articles, upload photo galleries, and publish." },
    { id: "event.create", name: "Manage Events & Rosters", module: "Events", description: "Create events, manage ticket registrations, and track attendance." },
    { id: "donation.verify", name: "Financial Donation Audit", module: "Donations", description: "Verify financial gifts, credit fund balances, and export CSV." },
    { id: "user.manage", name: "User & RBAC Administration", module: "Users", description: "Update institutional roles and manage account statuses." },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
          Granular Permissions Catalog
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Delegated capabilities assigned to administrative officers and librarians.
        </p>
      </div>

      {/* Permissions Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Permission Key</TableHead>
            <TableHead>Functional Capability</TableHead>
            <TableHead>Module Area</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs font-bold text-[#7B2D26]">
                {p.id}
              </TableCell>

              <TableCell className="font-semibold text-xs text-[#0F172A]">
                {p.name}
              </TableCell>

              <TableCell>
                <Badge variant="secondary" size="sm">
                  {p.module}
                </Badge>
              </TableCell>

              <TableCell className="text-xs text-[#64748B]">
                {p.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
