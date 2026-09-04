import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentProfile } from "@/lib/auth/guards";
import { trackDonationByTrxId } from "@/services/adminDonationService";
import { Search, ArrowLeft, CheckCircle2, Clock, XCircle, HeartHandshake } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track Donation Status | SDA RUET",
  description: "Verify your contribution status, receipt details, and transparent transaction confirmation.",
};

export default async function TrackDonationPage({
  searchParams,
}: {
  searchParams: Promise<{ trx?: string }>;
}) {
  const profile = await getCurrentProfile();
  const { trx } = await searchParams;

  const trackingResult = trx ? await trackDonationByTrxId(trx) : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link */}
        <div>
          <Button asChild size="sm" variant="ghost" className="text-xs text-[#64748B] hover:text-[#7B2D26]">
            <Link href="/donate" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Donation Hub
            </Link>
          </Button>
        </div>

        {/* Title Header */}
        <div className="border-b border-[#E8E2D9] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
            <Search className="w-3.5 h-3.5" />
            Transparency Portal
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] font-heading">
            Track Contribution Status
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Enter your Transaction ID (TrxID) or Bank Reference to inspect the status of your welfare contribution.
          </p>
        </div>

        {/* Search Input Card */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <form method="GET" action="/donate/track" className="flex gap-3">
              <Input
                name="trx"
                defaultValue={trx || ""}
                placeholder="e.g. 9J28XA91 or BANK-REF-1049"
                required
                className="font-mono text-xs uppercase"
              />
              <Button type="submit" leftIcon={<Search className="w-4 h-4" />}>
                Track Status
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tracking Result Receipt */}
        {trx && (
          <div>
            {!trackingResult?.found ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E8E2D9] text-center space-y-2">
                <XCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
                <h3 className="font-bold text-[#0F172A] text-base">No Contribution Found</h3>
                <p className="text-xs text-[#64748B]">
                  No donation found matching Transaction ID &ldquo;{trx}&rdquo;. Please verify your TrxID.
                </p>
              </div>
            ) : (
              <Card className="bg-white border-[#7B2D26]/20">
                <CardHeader className="pb-3 border-b border-[#F3EFEA]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-[#7B2D26]" />
                      <CardTitle className="text-base font-bold text-[#0F172A]">
                        Official Contribution Receipt
                      </CardTitle>
                    </div>
                    <Badge
                      variant={
                        trackingResult.status === "VERIFIED"
                          ? "success"
                          : trackingResult.status === "REJECTED"
                          ? "destructive"
                          : "warning"
                      }
                      size="sm"
                      dot
                    >
                      {trackingResult.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
                    <span className="text-[#64748B]">Transaction ID</span>
                    <span className="font-mono font-bold text-[#0F172A]">{trx.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
                    <span className="text-[#64748B]">Donor Name</span>
                    <span className="font-semibold text-[#0F172A]">{trackingResult.donorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
                    <span className="text-[#64748B]">Designated Purpose</span>
                    <span className="font-semibold text-[#0F172A]">{trackingResult.fundName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
                    <span className="text-[#64748B]">Contribution Amount</span>
                    <span className="font-bold text-[#15803D] text-sm font-heading">
                      {trackingResult.amount?.toLocaleString()} BDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Submission Date</span>
                    <span className="text-[#0F172A]">
                      {trackingResult.createdAt ? formatDate(trackingResult.createdAt) : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
