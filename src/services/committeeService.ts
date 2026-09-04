import { createClient } from "@/lib/supabase/server";

export interface CommitteeMemberItem {
  id: string;
  committee_id?: string;
  profile_id: string | null;
  name: string;
  department: string | null;
  series: string | null;
  session: string | null;
  photo_url: string | null;
  bio: string | null;
  social_links: Record<string, string>;
  display_order: number;
  position_id: string;
  custom_position_title: string | null;
  position?: {
    id: string;
    title: string;
    hierarchy_order: number;
  };
  profile?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    student_id: string | null;
    department: string | null;
    series: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
}

export interface CommitteeTermItem {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  banner_image_url: string | null;
  description: string | null;
  members?: CommitteeMemberItem[];
}

export async function getCurrentCommittee(): Promise<CommitteeTermItem | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: term, error: termError } = await (supabase as any)
      .from("committees")
      .select("*, members:committee_members(*, position:committee_positions(id, title, hierarchy_order), profile:profiles(id, full_name, email, phone, student_id, department, series, avatar_url, bio))")
      .eq("is_current", true)
      .single();

    if (termError || !term) return null;

    if (term.members) {
      term.members.sort(
        (a: { display_order: number; position?: { hierarchy_order: number } }, b: { display_order: number; position?: { hierarchy_order: number } }) =>
          (a.display_order ?? 100) - (b.display_order ?? 100) ||
          ((a.position?.hierarchy_order ?? 100) - (b.position?.hierarchy_order ?? 100))
      );
    }

    return term as CommitteeTermItem;
  } catch {
    return null;
  }
}

export async function getPastCommitteeTerms(): Promise<CommitteeTermItem[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("committees")
      .select("*")
      .eq("is_current", false)
      .order("start_date", { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function getCommitteeTermById(id: string): Promise<CommitteeTermItem | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: term, error: termError } = await (supabase as any)
      .from("committees")
      .select("*")
      .eq("id", id)
      .single();

    if (termError || !term) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: members } = await (supabase as any)
      .from("committee_members")
      .select("*, position:committee_positions(id, title, hierarchy_order), profile:profiles(id, full_name, email, phone, student_id, department, series, avatar_url, bio)")
      .eq("committee_id", term.id)
      .order("display_order", { ascending: true });

    return {
      ...term,
      members: (members || []).sort(
        (a: { display_order: number }, b: { display_order: number }) =>
          (a.display_order ?? 100) - (b.display_order ?? 100)
      ),
    };
  } catch {
    return null;
  }
}

export async function getAllPastCommitteesWithMembers(): Promise<CommitteeTermItem[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: terms, error } = await (supabase as any)
      .from("committees")
      .select("*, members:committee_members(*, position:committee_positions(id, title, hierarchy_order), profile:profiles(id, full_name, email, phone, student_id, department, series, avatar_url, bio))")
      .order("start_date", { ascending: false });

    if (error || !terms) return [];

    // Sort members for each term strictly by display_order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return terms.map((term: any) => ({
      ...term,
      members: (term.members || []).sort(
        (a: { display_order: number; position?: { hierarchy_order: number } }, b: { display_order: number; position?: { hierarchy_order: number } }) =>
          (a.display_order ?? 100) - (b.display_order ?? 100) ||
          ((a.position?.hierarchy_order ?? 100) - (b.position?.hierarchy_order ?? 100))
      ),
    })) as CommitteeTermItem[];
  } catch {
    return [];
  }
}

export async function getMemberCommitteeDesignation(profileId: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    // 1. Check current active executive committee first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentMember } = await (supabase as any)
      .from("committee_members")
      .select("custom_position_title, position:committee_positions(title), committee:committees!inner(term_name, is_current)")
      .eq("profile_id", profileId)
      .eq("committee.is_current", true)
      .maybeSingle();

    if (currentMember) {
      return currentMember.custom_position_title || currentMember.position?.title || "Executive Member";
    }

    // 2. Check any previous executive committee
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pastMember } = await (supabase as any)
      .from("committee_members")
      .select("custom_position_title, position:committee_positions(title), committee:committees!inner(term_name, start_date)")
      .eq("profile_id", profileId)
      .order("committee(start_date)", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pastMember) {
      const pos = pastMember.custom_position_title || pastMember.position?.title || "Former Executive Member";
      return pastMember.committee?.term_name ? `${pos} (${pastMember.committee.term_name})` : pos;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getAlumniAssociationDesignation(profileId: string): Promise<string> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pastMember } = await (supabase as any)
      .from("committee_members")
      .select("custom_position_title, position:committee_positions(title), committee:committees!inner(term_name, start_date)")
      .eq("profile_id", profileId)
      .order("committee(start_date)", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pastMember) {
      const pos = pastMember.custom_position_title || pastMember.position?.title;
      if (pos) {
        return `Ex-${pos}`;
      }
    }
    return "Alumni";
  } catch {
    return "Alumni";
  }
}



