import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Association Settings | Admin Console",
  description: "Configure association parameters, library rules, and contact metadata.",
};

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] font-heading">
          Association &amp; System Configuration
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          General identity, loan circulation policies, and institutional contacts.
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#0F172A]">
              Institutional Identity
            </CardTitle>
            <CardDescription className="text-xs">
              Official association name, campus location, and motto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  defaultValue="Sirajganj District Association, RUET (SDA RUET)"
                  readOnly
                />
              </div>

              <div>
                <Label htmlFor="motto">Motto</Label>
                <Input
                  id="motto"
                  defaultValue="Take a Stand &amp; Hold a Hand"
                  readOnly
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Campus Address</Label>
              <Input
                id="address"
                defaultValue="Rajshahi University of Engineering &amp; Technology, Kazla, Rajshahi-6204"
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        {/* Library Circulation Rules */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#0F172A]">
              Digital Library Policies
            </CardTitle>
            <CardDescription className="text-xs">
              Loan limits, renewal extensions, and overdue fines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxQuota">Borrower Max Quota</Label>
                <Input id="maxQuota" defaultValue="3 Books" readOnly />
              </div>

              <div>
                <Label htmlFor="loanPeriod">Loan Duration</Label>
                <Input id="loanPeriod" defaultValue="14 Days" readOnly />
              </div>

              <div>
                <Label htmlFor="overdueFine">Overdue Fine</Label>
                <Input id="overdueFine" defaultValue="2.00 BDT / Day" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & System Info */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#0F172A]">
              Security &amp; Database Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-[#64748B]">
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span>Authentication Engine</span>
              <span className="font-semibold text-[#0F172A]">Supabase Auth + SSR Cookies</span>
            </div>
            <div className="flex justify-between border-b border-[#F3EFEA] pb-2">
              <span>RBAC Engine</span>
              <span className="font-semibold text-[#0F172A]">PostgreSQL Row Level Security (RLS)</span>
            </div>
            <div className="flex justify-between">
              <span>Deployment Mode</span>
              <span className="font-semibold text-[#15803D]">Production Ready</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
