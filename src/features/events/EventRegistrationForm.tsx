"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  submitEventRegistrationAction,
  type EventRegistrationResult,
} from "@/actions/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EventPassCard } from "./EventPassCard";
import {
  unpackEventDescription,
  calculateEventRegistrationFee,
} from "@/lib/eventMetadata";
import {
  Ticket,
  CheckCircle2,
  AlertCircle,
  Users,
  Tag,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AdminEventItem } from "@/services/adminEventService";

interface EventRegistrationFormProps {
  event: AdminEventItem;
  user?: {
    id: string;
    full_name: string;
    email: string;
    role_id?: string;
    phone?: string | null;
    department?: string | null;
    series?: string | null;
    student_id?: string | null;
  } | null;
  isRegistered?: boolean;
  isFull?: boolean;
  isClosed?: boolean;
}

export function EventRegistrationForm({
  event,
  user,
  isRegistered = false,
  isFull = false,
  isClosed = false,
}: EventRegistrationFormProps) {
  const { metadata } = unpackEventDescription(event.description);

  // Derive initial category from user's role or default to STUDENT/GUEST
  const defaultCategory: "STUDENT" | "ALUMNI" | "TEACHER" | "GUEST" =
    user?.role_id === "ALUMNI"
      ? "ALUMNI"
      : user?.role_id === "TEACHER"
      ? "TEACHER"
      : user
      ? "STUDENT"
      : "STUDENT";

  const [category, setCategory] = React.useState<"STUDENT" | "ALUMNI" | "TEACHER" | "GUEST">(defaultCategory);
  const [guestCount, setGuestCount] = React.useState(0);
  const [fullName, setFullName] = React.useState(user?.full_name || "");
  const [department, setDepartment] = React.useState(user?.department || "");
  const [series, setSeries] = React.useState(user?.series || "");
  const [studentId, setStudentId] = React.useState(user?.student_id || "");
  const [showRegisteredPass, setShowRegisteredPass] = React.useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = React.useState("");
  const [appliedCouponCode, setAppliedCouponCode] = React.useState<string | undefined>(undefined);
  const [couponFeedback, setCouponFeedback] = React.useState<{ success?: boolean; message?: string } | null>(null);

  const [state, formAction, isPending] = useActionState<EventRegistrationResult | null, FormData>(
    submitEventRegistrationAction,
    null
  );

  // Dynamic fee calculation
  const feeCalculation = calculateEventRegistrationFee({
    baseFee: event.fee_amount || 0,
    tieredPricingEnabled: metadata.tieredPricingEnabled !== false,
    categoryFees: metadata.categoryFees,
    category,
    guestCount,
    couponCode: appliedCouponCode,
    coupons: metadata.coupons,
  });

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      setCouponFeedback({ success: false, message: "Please enter a coupon code." });
      return;
    }

    const testCalc = calculateEventRegistrationFee({
      baseFee: event.fee_amount || 0,
      tieredPricingEnabled: metadata.tieredPricingEnabled !== false,
      categoryFees: metadata.categoryFees,
      category,
      guestCount,
      couponCode: couponInput.trim(),
      coupons: metadata.coupons,
    });

    if (testCalc.appliedCoupon) {
      setAppliedCouponCode(testCalc.appliedCoupon.code);
      const discountText =
        testCalc.appliedCoupon.discountType === "PERCENT"
          ? `${testCalc.appliedCoupon.discountValue}% OFF`
          : `${testCalc.appliedCoupon.discountValue} BDT OFF`;
      setCouponFeedback({
        success: true,
        message: `Coupon "${testCalc.appliedCoupon.code}" applied! (${discountText})`,
      });
    } else {
      setAppliedCouponCode(undefined);
      setCouponFeedback({ success: false, message: testCalc.error || "Invalid coupon code." });
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCouponCode(undefined);
    setCouponInput("");
    setCouponFeedback(null);
  };

  const categoryLabelMap = {
    STUDENT: "Current Student / Member",
    ALUMNI: "RUET Alumnus / Graduate",
    TEACHER: "Faculty / Teacher",
    GUEST: "Non-Member / General Guest",
  };

  // Success view: Render the high-fidelity Event Pass matching user's photo
  if (state?.success && state.ticketCode) {
    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <Alert variant="success">
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription className="font-semibold text-xs">
            {state.message}
          </AlertDescription>
        </Alert>

        <EventPassCard
          event={{
            title: event.title,
            event_date: event.event_date,
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location,
            slug: event.slug,
          }}
          metadata={{
            tagline: metadata.tagline,
          }}
          registration={{
            ticketCode: state.ticketCode,
            fullName: fullName || user?.full_name || "Registered Attendee",
            category: categoryLabelMap[category],
            guestCount,
            department: department || user?.department || undefined,
            series: series || user?.series || undefined,
            studentId: studentId || user?.student_id || undefined,
          }}
        />
      </div>
    );
  }

  // If already registered before
  if (isRegistered) {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto" />
          <h4 className="text-base font-bold text-[#15803D]">
            You Are Registered For This Event!
          </h4>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Your seat has been reserved. You can view, save, or print your official admission pass below.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setShowRegisteredPass(!showRegisteredPass)}
              className="text-xs font-bold"
              leftIcon={<Ticket className="w-3.5 h-3.5" />}
            >
              {showRegisteredPass ? "Hide Pass" : "View Official Event Pass"}
            </Button>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <Link href="/dashboard">Member Dashboard</Link>
            </Button>
          </div>
        </div>

        {showRegisteredPass && (
          <div className="pt-2 animate-in fade-in zoom-in-95 duration-200">
            <EventPassCard
              event={{
                title: event.title,
                event_date: event.event_date,
                start_time: event.start_time,
                end_time: event.end_time,
                location: event.location,
                slug: event.slug,
              }}
              metadata={{
                tagline: metadata.tagline,
              }}
              registration={{
                ticketCode: `SDA-${event.slug.toUpperCase().slice(0, 8)}-${user?.id ? user.id.slice(0, 6).toUpperCase() : "PASS"}`,
                fullName: user?.full_name || "Registered Member",
                category: categoryLabelMap[category],
                department: user?.department || undefined,
                series: user?.series || undefined,
                studentId: user?.student_id || undefined,
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // If registrations are closed or capacity full
  if (isClosed) {
    return (
      <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-[#DC2626] mx-auto" />
        <h4 className="text-base font-bold text-[#0F172A]">
          Registration Deadline Concluded
        </h4>
        <p className="text-xs text-[#64748B]">
          Online seat reservations for this event closed on {event.registration_deadline ? formatDate(event.registration_deadline) : "the specified date"}.
        </p>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="p-6 rounded-2xl border border-[#E8E2D9] bg-white text-center space-y-2">
        <Users className="w-8 h-8 text-[#DC2626] mx-auto" />
        <h4 className="text-base font-bold text-[#0F172A]">
          All Seats Are Fully Booked
        </h4>
        <p className="text-xs text-[#64748B]">
          This event has reached its maximum auditorium capacity ({event.max_participants} seats). Stay tuned for future editions!
        </p>
      </div>
    );
  }

  const maxGuestsAllowed = metadata.maxGuests || 3;
  const guestOptions = Array.from({ length: maxGuestsAllowed + 1 }, (_, i) => ({
    value: i.toString(),
    label: i === 0 ? "0 (Single Admission)" : `+${i} ${i === 1 ? "Guest" : "Guests"}`,
  }));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId" value={event.id} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="couponCode" value={appliedCouponCode || ""} />

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-xs">{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Attendee Category Selection */}
      <div className="bg-[#FAF5F5] border border-[#DFCEB5] rounded-xl p-3.5 space-y-2">
        <Label htmlFor="reg-category" className="text-xs font-bold text-[#0F172A]">
          Select Attendee Category
        </Label>
        <Select
          id="reg-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          <option value="STUDENT">Current RUET Student / Member ({metadata.categoryFees?.student ?? event.fee_amount} BDT)</option>
          <option value="ALUMNI">RUET Alumnus / Graduate ({metadata.categoryFees?.alumni ?? event.fee_amount} BDT)</option>
          <option value="TEACHER">Faculty / Teacher ({metadata.categoryFees?.teacher ?? event.fee_amount} BDT)</option>
          <option value="GUEST">General Guest / Non-Member ({metadata.categoryFees?.guest ?? event.fee_amount} BDT)</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reg-fullName" required>Full Name</Label>
          <Input
            id="reg-fullName"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Md. Yeasir Arafat"
            required
            error={state?.fieldErrors?.fullName?.[0]}
          />
        </div>

        <div>
          <Label htmlFor="reg-email" required>Email Address</Label>
          <Input
            id="reg-email"
            name="email"
            type="email"
            defaultValue={user?.email || ""}
            placeholder="you@example.com"
            required
            error={state?.fieldErrors?.email?.[0]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reg-phone" required>Mobile / WhatsApp Number</Label>
          <Input
            id="reg-phone"
            name="phone"
            type="tel"
            defaultValue={user?.phone || ""}
            placeholder="017XXXXXXXX"
            required
            error={state?.fieldErrors?.phone?.[0]}
          />
        </div>

        {metadata.allowGuests !== false ? (
          <div>
            <Label htmlFor="reg-guests">Accompanying Guests</Label>
            <Select
              id="reg-guests"
              name="guestCount"
              value={guestCount.toString()}
              onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
            >
              {guestOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <input type="hidden" name="guestCount" value="0" />
        )}
      </div>

      {metadata.askDeptSeries !== false && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reg-dept">Academic Department / Organization</Label>
            <Input
              id="reg-dept"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science &amp; Engineering"
            />
          </div>

          <div>
            <Label htmlFor="reg-series">RUET Series / Batch</Label>
            <Input
              id="reg-series"
              name="series"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              placeholder="e.g. 19, 20, 21"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metadata.askStudentId !== false && (
          <div>
            <Label htmlFor="reg-studentId">Student / Roll ID</Label>
            <Input
              id="reg-studentId"
              name="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 1903001"
            />
          </div>
        )}

        {metadata.askTshirt !== false && (
          <div>
            <Label htmlFor="reg-tshirt">T-Shirt Size Preference</Label>
            <Select id="reg-tshirt" name="tshirtSize" defaultValue="L">
              <option value="M">Medium (M - 38)</option>
              <option value="L">Large (L - 40)</option>
              <option value="XL">Extra Large (XL - 42)</option>
              <option value="XXL">Double Extra Large (XXL - 44)</option>
            </Select>
          </div>
        )}
      </div>

      {metadata.askDietary !== false && (
        <div>
          <Label htmlFor="reg-dietary">Dietary Meal Preference</Label>
          <Select id="reg-dietary" name="dietaryPreference" defaultValue="REGULAR">
            <option value="REGULAR">Standard Feast &amp; Buffet</option>
            <option value="VEGETARIAN">Vegetarian Meal</option>
          </Select>
        </div>
      )}

      {/* Coupon Code Section */}
      <div className="bg-white border border-[#E8E2D9] rounded-xl p-3.5 space-y-2">
        <Label htmlFor="couponCode" className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#7B2D26]" />
          Have a Discount / Promo Coupon?
        </Label>
        <div className="flex gap-2">
          <Input
            id="couponCode"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="e.g. SDA2026, EARLYBIRD"
            className="text-xs uppercase font-mono"
            disabled={!!appliedCouponCode}
          />
          {appliedCouponCode ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRemoveCoupon}
              className="text-xs border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleApplyCoupon}
              className="text-xs font-semibold"
            >
              Apply
            </Button>
          )}
        </div>

        {couponFeedback && (
          <p
            className={`text-[11px] font-semibold flex items-center gap-1 ${
              couponFeedback.success ? "text-[#15803D]" : "text-[#DC2626]"
            }`}
          >
            {couponFeedback.success ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {couponFeedback.message}
          </p>
        )}
      </div>

      {/* Payment / Admission Fee Section If Applicable */}
      {feeCalculation.totalFee > 0 || feeCalculation.subtotal > 0 ? (
        <div className="bg-[#FAF5F5] border border-[#DFCEB5] rounded-xl p-4 space-y-3">
          <div className="space-y-1 text-xs border-b border-[#E8E2D9] pb-2">
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Category Rate ({categoryLabelMap[category]}):</span>
              <span className="font-semibold text-[#0F172A]">{feeCalculation.unitFee} BDT / person</span>
            </div>
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Total Headcount ({1 + guestCount} {1 + guestCount === 1 ? "seat" : "seats"}):</span>
              <span className="font-semibold text-[#0F172A]">{feeCalculation.subtotal} BDT</span>
            </div>
            {feeCalculation.discountAmount > 0 && (
              <div className="flex items-center justify-between text-[#15803D] font-semibold">
                <span>Coupon Discount ({appliedCouponCode}):</span>
                <span>-{feeCalculation.discountAmount} BDT</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm pt-1">
              <span className="font-bold text-[#0F172A]">Net Payable Amount:</span>
              <span className="font-extrabold text-[#7B2D26] text-base font-heading">
                {feeCalculation.totalFee} BDT
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B] whitespace-pre-line leading-relaxed">
            {metadata.paymentInstructions ||
              `Please send ${feeCalculation.totalFee} BDT via bKash / Nagad / Rocket to Association Number: 01712-345678 and enter your transaction ID below.`}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <Label htmlFor="reg-paymentMethod">Payment Method</Label>
              <Select id="reg-paymentMethod" name="paymentMethod" defaultValue="BKASH">
                <option value="BKASH">bKash (01712-345678)</option>
                <option value="NAGAD">Nagad (01712-345678)</option>
                <option value="ROCKET">Rocket (01712-345678)</option>
                <option value="CASH">Cash on Arrival (Desk)</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="reg-txId" required={metadata.requireTransactionId}>
                Transaction ID {metadata.requireTransactionId ? "*" : "(Optional)"}
              </Label>
              <Input
                id="reg-txId"
                name="transactionId"
                required={metadata.requireTransactionId}
                placeholder="e.g. 9J8A7B6C5D"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <Label htmlFor="reg-notes">Special Requests or Inquiries (Optional)</Label>
        <Textarea
          id="reg-notes"
          name="notes"
          rows={2}
          placeholder="Any special dietary accommodations or notes for organizers..."
          className="text-xs"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full font-bold text-sm py-3 h-auto"
          leftIcon={<Ticket className="w-4 h-4" />}
        >
          {isPending
            ? "Reserving Your Seat..."
            : feeCalculation.totalFee > 0
            ? `Confirm & Register (${feeCalculation.totalFee} BDT)`
            : "Complete Free Seat Registration"}
        </Button>
      </div>
    </form>
  );
}
