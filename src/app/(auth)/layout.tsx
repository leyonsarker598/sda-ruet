import Image from "next/image";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between">
      {/* Auth Navigation Header */}
      <header className="py-6 px-4 sm:px-8 border-b border-[#E2E8F0] bg-white/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/assets/Sda-PNG.png"
                alt="SDA RUET Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-base text-[#7B2D26] tracking-tight group-hover:text-[#60211B] transition-colors">
                SDA RUET
              </span>
              <span className="block text-[11px] text-[#64748B] font-medium">
                Sirajganj District Association, RUET
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative w-8 h-9 flex-shrink-0 opacity-90">
              <Image
                src="/assets/ruet_logo.png"
                alt="RUET Crest"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Auth Content Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl my-4 sm:my-6">
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-[11px] font-semibold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              Take a Stand &amp; Hold a Hand
            </div>
          </div>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-[#E2E8F0] bg-white text-center text-xs text-[#64748B]">
        <span>&copy; {new Date().getFullYear()} Sirajganj District Association, RUET. All rights reserved.</span>
      </footer>
    </div>
  );
}
