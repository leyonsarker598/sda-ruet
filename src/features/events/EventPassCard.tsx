"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, Copy, Check, Sparkles, Image as ImageIcon } from "lucide-react";

interface EventPassCardProps {
  event: {
    title: string;
    event_date: string;
    start_time: string;
    end_time?: string | null;
    location: string;
    slug: string;
  };
  metadata?: {
    tagline?: string;
  };
  registration: {
    ticketCode: string;
    fullName: string;
    category?: string | null;
    guestCount?: number;
    department?: string | null;
    series?: string | null;
    studentId?: string | null;
  };
}

function formatTimeString(timeStr?: string | null): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function EventPassCard({
  event,
  metadata,
  registration,
}: EventPassCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const passContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (passContainerRef.current) {
      passContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(registration.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      const cardEl = document.getElementById("official-event-pass");
      if (!cardEl) return;

      // Create a canvas to render the pass
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scale = 2; // High DPI
      const width = 440;
      const height = 580;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Background Parchment
      ctx.fillStyle = "#FAF6EE";
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 24);
      ctx.fill();
      ctx.strokeStyle = "#E2D6C3";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Top Navy Header
      ctx.fillStyle = "#11233D";
      ctx.beginPath();
      ctx.roundRect(14, 14, width - 28, 120, 16);
      ctx.fill();

      // Header Texts
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("SIRAJGANJ DISTRICT", 28, 38);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("ASSOCIATION, RUET", 28, 58);

      ctx.fillStyle = "#CBD5E1";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("PRESENTS", 28, 76);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 20px sans-serif";
      ctx.fillText("EVENT PASS", 28, 102);

      // Seal Circle
      ctx.fillStyle = "#8E2820";
      ctx.beginPath();
      ctx.arc(width - 56, 74, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#C5A880";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "20px sans-serif";
      ctx.fillText("🎓", width - 68, 81);

      // Gold Accent Divider
      ctx.fillStyle = "#C5A880";
      ctx.fillRect(width / 8, 148, (width * 3) / 4, 2);

      // Title & Subtitle
      ctx.fillStyle = "#11233D";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(event.title.toUpperCase(), width / 2, 178);

      ctx.fillStyle = "#64748B";
      ctx.font = "italic 11px sans-serif";
      ctx.fillText(metadata?.tagline || "A day to reconnect, remember, and celebrate", width / 2, 196);

      // Pill 1: DATE
      ctx.textAlign = "left";
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(18, 215, width - 36, 42, 12);
      ctx.fill();
      ctx.strokeStyle = "#E8DFC8";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#A33D34";
      ctx.beginPath();
      ctx.roundRect(24, 222, 70, 28, 8);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DATE", 59, 239);

      ctx.textAlign = "left";
      ctx.fillStyle = "#11233D";
      ctx.font = "bold 12px sans-serif";
      const fDate = new Date(event.event_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      ctx.fillText(fDate.toUpperCase(), 106, 240);

      // Pill 2: TIME
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(18, 268, width - 36, 42, 12);
      ctx.fill();
      ctx.strokeStyle = "#E8DFC8";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#A33D34";
      ctx.beginPath();
      ctx.roundRect(24, 275, 70, 28, 8);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TIME", 59, 292);

      ctx.textAlign = "left";
      ctx.fillStyle = "#11233D";
      ctx.font = "bold 12px sans-serif";
      const fTime = formatTimeString(event.start_time) + (event.end_time ? ` – ${formatTimeString(event.end_time)}` : "");
      ctx.fillText(fTime.toUpperCase(), 106, 293);

      // Pill 3: LOCATION
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(18, 321, width - 36, 42, 12);
      ctx.fill();
      ctx.strokeStyle = "#E8DFC8";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#A33D34";
      ctx.beginPath();
      ctx.roundRect(24, 328, 70, 28, 8);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LOCATION", 59, 345);

      ctx.textAlign = "left";
      ctx.fillStyle = "#11233D";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(event.location.toUpperCase(), 106, 346);

      // Bottom Unique ID Navy Stub
      ctx.fillStyle = "#11233D";
      ctx.beginPath();
      ctx.roundRect(16, 378, width - 32, 140, 16);
      ctx.fill();

      ctx.fillStyle = "#C5A880";
      ctx.textAlign = "center";
      ctx.font = "10px monospace";
      ctx.fillText("••••••••••••••••••••••••••••", width / 2, 396);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 17px monospace";
      ctx.fillText(registration.ticketCode, width / 2, 424);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px sans-serif";
      ctx.fillText("Please present this pass at the registration desk", width / 2, 446);

      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 11px sans-serif";
      const attendeeSub = `${registration.fullName}${registration.guestCount ? ` • +${registration.guestCount} Guests` : " • Single Admission"}${registration.series ? ` • Series '${registration.series}` : ""}`;
      ctx.fillText(attendeeSub, width / 2, 474);

      ctx.fillStyle = "#C5A880";
      ctx.font = "10px monospace";
      ctx.fillText("••••••••••••••••••••••••••••", width / 2, 502);

      // Footer
      ctx.fillStyle = "#11233D";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("SIRAJGANJ DISTRICT ASSOCIATION, RUET", width / 2, 550);

      // Export to PNG blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `SDA_Pass_${registration.ticketCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch {
      alert("Could not generate pass image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedDate = new Date(event.event_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedStartTime = formatTimeString(event.start_time);
  const formattedEndTime = event.end_time ? formatTimeString(event.end_time) : null;
  const timeDisplay = formattedEndTime
    ? `${formattedStartTime} – ${formattedEndTime}`
    : formattedStartTime;

  return (
    <div ref={passContainerRef} className="flex flex-col items-center space-y-4 w-full">
      {/* Pass Outer Container matching exact photo styling */}
      <div
        id="official-event-pass"
        className="w-full max-w-[440px] bg-[#FAF6EE] border-2 border-[#E2D6C3] rounded-3xl p-4 sm:p-5 shadow-xl text-[#0F172A] relative overflow-hidden transition-all"
      >
        {/* Top Header Strip */}
        <div className="bg-[#11233D] rounded-2xl p-5 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A880]/10 rounded-full blur-xl pointer-events-none" />

          {/* Left Text Block */}
          <div className="space-y-0.5 z-10">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              Sirajganj District
            </div>
            <div className="text-base sm:text-lg font-extrabold font-heading tracking-tight text-white uppercase leading-tight">
              Association, RUET
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-300 pt-1">
              Presents
            </div>
            <div className="text-xl sm:text-2xl font-black font-heading tracking-wider text-white">
              EVENT PASS
            </div>
          </div>

          {/* Right Emblem Seal */}
          <div className="flex flex-col items-center z-10 flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-[#C5A880] p-1 bg-[#1A3154] flex items-center justify-center relative shadow-md">
              <div className="w-full h-full rounded-full bg-[#8E2820] flex items-center justify-center text-white relative">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="absolute -bottom-2 bg-[#A33D34] border border-[#D4AF37] px-2 py-0.5 rounded-full text-[8px] font-extrabold text-white uppercase tracking-tighter">
                2001-2026
              </div>
            </div>
          </div>
        </div>

        {/* Gold Horizontal Separator Bar */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent w-3/4 mx-auto my-4 rounded-full" />

        {/* Event Title & Subtitle */}
        <div className="text-center px-3 space-y-1 mb-5">
          <h2 className="text-lg sm:text-xl font-black font-heading text-[#11233D] uppercase tracking-tight leading-snug">
            {event.title}
          </h2>
          <p className="text-xs text-[#52637A] font-medium italic">
            {metadata?.tagline || "A day to reconnect, remember, and celebrate"}
          </p>
        </div>

        {/* 3 Pill Information Cards */}
        <div className="space-y-2.5 px-1">
          {/* DATE PILL */}
          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-2.5 flex items-center gap-3 shadow-2xs">
            <div className="bg-[#A33D34] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider min-w-[80px] text-center flex-shrink-0">
              DATE
            </div>
            <div className="font-bold text-[#11233D] text-xs sm:text-sm uppercase tracking-wide truncate">
              {formattedDate}
            </div>
          </div>

          {/* TIME PILL */}
          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-2.5 flex items-center gap-3 shadow-2xs">
            <div className="bg-[#A33D34] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider min-w-[80px] text-center flex-shrink-0">
              TIME
            </div>
            <div className="font-bold text-[#11233D] text-xs sm:text-sm uppercase tracking-wide truncate">
              {timeDisplay}
            </div>
          </div>

          {/* LOCATION PILL */}
          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-2.5 flex items-center gap-3 shadow-2xs">
            <div className="bg-[#A33D34] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider min-w-[80px] text-center flex-shrink-0">
              LOCATION
            </div>
            <div className="font-bold text-[#11233D] text-[11px] sm:text-xs uppercase tracking-wide leading-tight line-clamp-2">
              {event.location}
            </div>
          </div>
        </div>

        {/* Bottom Unique ID Stub with Perforated Edge */}
        <div className="mt-4 bg-[#11233D] rounded-2xl p-4 text-white text-center space-y-1.5 relative shadow-md">
          <div className="text-[#C5A880] text-[10px] tracking-[0.25em] font-mono select-none overflow-hidden opacity-80">
            ••••••••••••••••••••••••••••
          </div>

          <div className="text-base sm:text-lg font-black font-mono tracking-widest text-white uppercase py-0.5">
            {registration.ticketCode}
          </div>

          <p className="text-[10px] text-slate-300 font-medium">
            Please present this pass at the registration desk
          </p>

          <div className="text-[10px] text-[#D4AF37] font-semibold pt-1 border-t border-slate-700/60">
            {registration.fullName}
            {registration.guestCount && registration.guestCount > 0
              ? ` • +${registration.guestCount} Guests`
              : " • Single Admission"}
            {registration.category ? ` • ${registration.category}` : ""}
            {registration.series ? ` • Series '${registration.series}` : ""}
            {registration.department ? ` • ${registration.department}` : ""}
          </div>

          <div className="text-[#C5A880] text-[10px] tracking-[0.25em] font-mono select-none overflow-hidden opacity-80 pt-0.5">
            ••••••••••••••••••••••••••••
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center text-[9px] font-bold uppercase tracking-widest text-[#11233D] mt-3 opacity-90">
          Sirajganj District Association, RUET
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 print:hidden">
        <Button
          type="button"
          size="sm"
          onClick={handlePrint}
          className="font-bold text-xs"
          leftIcon={<Printer className="w-3.5 h-3.5" />}
        >
          Print / Save Pass (PDF)
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isDownloading}
          onClick={handleDownloadImage}
          className="text-xs border-[#DFCEB5]"
          leftIcon={<ImageIcon className="w-3.5 h-3.5 text-[#7B2D26]" />}
        >
          {isDownloading ? "Generating..." : "Save Image (PNG)"}
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="text-xs border-[#DFCEB5]"
          leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copied ? "Copied!" : "Copy Code"}
        </Button>
      </div>
    </div>
  );
}
