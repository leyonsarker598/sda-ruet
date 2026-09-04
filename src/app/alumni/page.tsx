import type { Metadata } from "next";
import Link from "next/link";
import { Users, GraduationCap, Briefcase, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AlumniFilterForm } from "@/features/public/AlumniFilterForm";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getVerifiedAlumniDirectory } from "@/services/alumniService";

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Verified Alumni Directory",
  description:
    "Search and connect with verified engineering graduates of RUET from Sirajganj District across global industries.",
};

export default async function AlumniDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; series?: string; year?: string }>;
}) {
  const resolvedParams = await searchParams;
  const profile = await getCurrentProfile();
  const { alumni, count } = await getVerifiedAlumniDirectory({
    search: resolvedParams.q,
    department: resolvedParams.dept,
    series: resolvedParams.series,
    graduationYear: resolvedParams.year ? Number(resolvedParams.year) : undefined,
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E2D9] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Verified Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
              RUET Alumni Network
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Connecting verified engineering graduates from Sirajganj District ({count} verified graduates listed).
            </p>
          </div>

          <Button asChild size="sm" className="font-semibold">
            <Link href="/register/alumni">Register as Alumnus</Link>
          </Button>
        </div>

        {/* Filter Bar */}
        <AlumniFilterForm />

        {/* Alumni Grid */}
        {alumni.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6 text-[#7B2D26]" />}
            title="No Alumni Found"
            description="No verified alumni matched your filter criteria. Try searching with a broader keyword or resetting filters."
            action={
              <Button asChild size="sm" variant="default">
                <Link href="/alumni">View All Alumni</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {alumni.map((alum) => (
              <Card key={alum.id} hoverable className="bg-white flex flex-col justify-between p-1">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="alumni" size="sm" dot>
                      Batch &apos;{alum.series || "N/A"}
                    </Badge>
                    <span className="text-[11px] text-[#64748B] font-semibold">
                      Class of {alum.graduation_year}
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold text-[#0F172A] truncate">
                    <Link href={`/alumni/${alum.id}`} className="hover:text-[#7B2D26] transition-colors">
                      {alum.full_name}
                    </Link>
                  </CardTitle>

                  <CardDescription className="text-xs text-[#1E293B] font-medium truncate mt-1">
                    {alum.current_designation || "Graduate Engineer"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 text-xs text-[#64748B] space-y-1.5">
                  {alum.organization && (
                    <div className="flex items-center gap-1.5 text-xs text-[#334155] truncate">
                      <Briefcase className="w-3.5 h-3.5 text-[#7B2D26] flex-shrink-0" />
                      <span className="truncate">{alum.organization}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880] flex-shrink-0" />
                    <span className="truncate">{alum.current_city ? `${alum.current_city}, ` : ""}{alum.current_country}</span>
                  </div>

                  <div className="text-[11px] text-[#7B2D26] font-medium pt-1">
                    Dept: {alum.department || "Engineering"}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t border-[#F3EFEA] justify-between">
                  {alum.linkedin_url ? (
                    <a
                      href={alum.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0077B5] hover:opacity-80 transition-opacity p-1"
                      title="LinkedIn Profile"
                    >
                      <LinkedInIcon className="w-4 h-4" />
                    </a>
                  ) : (
                    <span />
                  )}

                  <Button asChild size="xs" variant="ghost" className="text-[#7B2D26] font-semibold p-0">
                    <Link href={`/alumni/${alum.id}`} className="flex items-center gap-1">
                      View Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
