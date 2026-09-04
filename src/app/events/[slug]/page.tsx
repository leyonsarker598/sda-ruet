import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventRegistrationForm } from "@/features/events/EventRegistrationForm";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getEventBySlug, getEventParticipants } from "@/services/adminEventService";
import { unpackEventDescription } from "@/lib/eventMetadata";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Users,
  ShieldCheck,
  Ticket,
  Sparkles,
  Info,
  CheckCircle2,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found | SDA RUET" };
  }

  const { metadata } = unpackEventDescription(event.description);

  return {
    title: `${event.title} | Official Event Landing Page`,
    description: metadata.tagline || event.title,
  };
}

export default async function PublicEventLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const { programDetails, metadata } = unpackEventDescription(event.description);
  const participants = await getEventParticipants(event.id);
  const isUserRegistered = profile ? participants.some((p) => p.user_id === profile.id) : false;

  const isFull = event.max_participants ? event.current_participants >= event.max_participants : false;
  const isClosed = event.registration_deadline
    ? new Date() > new Date(event.registration_deadline)
    : false;

  const guidelineItems = (metadata.guidelines || "")
    .split("\n")
    .map((line) => line.trim().replace(/^[•\-\*]\s*/, ""))
    .filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
            <Link href="/events" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Events &amp; Gatherings
            </Link>
          </Button>
        </div>

        {/* Hero Section Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E8E2D9] bg-[#0F172A] text-white shadow-lg">
          {event.banner_image_url ? (
            <div className="relative w-full h-64 sm:h-96 md:h-[420px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.banner_image_url}
                alt={event.title}
                className="w-full h-full object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 to-transparent" />
            </div>
          ) : (
            <div className="h-48 sm:h-64 bg-gradient-to-br from-[#7B2D26] to-[#0F172A]" />
          )}

          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={event.status === "UPCOMING" ? "default" : "secondary"}
                size="sm"
                dot
              >
                {event.status}
              </Badge>
              <Badge variant="outline" size="sm" className="bg-black/40 text-white border-white/20">
                Event Pass: {event.slug}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            {metadata.tagline && (
              <p className="text-sm sm:text-base text-[#D4AF37] font-medium italic">
                {metadata.tagline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-200 pt-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                <span className="font-semibold">{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C5A880]" />
                <span>{event.start_time} {event.end_time ? `– ${event.end_time}` : ""}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C5A880]" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Admission Fee
            </span>
            <span className="text-lg sm:text-xl font-bold font-heading text-[#15803D] mt-0.5 block">
              {event.fee_amount > 0 ? `${event.fee_amount} BDT` : "Free Entry"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Auditorium Capacity
            </span>
            <span className="text-lg sm:text-xl font-bold font-heading text-[#0F172A] mt-0.5 block">
              {event.max_participants ? `${event.max_participants} Seats` : "Open Capacity"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Registered Seats
            </span>
            <span className="text-lg sm:text-xl font-bold font-heading text-[#7B2D26] mt-0.5 block">
              {event.current_participants} Reserved
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E2D9] shadow-2xs">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
              Registration Status
            </span>
            <span className={`text-lg sm:text-xl font-bold font-heading mt-0.5 block ${isFull ? "text-[#DC2626]" : "text-[#15803D]"}`}>
              {isFull ? "Full" : isClosed ? "Closed" : "Open"}
            </span>
          </div>
        </div>

        {/* 2-Column Landing Page Content & Registration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Narrative & Schedule Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Event Description Card with Rich Formatting */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7B2D26]" />
                  About This Event &amp; Program Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs sm:text-sm text-[#334155] leading-relaxed whitespace-pre-line prose prose-slate max-w-none">
                  {programDetails}
                </div>
              </CardContent>
            </Card>

            {/* Event Guidelines Card */}
            {guidelineItems.length > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#7B2D26]" />
                    Attendee Guidelines &amp; Venue Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-[#64748B]">
                  {guidelineItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Venue & Organizer Inquiries Card */}
            <div className="bg-[#FAF5F5] border border-[#DFCEB5] rounded-2xl p-6 space-y-3">
              <h4 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7B2D26]" />
                Event Venue &amp; Organizer Inquiries
              </h4>
              <p className="text-xs text-[#64748B]">
                Organized by {metadata.contactName || "Executive Committee of Sirajganj District Association (SDA), RUET"}.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#0F172A] pt-1">
                {metadata.contactPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#7B2D26]" />
                    {metadata.contactPhone}
                  </span>
                )}
                {metadata.contactEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#7B2D26]" />
                    {metadata.contactEmail}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Registration Form Column */}
          <div className="lg:col-span-5 sticky top-24">
            <Card className="bg-white border-2 border-[#E8E2D9] shadow-sm">
              <CardHeader className="pb-4 border-b border-[#F3EFEA]">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-bold text-[#0F172A] flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-[#7B2D26]" />
                    Reserve Your Seat
                  </CardTitle>
                  <Badge variant={isFull ? "destructive" : "success"} size="sm">
                    {isFull ? "Full" : "Open"}
                  </Badge>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Fill in your details to obtain your official digital admission pass.
                </p>
              </CardHeader>
              <CardContent className="pt-5">
                <EventRegistrationForm
                  event={event}
                  user={profile}
                  isRegistered={isUserRegistered}
                  isFull={isFull}
                  isClosed={isClosed}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
