"use client";

import * as React from "react";
import { useActionState } from "react";
import { updateSocialAndFooterCmsAction, type AdminCmsResult } from "@/actions/adminCms";
import { type SocialFooterCmsData, type CmsFooterLink } from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "./RichTextEditor";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Share2,
  Code,
  Link as LinkIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

export function SocialFooterCmsForm({ initialData }: { initialData: SocialFooterCmsData }) {
  const [state, formAction, isPending] = useActionState<AdminCmsResult | null, FormData>(
    updateSocialAndFooterCmsAction,
    null
  );

  const defaultLinks: CmsFooterLink[] = [
    { id: "fl-1", title: "Digital Textbook Library", url: "/library", category: "PORTALS" },
    { id: "fl-2", title: "Verified Alumni Directory", url: "/alumni", category: "PORTALS" },
    { id: "fl-3", title: "Activities & News", url: "/activities", category: "PORTALS" },
    { id: "fl-4", title: "Events & Reunions", url: "/events", category: "PORTALS" },
    { id: "fl-5", title: "Student Welfare Fund", url: "/donate", category: "PORTALS" },
    { id: "fl-6", title: "About & Constitution", url: "/about", category: "AFFAIRS" },
    { id: "fl-7", title: "Executive Committee", url: "/committee", category: "AFFAIRS" },
    { id: "fl-8", title: "Historical Committee Archive", url: "/committee/archive", category: "AFFAIRS" },
    { id: "fl-9", title: "Member FAQs & Helpdesk", url: "/faq", category: "AFFAIRS" },
    { id: "fl-10", title: "Contribution Transparency", url: "/donate/track", category: "AFFAIRS" },
  ];

  const [customLinks, setCustomLinks] = React.useState<CmsFooterLink[]>(
    initialData.customLinks && initialData.customLinks.length > 0
      ? initialData.customLinks
      : defaultLinks
  );

  const [showInlineCode, setShowInlineCode] = React.useState<boolean>(
    initialData.showInlineCode !== false
  );

  const handleAddLink = () => {
    setCustomLinks([
      ...customLinks,
      {
        id: `link-${Date.now()}`,
        title: "New Footer Link",
        url: "/about",
        category: "PORTALS",
      },
    ]);
  };

  const handleRemoveLink = (id: string) => {
    setCustomLinks(customLinks.filter((l) => l.id !== id));
  };

  const handleUpdateLink = (id: string, field: keyof CmsFooterLink, val: string) => {
    setCustomLinks(
      customLinks.map((l) => (l.id === id ? { ...l, [field]: val } : l))
    );
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

      <input type="hidden" name="customLinksJson" value={JSON.stringify(customLinks)} />
      <input type="hidden" name="showInlineCode" value={showInlineCode ? "true" : "false"} />

      {/* 1. Official Social Media Channels */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#7B2D26]" />
          1. Official Social Media &amp; Community Channels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="facebookUrl">Facebook Page URL</Label>
            <Input
              id="facebookUrl"
              name="facebookUrl"
              defaultValue={initialData.facebookUrl}
              placeholder="https://facebook.com/sdaruet"
            />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn Page URL</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              defaultValue={initialData.linkedinUrl}
              placeholder="https://linkedin.com/company/sdaruet"
            />
          </div>

          <div>
            <Label htmlFor="youtubeUrl">YouTube Channel URL</Label>
            <Input
              id="youtubeUrl"
              name="youtubeUrl"
              defaultValue={initialData.youtubeUrl}
              placeholder="https://youtube.com/@sdaruet"
            />
          </div>

          <div>
            <Label htmlFor="githubUrl">GitHub Organization URL</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              defaultValue={initialData.githubUrl}
              placeholder="https://github.com/sda-ruet"
            />
          </div>

          <div>
            <Label htmlFor="instagramUrl">Instagram Profile URL</Label>
            <Input
              id="instagramUrl"
              name="instagramUrl"
              defaultValue={initialData.instagramUrl}
              placeholder="https://instagram.com/sdaruet"
            />
          </div>

          <div>
            <Label htmlFor="whatsappNumber">WhatsApp Helpline Number</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              defaultValue={initialData.whatsappNumber}
              placeholder="+880 1700-000000"
            />
          </div>

          <div>
            <Label htmlFor="twitterUrl">Twitter / X Profile URL</Label>
            <Input
              id="twitterUrl"
              name="twitterUrl"
              defaultValue={initialData.twitterUrl}
              placeholder="https://twitter.com/sdaruet"
            />
          </div>

          <div>
            <Label htmlFor="emailContact">Public Contact Email</Label>
            <Input
              id="emailContact"
              name="emailContact"
              defaultValue={initialData.emailContact}
              placeholder="contact@sda-ruet.org"
            />
          </div>
        </div>
      </div>

      {/* 2. Customizable Inline Code & Developer Attribution */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <Code className="w-4 h-4 text-[#7B2D26]" />
              2. Inline Code &amp; Custom Snippet Attribution
            </h3>
            <p className="text-xs text-[#64748B]">
              Display custom inline code snippets, build metadata, or developer credits in the footer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInlineCode(!showInlineCode)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7B2D26]"
          >
            {showInlineCode ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {showInlineCode ? "Snippet Enabled" : "Snippet Disabled"}
          </button>
        </div>

        <div>
          <Label htmlFor="inlineCodeSnippet">Inline Code Text / Monospace Snippet</Label>
          <Input
            id="inlineCodeSnippet"
            name="inlineCodeSnippet"
            defaultValue={
              initialData.inlineCodeSnippet ||
              "const fraternalBond = (engineer) => engineer.origin === 'Sirajganj' && engineer.almaMater === 'RUET';"
            }
            placeholder="e.g. v2.4.0-prod // built for RUET Engineers"
            className="font-mono text-xs bg-[#FAF8F5]"
          />
          <p className="text-[11px] text-[#64748B] mt-1">
            Renders as a stylized dark code pill in the footer branding section next to the motto badge.
          </p>
        </div>
      </div>

      {/* 3. Dynamic Quick Links Manager (Add, Edit, Delete) */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#7B2D26]" />
              3. Footer Navigation Links (Add, Edit, Delete)
            </h3>
            <p className="text-xs text-[#64748B]">Manage column links for Academic Portals and Association Affairs.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLink}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Footer Link
          </Button>
        </div>

        <div className="space-y-3">
          {customLinks.map((link, idx) => (
            <div
              key={link.id}
              className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#E8E2D9] flex flex-col sm:flex-row items-center gap-3 relative"
            >
              <span className="text-xs font-bold text-[#7B2D26] shrink-0">#{idx + 1}</span>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                <Input
                  value={link.title}
                  onChange={(e) => handleUpdateLink(link.id, "title", e.target.value)}
                  placeholder="Link Title (e.g. Digital Library)"
                  className="bg-white text-xs"
                />
                <Input
                  value={link.url}
                  onChange={(e) => handleUpdateLink(link.id, "url", e.target.value)}
                  placeholder="Target URL (e.g. /library)"
                  className="bg-white text-xs font-mono"
                />
                <select
                  value={link.category || "PORTALS"}
                  onChange={(e) => handleUpdateLink(link.id, "category", e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-white border border-[#E8E2D9] focus:outline-hidden focus:ring-2 focus:ring-[#7B2D26] text-[#0F172A]"
                >
                  <option value="PORTALS">Portals &amp; Systems Column</option>
                  <option value="AFFAIRS">Association Affairs Column</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveLink(link.id)}
                className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg hover:bg-white transition-colors shrink-0"
                title="Delete Link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Global Footer Description & Copyright */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E2D9] space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F172A] font-heading border-b border-[#F3EFEA] pb-3">
          4. Global Footer Description &amp; Copyright Notices
        </h3>

        <RichTextEditor
          id="footerDescription"
          name="footerDescription"
          label="Footer Mission Description (With Rich Formatting & Preview)"
          defaultValue={initialData.footerDescription}
          required
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RichTextEditor
            id="copyrightText"
            name="copyrightText"
            label="Copyright Text (Supports Inline Code & Formatting)"
            defaultValue={initialData.copyrightText}
            required
            compact
          />

          <RichTextEditor
            id="affiliationNotice"
            name="affiliationNotice"
            label="Affiliation & Motto Notice"
            defaultValue={initialData.affiliationNotice}
            required
            compact
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          leftIcon={<Save className="w-5 h-5" />}
          className="shadow-sm"
        >
          {isPending ? "Saving..." : "Save Footer & Social Links"}
        </Button>
      </div>
    </form>
  );
}
