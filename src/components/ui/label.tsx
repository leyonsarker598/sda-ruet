import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-semibold text-[#1E293B] uppercase tracking-wider block mb-1.5",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-[#EF4444] ml-1">*</span>}
    </label>
  )
);
Label.displayName = "Label";

export { Label };
