import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowLeft, HeartHandshake, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { BookDonationForm } from "@/features/library/BookDonationForm";
import { getBookCategories } from "@/services/libraryService";
import { getCurrentProfile } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Donate Books to Digital Library | SDA RUET",
  description: "Donate engineering textbooks and course references to the SDA RUET student lending library.",
};

export default async function LibraryDonatePage() {
  const [profile, categories] = await Promise.all([
    getCurrentProfile(),
    getBookCategories(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Navigation */}
        <div>
          <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
            <Link href="/library" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Library Catalog
            </Link>
          </Button>
        </div>

        {/* Page Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Library Contribution
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
            Donate Course Textbooks
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Passing down your completed semester textbooks ensures junior students always have access to vital course literature and references.
          </p>
        </div>

        {/* Donation Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D9] shadow-sm">
          <BookDonationForm
            categories={categories}
            defaultDonor={
              profile
                ? {
                    fullName: profile.full_name,
                    email: profile.email,
                    phone: profile.phone || "",
                    department: profile.department || "",
                    series: profile.series || "",
                  }
                : undefined
            }
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
