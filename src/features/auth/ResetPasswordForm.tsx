"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type AuthActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    resetPasswordAction,
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
        <div className="space-y-4">
          <Alert variant="success">
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href="/login">Proceed to Login</Link>
          </Button>
        </div>
      )}

      {!state?.success && (
        <>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Please enter and confirm your new secure password below.
          </p>

          <div>
            <Label htmlFor="password" required>
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" required>
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isPending}
          >
            <KeyRound className="w-4 h-4 mr-1.5" />
            {isPending ? "Updating password..." : "Update Password"}
          </Button>
        </>
      )}
    </form>
  );
}
