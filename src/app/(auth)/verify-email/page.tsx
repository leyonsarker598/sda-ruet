import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "Check your inbox for the SDA RUET email verification link.",
};

export default function VerifyEmailPage() {
  return (
    <Card className="shadow-sm text-center">
      <CardHeader className="pb-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mb-3">
          <MailCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl text-[#7B2D26]">Check Your Inbox</CardTitle>
        <CardDescription>
          We have sent a verification link to your email address. Please click the link to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs text-[#64748B] leading-relaxed">
        <p>
          If you do not see the email within a few minutes, please check your spam or junk folder.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
