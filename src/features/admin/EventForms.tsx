"use client";

import * as React from "react";
import { useActionState, useTransition } from "react";
import {
  createEventAction,
  updateEventAction,
  cancelEventAction,
  deleteEventAction,
  markAttendanceAction,
  exportEventAttendeesCSVAction,
  type AdminEventResult,
} from "@/actions/adminEvent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { unpackEventDescription, type EventCmsMetadata } from "@/lib/eventMetadata";
import {
  Plus,
  Edit2,
  XCircle,
  Trash2,
  CheckCircle2,
  Download,
  AlertCircle,
  Calendar,
  Image as ImageIcon,
  UserCheck,
  Eye,
  Settings,
  Phone,
  DollarSign,
  FileText,
  Sliders,
  Sparkles,
} from "lucide-react";
import type { AdminEventItem } from "@/services/adminEventService";

function ImagePreviewBox({ url }: { url: string }) {
  const [hasError, setHasError] = React.useState(false);
  if (!url || !url.trim().startsWith("http")) return null;

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-[#E8E2D9] bg-[#FAF5F5] relative h-36 w-full flex items-center justify-center">
      {hasError ? (
        <div className="text-xs text-[#DC2626] flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          Could not load image preview. Check link validity.
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Banner Preview"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
        Live Banner Preview
      </div>
    </div>
  );
}

export function CreateEventModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"basic" | "content" | "guidelines" | "payment" | "form">("basic");
  const [bannerUrl, setBannerUrl] = React.useState("");

  const [state, formAction, isPending] = useActionState<AdminEventResult | null, FormData>(
    createEventAction,
    null
  );

  React.useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      setActiveTab("basic");
      setBannerUrl("");
    }
  }, [state?.success]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        leftIcon={<Plus className="w-4 h-4" />}
        className="font-semibold text-xs"
      >
        Launch New Event
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Launch Official Event & Landing Page"
        description="Configure dynamic landing page, customizable registration fields, payment options, and guidelines."
      >
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E8E2D9] pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "basic"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              1. Basic &amp; Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "content"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              2. Program Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guidelines")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "guidelines"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              3. Guidelines &amp; Contacts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payment")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "payment"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              4. Payment Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "form"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              5. Form Customizer
            </button>
          </div>

          {/* TAB 1: BASIC & SCHEDULE */}
          <div className={`space-y-4 ${activeTab === "basic" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" required>Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. RUET Alumni Reunion 2026"
                  error={state?.fieldErrors?.title?.[0]}
                />
              </div>

              <div>
                <Label htmlFor="slug" required>Landing Page URL Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="e.g. alumni-reunion-2026"
                  error={state?.fieldErrors?.slug?.[0]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tagline">Event Tagline / Subtitle (Appears on Pass &amp; Banner)</Label>
              <Input
                id="tagline"
                name="tagline"
                defaultValue="A day to reconnect, remember, and celebrate"
                placeholder="e.g. A day to reconnect, remember, and celebrate"
              />
            </div>

            <div>
              <Label htmlFor="bannerImageUrl">Banner / Cover Image Link URL</Label>
              <Input
                id="bannerImageUrl"
                name="bannerImageUrl"
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or direct image link"
              />
              <ImagePreviewBox url={bannerUrl} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" required>Event Venue / Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue="Rajshahi University of Engineering & Technology"
                  placeholder="e.g. RUET Central Auditorium"
                />
              </div>

              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select id="status" name="status" defaultValue="UPCOMING">
                  <option value="UPCOMING">Upcoming (Active)</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DRAFT">Draft (Admin Only)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventDate" required>Event Date</Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                />
              </div>

              <div>
                <Label htmlFor="startTime" required>Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  defaultValue="16:00"
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  defaultValue="20:00"
                />
              </div>
            </div>
          </div>

          {/* TAB 2: RICH PROGRAM DETAILS */}
          <div className={`space-y-4 ${activeTab === "content" ? "block" : "hidden"}`}>
            <div>
              <Label htmlFor="description" required>Program Details, Overview &amp; Agenda</Label>
              <p className="text-[11px] text-[#64748B] mb-2">
                Use the formatting toolbar to format headings, bold highlights, bullet points, and timeline schedule blocks.
              </p>
              <RichTextEditor
                id="description"
                name="description"
                rows={7}
                defaultValue="## Event Overview\n\nJoin fellow students, alumni, and faculty members for an inspiring grand event celebrating brotherhood and excellence.\n\n### Schedule\n- **05:00 PM**: Reception & Welcome Drinks\n- **06:30 PM**: Executive Keynotes & Speeches\n- **08:00 PM**: Grand Feast Dinner & Networking"
                placeholder="Join fellow alumni, faculty, and students for an unforgettable evening..."
              />
            </div>
          </div>

          {/* TAB 3: GUIDELINES & CONTACTS */}
          <div className={`space-y-4 ${activeTab === "guidelines" ? "block" : "hidden"}`}>
            <div>
              <Label htmlFor="guidelines">Attendee Guidelines &amp; Venue Instructions</Label>
              <Textarea
                id="guidelines"
                name="guidelines"
                rows={3}
                defaultValue={"• Please present your Digital Admission Pass or Pass Reference Code at the reception desk.\n• Student attendees should carry their RUET Student ID card or roll verification.\n• Feast & dinner tokens will be provided upon entry verification."}
                placeholder="Bullet points of check-in instructions, dress code, entry rules..."
              />
            </div>

            <div className="border-t border-[#F3EFEA] pt-3">
              <h4 className="text-xs font-bold text-[#0F172A] mb-2">Organizer Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="contactName">Contact Person / Convener</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    defaultValue="Executive Committee, SDA RUET"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Helpline / WhatsApp</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    defaultValue="+880 1712-345678"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Inquiry Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    defaultValue="events@sda-ruet.org"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 4: PAYMENT INFO & CATEGORY TIERS */}
          <div className={`space-y-4 ${activeTab === "payment" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="feeAmount">Default Base Admission Fee (BDT)</Label>
                <Input
                  id="feeAmount"
                  name="feeAmount"
                  type="number"
                  min="0"
                  defaultValue="0"
                  placeholder="0 for Free Event"
                />
              </div>

              <div>
                <Label htmlFor="requireTransactionId">Payment Verification</Label>
                <Select id="requireTransactionId" name="requireTransactionId" defaultValue="false">
                  <option value="false">Optional / Cash on arrival</option>
                  <option value="true">Strictly Require bKash/Nagad TxID</option>
                </Select>
              </div>
            </div>

            {/* Tiered Category Pricing Section */}
            <div className="bg-[#FAF5F5] border border-[#DFCEB5] rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Category-wise Tiered Pricing</h4>
                  <p className="text-[11px] text-[#64748B]">
                    Set custom admission fee rates for different attendee categories.
                  </p>
                </div>
                <Checkbox
                  id="tieredPricingEnabled"
                  name="tieredPricingEnabled"
                  value="true"
                  defaultChecked={true}
                  label="Enable Tiers"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <Label htmlFor="feeStudent" className="text-[11px]">Student Fee (BDT)</Label>
                  <Input id="feeStudent" name="feeStudent" type="number" min="0" defaultValue="100" />
                </div>
                <div>
                  <Label htmlFor="feeAlumni" className="text-[11px]">Alumni Fee (BDT)</Label>
                  <Input id="feeAlumni" name="feeAlumni" type="number" min="0" defaultValue="200" />
                </div>
                <div>
                  <Label htmlFor="feeTeacher" className="text-[11px]">Teacher Fee (BDT)</Label>
                  <Input id="feeTeacher" name="feeTeacher" type="number" min="0" defaultValue="150" />
                </div>
                <div>
                  <Label htmlFor="feeGuest" className="text-[11px]">Non-Member (BDT)</Label>
                  <Input id="feeGuest" name="feeGuest" type="number" min="0" defaultValue="300" />
                </div>
              </div>
            </div>

            {/* Coupons Configuration */}
            <div>
              <Label htmlFor="coupons">Discount / Promo Coupons (Comma separated)</Label>
              <Input
                id="coupons"
                name="coupons"
                defaultValue="SDA2026:10%, EARLYBIRD:50, SPECIAL100:100"
                placeholder="e.g. CODE:VALUE (e.g. SDA2026:10%, EARLYBIRD:50)"
              />
              <p className="text-[10px] text-[#64748B] mt-1">
                Format: <code className="text-[#7B2D26]">CODE:VALUE</code> (use % for percentage discount or flat BDT amount).
              </p>
            </div>

            <div>
              <Label htmlFor="paymentInstructions">Payment Details &amp; Merchant Numbers</Label>
              <Textarea
                id="paymentInstructions"
                name="paymentInstructions"
                rows={3}
                defaultValue="Please send the required admission fee via bKash / Nagad / Rocket to Association Merchant/Personal Number: 01712-345678 (Send Money / Payment) and enter your transaction ID."
                placeholder="Custom payment instructions, account numbers, and reference formatting..."
              />
            </div>
          </div>

          {/* TAB 5: REGISTRATION FORM CUSTOMIZER */}
          <div className={`space-y-4 ${activeTab === "form" ? "block" : "hidden"}`}>
            <div className="bg-[#FAF5F5] border border-[#DFCEB5] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#7B2D26]" />
                Registration Form Field Customizer
              </h4>
              <p className="text-[11px] text-[#64748B]">
                Choose which fields are requested on the event registration form:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Checkbox
                  name="registrationRequired"
                  value="true"
                  defaultChecked={true}
                  label="Enable Registration Form on Landing Page"
                />

                <Checkbox
                  name="allowGuests"
                  value="true"
                  defaultChecked={true}
                  label="Allow Accompanying Guests (+1, +2, etc.)"
                />

                <Checkbox
                  name="askTshirt"
                  value="true"
                  defaultChecked={true}
                  label="Ask for T-Shirt Size (M, L, XL, XXL)"
                />

                <Checkbox
                  name="askDietary"
                  value="true"
                  defaultChecked={true}
                  label="Ask for Dietary Meal Preference"
                />

                <Checkbox
                  name="askStudentId"
                  value="true"
                  defaultChecked={true}
                  label="Ask for Student / Roll ID"
                />

                <Checkbox
                  name="askDeptSeries"
                  value="true"
                  defaultChecked={true}
                  label="Ask for Academic Department &amp; Series"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E2D9]">
                <div>
                  <Label htmlFor="maxParticipants">Max Capacity (Auditorium Seats)</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    placeholder="e.g. 200 (blank = unlimited)"
                  />
                </div>

                <div>
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    name="registrationDeadline"
                    type="datetime-local"
                  />
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Launching Event..." : "Launch Event & Landing Page"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function EditEventModal({ event }: { event: AdminEventItem }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"basic" | "content" | "guidelines" | "payment" | "form">("basic");
  const [bannerUrl, setBannerUrl] = React.useState(event.banner_image_url || "");

  const { programDetails, metadata } = unpackEventDescription(event.description);

  const [state, formAction, isPending] = useActionState<AdminEventResult | null, FormData>(
    updateEventAction,
    null
  );

  React.useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state?.success]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="xs"
        variant="outline"
        leftIcon={<Edit2 className="w-3.5 h-3.5 text-[#7B2D26]" />}
        className="text-xs"
      >
        Edit CMS
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit Event Landing Page &amp; CMS"
        description="Update all event details, rich program text, guidelines, contact info, payment setup, and registration fields."
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={event.id} />

          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E8E2D9] pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "basic"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              1. Basic &amp; Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "content"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              2. Program Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guidelines")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "guidelines"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              3. Guidelines &amp; Contacts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payment")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "payment"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              4. Payment Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === "form"
                  ? "bg-[#7B2D26] text-white"
                  : "text-[#64748B] hover:bg-[#FAF5F5]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              5. Form Customizer
            </button>
          </div>

          {/* TAB 1: BASIC & SCHEDULE */}
          <div className={`space-y-4 ${activeTab === "basic" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title" required>Event Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={event.title}
                />
              </div>

              <div>
                <Label htmlFor="edit-slug" required>URL Slug</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  defaultValue={event.slug}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-tagline">Event Tagline / Subtitle</Label>
              <Input
                id="edit-tagline"
                name="tagline"
                defaultValue={metadata.tagline || ""}
              />
            </div>

            <div>
              <Label htmlFor="edit-bannerImageUrl">Banner / Cover Image Link URL</Label>
              <Input
                id="edit-bannerImageUrl"
                name="bannerImageUrl"
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
              />
              <ImagePreviewBox url={bannerUrl} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location" required>Venue / Location</Label>
                <Input
                  id="edit-location"
                  name="location"
                  defaultValue={event.location}
                />
              </div>

              <div>
                <Label htmlFor="edit-status">Event Status</Label>
                <Select id="edit-status" name="status" defaultValue={event.status}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="DRAFT">Draft</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-eventDate" required>Event Date</Label>
                <Input
                  id="edit-eventDate"
                  name="eventDate"
                  type="date"
                  defaultValue={event.event_date}
                />
              </div>

              <div>
                <Label htmlFor="edit-startTime" required>Start Time</Label>
                <Input
                  id="edit-startTime"
                  name="startTime"
                  type="time"
                  defaultValue={event.start_time}
                />
              </div>

              <div>
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  name="endTime"
                  type="time"
                  defaultValue={event.end_time || ""}
                />
              </div>
            </div>
          </div>

          {/* TAB 2: RICH PROGRAM DETAILS */}
          <div className={`space-y-4 ${activeTab === "content" ? "block" : "hidden"}`}>
            <div>
              <Label htmlFor="edit-description" required>Program Details, Overview &amp; Agenda</Label>
              <p className="text-[11px] text-[#64748B] mb-2">
                Use the formatting toolbar to format headings, bold highlights, bullet points, and timeline schedule blocks.
              </p>
              <RichTextEditor
                id="edit-description"
                name="description"
                defaultValue={programDetails}
                rows={7}
              />
            </div>
          </div>

          {/* TAB 3: GUIDELINES & CONTACTS */}
          <div className={`space-y-4 ${activeTab === "guidelines" ? "block" : "hidden"}`}>
            <div>
              <Label htmlFor="edit-guidelines">Attendee Guidelines &amp; Venue Instructions</Label>
              <Textarea
                id="edit-guidelines"
                name="guidelines"
                rows={3}
                defaultValue={metadata.guidelines || ""}
              />
            </div>

            <div className="border-t border-[#F3EFEA] pt-3">
              <h4 className="text-xs font-bold text-[#0F172A] mb-2">Organizer Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="edit-contactName">Contact Person / Convener</Label>
                  <Input
                    id="edit-contactName"
                    name="contactName"
                    defaultValue={metadata.contactName || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-contactPhone">Helpline / WhatsApp</Label>
                  <Input
                    id="edit-contactPhone"
                    name="contactPhone"
                    defaultValue={metadata.contactPhone || ""}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-contactEmail">Inquiry Email</Label>
                  <Input
                    id="edit-contactEmail"
                    name="contactEmail"
                    defaultValue={metadata.contactEmail || ""}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 4: PAYMENT INFO & CATEGORY TIERS */}
          <div className={`space-y-4 ${activeTab === "payment" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-feeAmount">Default Base Admission Fee (BDT)</Label>
                <Input
                  id="edit-feeAmount"
                  name="feeAmount"
                  type="number"
                  min="0"
                  defaultValue={event.fee_amount}
                />
              </div>

              <div>
                <Label htmlFor="edit-requireTransactionId">Payment Verification</Label>
                <Select
                  id="edit-requireTransactionId"
                  name="requireTransactionId"
                  defaultValue={metadata.requireTransactionId ? "true" : "false"}
                >
                  <option value="false">Optional / Cash on arrival</option>
                  <option value="true">Strictly Require bKash/Nagad TxID</option>
                </Select>
              </div>
            </div>

            {/* Tiered Category Pricing Section */}
            <div className="bg-[#FAF5F5] border border-[#DFCEB5] rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Category-wise Tiered Pricing</h4>
                  <p className="text-[11px] text-[#64748B]">
                    Set custom admission fee rates for different attendee categories.
                  </p>
                </div>
                <Checkbox
                  id="edit-tieredPricingEnabled"
                  name="tieredPricingEnabled"
                  value="true"
                  defaultChecked={metadata.tieredPricingEnabled !== false}
                  label="Enable Tiers"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <Label htmlFor="edit-feeStudent" className="text-[11px]">Student Fee (BDT)</Label>
                  <Input
                    id="edit-feeStudent"
                    name="feeStudent"
                    type="number"
                    min="0"
                    defaultValue={metadata.categoryFees?.student ?? event.fee_amount}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-feeAlumni" className="text-[11px]">Alumni Fee (BDT)</Label>
                  <Input
                    id="edit-feeAlumni"
                    name="feeAlumni"
                    type="number"
                    min="0"
                    defaultValue={metadata.categoryFees?.alumni ?? event.fee_amount}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-feeTeacher" className="text-[11px]">Teacher Fee (BDT)</Label>
                  <Input
                    id="edit-feeTeacher"
                    name="feeTeacher"
                    type="number"
                    min="0"
                    defaultValue={metadata.categoryFees?.teacher ?? event.fee_amount}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-feeGuest" className="text-[11px]">Non-Member (BDT)</Label>
                  <Input
                    id="edit-feeGuest"
                    name="feeGuest"
                    type="number"
                    min="0"
                    defaultValue={metadata.categoryFees?.guest ?? event.fee_amount}
                  />
                </div>
              </div>
            </div>

            {/* Coupons Configuration */}
            <div>
              <Label htmlFor="edit-coupons">Discount / Promo Coupons (Comma separated)</Label>
              <Input
                id="edit-coupons"
                name="coupons"
                defaultValue={
                  metadata.coupons
                    ? metadata.coupons.map((c) => `${c.code}:${c.discountValue}${c.discountType === "PERCENT" ? "%" : ""}`).join(", ")
                    : "SDA2026:10%, EARLYBIRD:50"
                }
                placeholder="e.g. CODE:VALUE (e.g. SDA2026:10%, EARLYBIRD:50)"
              />
              <p className="text-[10px] text-[#64748B] mt-1">
                Format: <code className="text-[#7B2D26]">CODE:VALUE</code> (use % for percentage discount or flat BDT amount).
              </p>
            </div>

            <div>
              <Label htmlFor="edit-paymentInstructions">Payment Details &amp; Merchant Numbers</Label>
              <Textarea
                id="edit-paymentInstructions"
                name="paymentInstructions"
                rows={3}
                defaultValue={metadata.paymentInstructions || ""}
              />
            </div>
          </div>

          {/* TAB 5: REGISTRATION FORM CUSTOMIZER */}
          <div className={`space-y-4 ${activeTab === "form" ? "block" : "hidden"}`}>
            <div className="bg-[#FAF5F5] border border-[#DFCEB5] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#7B2D26]" />
                Registration Form Field Customizer
              </h4>
              <p className="text-[11px] text-[#64748B]">
                Customize which fields are requested from attendees for this event:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Checkbox
                  name="registrationRequired"
                  value="true"
                  defaultChecked={event.registration_required}
                  label="Enable Registration Form on Landing Page"
                />

                <Checkbox
                  name="allowGuests"
                  value="true"
                  defaultChecked={metadata.allowGuests !== false}
                  label="Allow Accompanying Guests (+1, +2, etc.)"
                />

                <Checkbox
                  name="askTshirt"
                  value="true"
                  defaultChecked={metadata.askTshirt !== false}
                  label="Ask for T-Shirt Size (M, L, XL, XXL)"
                />

                <Checkbox
                  name="askDietary"
                  value="true"
                  defaultChecked={metadata.askDietary !== false}
                  label="Ask for Dietary Meal Preference"
                />

                <Checkbox
                  name="askStudentId"
                  value="true"
                  defaultChecked={metadata.askStudentId !== false}
                  label="Ask for Student / Roll ID"
                />

                <Checkbox
                  name="askDeptSeries"
                  value="true"
                  defaultChecked={metadata.askDeptSeries !== false}
                  label="Ask for Academic Department &amp; Series"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8E2D9]">
                <div>
                  <Label htmlFor="edit-maxParticipants">Max Capacity (Seats)</Label>
                  <Input
                    id="edit-maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    defaultValue={event.max_participants || ""}
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="edit-registrationDeadline"
                    name="registrationDeadline"
                    type="datetime-local"
                    defaultValue={event.registration_deadline ? event.registration_deadline.slice(0, 16) : ""}
                  />
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save All Event Changes"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

export function CancelEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="xs"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to cancel this event?")) {
          startTransition(async () => {
            await cancelEventAction(eventId);
          });
        }
      }}
      className="text-xs text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2]"
      leftIcon={<XCircle className="w-3.5 h-3.5" />}
    >
      {isPending ? "Cancelling..." : "Cancel Event"}
    </Button>
  );
}

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="xs"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to completely delete this event?")) {
          startTransition(async () => {
            await deleteEventAction(eventId);
          });
        }
      }}
      className="text-xs text-[#DC2626] border-[#FCA5A5] hover:bg-[#FEF2F2]"
      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

export function ExportAttendeesCSVButton({ eventId, eventSlug }: { eventId: string; eventSlug: string }) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await exportEventAttendeesCSVAction(eventId);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendees_${eventSlug}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export attendee roster.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      size="xs"
      variant="outline"
      disabled={isExporting}
      leftIcon={<Download className="w-3.5 h-3.5 text-[#7B2D26]" />}
      className="text-xs border-[#DFCEB5]"
    >
      {isExporting ? "Exporting..." : "Export Attendee CSV"}
    </Button>
  );
}

export function AttendanceToggleButton({
  registrationId,
  attended,
  eventId,
}: {
  registrationId: string;
  attended: boolean;
  eventId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="xs"
      variant={attended ? "default" : "outline"}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await markAttendanceAction(registrationId, !attended, eventId);
        });
      }}
      className="text-xs"
      leftIcon={attended ? <CheckCircle2 className="w-3 h-3 text-white" /> : <UserCheck className="w-3 h-3 text-[#64748B]" />}
    >
      {isPending ? "..." : attended ? "Attended" : "Check-in"}
    </Button>
  );
}
