"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    forgotPasswordAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
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

      <p className="text-xs text-[#64748B] leading-relaxed">
        Enter the email address associated with your SDA RUET account and we will send you instructions to reset your password.
      </p>

      <div>
        <Label htmlFor="email" required>
          Account Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="e.g. name@student.ruet.ac.bd"
          required
          autoComplete="email"
        />
      </div>

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={isPending || state?.success}
      >
        <Mail className="w-4 h-4 mr-1.5" />
        {isPending ? "Sending link..." : "Send Password Reset Link"}
      </Button>

      <div className="text-center pt-4 border-t border-[#E2E8F0] text-xs">
        <Link
          href="/login"
          className="inline-flex items-center text-[#7B2D26] font-semibold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
