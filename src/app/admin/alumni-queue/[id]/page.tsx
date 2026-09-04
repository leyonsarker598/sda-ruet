import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getAlumniApplicationById } from "@/services/adminAlumniService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlumniReviewActions } from "@/features/admin/AlumniReviewActions";
import {
  GraduationCap,
  ArrowLeft,
  Briefcase,
  MapPin,
  FileText,
  User,
  Building2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Audit Alumni Application | Admin Console",
  description: "Review institutional records, graduation details, and verify alumni membership.",
};

export default async function AdminAlumniApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const application = await getAlumniApplicationById(id);

  if (!application) {
    notFound();
  }

  const sub = application.submitted_data || {};
  const prof = application.profile;

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
          <Link href="/admin/alumni-queue" className="flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Verification Queue
          </Link>
        </Button>
      </div>

      {/* Applicant Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF5F5] border-2 border-[#7B2D26] flex items-center justify-center text-[#7B2D26] text-xl font-bold font-heading">
            {(prof?.full_name || sub.fullName || "A").charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0F172A] font-heading">
                {prof?.full_name || sub.fullName}
              </h1>
              <Badge
                variant={
                  application.status === "VERIFIED"
                    ? "success"
                    : application.status === "REJECTED"
                    ? "destructive"
                    : application.status === "CORRECTION_REQUESTED"
                    ? "warning"
                    : "secondary"
                }
                size="sm"
                dot
              >
                {application.status}
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {prof?.email || sub.email} · Phone: {prof?.phone || sub.phone || "Not Provided"}
            </p>
          </div>
        </div>

        <div className="text-xs text-[#64748B]">
          Submitted: <strong className="text-[#0F172A]">{formatDate(application.created_at)}</strong>
        </div>
      </div>

      {/* Decision Review Control Box */}
      <Card className="bg-white border-[#7B2D26]/30 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#7B2D26]">
            Executive Audit &amp; Verification Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlumniReviewActions
            applicationId={application.id}
            currentStatus={application.status}
            existingNotes={application.admin_notes}
          />
        </CardContent>
      </Card>

      {/* 2-Column Academic & Professional Record Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Institutional Record */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#7B2D26]" />
              Institutional RUET Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span className="text-[#64748B]">Student / Roll ID</span>
              <span className="font-mono font-bold text-[#0F172A]">{prof?.student_id || sub.studentId || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span className="text-[#64748B]">Department</span>
              <span className="font-semibold text-[#0F172A]">{prof?.department || sub.department}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span className="text-[#64748B]">Series / Batch</span>
              <span className="font-semibold text-[#0F172A]">Series &apos;{prof?.series || sub.series}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span className="text-[#64748B]">Graduation Year</span>
              <span className="font-semibold text-[#0F172A]">Class of {sub.graduationYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Degree Conferred</span>
              <span className="font-semibold text-[#0F172A]">{sub.degree || "B.Sc. in Engineering"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Professional Career Info */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7B2D26]" />
              Professional Career Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span className="text-[#64748B]">Designation</span>
              <span className="font-semibold text-[#0F172A]">{sub.currentDesignation || "Not specified"}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span className="text-[#64748B]">Organization / Company</span>
              <span className="font-semibold text-[#0F172A]">{sub.organization || "Independent"}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span className="text-[#64748B]">Industry Domain</span>
              <span className="font-semibold text-[#0F172A]">{sub.industry || "Engineering"}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span className="text-[#64748B]">Location</span>
              <span className="font-semibold text-[#0F172A]">
                {sub.currentCity ? `${sub.currentCity}, ` : ""}{sub.currentCountry || "Bangladesh"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#64748B]">LinkedIn Profile</span>
              {sub.linkedinUrl ? (
                <a
                  href={sub.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0077B5] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[#94A3B8]">Not provided</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio Statement */}
      {sub.bio && (
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Applicant Biography / Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-line">
              {sub.bio}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
