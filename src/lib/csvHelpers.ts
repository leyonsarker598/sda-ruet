export interface CommitteeCSVRow {
  name: string;
  designation: string;
  department?: string;
  series?: string;
  session?: string;
  photoUrl?: string;
  bio?: string;
  displayOrder?: number;
}

/**
 * Normalizes user-entered designation string to canonical database position ID
 */
export function normalizePositionToId(designation: string): string {
  const norm = designation.trim().toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
  
  if (norm.includes("vice") && norm.includes("presid")) return "vice_president";
  if (norm.includes("presid")) return "president";
  if (norm.includes("joint") && norm.includes("sec")) return "joint_secretary";
  if (norm.includes("gen") && norm.includes("sec")) return "general_secretary";
  if (norm.includes("org") && norm.includes("sec")) return "organizing_secretary";
  if (norm.includes("treasur") || norm.includes("finance") || norm.includes("cash") || norm.includes("audit")) return "treasurer";
  if (norm.includes("off") && norm.includes("sec")) return "office_secretary";
  if (norm.includes("it") || norm.includes("ict") || norm.includes("media") || norm.includes("pub")) return "publicity_secretary";
  if (norm.includes("cultur")) return "cultural_secretary";
  if (norm.includes("sport") || norm.includes("game")) return "sports_secretary";
  if (norm.includes("lib")) return "library_secretary";
  if (norm.includes("advis")) return "executive_member";
  
  return "executive_member";
}

/**
 * Parses raw CSV or TSV string into structured committee member objects
 */
export function parseCommitteeCSV(csvText: string): {
  rows: CommitteeCSVRow[];
  errors: string[];
} {
  const errors: string[] = [];
  const rows: CommitteeCSVRow[] = [];

  if (!csvText || !csvText.trim()) {
    return { rows: [], errors: ["CSV content is empty."] };
  }

  // Split lines accounting for Windows/Mac/Linux linebreaks
  const lines = csvText.split(/\r\n|\n|\r/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { rows: [], errors: ["CSV must contain a header row and at least one member record."] };
  }

  // Parse CSV line taking quotes into account
  const parseLine = (line: string): string[] => {
    const delimiter = line.includes("\t") && !line.includes(",") ? "\t" : ",";
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headerTokens = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  
  const nameIdx = headerTokens.findIndex((h) =>
    ["name", "fullname", "membername", "studentname", "member"].includes(h)
  );
  const desigIdx = headerTokens.findIndex((h) =>
    ["designation", "position", "positiontitle", "title", "role", "post"].includes(h)
  );
  const deptIdx = headerTokens.findIndex((h) =>
    ["department", "dept", "discipline"].includes(h)
  );
  const seriesIdx = headerTokens.findIndex((h) =>
    ["series", "batch", "hscbatch"].includes(h)
  );
  const sessionIdx = headerTokens.findIndex((h) =>
    ["session", "academicsession", "year"].includes(h)
  );
  const photoIdx = headerTokens.findIndex((h) =>
    ["photourl", "photo", "image", "imageurl", "avatar", "avatarurl"].includes(h)
  );
  const bioIdx = headerTokens.findIndex((h) =>
    ["bio", "notes", "quote", "about", "description"].includes(h)
  );
  const orderIdx = headerTokens.findIndex((h) =>
    ["displayorder", "order", "serial", "sl", "index", "priority"].includes(h)
  );

  if (nameIdx === -1) {
    errors.push("Missing required 'Full Name' column in CSV header.");
    return { rows: [], errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const name = cols[nameIdx]?.trim();
    if (!name) continue;

    const rawDesig = desigIdx !== -1 ? cols[desigIdx]?.trim() || "Executive Member" : "Executive Member";
    const department = deptIdx !== -1 ? cols[deptIdx]?.trim() || undefined : undefined;
    const series = seriesIdx !== -1 ? cols[seriesIdx]?.trim() || undefined : undefined;
    const session = sessionIdx !== -1 ? cols[sessionIdx]?.trim() || undefined : undefined;
    const photoUrl = photoIdx !== -1 ? cols[photoIdx]?.trim() || undefined : undefined;
    const bio = bioIdx !== -1 ? cols[bioIdx]?.trim() || undefined : undefined;
    
    let displayOrder = i;
    if (orderIdx !== -1 && cols[orderIdx]) {
      const parsed = parseInt(cols[orderIdx], 10);
      if (!isNaN(parsed)) displayOrder = parsed;
    }

    rows.push({
      name,
      designation: rawDesig,
      department,
      series,
      session,
      photoUrl,
      bio,
      displayOrder,
    });
  }

  return { rows, errors };
}

/**
 * Generates sample CSV template for administrative committee bulk imports
 */
export function generateSampleCommitteeCSV(): string {
  return `Full Name,Designation,Department,Series,Session,Photo URL,Bio,Display Order
Engr. Mahfuzur Rahman,President,Computer Science & Engineering,18,2018-2019,,Serving as President for the executive session,1
Md. Shahadat Hossain,General Secretary,Electrical & Electronic Engineering,18,2018-2019,,Directing general executive affairs and student welfare,2
Tanvir Hasan,Vice President,Civil Engineering,18,2018-2019,,Vice President heading academic and campus relations,3
Naimur Rashid,Joint Secretary,Mechanical Engineering,19,2019-2020,,Coordinating intra-departmental activities,4
Sabbir Ahmed,Treasurer,Computer Science & Engineering,19,2019-2020,,Managing association accounts and student welfare ledger,5
Rifat Hossain,Organizing Secretary,Civil Engineering,19,2019-2020,,Organizing annual reunions and freshers orientation,6
Al-Amin Sheikh,Publicity & Media Secretary,Electrical & Electronic Engineering,20,2020-2021,,Managing official association media and broadcasts,7
Farhan Labib,Executive Member,Chemical Engineering,21,2021-2022,,Active executive committee council member,8`;
}
