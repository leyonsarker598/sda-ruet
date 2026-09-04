import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";

export interface CommitteePositionItem {
  id: string;
  title: string;
  hierarchy_order: number;
}

export const DEFAULT_COMMITTEE_POSITIONS: CommitteePositionItem[] = [
  { id: "PRESIDENT", title: "President", hierarchy_order: 10 },
  { id: "VICE_PRESIDENT", title: "Vice President", hierarchy_order: 20 },
  { id: "GENERAL_SECRETARY", title: "General Secretary", hierarchy_order: 30 },
  { id: "JOINT_SECRETARY", title: "Joint Secretary", hierarchy_order: 40 },
  { id: "ORGANIZING_SECRETARY", title: "Organizing Secretary", hierarchy_order: 50 },
  { id: "TREASURER", title: "Treasurer", hierarchy_order: 60 },
  { id: "PUBLICITY_SECRETARY", title: "Publicity & Media Secretary", hierarchy_order: 70 },
  { id: "CULTURAL_SECRETARY", title: "Cultural Secretary", hierarchy_order: 80 },
  { id: "SPORTS_SECRETARY", title: "Sports Secretary", hierarchy_order: 90 },
  { id: "EXECUTIVE_MEMBER", title: "Executive Member", hierarchy_order: 100 },
  { id: "ADVISOR", title: "Senior Faculty Advisor", hierarchy_order: 5 },
];

export interface AdminCommitteeItem {
  id: string;
  term_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  banner_image_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  members_count?: number;
}

export interface AdminCommitteeMemberItem {
  id: string;
  committee_id: string;
  profile_id: string | null;
  position_id: string;
  custom_position_title: string | null;
  name: string;
  department: string | null;
  series: string | null;
  session: string | null;
  photo_url: string | null;
  bio: string | null;
  social_links: Record<string, string>;
  display_order: number;
  created_at: string;
  position?: CommitteePositionItem;
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

export async function getCommitteePositions(): Promise<CommitteePositionItem[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("committee_positions")
      .select("*")
      .order("hierarchy_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_COMMITTEE_POSITIONS;
    }
    return data;
  } catch {
    return DEFAULT_COMMITTEE_POSITIONS;
  }
}

export async function getAllCommittees(): Promise<AdminCommitteeItem[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: committees, error } = await (supabase as any)
      .from("committees")
      .select("*, members:committee_members(count)")
      .order("start_date", { ascending: false });

    if (error || !committees) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return committees.map((c: any) => ({
      ...c,
      members_count: c.members?.[0]?.count || 0,
    }));
  } catch {
    return [];
  }
}

export async function getCommitteeDetailById(
  id: string
): Promise<{ committee: AdminCommitteeItem; members: AdminCommitteeMemberItem[] } | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: committee, error } = await (supabase as any)
      .from("committees")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !committee) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: members } = await (supabase as any)
      .from("committee_members")
      .select("*, position:committee_positions(id, title, hierarchy_order), profile:profiles(id, full_name, email, phone, student_id, department, series, avatar_url, bio)")
      .eq("committee_id", id)
      .order("display_order", { ascending: true });

    const sortedMembers = (members || []).sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        (a.display_order ?? 100) - (b.display_order ?? 100)
    );

    return {
      committee,
      members: sortedMembers,
    };
  } catch {
    return null;
  }
}

export async function reorderCommitteeMembers(
  committeeId: string,
  orderedMemberIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();

    for (let i = 0; i < orderedMemberIds.length; i++) {
      const memberId = orderedMemberIds[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("committee_members")
        .update({ display_order: i + 1 })
        .eq("id", memberId)
        .eq("committee_id", committeeId);

      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error reordering committee members";
    return { success: false, error: msg };
  }
}

export async function createCommittee(data: {
  termName: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  bannerImageUrl?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // If marked as current, reset other current terms
    if (data.isCurrent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("committees")
        .update({ is_current: false })
        .eq("is_current", true);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error } = await (supabase as any)
      .from("committees")
      .insert({
        term_name: data.termName,
        start_date: data.startDate,
        end_date: data.endDate || null,
        is_current: data.isCurrent || false,
        description: data.description || null,
        banner_image_url: data.bannerImageUrl || null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: inserted?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating committee";
    return { success: false, error: msg };
  }
}

export async function updateCommittee(
  id: string,
  data: {
    termName: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    bannerImageUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    if (data.isCurrent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("committees")
        .update({ is_current: false })
        .neq("id", id)
        .eq("is_current", true);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("committees")
      .update({
        term_name: data.termName,
        start_date: data.startDate,
        end_date: data.endDate || null,
        is_current: data.isCurrent || false,
        description: data.description || null,
        banner_image_url: data.bannerImageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating committee";
    return { success: false, error: msg };
  }
}

export async function setCurrentCommittee(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 1. Reset all to false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("committees")
      .update({ is_current: false })
      .eq("is_current", true);

    // 2. Set this one to true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("committees")
      .update({ is_current: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error setting active committee";
    return { success: false, error: msg };
  }
}

export async function archiveCommittee(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("committees")
      .update({ is_current: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error archiving committee";
    return { success: false, error: msg };
  }
}

export async function deleteCommittee(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("committees")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting committee";
    return { success: false, error: msg };
  }
}

export async function addCommitteeMember(data: {
  committeeId: string;
  name: string;
  positionId: string;
  customPositionTitle?: string;
  profileId?: string;
  department?: string;
  series?: string;
  session?: string;
  photoUrl?: string;
  bio?: string;
  displayOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("committee_members").insert({
      committee_id: data.committeeId,
      name: data.name,
      position_id: data.positionId,
      custom_position_title: data.customPositionTitle || null,
      profile_id: data.profileId || null,
      department: data.department || null,
      series: data.series || null,
      session: data.session || null,
      photo_url: data.photoUrl || null,
      bio: data.bio || null,
      display_order: data.displayOrder || 0,
      social_links: {},
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error adding member";
    return { success: false, error: msg };
  }
}

export async function updateCommitteeMember(
  memberId: string,
  data: {
    name: string;
    positionId: string;
    customPositionTitle?: string;
    profileId?: string;
    department?: string;
    series?: string;
    session?: string;
    photoUrl?: string;
    bio?: string;
    displayOrder?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("committee_members")
      .update({
        name: data.name,
        position_id: data.positionId,
        custom_position_title: data.customPositionTitle || null,
        profile_id: data.profileId || null,
        department: data.department || null,
        series: data.series || null,
        session: data.session || null,
        photo_url: data.photoUrl || null,
        bio: data.bio || null,
        display_order: data.displayOrder || 0,
      })
      .eq("id", memberId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating member";
    return { success: false, error: msg };
  }
}

export async function removeCommitteeMember(memberId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("committee_members")
      .delete()
      .eq("id", memberId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error removing member";
    return { success: false, error: msg };
  }
}

export * from "@/lib/csvHelpers";
import {
  normalizePositionToId,
  type CommitteeCSVRow,
} from "@/lib/csvHelpers";

/**
 * Batch import committee members into a committee term
 */
export async function batchImportCommitteeMembers(
  adminId: string,
  committeeId: string,
  members: CommitteeCSVRow[],
  replaceExisting: boolean = true
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();

    // Verify committee exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: committee, error: commError } = await (supabase as any)
      .from("committees")
      .select("id, term_name")
      .eq("id", committeeId)
      .single();

    if (commError || !committee) {
      return { success: false, count: 0, error: "Target committee term not found." };
    }

    if (replaceExisting) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("committee_members")
        .delete()
        .eq("committee_id", committeeId);
    }

    const memberInserts = members.map((m, idx) => {
      const positionId = normalizePositionToId(m.designation);
      return {
        committee_id: committeeId,
        name: m.name,
        position_id: positionId,
        custom_position_title: m.designation,
        department: m.department || null,
        series: m.series || null,
        session: m.session || null,
        photo_url: m.photoUrl || null,
        bio: m.bio || null,
        display_order: m.displayOrder || idx + 1,
        social_links: {},
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from("committee_members")
      .insert(memberInserts);

    if (insertError) {
      return { success: false, count: 0, error: insertError.message };
    }

    return { success: true, count: memberInserts.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Batch import failed";
    return { success: false, count: 0, error: msg };
  }
}
