export interface EventCategoryFees {
  student?: number;
  alumni?: number;
  teacher?: number;
  guest?: number;
}

export interface EventCoupon {
  code: string;
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
}

export interface EventCmsMetadata {
  tagline?: string;
  guidelines?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentInstructions?: string;
  allowGuests?: boolean;
  maxGuests?: number;
  askTshirt?: boolean;
  askDietary?: boolean;
  askStudentId?: boolean;
  askDeptSeries?: boolean;
  requireTransactionId?: boolean;
  tieredPricingEnabled?: boolean;
  categoryFees?: EventCategoryFees;
  coupons?: EventCoupon[];
}

export const DEFAULT_EVENT_METADATA: EventCmsMetadata = {
  tagline: "A day to reconnect, remember, and celebrate",
  guidelines:
    "• Please present your Digital Admission Pass or Pass Reference Code at the reception desk.\n• Student attendees should carry their RUET Student ID card or roll verification.\n• Feast & dinner tokens will be provided upon entry verification.",
  contactName: "Executive Committee, SDA RUET",
  contactPhone: "+880 1712-345678",
  contactEmail: "events@sda-ruet.org",
  paymentInstructions:
    "Please send the required admission fee via bKash / Nagad / Rocket to Association Number: 01712-345678 (Send Money / Payment) and enter your transaction ID below.",
  allowGuests: true,
  maxGuests: 3,
  askTshirt: true,
  askDietary: true,
  askStudentId: true,
  askDeptSeries: true,
  requireTransactionId: false,
  tieredPricingEnabled: false,
  categoryFees: {
    student: 0,
    alumni: 0,
    teacher: 0,
    guest: 0,
  },
  coupons: [
    { code: "SDA2026", discountType: "PERCENT", discountValue: 10 },
    { code: "EARLYBIRD", discountType: "FIXED", discountValue: 50 },
  ],
};

export function packEventDescription(programDetails: string, meta: Partial<EventCmsMetadata>): string {
  const merged = { ...DEFAULT_EVENT_METADATA, ...meta };
  const metaJson = JSON.stringify(merged);
  return `${programDetails.trim()}\n\n<!-- EVENT_CMS_METADATA:${metaJson} -->`;
}

export function unpackEventDescription(rawDescription: string): {
  programDetails: string;
  metadata: EventCmsMetadata;
} {
  if (!rawDescription) {
    return {
      programDetails: "",
      metadata: DEFAULT_EVENT_METADATA,
    };
  }

  const match = rawDescription.match(/<!-- EVENT_CMS_METADATA:([\s\S]+?) -->/);
  if (!match) {
    return {
      programDetails: rawDescription,
      metadata: DEFAULT_EVENT_METADATA,
    };
  }

  const programDetails = rawDescription.replace(/<!-- EVENT_CMS_METADATA:[\s\S]+? -->/, "").trim();
  try {
    const parsed = JSON.parse(match[1]);
    return {
      programDetails,
      metadata: {
        ...DEFAULT_EVENT_METADATA,
        ...parsed,
        categoryFees: {
          ...DEFAULT_EVENT_METADATA.categoryFees,
          ...(parsed.categoryFees || {}),
        },
        coupons: parsed.coupons || DEFAULT_EVENT_METADATA.coupons,
      },
    };
  } catch {
    return {
      programDetails,
      metadata: DEFAULT_EVENT_METADATA,
    };
  }
}

/**
 * Calculates event fee based on category, guest count, and optional coupon
 */
export function calculateEventRegistrationFee(params: {
  baseFee: number;
  tieredPricingEnabled?: boolean;
  categoryFees?: EventCategoryFees;
  category: "STUDENT" | "ALUMNI" | "TEACHER" | "GUEST";
  guestCount: number;
  couponCode?: string;
  coupons?: EventCoupon[];
}): {
  unitFee: number;
  subtotal: number;
  discountAmount: number;
  totalFee: number;
  appliedCoupon?: EventCoupon;
  error?: string;
} {
  const {
    baseFee,
    tieredPricingEnabled,
    categoryFees,
    category,
    guestCount,
    couponCode,
    coupons = [],
  } = params;

  let unitFee = baseFee;
  if (tieredPricingEnabled && categoryFees) {
    if (category === "STUDENT" && categoryFees.student !== undefined) unitFee = categoryFees.student;
    else if (category === "ALUMNI" && categoryFees.alumni !== undefined) unitFee = categoryFees.alumni;
    else if (category === "TEACHER" && categoryFees.teacher !== undefined) unitFee = categoryFees.teacher;
    else if (category === "GUEST" && categoryFees.guest !== undefined) unitFee = categoryFees.guest;
  }

  const totalSeats = 1 + (guestCount || 0);
  const subtotal = unitFee * totalSeats;

  let discountAmount = 0;
  let appliedCoupon: EventCoupon | undefined;
  let error: string | undefined;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (found) {
      appliedCoupon = found;
      if (found.discountType === "PERCENT") {
        discountAmount = Math.round((subtotal * found.discountValue) / 100);
      } else {
        discountAmount = found.discountValue;
      }
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    } else {
      error = "Invalid or expired coupon code.";
    }
  }

  const totalFee = Math.max(0, subtotal - discountAmount);

  return {
    unitFee,
    subtotal,
    discountAmount,
    totalFee,
    appliedCoupon,
    error,
  };
}
