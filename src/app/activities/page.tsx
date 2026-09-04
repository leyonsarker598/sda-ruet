import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Search, ArrowRight, Tag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getActivities, getActivityCategories } from "@/services/activityService";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Activities & Events",
  description:
    "Explore the chronicle of association activities, meetings, annual freshers receptions, and academic programs at SDA RUET.",
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const profile = await getCurrentProfile();
  const categories = await getActivityCategories();
  const { activities, count } = await getActivities({
    categorySlug: resolvedParams.cat,
    search: resolvedParams.q,
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Title */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7B2D26]">Association Chronicle</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading mt-1">
            Activities &amp; Programs
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Explore our community meetings, freshers receptions, iftar gatherings, and academic workshops.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D9] pb-4">
          <Link
            href="/activities"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !resolvedParams.cat || resolvedParams.cat === "all"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white border border-[#E8E2D9] text-[#0F172A] hover:bg-[#FAF5F5]"
            }`}
          >
            All Activities ({count})
          </Link>
          {categories.map((cat) => {
            const isActive = resolvedParams.cat === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/activities?cat=${cat.slug}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#7B2D26] text-white shadow-xs"
                    : "bg-white border border-[#E8E2D9] text-[#0F172A] hover:bg-[#FAF5F5]"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Activities Grid */}
        {activities.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6 text-[#7B2D26]" />}
            title="No Activities Found"
            description="There are currently no published activities matching your selected category."
            action={
              <Button asChild size="sm" variant="default">
                <Link href="/activities">View All Activities</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <Card key={act.id} hoverable className="flex flex-col justify-between overflow-hidden">
                {act.cover_image_url && (
                  <div className="w-full h-44 overflow-hidden bg-[#FAF5F5] border-b border-[#E8E2D9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={act.cover_image_url}
                      alt={act.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary" size="sm">
                      {act.category?.name || "Association"}
                    </Badge>
                    <span className="text-[11px] text-[#64748B]">
                      {formatDate(act.activity_date)}
                    </span>
                  </div>
                  <CardTitle className="text-base line-clamp-2">
                    <Link href={`/activities/${act.slug}`} className="hover:text-[#7B2D26] transition-colors">
                      {act.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">
                    {act.short_description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <Calendar className="w-3.5 h-3.5 text-[#7B2D26]" />
                    <span>{act.location || "RUET Campus"}</span>
                  </div>
                  <Button asChild size="xs" variant="ghost" className="text-[#7B2D26] font-semibold p-0">
                    <Link href={`/activities/${act.slug}`} className="flex items-center gap-1">
                      Read Story <ArrowRight className="w-3 h-3" />
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
