"use client";

import * as React from "react";
import { useActionState } from "react";
import { submitBookDonationAction, type BookDonationActionResult } from "@/actions/bookDonation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  User,
  GraduationCap,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

interface BookCategory {
  id: string;
  name: string;
}

export function BookDonationForm({
  categories = [],
  defaultDonor,
}: {
  categories?: BookCategory[];
  defaultDonor?: {
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    series?: string;
  };
}) {
  const [state, formAction, isPending] = useActionState<BookDonationActionResult | null, FormData>(
    submitBookDonationAction,
    null
  );

  const [photoUrl, setPhotoUrl] = React.useState("");
  const [imageError, setImageError] = React.useState(false);

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

      {/* Section 1: Donor Identification */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE6] pb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              1. Donor Identification &amp; Credit
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Your name, department, and series will be credited on the book copy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="donorName" required>
              Your Full Name
            </Label>
            <Input
              id="donorName"
              name="donorName"
              defaultValue={defaultDonor?.fullName || ""}
              placeholder="e.g. Md. Yeasir Arafat"
              required
              error={state?.fieldErrors?.donorName?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="donorEmail" required>
              Email Address
            </Label>
            <Input
              id="donorEmail"
              name="donorEmail"
              type="email"
              defaultValue={defaultDonor?.email || ""}
              placeholder="e.g. student@ruet.ac.bd"
              required
              error={state?.fieldErrors?.donorEmail?.[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="donorDepartment">Department</Label>
            <Input
              id="donorDepartment"
              name="donorDepartment"
              defaultValue={defaultDonor?.department || ""}
              placeholder="e.g. CSE, EEE, CE, ME"
            />
          </div>

          <div>
            <Label htmlFor="donorSeries">Series / Batch</Label>
            <Input
              id="donorSeries"
              name="donorSeries"
              defaultValue={defaultDonor?.series || ""}
              placeholder="e.g. 19, 20, 21"
            />
          </div>

          <div>
            <Label htmlFor="donorPhone">Contact Phone</Label>
            <Input
              id="donorPhone"
              name="donorPhone"
              type="tel"
              defaultValue={defaultDonor?.phone || ""}
              placeholder="+880 1700-000000"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Book Details */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0ECE6] pb-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5F5] border border-[#E6C9C7] flex items-center justify-center text-[#7B2D26]">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              2. Textbook Details
            </h3>
            <p className="text-[11px] text-[#64748B]">Title, author, and academic category</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bookTitle" required>
              Book Title
            </Label>
            <Input
              id="bookTitle"
              name="bookTitle"
              placeholder="e.g. Higher Engineering Mathematics"
              required
              error={state?.fieldErrors?.bookTitle?.[0]}
            />
          </div>

          <div>
            <Label htmlFor="author" required>
              Primary Author(s)
            </Label>
            <Input
              id="author"
              name="author"
              placeholder="e.g. B.S. Grewal"
              required
              error={state?.fieldErrors?.author?.[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="categoryId">Discipline / Category</Label>
            <Select id="categoryId" name="categoryId" defaultValue={categories[0]?.id || ""}>
              <option value="">Select subject category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity (Copies)</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              max="50"
              defaultValue="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="condition">Physical Condition</Label>
            <Select id="condition" name="condition" defaultValue="GOOD">
              <option value="NEW">Brand New / Unused</option>
              <option value="GOOD">Good (Light use, intact pages)</option>
              <option value="FAIR">Fair (Readable, minor markings)</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="isbn">ISBN (Optional)</Label>
            <Input
              id="isbn"
              name="isbn"
              placeholder="e.g. 978-0131103627"
            />
          </div>

          <div>
            <Label htmlFor="photoUrl">Book Photo / Cover Image URL (Optional)</Label>
            <Input
              id="photoUrl"
              name="photoUrl"
              value={photoUrl}
              onChange={(e) => {
                setPhotoUrl(e.target.value);
                setImageError(false);
              }}
              placeholder="https://example.com/cover.jpg"
            />
          </div>
        </div>

        {/* Live Image Preview */}
        {photoUrl && !imageError && (
          <div className="p-3 rounded-xl bg-[#FAF5F5] border border-[#E6C9C7] flex items-center gap-4">
            <div className="relative w-14 h-18 rounded-lg overflow-hidden border border-[#E8E2D9] bg-white flex-shrink-0">
              <Image
                src={photoUrl}
                alt="Book cover preview"
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#15803D] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cover Image Linked
              </span>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                This image will be displayed on the digital catalog once accepted by the librarian.
              </p>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="message">Campus Pickup Note / Message</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="e.g. Can meet in front of RUET Central Library or Shahid Ziaur Rahman Hall during afternoons."
            rows={2}
          />
        </div>
      </div>

      {/* Submit CTA */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-[#7B2D26] hover:bg-[#60211B] text-white font-semibold shadow-xs"
        disabled={isPending || state?.success}
      >
        <HeartHandshake className="w-4 h-4 mr-2" />
        {isPending ? "Submitting Book Donation..." : "Submit Book Donation to Digital Library"}
      </Button>

      <p className="text-center text-[11px] text-[#64748B]">
        After submission, our student library secretary will inspect the physical condition and enlist the copy in the official SDA RUET catalog with your donor attribution.
      </p>
    </form>
  );
}
