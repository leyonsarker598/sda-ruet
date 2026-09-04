import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl";
  color?: "primary" | "accent" | "white" | "muted";
}

export function Spinner({
  size = "default",
  color = "primary",
  className,
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    primary: "text-[#7B2D26]",
    accent: "text-[#C5A880]",
    white: "text-white",
    muted: "text-[#64748B]",
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      {...props}
    >
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#EBE4D8]/60",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[#E8E2D9] bg-white p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="pt-4 flex justify-between items-center">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-[#E8E2D9] bg-white overflow-hidden p-4 space-y-3">
      <div className="flex gap-4 pb-2 border-b border-[#F3EFEA]">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function LoadingOverlay({
  message = "Loading data...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
      <Spinner size="lg" />
      <p className="text-xs font-medium text-[#64748B]">{message}</p>
    </div>
  );
}
