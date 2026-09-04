import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, error, helperText, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    return (
      <div className="w-full space-y-1">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#64748B] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] shadow-xs transition-colors placeholder:text-[#94A3B8] focus-visible:outline-hidden focus-visible:border-[#7B2D26] focus-visible:ring-2 focus-visible:ring-[#7B2D26]/15 disabled:cursor-not-allowed disabled:bg-[#F3EFEA] disabled:opacity-70",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error &&
                "border-[#DC2626] focus-visible:border-[#DC2626] focus-visible:ring-[#DC2626]/15",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#64748B] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[#DC2626] font-medium flex items-center gap-1 mt-1">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-[#64748B] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
