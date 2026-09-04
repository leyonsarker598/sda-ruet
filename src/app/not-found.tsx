import Link from "next/link";
import { FolderSearch, Home, BookOpen, Users, ShieldAlert, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F5] p-6 text-center">
      <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E2D9] shadow-md space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] mx-auto shadow-2xs">
          <FolderSearch className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider">
            404 · Page Not Found
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading tracking-tight">
            Resource or Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto">
            The page, record, or portal endpoint you requested could not be located. It may have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 border-t border-[#F1EBE1] space-y-3">
          <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Quick Navigation
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild size="sm" className="bg-[#7B2D26] hover:bg-[#5C221D] text-white">
              <Link href="/" className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Homepage
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-[#E8E2D9] hover:bg-[#FAF5F5]">
              <Link href="/admin" className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#7B2D26]" />
                Admin Console
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-[#E8E2D9] hover:bg-[#FAF5F5]">
              <Link href="/library" className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#7B2D26]" />
                Library
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-[#E8E2D9] hover:bg-[#FAF5F5]">
              <Link href="/alumni" className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#7B2D26]" />
                Alumni
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-[#E8E2D9] hover:bg-[#FAF5F5]">
              <Link href="/faq" className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#7B2D26]" />
                Helpdesk &amp; FAQs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
