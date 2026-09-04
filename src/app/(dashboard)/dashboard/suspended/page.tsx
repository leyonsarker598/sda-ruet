import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { AlertOctagon } from "lucide-react";

export const metadata: Metadata = {
  title: "Account Suspended",
  description: "Account suspended notice",
};

export default function SuspendedPage() {
  return (
    <div className="max-w-md mx-auto my-12">
      <Card className="border-[#EF4444] text-center shadow-md">
        <CardHeader className="pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#DC2626] mb-2">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl text-[#DC2626]">Account Access Restricted</CardTitle>
          <CardDescription>
            Your SDA RUET membership account has been suspended or restricted by the association administration.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-[#64748B] leading-relaxed">
          <p>
            If you believe this is a mistake or wish to appeal this status, please reach out to the executive committee via the contact page.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/contact">Contact Administration</Link>
          </Button>
          <form action={logoutAction} className="w-full">
            <Button variant="ghost" type="submit" className="w-full text-xs text-[#64748B]">
              Sign Out
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
