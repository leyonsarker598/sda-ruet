import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, ArrowUpRight, Code, MessageCircle, Mail } from "lucide-react";
import { DEFAULT_SOCIAL_FOOTER_CMS, type SocialFooterCmsData } from "@/types/cms";
import { sanitizeHtml } from "@/lib/sanitizer";

export function Footer({ cms }: { cms?: SocialFooterCmsData }) {
  const footerCms = cms || DEFAULT_SOCIAL_FOOTER_CMS;

  const portalLinks =
    footerCms.customLinks && footerCms.customLinks.length > 0
      ? footerCms.customLinks.filter((l) => l.category === "PORTALS")
      : [
          { id: "def-1", title: "Digital Textbook Library", url: "/library" },
          { id: "def-2", title: "Verified Alumni Directory", url: "/alumni" },
          { id: "def-3", title: "Activities & News", url: "/activities" },
          { id: "def-4", title: "Events & Reunions", url: "/events" },
          { id: "def-5", title: "Student Welfare Fund", url: "/donate" },
        ];

  const affairsLinks =
    footerCms.customLinks && footerCms.customLinks.length > 0
      ? footerCms.customLinks.filter((l) => l.category === "AFFAIRS")
      : [
          { id: "def-6", title: "About & Constitution", url: "/about" },
          { id: "def-7", title: "Executive Committee", url: "/committee" },
          { id: "def-8", title: "Historical Committee Archive", url: "/committee/archive" },
          { id: "def-9", title: "Member FAQs & Helpdesk", url: "/faq" },
          { id: "def-10", title: "Contribution Transparency", url: "/donate/track" },
        ];

  return (
    <footer className="border-t border-[#E8E2D9] bg-white text-[#0F172A] mt-auto">
      {/* Top Pre-Footer Accent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Branding & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/assets/Sda-PNG.png"
                  alt="SDA RUET Official Seal"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-base text-[#7B2D26] block leading-none font-heading">
                  SDA RUET
                </span>
                <span className="text-xs text-[#64748B] font-medium">
                  Sirajganj District Association, RUET
                </span>
              </div>
            </div>

            <div
              className="text-xs text-[#475569] leading-relaxed max-w-sm prose prose-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(footerCms.footerDescription) }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-[11px] font-semibold">
                <HeartHandshake className="w-3.5 h-3.5" />
                Take a Stand &amp; Hold a Hand
              </div>

              {footerCms.showInlineCode !== false && footerCms.inlineCodeSnippet && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0F172A] text-[#38BDF8] border border-[#334155] font-mono text-[10px] font-medium shadow-2xs">
                  <Code className="w-3 h-3 text-[#A855F7]" />
                  <code className="truncate max-w-[220px]">{footerCms.inlineCodeSnippet}</code>
                </div>
              )}
            </div>
          </div>

          {/* Col 3: Academic Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Portals &amp; Systems
            </h4>
            <ul className="space-y-2 text-xs text-[#64748B]">
              {portalLinks.map((l) => (
                <li key={l.id}>
                  <Link href={l.url} className="hover:text-[#7B2D26] transition-colors">
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Association Affairs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Association Affairs
            </h4>
            <ul className="space-y-2 text-xs text-[#64748B]">
              {affairsLinks.map((l) => (
                <li key={l.id}>
                  <Link href={l.url} className="hover:text-[#7B2D26] transition-colors">
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Social Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Community Channels
            </h4>
            <ul className="space-y-2 text-xs text-[#64748B]">
              {footerCms.facebookUrl && (
                <li>
                  <a
                    href={footerCms.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#7B2D26] transition-colors flex items-center gap-1"
                  >
                    Facebook Page <ArrowUpRight className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                </li>
              )}
              {footerCms.linkedinUrl && (
                <li>
                  <a
                    href={footerCms.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#7B2D26] transition-colors flex items-center gap-1"
                  >
                    LinkedIn Network <ArrowUpRight className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                </li>
              )}
              {footerCms.youtubeUrl && (
                <li>
                  <a
                    href={footerCms.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#7B2D26] transition-colors flex items-center gap-1"
                  >
                    YouTube Channel <ArrowUpRight className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                </li>
              )}
              {footerCms.githubUrl && (
                <li>
                  <a
                    href={footerCms.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#7B2D26] transition-colors flex items-center gap-1"
                  >
                    GitHub Open Source <ArrowUpRight className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                </li>
              )}
              {footerCms.instagramUrl && (
                <li>
                  <a
                    href={footerCms.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#7B2D26] transition-colors flex items-center gap-1"
                  >
                    Instagram <ArrowUpRight className="w-3 h-3 text-[#94A3B8]" />
                  </a>
                </li>
              )}
              {footerCms.whatsappNumber && (
                <li>
                  <a
                    href={`https://wa.me/${footerCms.whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#15803D] transition-colors flex items-center gap-1 text-[#15803D] font-medium"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp Helpline
                  </a>
                </li>
              )}
              {footerCms.emailContact && (
                <li>
                  <a
                    href={`mailto:${footerCms.emailContact}`}
                    className="hover:text-[#7B2D26] transition-colors flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3 text-[#94A3B8]" /> {footerCms.emailContact}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer */}
      <div className="border-t border-[#F3EFEA] bg-[#FAF8F5] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(footerCms.copyrightText || "© 2026 SDA RUET. All Rights Reserved."),
            }}
          />
          <div className="flex items-center gap-4">
            <span
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(footerCms.affiliationNotice || "Take a Stand & Hold a Hand"),
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
