import * as fs from "node:fs";
import * as path from "node:path";
import { createAdminClient } from "../src/lib/supabase/admin";

// Load .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...vals] = trimmed.split("=");
        if (key && vals.length > 0) {
          process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
} catch {}

async function checkOrApplyColumns() {
  const admin = createAdminClient();
  // Check if events table has the new columns by doing a select query
  const { data, error } = await (admin as any)
    .from("events")
    .select("id, tagline, guidelines, contact_phone, payment_instructions, allow_guests, max_guests, ask_tshirt, ask_dietary, ask_student_id, ask_dept_series, require_transaction_id")
    .limit(1);

  if (error) {
    console.log("Columns not present in DB or error:", error.message);
  } else {
    console.log("✓ Columns exist and are accessible in Supabase events table!");
  }
}

checkOrApplyColumns().catch(console.error);
