import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  MapPin,
  Tag,
  ArrowLeft,
  Share2,
  Image as ImageIcon,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getActivityBySlug, getActivities } from "@/services/activityService";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) {
    return {
      title: "Activity Not Found",
    };
  }
  return {
    title: `${activity.title} | SDA RUET`,
    description: activity.short_description,
  };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  const activity = await getActivityBySlug(slug);

  if (!activity) {
    notFound();
  }

  const { activities: recent } = await getActivities({ limit: 3 });

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link */}
        <div>
          <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
            <Link href="/activities" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Activities
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {activity.category?.name || "Association Activity"}
            </Badge>
            <span className="text-xs text-[#64748B]">·</span>
            <span className="text-xs text-[#64748B] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7B2D26]" />
              {formatDate(activity.activity_date)}
            </span>
            {activity.location && (
              <>
                <span className="text-xs text-[#64748B]">·</span>
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#7B2D26]" />
                  {activity.location}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight leading-tight">
            {activity.title}
          </h1>

          <p className="text-sm sm:text-base text-[#475569] font-medium leading-relaxed border-l-2 border-[#7B2D26] pl-4">
            {activity.short_description}
          </p>
        </div>

        {/* Cover Image Banner */}
        {activity.cover_image_url && (
          <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-[#E8E2D9] shadow-xs relative bg-[#FAF5F5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activity.cover_image_url}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Content Body */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D9] space-y-6 text-sm text-[#1E293B] leading-relaxed shadow-xs">
          <div className="whitespace-pre-line prose prose-slate max-w-none">
            {activity.content}
          </div>

          {/* Tags */}
          {activity.tags && activity.tags.length > 0 && (
            <div className="pt-6 border-t border-[#F3EFEA] flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#64748B]" />
              {activity.tags.map((tag) => (
                <Badge key={tag} variant="outline" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Photo Gallery If Present */}
        {activity.images && activity.images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#7B2D26]" />
              Photo Gallery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activity.images.map((img) => (
                <div key={img.id} className="rounded-xl border border-[#E8E2D9] bg-white p-2 shadow-2xs">
                  <div className="relative h-44 w-full rounded-lg overflow-hidden bg-[#F3EFEA]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_url}
                      alt={img.caption || "Activity image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {img.caption && (
                    <p className="text-[11px] text-[#64748B] mt-1.5 px-1 truncate">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
