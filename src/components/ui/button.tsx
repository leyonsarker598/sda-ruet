import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#7B2D26] text-white shadow-xs hover:bg-[#60211B] focus-visible:ring-[#7B2D26]",
        secondary:
          "bg-[#F3EFEA] text-[#0F172A] border border-[#E8E2D9] shadow-2xs hover:bg-[#EBE4D8] focus-visible:ring-[#C5A880]",
        accent:
          "bg-[#C5A880] text-[#0F172A] font-semibold shadow-xs hover:bg-[#A8895E] focus-visible:ring-[#C5A880]",
        outline:
          "border border-[#E2E8F0] bg-white text-[#0F172A] shadow-2xs hover:bg-[#FAF5F5] hover:text-[#7B2D26] hover:border-[#E6C9C7] focus-visible:ring-[#7B2D26]",
        ghost:
          "text-[#0F172A] hover:bg-[#FAF5F5] hover:text-[#7B2D26] focus-visible:ring-[#7B2D26]",
        link:
          "text-[#7B2D26] underline-offset-4 hover:underline focus-visible:ring-[#7B2D26] p-0 h-auto font-normal",
        destructive:
          "bg-[#DC2626] text-white shadow-xs hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]",
      },
      size: {
        xs: "h-7 rounded-md px-2.5 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-12 rounded-lg px-6 text-base font-semibold",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
