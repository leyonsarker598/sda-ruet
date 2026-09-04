import type { Metadata } from "next";
import Link from "next/link";
import { Award, Calendar, History, ArrowRight, User, ExternalLink } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getCurrentCommittee, getPastCommitteeTerms } from "@/services/committeeService";

export const metadata: Metadata = {
  title: "Executive Committee | SDA RUET",
  description:
    "Meet the current executive committee leadership and governing body of Sirajganj District Association, RUET.",
};

export default async function CommitteePage() {
  const profile = await getCurrentProfile();
  const committee = await getCurrentCommittee();
  const pastTerms = await getPastCommitteeTerms();

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header Title & Archive Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              Executive Leadership
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
              {committee?.term_name || "Executive Committee"}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Guiding student affairs, welfare distributions, library operations, and alumni connections.
            </p>
          </div>

          {pastTerms.length > 0 && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/committee/archive/${pastTerms[0].id}`} className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Past Committee Archive
              </Link>
            </Button>
          )}
        </div>

        {/* Current Committee Roster */}
        {!committee || !committee.members || committee.members.length === 0 ? (
          <EmptyState
            icon={<Award className="w-6 h-6 text-[#7B2D26]" />}
            title="Committee Roster Being Finalized"
            description="The current executive committee roster is being updated by the election commission."
          />
        ) : (
          <div className="space-y-10">
            {/* Top Leadership Tier (President & General Secretary) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {committee.members.slice(0, 2).map((member) => {
                const displayName = member.profile?.full_name || member.name;
                const displayDept = member.profile?.department || member.department || "RUET";
                const displaySeries = member.profile?.series || member.series;
                const displayRoll = member.profile?.student_id || "N/A";
                const displayPhone = member.profile?.phone || "N/A";
                const profileLink = member.profile_id
                  ? `/members/${member.profile_id}`
                  : `/members/${member.id}`;

                return (
                  <Card key={member.id} hoverable className="bg-white border-[#DFCEB5] shadow-xs text-center p-2">
                    <CardHeader className="items-center pb-2">
                      <div className="w-20 h-20 rounded-full bg-[#FAF5F5] border-2 border-[#7B2D26] flex items-center justify-center text-[#7B2D26] mb-3 text-xl font-bold font-heading shadow-xs">
                        {displayName.charAt(0)}
                      </div>
                      <Badge variant="admin" size="sm" className="mb-1">
                        {member.custom_position_title || member.position?.title || "Executive Leader"}
                      </Badge>
                      <CardTitle className="text-lg text-[#0F172A]">{displayName}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-[#64748B] space-y-1">
                      <div className="font-semibold text-[#1E293B]">
                        Department of {displayDept}
                      </div>
                      <div>
                        Series &apos;{displaySeries || "N/A"} · Roll: {displayRoll}
                      </div>
                      {displayPhone !== "N/A" && (
                        <div className="text-[11px] text-[#7B2D26]">Contact: {displayPhone}</div>
                      )}
                      <div className="pt-2">
                        <Button asChild size="xs" variant="outline" className="text-xs text-[#7B2D26] border-[#E6C9C7]">
                          <Link href={profileLink} className="flex items-center gap-1 font-semibold">
                            View Member Profile <ExternalLink className="w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Complete Executive Committee Members Roster Table */}
            <div className="space-y-4">
              <div className="border-b border-[#E8E2D9] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] font-heading">
                    Executive Committee Members ({committee.members.length})
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Governing student body and council members in assigned display order.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8E2D9] overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Dept</TableHead>
                      <TableHead>Series</TableHead>
                      <TableHead>Roll</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {committee.members.map((member) => {
                      const displayName = member.profile?.full_name || member.name;
                      const displayDept = member.profile?.department || member.department || "RUET";
                      const displaySeries = member.profile?.series || member.series;
                      const displayRoll = member.profile?.student_id || "N/A";
                      const displayPhone = member.profile?.phone || "N/A";
                      const profileLink = member.profile_id
                        ? `/members/${member.profile_id}`
                        : `/members/${member.id}`;

                      return (
                        <TableRow key={member.id} className="hover:bg-[#FBF9F5]">
                          <TableCell>
                            <div className="font-semibold text-[#0F172A] flex items-center gap-2">
                              {displayName}
                              <Badge variant="secondary" size="sm" className="text-[10px] py-0">
                                {member.custom_position_title || member.position?.title || "Executive Member"}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-[#64748B]">
                              {member.profile?.email || member.session || ""}
                            </div>
                          </TableCell>

                          <TableCell className="font-semibold text-xs text-[#7B2D26]">
                            {displayDept}
                          </TableCell>

                          <TableCell className="text-xs font-medium">
                            {displaySeries ? `Series '${displaySeries}` : "N/A"}
                          </TableCell>

                          <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                            {displayRoll}
                          </TableCell>

                          <TableCell className="text-xs text-[#334155]">
                            {displayPhone !== "N/A" ? displayPhone : <span className="text-slate-400">N/A</span>}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button asChild size="xs" variant="outline" className="text-xs text-[#7B2D26] border-[#E6C9C7] hover:bg-[#FAF5F5]">
                              <Link href={profileLink} className="flex items-center gap-1 font-semibold">
                                View Profile <ExternalLink className="w-3 h-3 ml-0.5" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
