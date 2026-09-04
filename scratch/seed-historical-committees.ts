import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";

if (typeof (globalThis as any).WebSocket === "undefined") {
  (globalThis as any).WebSocket = class MockWebSocket {};
}

const envContent = fs.readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCommittees() {
  const { data: committees } = await supabase.from("committees").select("*, members:committee_members(*)");
  console.log("Existing committees count:", committees?.length);
  committees?.forEach(c => {
    console.log(`- ${c.term_name} (${c.start_date} to ${c.end_date || "Present"}, is_current: ${c.is_current}): ${c.members?.length || 0} members`);
  });

  console.log("Seeding multiple historical committee terms (2024-2025, 2023-2024)...");
  // 1. Term 2024-2025
  const { data: term24 } = await supabase.from("committees").upsert({
    term_name: "Executive Committee 2024–2025",
    start_date: "2024-07-01",
    end_date: "2025-06-30",
    is_current: false,
    description: "Steered the 2024 Annual Reunion and modernized the digital student welfare fund.",
  }, { onConflict: "term_name" }).select().single();

    if (term24) {
      await supabase.from("committee_members").upsert([
        {
          committee_id: term24.id,
          position_id: "president",
          name: "Engr. Tariqul Islam",
          department: "Civil Engineering",
          series: "18",
          session: "2018-2019",
          display_order: 1,
          bio: "Served as President with focus on cross-departmental fellowship and student welfare.",
        },
        {
          committee_id: term24.id,
          position_id: "general_secretary",
          name: "Md. Mehedi Hasan",
          department: "Mechanical Engineering",
          series: "18",
          session: "2018-2019",
          display_order: 2,
          bio: "General Secretary directing general meetings, annual reunions, and welfare activities.",
        },
        {
          committee_id: term24.id,
          position_id: "treasurer",
          name: "Sabbir Hossain",
          department: "Electrical & Electronic Engineering",
          series: "19",
          session: "2019-2020",
          display_order: 3,
        },
        {
          committee_id: term24.id,
          position_id: "organizing_secretary",
          name: "Al-Amin Sheikh",
          department: "Computer Science & Engineering",
          series: "19",
          session: "2019-2020",
          display_order: 4,
        },
      ]);
    }

    // 2. Term 2023-2024
    const { data: term23 } = await supabase.from("committees").upsert({
      term_name: "Executive Committee 2023–2024",
      start_date: "2023-07-01",
      end_date: "2024-06-30",
      is_current: false,
      description: "Founded the SDA RUET Central Book Bank and established the Sirajganj Alumni Network.",
    }, { onConflict: "term_name" }).select().single();

    if (term23) {
      await supabase.from("committee_members").upsert([
        {
          committee_id: term23.id,
          position_id: "president",
          name: "Engr. Asif Mahmud",
          department: "Electrical & Electronic Engineering",
          series: "17",
          session: "2017-2018",
          display_order: 1,
          bio: "Championed the initial digitization of the association archives.",
        },
        {
          committee_id: term23.id,
          position_id: "general_secretary",
          name: "Farhan Labib",
          department: "Civil Engineering",
          series: "17",
          session: "2017-2018",
          display_order: 2,
        },
      ]);
    }
  }

checkCommittees();
