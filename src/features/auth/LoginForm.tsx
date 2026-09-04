"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionResult } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    loginAction,
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

      <div>
        <Label htmlFor="email" required>
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="e.g. name@student.ruet.ac.bd"
          required
          autoComplete="email"
          error={state?.fieldErrors?.email?.[0]}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="password" required className="mb-0">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs text-[#7B2D26] hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          error={state?.fieldErrors?.password?.[0]}
        />
      </div>

      <Button
        type="submit"
        className="w-full mt-2"
        disabled={isPending}
      >
        <LogIn className="w-4 h-4 mr-1.5" />
        {isPending ? "Signing in..." : "Sign In to SDA RUET"}
      </Button>

      <div className="text-center pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#7B2D26] font-semibold hover:underline">
          Register as Student Member
        </Link>
        <span className="mx-1.5">·</span>
        <Link href="/register/alumni" className="text-[#7B2D26] font-semibold hover:underline">
          Alumni Registration
        </Link>
      </div>
    </form>
  );
}
