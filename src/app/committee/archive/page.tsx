import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getAllPastCommitteesWithMembers } from "@/services/committeeService";
import { PreviousCommitteeViewer } from "@/features/public/PreviousCommitteeViewer";

export const metadata: Metadata = {
  title: "Previous Executive Committees | SDA RUET",
  description: "Explore previous executive committees, past student leadership rosters, and session archives of SDA RUET.",
};

export default async function CommitteeArchiveListPage({
  searchParams,
}: {
  searchParams?: Promise<{ termId?: string }>;
}) {
  const profile = await getCurrentProfile();
  const pastTerms = await getAllPastCommitteesWithMembers();
  const resolvedParams = searchParams ? await searchParams : undefined;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PreviousCommitteeViewer
          terms={pastTerms}
          initialTermId={resolvedParams?.termId}
        />
      </main>

      <Footer />
    </div>
  );
}
