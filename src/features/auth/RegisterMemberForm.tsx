"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerMemberAction, type AuthActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserPlus,
  AlertCircle,
  CheckCircle2,
  User,
  GraduationCap,
  Building2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export function RegisterMemberForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    registerMemberAction,
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
        <div className="py-2 px-3 text-center rounded-lg bg-white text-[#7B2D26] shadow-2xs">
          Student Member
        </div>
        <Link
          href="/register/alumni"
          className="py-2 px-3 text-center rounded-lg text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          Alumni Member
        </Link>
      </div>

      {/* Section 1: Account & Credentials */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE6] pb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <KeyRound className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              1. Account &amp; Identity Credentials
            </h3>
            <p className="text-[11px] text-[#64748B]">Your primary login and member identification</p>
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
              placeholder="e.g. Md. Yeasir Arafat"
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
              placeholder="e.g. student@ruet.ac.bd"
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

      {/* Section 2: RUET Academic Information */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE6] pb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              2. RUET Academic Profile
            </h3>
            <p className="text-[11px] text-[#64748B]">Department, batch, and academic identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department" required>
              Department
            </Label>
            <Input
              id="department"
              name="department"
              placeholder="e.g. CSE, EEE, CE, ME, IPE, ETE"
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
              placeholder="e.g. 19, 20, 21, 22, 23"
              required
              error={state?.fieldErrors?.series?.[0]}
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
              placeholder="e.g. 2019-2020"
              required
              error={state?.fieldErrors?.session?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="studentId" required>
              Student Roll / ID
            </Label>
            <Input
              id="studentId"
              name="studentId"
              placeholder="e.g. 1903001"
              required
              error={state?.fieldErrors?.studentId?.[0]}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Contact & Campus Life */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE6] pb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              3. Campus &amp; Contact Details (Optional)
            </h3>
            <p className="text-[11px] text-[#64748B]">Helps connect batchmates and arrange emergency blood donation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+880 1700-000000"
            />
          </div>

          <div>
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Select id="bloodGroup" name="bloodGroup" defaultValue="">
              <option value="">Select blood group</option>
              <option value="A+">A+ (A Positive)</option>
              <option value="A-">A- (A Negative)</option>
              <option value="B+">B+ (B Positive)</option>
              <option value="B-">B- (B Negative)</option>
              <option value="O+">O+ (O Positive)</option>
              <option value="O-">O- (O Negative)</option>
              <option value="AB+">AB+ (AB Positive)</option>
              <option value="AB-">AB- (AB Negative)</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="hall">Residential Hall</Label>
            <Input
              id="hall"
              name="hall"
              placeholder="e.g. Shahid Ziaur Rahman Hall"
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
        <UserPlus className="w-4 h-4 mr-2" />
        {isPending ? "Creating Member Account..." : "Complete Student Member Registration"}
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
