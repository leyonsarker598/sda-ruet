import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26]",
        secondary:
          "bg-[#F3EFEA] border border-[#E8E2D9] text-[#0F172A]",
        outline:
          "bg-white border border-[#E2E8F0] text-[#0F172A]",
        success:
          "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]",
        warning:
          "bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]",
        destructive:
          "bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]",
        accent:
          "bg-[#FBF6EE] border border-[#DFCEB5] text-[#9B7D54]",
        admin:
          "bg-[#7B2D26] text-white border border-[#60211B]",
        member:
          "bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]",
        alumni:
          "bg-[#FAF5FF] border border-[#E9D5FF] text-[#7E22CE]",
        teacher:
          "bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D]",
        librarian:
          "bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1]",
      },
      size: {
        sm: "px-2 py-0.2 text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "admin" && "bg-white",
            (variant === "success" || variant === "teacher") && "bg-[#15803D]",
            variant === "librarian" && "bg-[#0369A1]",
            variant === "warning" && "bg-[#B45309]",
            variant === "destructive" && "bg-[#DC2626]",
            variant === "member" && "bg-[#1D4ED8]",
            variant === "alumni" && "bg-[#7E22CE]",
            variant === "accent" && "bg-[#9B7D54]",
            (!variant || variant === "default") && "bg-[#7B2D26]"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
