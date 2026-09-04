import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAllCommittees } from "@/services/adminCommitteeService";
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
  CreateCommitteeModal,
  SetCurrentCommitteeButton,
  ArchiveCommitteeButton,
} from "@/features/admin/CommitteeForms";
import { UploadCommitteeModal } from "@/features/admin/UploadCommitteeModal";
import { Award, Calendar, Users, Star, ArrowRight, Settings } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Committee Terms Management | Admin Console",
  description: "Manage executive committee terms, designations, and student officer rosters.",
};

export default async function AdminCommitteesPage() {
  await requireRole(["ADMIN"]);
  const committees = await getAllCommittees();

  return (
    <div className="space-y-8">
      {/* Header Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Executive Committee Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Establish new executive terms, designate current governing committees, and manage officer rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UploadCommitteeModal committees={committees} />
          <CreateCommitteeModal />
        </div>
      </div>

      {/* Committees Table */}
      {committees.length === 0 ? (
        <EmptyState
          icon={<Award className="w-6 h-6 text-[#7B2D26]" />}
          title="No Committee Terms Created"
          description="Create your first executive committee term to begin managing leadership rosters."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Term Name</TableHead>
              <TableHead>Tenure Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Officers</TableHead>
              <TableHead>Quick Status Action</TableHead>
              <TableHead className="text-right">Manage Roster</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {committees.map((term) => (
              <TableRow key={term.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    <Link
                      href={`/admin/committees/${term.id}`}
                      className="hover:text-[#7B2D26] transition-colors"
                    >
                      {term.term_name}
                    </Link>
                  </div>
                  {term.description && (
                    <div className="text-[11px] text-[#64748B] line-clamp-1">
                      {term.description}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  {formatDate(term.start_date)} – {term.end_date ? formatDate(term.end_date) : "Present"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={term.is_current ? "admin" : "secondary"}
                    size="sm"
                    dot={term.is_current}
                  >
                    {term.is_current ? "Active Current Term" : "Archived"}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs font-semibold text-[#0F172A]">
                  {term.members_count} officers
                </TableCell>

                <TableCell>
                  {!term.is_current ? (
                    <SetCurrentCommitteeButton committeeId={term.id} />
                  ) : (
                    <ArchiveCommitteeButton committeeId={term.id} />
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <Button asChild size="xs" variant="outline">
                    <Link
                      href={`/admin/committees/${term.id}`}
                      className="flex items-center gap-1"
                    >
                      Manage Roster <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
