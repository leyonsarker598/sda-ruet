"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(
  undefined
);

export function Dropdown({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownTrigger must be used within Dropdown");

  return (
    <div
      onClick={() => context.setIsOpen((prev) => !prev)}
      className={cn("cursor-pointer inline-flex items-center", className)}
      role="button"
      tabIndex={0}
      aria-expanded={context.isOpen}
    >
      {children}
    </div>
  );
}

export function DropdownContent({
  children,
  align = "right",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownContent must be used within Dropdown");

  if (!context.isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1.5 min-w-[180px] max-w-[calc(100vw-1.5rem)] rounded-xl border border-[#E8E2D9] bg-white p-1.5 text-[#0F172A] shadow-xl animate-in fade-in zoom-in-95 duration-100",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  className,
  destructive = false,
  disabled = false,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  const context = React.useContext(DropdownContext);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    context?.setIsOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer select-none text-left disabled:pointer-events-none disabled:opacity-50",
        destructive
          ? "text-[#DC2626] hover:bg-[#FEF2F2]"
          : "text-[#1E293B] hover:bg-[#FAF5F5] hover:text-[#7B2D26]",
        className
      )}
    >
      {icon && <span className="w-4 h-4 text-[#64748B]">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-[#F3EFEA]", className)} />;
}

export function DropdownLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]",
        className
      )}
    >
      {children}
    </div>
  );
}
