"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error("Global Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F5] p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#FECACA] shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mx-auto shadow-2xs">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] font-heading">
          Connection Issue Encountered
        </h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          An unexpected error occurred while loading this page. Please try refreshing or return to the homepage.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="sm"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/" className="flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
