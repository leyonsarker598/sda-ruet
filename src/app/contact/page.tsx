import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Building2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/features/public/ContactForm";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getContactCms, getSocialFooterCms } from "@/services/cmsService";
import { sanitizeHtml } from "@/lib/sanitizer";

export const metadata: Metadata = {
  title: "Contact Association | SDA RUET",
  description:
    "Get in touch with the executive committee of Sirajganj District Association, RUET. Campus office details and inquiry form.",
};

export default async function ContactPage() {
  const [profile, contactInfo, socialFooter] = await Promise.all([
    getCurrentProfile(),
    getContactCms(),
    getSocialFooterCms(),
  ]);

  const defaultFaqs = [
    {
      id: "faq-1",
      question: "How do I apply for textbook loans from the library?",
      answer: "Register an account, navigate to the Digital Library, and submit a loan request before the semester deadline.",
    },
    {
      id: "faq-2",
      question: "Who can register as a Verified Alumni Engineer?",
      answer: "Any RUET graduate originating from Sirajganj district can complete verification with their student roll and graduation series.",
    },
    {
      id: "faq-3",
      question: "How are student emergency welfare grants disbursed?",
      answer: "Emergency medical and academic welfare applications are reviewed and approved transparently by the Executive Committee.",
    },
  ];

  const faqs = contactInfo.faqs && contactInfo.faqs.length > 0 ? contactInfo.faqs : defaultFaqs;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
            <Mail className="w-3.5 h-3.5" />
            Direct Communication
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
            Contact SDA RUET
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Have an inquiry about membership, book donations, or executive affairs? Reach out directly to our committee.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Office Details Column */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] font-heading">
              Campus Office &amp; Address
            </h3>

            <div className="p-5 rounded-2xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0F172A] block">{contactInfo.campusName}</span>
                  <span className="text-xs text-[#64748B] leading-relaxed block mt-0.5">
                    {contactInfo.address}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0F172A] block">General Inquiries</span>
                  <a
                    href={`mailto:${contactInfo.primaryEmail}`}
                    className="text-xs text-[#7B2D26] hover:underline block mt-0.5"
                  >
                    {contactInfo.primaryEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0F172A] block">Helpline Hotlines</span>
                  <span className="text-xs text-[#64748B] block mt-0.5">
                    {contactInfo.helplinePhone} {contactInfo.alternatePhone ? `· ${contactInfo.alternatePhone}` : ""}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26] flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0F172A] block">Office Hours</span>
                  <span className="text-xs text-[#64748B] block mt-0.5">
                    {contactInfo.officeHours}
                  </span>
                </div>
              </div>
            </div>

            {contactInfo.emergencyDeskNotice && (
              <div className="p-4 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] text-xs text-[#7B2D26] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{contactInfo.emergencyDeskNotice}</span>
              </div>
            )}
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] font-heading">
              Send Official Inquiry Message
            </h3>

            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Dynamic Frequently Asked Questions (FAQs) */}
        <div className="pt-6 border-t border-[#E8E2D9] space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#C5A880]" />
                Knowledge Base
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                Frequently Asked Questions
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="font-semibold border-[#DFCEB5] hover:bg-white">
              <Link href="/faq" className="flex items-center gap-1.5">
                View Full FAQ Knowledgebase <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id}
                className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-2"
              >
                <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-start gap-2">
                  <span className="text-xs text-[#7B2D26] font-extrabold font-mono">Q{idx + 1}.</span>
                  {faq.question}
                </h3>
                <div
                  className="text-xs text-[#475569] leading-relaxed pl-5 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer cms={socialFooter} />
    </div>
  );
}

