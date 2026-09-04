"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  History,
  ArrowLeft,
  Users,
  Search,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, cn } from "@/lib/utils";
import type { CommitteeTermItem, CommitteeMemberItem } from "@/services/committeeService";

interface PreviousCommitteeViewerProps {
  terms: CommitteeTermItem[];
  initialTermId?: string;
}

export function PreviousCommitteeViewer({
  terms,
  initialTermId,
}: PreviousCommitteeViewerProps) {
  // Filter for non-current terms by default, or fallback to all terms
  const pastTerms = React.useMemo(() => {
    const past = terms.filter((t) => !t.is_current);
    return past.length > 0 ? past : terms;
  }, [terms]);

  const [selectedTermId, setSelectedTermId] = React.useState<string>(() => {
    if (initialTermId && pastTerms.some((t) => t.id === initialTermId)) {
      return initialTermId;
    }
    return pastTerms[0]?.id || "";
  });

  const [searchQuery, setSearchQuery] = React.useState("");

  const activeTerm = React.useMemo(() => {
    return pastTerms.find((t) => t.id === selectedTermId) || pastTerms[0] || null;
  }, [pastTerms, selectedTermId]);

  const filteredMembers = React.useMemo(() => {
    if (!activeTerm?.members) return [];
    if (!searchQuery.trim()) return activeTerm.members;

    const query = searchQuery.toLowerCase();
    return activeTerm.members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        (m.custom_position_title || m.position?.title || "").toLowerCase().includes(query) ||
        (m.department || "").toLowerCase().includes(query) ||
        (m.series || "").toLowerCase().includes(query)
    );
  }, [activeTerm, searchQuery]);

  // Top tier leaders (President, General Secretary) vs general body
  const topLeaders = React.useMemo(() => {
    if (!filteredMembers.length) return [];
    if (searchQuery.trim()) return []; // Flatten in search mode
    return filteredMembers.slice(0, 2);
  }, [filteredMembers, searchQuery]);

  const generalMembers = React.useMemo(() => {
    if (!filteredMembers.length) return [];
    if (searchQuery.trim()) return filteredMembers;
    return filteredMembers.slice(2);
  }, [filteredMembers, searchQuery]);

  // Helper to extract clean session display string
  const getSessionLabel = (term: CommitteeTermItem) => {
    const match = term.term_name.match(/\b(20\d\d\s*[-–—/]\s*20\d\d|20\d\d)\b/);
    if (match) return match[0].replace(/\s+/g, "");
    return term.term_name;
  };

  if (pastTerms.length === 0) {
    return (
      <EmptyState
        icon={<History className="w-8 h-8 text-[#7B2D26]" />}
        title="Historical Archives Being Digitized"
        description="Past executive committee records from previous academic sessions are currently being transcribed into the digital archive."
      />
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E2D9] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5" />
            Executive Heritage
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight">
            Previous Executive Committees
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-2xl">
            Explore past governing bodies, student leaders, and executive councils who shaped Sirajganj District Association, RUET across historical sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="outline" className="text-xs border-[#DFCEB5]">
            <Link href="/committee" className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#7B2D26]" />
              Current Executive Committee
            </Link>
          </Button>
        </div>
      </div>

      {/* Horizontal List of Sessions / Years */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-[#7B2D26]" />
            Select Academic Session / Tenure Year
          </div>
          <span className="text-[11px] text-[#64748B]">
            {pastTerms.length} Historical {pastTerms.length === 1 ? "Session" : "Sessions"} Available
          </span>
        </div>

        {/* Scrollable Horizontal Pill Track */}
        <div className="relative">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scroll-smooth focus:outline-none scrollbar-thin scrollbar-thumb-[#E8E2D9]">
            {pastTerms.map((term) => {
              const isSelected = term.id === activeTerm?.id;
              const sessionLabel = getSessionLabel(term);

              return (
                <button
                  key={term.id}
                  onClick={() => {
                    setSelectedTermId(term.id);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer select-none",
                    isSelected
                      ? "bg-[#7B2D26] text-white border-[#60211B] shadow-md shadow-[#7B2D26]/15 scale-[1.02]"
                      : "bg-white text-[#1E293B] border-[#E8E2D9] hover:border-[#DFCEB5] hover:bg-[#FAF5F5] hover:text-[#7B2D26]"
                  )}
                  aria-pressed={isSelected}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold",
                      isSelected ? "bg-white/20 text-white" : "bg-[#FAF5F5] text-[#7B2D26]"
                    )}
                  >
                    {term.members?.length || 0}
                  </div>

                  <div className="text-left">
                    <div className="font-bold text-[13px] leading-tight">
                      {sessionLabel}
                    </div>
                    <div
                      className={cn(
                        "text-[10px] font-normal leading-tight mt-0.5",
                        isSelected ? "text-white/80" : "text-[#64748B]"
                      )}
                    >
                      {formatDate(term.start_date)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Session Committee Roster View */}
      {activeTerm && (
        <div className="space-y-8 bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Term Metadata & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F1ECE4]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-[#0F172A] font-heading">
                  {activeTerm.term_name}
                </h2>
                <Badge variant="secondary" size="sm">
                  Historical Tenure
                </Badge>
              </div>
              <p className="text-xs text-[#64748B] flex items-center gap-2">
                <span>
                  Tenure Period: {formatDate(activeTerm.start_date)} –{" "}
                  {activeTerm.end_date ? formatDate(activeTerm.end_date) : "Concluded"}
                </span>
                <span>•</span>
                <span>{activeTerm.members?.length || 0} Committee Officers</span>
              </p>
              {activeTerm.description && (
                <p className="text-xs text-[#334155] pt-1 max-w-2xl leading-relaxed">
                  {activeTerm.description}
                </p>
              )}
            </div>

            {/* Fast Member Search */}
            <div className="w-full md:w-72">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search officers or position..."
                  className="pl-8 text-xs bg-[#FBF9F5] border-[#E8E2D9]"
                />
              </div>
            </div>
          </div>

          {/* Members Display */}
          {filteredMembers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Users className="w-8 h-8 text-[#94A3B8] mx-auto" />
              <div className="text-sm font-semibold text-[#0F172A]">
                {searchQuery ? "No matching officers found" : "Roster Records Archived Offline"}
              </div>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                {searchQuery
                  ? "Try searching for a different name, department, or executive designation."
                  : "The complete officer list for this tenure is being transcribed from association yearbooks."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Leadership Tier (President & General Secretary) */}
              {topLeaders.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#7B2D26] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Principal Executive Leadership
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {topLeaders.map((member) => {
                      const displayName = member.profile?.full_name || member.name;
                      const displayDept = member.profile?.department || member.department || "RUET";
                      const displaySeries = member.profile?.series || member.series;
                      const displayRoll = member.profile?.student_id || "N/A";
                      const displayPhone = member.profile?.phone || "N/A";
                      const profileLink = member.profile_id
                        ? `/members/${member.profile_id}`
                        : `/members/${member.id}`;

                      return (
                        <Card
                          key={member.id}
                          hoverable
                          className="bg-[#FAF5F5]/40 border-[#DFCEB5] shadow-xs p-2 text-center relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7B2D26]/5 rounded-bl-full pointer-events-none" />
                          <CardHeader className="items-center pb-2">
                            <div className="w-20 h-20 rounded-full bg-white border-2 border-[#7B2D26] flex items-center justify-center text-[#7B2D26] mb-3 text-xl font-bold font-heading shadow-xs">
                              {member.photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={member.photo_url}
                                  alt={displayName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                displayName.charAt(0)
                              )}
                            </div>
                            <Badge variant="admin" size="sm" className="mb-1">
                              {member.custom_position_title ||
                                member.position?.title ||
                                "Executive Leader"}
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
                                  View Member Profile
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Complete Executive Committee Members Roster Table */}
              <div className="space-y-4">
                {topLeaders.length > 0 && (
                  <h3 className="text-base font-bold text-[#0F172A] font-heading border-b border-[#F1ECE4] pb-2">
                    Executive Committee Members &amp; Council Roster
                  </h3>
                )}

                <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E8E2D9] bg-[#FBF9F5] text-[#64748B] text-[11px] uppercase tracking-wider font-bold">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Dept</th>
                          <th className="py-3 px-4">Series</th>
                          <th className="py-3 px-4">Roll</th>
                          <th className="py-3 px-4">Phone Number</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1ECE4]">
                        {filteredMembers.map((member) => {
                          const displayName = member.profile?.full_name || member.name;
                          const displayDept = member.profile?.department || member.department || "RUET";
                          const displaySeries = member.profile?.series || member.series;
                          const displayRoll = member.profile?.student_id || "N/A";
                          const displayPhone = member.profile?.phone || "N/A";
                          const profileLink = member.profile_id
                            ? `/members/${member.profile_id}`
                            : `/members/${member.id}`;

                          return (
                            <tr key={member.id} className="hover:bg-[#FAF5F5]/60 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#0F172A] flex items-center gap-2">
                                  {displayName}
                                  <Badge variant="secondary" size="sm" className="text-[10px] py-0">
                                    {member.custom_position_title ||
                                      member.position?.title ||
                                      "Executive Member"}
                                  </Badge>
                                </div>
                                <div className="text-[11px] text-[#64748B]">
                                  {member.profile?.email || member.session || ""}
                                </div>
                              </td>

                              <td className="py-3 px-4 font-semibold text-[#7B2D26]">
                                {displayDept}
                              </td>

                              <td className="py-3 px-4 font-medium">
                                {displaySeries ? `Series '${displaySeries}` : "N/A"}
                              </td>

                              <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                                {displayRoll}
                              </td>

                              <td className="py-3 px-4 text-[#334155]">
                                {displayPhone !== "N/A" ? displayPhone : <span className="text-slate-400">N/A</span>}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <Button asChild size="xs" variant="outline" className="text-xs text-[#7B2D26] border-[#E6C9C7] hover:bg-[#FAF5F5]">
                                  <Link href={profileLink} className="font-semibold">
                                    View Profile
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
