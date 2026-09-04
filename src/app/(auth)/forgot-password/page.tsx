import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your SDA RUET account password.",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-[#7B2D26]">Password Recovery</CardTitle>
        <CardDescription>
          Reset your password and regain access to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
