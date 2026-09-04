import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  Mail,
  Phone,
  ArrowRight,
  BookOpen,
  Users,
  HeartHandshake,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getContactCms, getSocialFooterCms } from "@/services/cmsService";
import { sanitizeHtml } from "@/lib/sanitizer";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQs) | SDA RUET",
  description:
    "Common inquiries about membership registration, alumni verification, digital library textbook loans, welfare aid, and events.",
};

export default async function FaqPage() {
  const [profile, contactInfo, socialFooter] = await Promise.all([
    getCurrentProfile(),
    getContactCms(),
    getSocialFooterCms(),
  ]);

  const defaultFaqs = [
    {
      id: "faq-1",
      question: "Who is eligible to join Sirajganj District Association, RUET?",
      answer:
        "Any enrolled student, teacher, or graduate of Rajshahi University of Engineering & Technology (RUET) hailing from Sirajganj district is eligible for official membership.",
    },
    {
      id: "faq-2",
      question: "How does the Digital Textbook Library loan process work?",
      answer:
        "Registered members can log into the portal, browse available semester textbooks by department and series, and submit a loan request. Books are distributed at the start of each semester by the library coordinator.",
    },
    {
      id: "faq-3",
      question: "How can alumni get verified?",
      answer:
        "RUET graduates can register as Alumni and provide their student roll, department, and passing series. The executive committee verifies records against association archives.",
    },
    {
      id: "faq-4",
      question: "How are student emergency welfare and medical funds disbursed?",
      answer:
        "Students facing medical emergencies or financial hardships can submit an emergency assistance request through the portal or by contacting the helpline. The Executive Committee reviews and disburses funds transparently.",
    },
    {
      id: "faq-5",
      question: "How do I donate or contribute to student welfare funds?",
      answer:
        "Visit the Support & Donate page to view official bKash, Nagad, Rocket, and Bank deposit channels. After making a payment, submit the transaction ID on the page for verified ledger recording.",
    },
  ];

  const faqs =
    contactInfo.faqs && contactInfo.faqs.length > 0 ? contactInfo.faqs : defaultFaqs;

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF9F5] text-[#0F172A]">
      <Header user={profile} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F5] border border-[#E6C9C7] text-[#7B2D26] text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Helpdesk &amp; Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Find answers to common questions about membership, alumni networking, digital textbook circulation, and welfare programs.
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="p-6 rounded-3xl bg-white border border-[#E8E2D9] shadow-xs space-y-3 hover:border-[#DFCEB5] transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#FAF5F5] text-[#7B2D26] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#E6C9C7]">
                  {idx + 1}
                </span>
                <div className="space-y-2 flex-1">
                  <h3 className="text-base font-bold text-[#0F172A] font-heading">
                    {faq.question}
                  </h3>
                  <div
                    className="text-xs sm:text-sm text-[#475569] leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#7B2D26] to-[#60211B] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold font-heading">Still Have Questions?</h3>
            <p className="text-xs text-white/80 max-w-md">
              Cannot find what you are looking for? Reach out to our campus desk or send a direct inquiry to the Executive Committee.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="sm" className="bg-white text-[#7B2D26] hover:bg-[#FAF5F5] font-bold shadow-sm hover:shadow-md transition-all">
              <Link href="/contact" className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7B2D26]" /> Contact Desk
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="bg-white/10 text-white border border-white/40 hover:bg-white/20 font-semibold shadow-xs transition-all">
              <Link href={`tel:${contactInfo.helplinePhone}`} className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#C5A880]" /> Call Helpline
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer cms={socialFooter} />
    </div>
  );
}
