import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <div className="relative flex items-center">
          <select
            className={cn(
              "flex h-10 w-full appearance-none rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 pr-9 text-sm text-[#0F172A] shadow-xs transition-colors focus-visible:outline-hidden focus-visible:border-[#7B2D26] focus-visible:ring-2 focus-visible:ring-[#7B2D26]/15 disabled:cursor-not-allowed disabled:bg-[#F3EFEA] disabled:opacity-70 cursor-pointer",
              error &&
                "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#DC2626]/15",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 pointer-events-none text-[#64748B] flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
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
Select.displayName = "Select";

export { Select };
