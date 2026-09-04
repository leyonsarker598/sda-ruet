"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateContactCmsAction, type AdminCmsResult } from "@/actions/adminCms";
import { type ContactCmsData, type CmsFaqItem } from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "./RichTextEditor";
import { CheckCircle2, AlertCircle, Save, Plus, Trash2, HelpCircle, Phone } from "lucide-react";

export function ContactCmsForm({ initialData }: { initialData: ContactCmsData }) {
  const [state, formAction, isPending] = useActionState<AdminCmsResult | null, FormData>(
    updateContactCmsAction,
    null
  );

  const defaultFaqs: CmsFaqItem[] = [
    { id: "faq-1", question: "How do I apply for textbook loans?", answer: "Register an account, navigate to the Digital Library, and submit a textbook loan request before the semester deadline." },
    { id: "faq-2", question: "Who can register as a Verified Alumni Engineer?", answer: "Any RUET graduate originating from Sirajganj district can complete alumni verification with their student roll and graduation series." },
    { id: "faq-3", question: "How are student welfare grants disbursed?", answer: "Emergency medical and academic welfare applications are reviewed and approved transparently by the Executive Committee." },
  ];

  const [faqs, setFaqs] = React.useState<CmsFaqItem[]>(
    initialData.faqs && initialData.faqs.length > 0 ? initialData.faqs : defaultFaqs
  );

  const handleAddFaq = () => {
    setFaqs([
      ...faqs,
      {
        id: `faq-${Date.now()}`,
        question: "New Frequently Asked Question?",
        answer: "Provide a clear and helpful response here...",
      },
    ]);
  };

  const handleRemoveFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const handleUpdateFaq = (id: string, field: keyof CmsFaqItem, val: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert variant="success">
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Hidden input for FAQs */}
      <input type="hidden" name="faqsJson" value={JSON.stringify(faqs)} />

      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-2 flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#7B2D26]" />
          Contact Desk &amp; Campus Location
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campusName" required>Campus Name</Label>
            <Input id="campusName" name="campusName" defaultValue={initialData.campusName} required />
          </div>

          <div>
            <Label htmlFor="primaryEmail" required>Official Helpline Email</Label>
            <Input id="primaryEmail" name="primaryEmail" type="email" defaultValue={initialData.primaryEmail} required />
          </div>
        </div>

        <div>
          <Label htmlFor="address" required>Physical Address</Label>
          <Input id="address" name="address" defaultValue={initialData.address} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="helplinePhone" required>Primary Helpline Phone</Label>
            <Input id="helplinePhone" name="helplinePhone" defaultValue={initialData.helplinePhone} required />
          </div>

          <div>
            <Label htmlFor="alternatePhone">Alternate / Emergency Contact</Label>
            <Input id="alternatePhone" name="alternatePhone" defaultValue={initialData.alternatePhone} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="officeHours" required>Office &amp; Help Desk Hours</Label>
            <Input id="officeHours" name="officeHours" defaultValue={initialData.officeHours} required />
          </div>

          <div>
            <RichTextEditor
              id="emergencyDeskNotice"
              name="emergencyDeskNotice"
              label="Emergency Desk Notice (With Text Formatting)"
              defaultValue={initialData.emergencyDeskNotice}
              compact
            />
          </div>
        </div>
      </div>

      {/* Dynamic Frequently Asked Questions Manager */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#7B2D26]" />
              Frequently Asked Questions (Add, Edit, Delete)
            </h3>
            <p className="text-xs text-[#64748B]">Manage member helpdesk questions and answers with rich text formatting.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFaq}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add FAQ Item
          </Button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id}
              className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9] space-y-3 relative group"
            >
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                <span className="text-xs font-bold text-[#7B2D26]">FAQ #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(faq.id)}
                  className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <Label>Question</Label>
                <Input
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(faq.id, "question", e.target.value)}
                  placeholder="e.g. How do I join the association?"
                  className="bg-white"
                />
              </div>

              <RichTextEditor
                label="Answer (With Rich Text Formatting & Live Preview)"
                value={faq.answer}
                onChange={(val) => handleUpdateFaq(faq.id, "answer", val)}
                rows={2}
                placeholder="Provide formatted answer..."
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending} leftIcon={<Save className="w-5 h-5" />}>
          {isPending ? "Saving..." : "Save Contact Info & FAQs"}
        </Button>
      </div>
    </form>
  );
}
