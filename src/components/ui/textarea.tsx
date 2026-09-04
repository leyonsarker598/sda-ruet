import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] shadow-xs placeholder:text-[#94A3B8] focus-visible:outline-hidden focus-visible:border-[#7B2D26] focus-visible:ring-2 focus-visible:ring-[#7B2D26]/15 disabled:cursor-not-allowed disabled:bg-[#F3EFEA] disabled:opacity-70 transition-colors",
            error &&
              "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#DC2626]/15",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#DC2626] font-medium mt-1">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-[#64748B] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
