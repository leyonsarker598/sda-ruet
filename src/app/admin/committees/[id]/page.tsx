import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import {
  getCommitteeDetailById,
  getCommitteePositions,
} from "@/services/adminCommitteeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AddCommitteeMemberModal,
  SetCurrentCommitteeButton,
  ArchiveCommitteeButton,
} from "@/features/admin/CommitteeForms";
import { UploadCommitteeModal } from "@/features/admin/UploadCommitteeModal";
import { CommitteeMembersReorderTable } from "@/features/admin/CommitteeMembersReorderTable";
import { Award, ArrowLeft, Users, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Committee Term Roster | Admin Console",
  description: "Manage executive committee members roster, positions, and display order.",
};

export default async function AdminCommitteeRosterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const data = await getCommitteeDetailById(id);
  const positions = await getCommitteePositions();

  if (!data) {
    notFound();
  }

  const { committee, members } = data;

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
          <Link href="/admin/committees" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Committee Terms
          </Link>
        </Button>
      </div>

      {/* Term Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
              {committee.term_name}
            </h1>
            <Badge
              variant={committee.is_current ? "admin" : "secondary"}
              size="sm"
              dot={committee.is_current}
            >
              {committee.is_current ? "Active Current Term" : "Archived"}
            </Badge>
          </div>
          <p className="text-xs text-[#64748B]">
            Tenure: {formatDate(committee.start_date)} – {committee.end_date ? formatDate(committee.end_date) : "Present"} · {members.length} Committee Members
          </p>
          {committee.description && (
            <p className="text-xs text-[#334155] mt-2 max-w-xl">
              {committee.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!committee.is_current ? (
            <SetCurrentCommitteeButton committeeId={committee.id} />
          ) : (
            <ArchiveCommitteeButton committeeId={committee.id} />
          )}
          <UploadCommitteeModal committeeId={committee.id} />
          <AddCommitteeMemberModal
            committeeId={committee.id}
            positions={positions}
          />
        </div>
      </div>

      {/* Committee Members Drag-and-Drop Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0F172A] font-heading">
            Executive Committee Members ({members.length})
          </h3>
        </div>

        <CommitteeMembersReorderTable
          committeeId={committee.id}
          initialMembers={members}
        />
      </div>
    </div>
  );
}

