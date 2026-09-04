import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getAllPastCommitteesWithMembers, getCommitteeTermById } from "@/services/committeeService";
import { PreviousCommitteeViewer } from "@/features/public/PreviousCommitteeViewer";

export const metadata: Metadata = {
  title: "Previous Executive Committee | SDA RUET",
  description: "Historical executive committee terms and past leadership rosters of SDA RUET.",
};

export default async function CommitteeArchivePage({
  params,
}: {
  params: Promise<{ termId: string }>;
}) {
  const { termId } = await params;
  const profile = await getCurrentProfile();
  const pastTerms = await getAllPastCommitteesWithMembers();
  const currentTerm = await getCommitteeTermById(termId);

  if (!currentTerm) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PreviousCommitteeViewer
          terms={pastTerms}
          initialTermId={termId}
        />
      </main>

      <Footer />
    </div>
  );
}
