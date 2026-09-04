import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getAdminEvents } from "@/services/adminEventService";
import { Calendar, MapPin, Clock, ArrowRight, Ticket, DollarSign, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events & Gatherings | SDA RUET",
  description: "Join upcoming reunions, freshers receptions, career workshops, and community dinners organized by SDA RUET.",
};

export default async function PublicEventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const profile = await getCurrentProfile();
  const resolvedParams = searchParams ? await searchParams : {};
  const currentFilter = resolvedParams.filter || "ALL";

  const { events } = await getAdminEvents({
    status: currentFilter === "ALL" ? undefined : currentFilter,
    limit: 50,
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Title Header */}
        <div className="border-b border-[#E8E2D9] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Official Gatherings
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading tracking-tight">
            Events &amp; Reunions
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-2xl">
            Explore dedicated landing pages, reserve your seats, and join fellow Sirajganj engineers at upcoming reunions, seminars, and celebrations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D9] pb-4">
          <Link
            href="/events"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              currentFilter === "ALL"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white border border-[#E8E2D9] text-[#0F172A] hover:bg-[#FAF5F5]"
            }`}
          >
            All Gatherings ({events.length})
          </Link>
          <Link
            href="/events?filter=UPCOMING"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              currentFilter === "UPCOMING"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white border border-[#E8E2D9] text-[#0F172A] hover:bg-[#FAF5F5]"
            }`}
          >
            Upcoming
          </Link>
          <Link
            href="/events?filter=COMPLETED"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              currentFilter === "COMPLETED"
                ? "bg-[#7B2D26] text-white shadow-xs"
                : "bg-white border border-[#E8E2D9] text-[#0F172A] hover:bg-[#FAF5F5]"
            }`}
          >
            Past Archives
          </Link>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6 text-[#7B2D26]" />}
            title="No Events Scheduled"
            description="There are currently no events matching your selected filter. Check back soon for announcements on upcoming programs!"
            action={
              <Button asChild size="sm" variant="default">
                <Link href="/events">View All Events</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isFull = event.max_participants ? event.current_participants >= event.max_participants : false;
              return (
                <Card key={event.id} hoverable className="bg-white flex flex-col justify-between overflow-hidden p-0">
                  {event.banner_image_url && (
                    <div className="w-full h-44 overflow-hidden bg-[#FAF5F5] border-b border-[#E8E2D9] relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.banner_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <Badge
                          variant={event.fee_amount > 0 ? "admin" : "success"}
                          size="sm"
                        >
                          {event.fee_amount > 0 ? `${event.fee_amount} BDT` : "Free Entry"}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant={event.status === "UPCOMING" ? "default" : "secondary"}
                        size="sm"
                        dot
                      >
                        {event.status}
                      </Badge>
                      <span className="text-[11px] text-[#64748B] font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#7B2D26]" />
                        {event.start_time}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold text-[#0F172A] line-clamp-2">
                      <Link
                        href={`/events/${event.slug}`}
                        className="hover:text-[#7B2D26] transition-colors"
                      >
                        {event.title}
                      </Link>
                    </CardTitle>

                    <div className="space-y-1 text-xs text-[#64748B] mt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#7B2D26]" />
                        {formatDate(event.event_date)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </div>
                    </div>

                    <CardDescription className="text-xs text-[#334155] line-clamp-2 mt-3 leading-relaxed">
                      {event.description}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="p-5 pt-3 border-t border-[#F3EFEA] justify-between">
                    <div className="text-xs">
                      {event.registration_required ? (
                        <span className={isFull ? "text-[#DC2626] font-bold" : "text-[#15803D] font-bold"}>
                          {isFull ? "Seats Full" : `${event.current_participants} Registered`}
                        </span>
                      ) : (
                        <span className="text-[#64748B]">Open Attendance</span>
                      )}
                    </div>

                    <Button asChild size="xs" variant="outline" className="font-semibold text-xs border-[#DFCEB5] hover:bg-[#FAF5F5]">
                      <Link href={`/events/${event.slug}`} className="flex items-center gap-1">
                        Landing Page &amp; Register <ArrowRight className="w-3 h-3 text-[#7B2D26]" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
