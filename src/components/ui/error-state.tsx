import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  supportLink?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this section. Please try again or contact support if the issue persists.",
  onRetry,
  supportLink = true,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-[#FECACA] bg-[#FEF2F2]/50 max-w-lg mx-auto",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mb-4 shadow-2xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-[#DC2626] font-heading">
        {title}
      </h4>
      <p className="text-xs text-[#64748B] max-w-sm mt-1.5 leading-relaxed">
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {onRetry && (
          <Button
            size="sm"
            variant="default"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        )}
        {supportLink && (
          <Button asChild size="sm" variant="outline">
            <Link href="/contact">Contact Administration</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
