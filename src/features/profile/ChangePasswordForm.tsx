"use client";

import { useActionState } from "react";
import { changePasswordAction, type ProfileActionResult } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<ProfileActionResult | null, FormData>(
    changePasswordAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4 max-w-md">
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

      <div>
        <Label htmlFor="currentPassword" required>Current Password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="••••••••"
          required
          error={state?.fieldErrors?.currentPassword?.[0]}
        />
      </div>

      <div>
        <Label htmlFor="newPassword" required>New Password (min 6 characters)</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          required
          error={state?.fieldErrors?.newPassword?.[0]}
        />
      </div>

      <div>
        <Label htmlFor="confirmNewPassword" required>Confirm New Password</Label>
        <Input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          placeholder="••••••••"
          required
          error={state?.fieldErrors?.confirmNewPassword?.[0]}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        leftIcon={<KeyRound className="w-4 h-4" />}
        className="font-semibold mt-2"
      >
        {isPending ? "Updating Password..." : "Change Password"}
      </Button>
    </form>
  );
}
