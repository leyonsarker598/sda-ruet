import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your SDA RUET account to access the library, alumni directory, and member features.",
};

export default function LoginPage() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl text-[#7B2D26]">Member &amp; Alumni Sign In</CardTitle>
        <CardDescription>
          Access your personal library dashboard, directory, and association events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
