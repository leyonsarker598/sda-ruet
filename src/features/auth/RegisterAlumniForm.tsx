"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAlumniAction, type AuthActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Briefcase,
  Globe,
  ShieldCheck,
} from "lucide-react";

export function RegisterAlumniForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    registerAlumniAction,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert variant="success">
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Track Selector Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[#F3EFEA] rounded-xl max-w-xs mx-auto text-xs font-semibold">
        <Link
          href="/register"
          className="py-2 px-3 text-center rounded-lg text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          Student Member
        </Link>
        <div className="py-2 px-3 text-center rounded-lg bg-white text-[#7B2D26] shadow-2xs">
          Alumni Member
        </div>
      </div>

      {/* Verification Notice */}
      <div className="bg-[#FAF5F5] border border-[#E6C9C7] p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-[#7B2D26] leading-relaxed">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Official Verification Policy:</strong> Alumni profiles are reviewed by the executive association committee to verify graduation credentials. Once audited, your profile will be listed in the SDA RUET verified alumni directory.
        </div>
      </div>

      {/* Section 1: Account Credentials */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE6] pb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <KeyRound className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              1. Account &amp; Identity Credentials
            </h3>
            <p className="text-[11px] text-[#64748B]">Primary email and password for alumni portal access</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName" required>
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="e.g. Engr. Leyon Sarker"
              required
              error={state?.fieldErrors?.fullName?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="email" required>
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. alumni@example.com"
              required
              error={state?.fieldErrors?.email?.[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              required
              error={state?.fieldErrors?.password?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" required>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              required
              error={state?.fieldErrors?.confirmPassword?.[0]}
            />
          </div>
        </div>
      </div>

      {/* Section 2: RUET Academic Heritage */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE6] pb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              2. RUET Academic Heritage
            </h3>
            <p className="text-[11px] text-[#64748B]">Graduation records used for verification audit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="department" required>
              Department
            </Label>
            <Input
              id="department"
              name="department"
              placeholder="e.g. CSE, EEE, CE, ME"
              required
              error={state?.fieldErrors?.department?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="series" required>
              Series / Batch
            </Label>
            <Input
              id="series"
              name="series"
              placeholder="e.g. 15, 16, 17, 18"
              required
              error={state?.fieldErrors?.series?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="graduationYear" required>
              Graduation Year
            </Label>
            <Input
              id="graduationYear"
              name="graduationYear"
              type="number"
              placeholder="e.g. 2021"
              required
              error={state?.fieldErrors?.graduationYear?.[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="session" required>
              Academic Session
            </Label>
            <Input
              id="session"
              name="session"
              placeholder="e.g. 2015-2016"
              required
              error={state?.fieldErrors?.session?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="studentId" required>
              RUET Student ID / Roll
            </Label>
            <Input
              id="studentId"
              name="studentId"
              placeholder="e.g. 1503001"
              required
              error={state?.fieldErrors?.studentId?.[0]}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Professional & Location Info */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE6] pb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              3. Professional Profile &amp; Location
            </h3>
            <p className="text-[11px] text-[#64748B]">Connect with alumni network and discover career opportunities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentDesignation">
              Current Job Title / Designation
            </Label>
            <Input
              id="currentDesignation"
              name="currentDesignation"
              placeholder="e.g. Lead Software Engineer, Executive Director"
            />
          </div>

          <div>
            <Label htmlFor="organization">
              Organization / Company
            </Label>
            <Input
              id="organization"
              name="organization"
              placeholder="e.g. Google, BEXIMCO, BUET, Grameenphone"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="industry">
              Industry Domain
            </Label>
            <Input
              id="industry"
              name="industry"
              placeholder="e.g. Tech, Energy, Civil Infra"
            />
          </div>

          <div>
            <Label htmlFor="currentCity">
              Current City
            </Label>
            <Input
              id="currentCity"
              name="currentCity"
              placeholder="e.g. Dhaka, Rajshahi, Singapore"
            />
          </div>

          <div>
            <Label htmlFor="currentCountry">
              Country
            </Label>
            <Input
              id="currentCountry"
              name="currentCountry"
              defaultValue="Bangladesh"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">
              Contact Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+880 1700-000000"
            />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">
              LinkedIn Profile URL
            </Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-[#7B2D26] hover:bg-[#60211B] text-white font-semibold shadow-xs"
        disabled={isPending || state?.success}
      >
        <GraduationCap className="w-4 h-4 mr-2" />
        {isPending ? "Submitting Alumni Profile..." : "Submit Alumni Profile for Verification"}
      </Button>

      {/* Footer Info */}
      <div className="text-center pt-2 text-xs text-[#64748B]">
        Already registered?{" "}
        <Link href="/login" className="text-[#7B2D26] font-semibold hover:underline">
          Sign In to Portal
        </Link>
      </div>
    </form>
  );
}
