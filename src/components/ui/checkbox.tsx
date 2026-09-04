import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id || autoId;

    return (
      <div className="flex items-start gap-2.5 select-none">
        <div className="relative flex items-center mt-0.5">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            ref={ref}
            className={cn(
              "peer h-4 w-4 shrink-0 appearance-none rounded border border-[#CBD5E1] bg-white transition-all checked:bg-[#7B2D26] checked:border-[#7B2D26] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#7B2D26]/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-0.5 h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
        </div>
        {(label || description) && (
          <label htmlFor={inputId} className="cursor-pointer">
            {label && (
              <span className="block text-xs font-semibold text-[#0F172A] leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-xs text-[#64748B] mt-0.5 leading-normal">
                {description}
              </span>
            )}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
