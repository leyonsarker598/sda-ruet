/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";

export interface AdminDonationItem {
  id: string;
  fund_id: string;
  profile_id?: string | null;
  donor_name: string;
  donor_email: string;
  donor_phone?: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id?: string | null;
  payment_reference?: string | null;
  status: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED" | "REFUNDED" | "FAILED" | "CANCELLED";
  is_anonymous: boolean;
  message?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  fund?: {
    id: string;
    name: string;
  };
  verifier?: {
    full_name: string;
  };
}

export interface DonationFundItem {
  id: string;
  name: string;
  description?: string | null;
  target_amount?: number | null;
  raised_amount: number;
  is_active: boolean;
}

export interface AdminDonationStats {
  totalRaisedBDT: number;
  totalDonationsCount: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export async function getPendingDonationCount(): Promise<number> {
  try {
    const supabase = await getServiceOrServerClient();
    const { count, error } = await (supabase as any)
      .from("donations")
      .select("*", { count: "exact", head: true })
      .in("status", ["PENDING", "SUBMITTED"]);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

export async function getDonationStats(): Promise<AdminDonationStats> {
  try {
    const supabase = await getServiceOrServerClient();
    const { data: donations } = await (supabase as any)
      .from("donations")
      .select("amount, status");

    if (!donations) {
      return {
        totalRaisedBDT: 0,
        totalDonationsCount: 0,
        verifiedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
      };
    }

    let totalRaisedBDT = 0;
    let verifiedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    donations.forEach((d: any) => {
      if (d.status === "VERIFIED") {
        totalRaisedBDT += Number(d.amount) || 0;
        verifiedCount++;
      } else if (d.status === "PENDING" || d.status === "SUBMITTED") {
        pendingCount++;
      } else if (d.status === "REJECTED" || d.status === "FAILED" || d.status === "CANCELLED") {
        rejectedCount++;
      }
    });

    return {
      totalRaisedBDT,
      totalDonationsCount: donations.length,
      verifiedCount,
      pendingCount,
      rejectedCount,
    };
  } catch {
    return {
      totalRaisedBDT: 0,
      totalDonationsCount: 0,
      verifiedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
    };
  }
}

export async function getAdminDonations(params?: {
  status?: string;
  fundId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ donations: AdminDonationItem[]; count: number }> {
  try {
    const supabase = await getServiceOrServerClient();
    let query = (supabase as any)
      .from("donations")
      .select("*, fund:donation_funds!fund_id(id, name), verifier:profiles!verified_by(full_name)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (params?.status && params.status !== "ALL") {
      if (params.status === "PENDING") {
        query = query.in("status", ["PENDING", "SUBMITTED"]);
      } else {
        query = query.eq("status", params.status);
      }
    }

    if (params?.fundId && params.fundId !== "ALL") {
      query = query.eq("fund_id", params.fundId);
    }

    if (params?.search) {
      const s = params.search.trim();
      query = query.or(`donor_name.ilike.%${s}%,donor_email.ilike.%${s}%,transaction_id.ilike.%${s}%`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, count, error } = await query;
    if (error) return { donations: [], count: 0 };
    return { donations: data || [], count: count || (data || []).length };
  } catch {
    return { donations: [], count: 0 };
  }
}

export async function verifyDonation(
  adminId: string,
  donationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();

    // 1. Fetch donation details
    const { data: donation, error: fetchError } = await (supabase as any)
      .from("donations")
      .select("id, fund_id, amount, status")
      .eq("id", donationId)
      .single();

    if (fetchError || !donation) {
      return { success: false, error: "Donation record not found." };
    }

    if (donation.status === "VERIFIED") {
      return { success: false, error: "This donation has already been verified." };
    }

    const now = new Date().toISOString();

    // 2. Update donation status to VERIFIED
    const { error: updateError } = await (supabase as any)
      .from("donations")
      .update({
        status: "VERIFIED",
        verified_by: adminId,
        verified_at: now,
      })
      .eq("id", donationId);

    if (updateError) return { success: false, error: updateError.message };

    // 3. Increment raised_amount on the fund
    const { data: fund } = await (supabase as any)
      .from("donation_funds")
      .select("id, raised_amount")
      .eq("id", donation.fund_id)
      .single();

    if (fund) {
      await (supabase as any)
        .from("donation_funds")
        .update({
          raised_amount: (Number(fund.raised_amount) || 0) + Number(donation.amount),
        })
        .eq("id", donation.fund_id);
    }

    // 4. Fetch donor info & dispatch notification + forensic audit log
    const { data: fullDonation } = await (supabase as any)
      .from("donations")
      .select("profile_id, donor_name, donor_email, amount, fund:donation_funds(name)")
      .eq("id", donationId)
      .single();

    if (fullDonation) {
      try {
        const { notifyDonationVerified } = await import("@/services/notificationService");
        const { logDonationVerified } = await import("@/services/auditLogService");
        const receiptNumber = `SDA-REC-${donationId.slice(0, 8).toUpperCase()}`;

        await notifyDonationVerified({
          userId: fullDonation.profile_id || undefined,
          donorName: fullDonation.donor_name,
          donorEmail: fullDonation.donor_email || undefined,
          amount: Number(fullDonation.amount),
          fundName: fullDonation.fund?.name || "General Welfare Fund",
          receiptNumber,
        });

        await logDonationVerified(
          adminId,
          donationId,
          Number(fullDonation.amount),
          fullDonation.donor_name,
          receiptNumber
        );
      } catch (notifErr) {
        console.warn("Donation notification/audit logging warning:", notifErr);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error verifying donation";
    return { success: false, error: msg };
  }
}

export async function rejectDonation(
  adminId: string,
  donationId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();
    const { error } = await (supabase as any)
      .from("donations")
      .update({
        status: "REJECTED",
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        payment_reference: reason ? `Rejected: ${reason}` : "Rejected by Administrator",
      })
      .eq("id", donationId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error rejecting donation";
    return { success: false, error: msg };
  }
}

export async function generateDonationsCSVReport(): Promise<string> {
  try {
    const { donations } = await getAdminDonations({ limit: 1000 });

    const headers = [
      "Donation ID",
      "Date",
      "Donor Name",
      "Donor Email",
      "Donor Phone",
      "Purpose / Fund",
      "Amount (BDT)",
      "Payment Method",
      "Transaction ID",
      "Anonymous",
      "Status",
      "Verified By",
    ];

    const rows = donations.map((d) => [
      `"${d.id}"`,
      `"${d.created_at.split("T")[0]}"`,
      `"${d.is_anonymous ? "Anonymous Donor (" + d.donor_name + ")" : d.donor_name}"`,
      `"${d.donor_email}"`,
      `"${d.donor_phone || ""}"`,
      `"${d.fund?.name || "General Welfare"}"`,
      d.amount,
      `"${d.payment_method}"`,
      `"${d.transaction_id || ""}"`,
      d.is_anonymous ? "YES" : "NO",
      `"${d.status}"`,
      `"${d.verifier?.full_name || ""}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  } catch {
    return "Date,Donor,Amount,Status\n";
  }
}

export async function trackDonationByTrxId(trxId: string): Promise<{
  found: boolean;
  status?: string;
  amount?: number;
  fundName?: string;
  donorName?: string;
  createdAt?: string;
}> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("donations")
      .select("amount, status, is_anonymous, donor_name, created_at, fund:donation_funds(name)")
      .eq("transaction_id", trxId.trim().toUpperCase())
      .single();

    if (error || !data) {
      return { found: false };
    }

    return {
      found: true,
      status: data.status,
      amount: Number(data.amount),
      fundName: data.fund?.name || "General Fund",
      donorName: data.is_anonymous ? "Anonymous Well-Wisher" : data.donor_name,
      createdAt: data.created_at,
    };
  } catch {
    return { found: false };
  }
}
