import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your SDA RUET account.",
};

export default function ResetPasswordPage() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-[#7B2D26]">Set New Password</CardTitle>
        <CardDescription>
          Enter your new password to secure your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
