import { createClient } from "@/lib/supabase/server";

export interface DonationFundItem {
  id: string;
  name: string;
  description: string | null;
  target_amount: number | null;
  raised_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface PublicDonationItem {
  id: string;
  fund_id: string;
  donor_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  created_at: string;
  message: string | null;
  fund?: {
    name: string;
  };
}

export async function getActiveDonationFunds(): Promise<DonationFundItem[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("donation_funds")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getRecentPublicDonations(limit = 10): Promise<PublicDonationItem[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("donations")
      .select("id, fund_id, donor_name, amount, currency, payment_method, is_anonymous, created_at, message, fund:donation_funds(name)")
      .eq("status", "VERIFIED")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];

    // Mask anonymous donors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((d: any) => ({
      id: d.id,
      fund_id: d.fund_id,
      donor_name: d.is_anonymous ? "Anonymous Donor" : d.donor_name,
      amount: d.amount,
      currency: d.currency,
      payment_method: d.payment_method,
      created_at: d.created_at,
      message: d.message,
      fund: d.fund,
    }));
  } catch {
    return [];
  }
}
