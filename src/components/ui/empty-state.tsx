import * as React from "react";
import { FolderSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#DFCEB5] bg-[#FBF9F5]/70 max-w-lg mx-auto",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mb-4 shadow-2xs">
        {icon || <FolderSearch className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-bold text-[#0F172A] font-heading">
        {title}
      </h4>
      <p className="text-xs text-[#64748B] max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
