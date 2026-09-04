import type { Metadata } from "next";
import Link from "next/link";
import { requirePermissionOrRole } from "@/lib/auth/guards";
import {
  getAdminActivities,
  getActivityCategories,
} from "@/services/adminActivityService";
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
import { EmptyState } from "@/components/ui/empty-state";
import {
  CreateActivityModal,
  TogglePublishButton,
} from "@/features/admin/ActivityForms";
import { Newspaper, Calendar, MapPin, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Activities & Blog Posts | Admin Console",
  description: "Publish stories, news, event photo galleries, and community milestones.",
};

export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  await requirePermissionOrRole("activity.create", ["ADMIN"]);
  const resolvedParams = await searchParams;

  const categories = await getActivityCategories();
  const { activities, count } = await getAdminActivities({
    categoryId: resolvedParams.category,
    search: resolvedParams.q,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
            Activities &amp; Blog Management
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Publish event reports, blood donation drives, photo stories, and official announcements ({count} stories).
          </p>
        </div>

        <CreateActivityModal categories={categories} />
      </div>

      {/* Activities Table */}
      {activities.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="w-6 h-6 text-[#7B2D26]" />}
          title="No Activity Posts Yet"
          description="Write your first story to share association events and achievements with the community."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Story Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date &amp; Location</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Publication Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act) => (
              <TableRow key={act.id}>
                <TableCell>
                  <div className="font-semibold text-[#0F172A]">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-[#64748B] line-clamp-1">
                    {act.short_description}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary" size="sm">
                    {act.category?.name || "General"}
                  </Badge>
                </TableCell>

                <TableCell className="text-xs text-[#64748B]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#7B2D26]" />
                    {formatDate(act.activity_date)}
                  </div>
                  {act.location && (
                    <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                      <MapPin className="w-3 h-3" />
                      {act.location}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-xs">
                  {act.author?.full_name || "SDA RUET"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={act.is_published ? "success" : "secondary"}
                    size="sm"
                    dot
                  >
                    {act.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <TogglePublishButton
                      activityId={act.id}
                      isPublished={act.is_published}
                    />
                    {act.is_published && (
                      <Button asChild size="xs" variant="ghost">
                        <Link href={`/activities/${act.slug}`} target="_blank">
                          <ArrowRight className="w-3.5 h-3.5 text-[#7B2D26]" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
