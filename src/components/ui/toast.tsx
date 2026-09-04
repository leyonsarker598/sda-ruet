"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
  };
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.durationMs ?? 4000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const toastHelpers = React.useMemo(
    () => ({
      success: (title: string, message?: string) =>
        addToast({ type: "success", title, message }),
      error: (title: string, message?: string) =>
        addToast({ type: "error", title, message }),
      info: (title: string, message?: string) =>
        addToast({ type: "info", title, message }),
      warning: (title: string, message?: string) =>
        addToast({ type: "warning", title, message }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        toast: toastHelpers,
      }}
    >
      {children}
      {/* Toast Viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-lg border text-xs transition-all animate-in slide-in-from-bottom-5 duration-200",
              t.type === "success" && "bg-white border-[#BBF7D0] text-[#0F172A]",
              t.type === "error" && "bg-white border-[#FECACA] text-[#0F172A]",
              t.type === "info" && "bg-white border-[#BFDBFE] text-[#0F172A]",
              t.type === "warning" && "bg-white border-[#FDE68A] text-[#0F172A]"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
              )}
              {t.type === "info" && (
                <Info className="w-4 h-4 text-[#1D4ED8]" />
              )}
              {t.type === "warning" && (
                <AlertTriangle className="w-4 h-4 text-[#B45309]" />
              )}
            </div>

            <div className="flex-1">
              <h5 className="font-semibold text-[#0F172A] leading-tight">
                {t.title}
              </h5>
              {t.message && (
                <p className="mt-1 text-[#64748B] leading-relaxed">
                  {t.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-[#94A3B8] hover:text-[#0F172A] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
