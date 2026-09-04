import { getServiceOrServerClient } from "../src/lib/supabase/admin";

async function check() {
  const supabase = await getServiceOrServerClient();
  const { data, error } = await (supabase as any).from("events").select("id, title, slug, fee_amount, created_at").order("created_at", { ascending: false }).limit(5);
  console.log("Error:", error);
  console.log("Recent Events:", data);
}

check();
