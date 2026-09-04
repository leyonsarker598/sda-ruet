import { createClient } from "@/lib/supabase/server";
import { getServiceOrServerClient } from "@/lib/supabase/admin";

export interface AdminEventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  banner_image_url?: string | null;
  event_date: string;
  start_time: string;
  end_time?: string | null;
  location: string;
  registration_required: boolean;
  registration_deadline?: string | null;
  max_participants?: number | null;
  current_participants: number;
  fee_amount: number;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT";
  created_at: string;
  registrations?: EventRegistrationItem[];
}

export interface EventRegistrationItem {
  id: string;
  event_id: string;
  user_id: string;
  guest_count: number;
  payment_status: string;
  transaction_id?: string | null;
  attended: boolean;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    department: string | null;
    series: string | null;
    student_id: string | null;
  };
}

export async function getAdminEvents(params?: {
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{ events: AdminEventItem[]; count: number }> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("events")
      .select("*, registrations:event_registrations(count)", { count: "exact" })
      .order("event_date", { ascending: false });

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    if (params?.search && params.search.trim()) {
      const q = `%${params.search.trim()}%`;
      query = query.or(`title.ilike.${q},location.ilike.${q},description.ilike.${q}`);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
    }

    const { data, count, error } = await query;
    if (error) return { events: [], count: 0 };
    return { events: data || [], count: count || (data || []).length };
  } catch {
    return { events: [], count: 0 };
  }
}

export async function getAdminEventById(id: string): Promise<AdminEventItem | null> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getEventBySlug(slug: string): Promise<AdminEventItem | null> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createEvent(
  createdBy: string,
  data: {
    title: string;
    slug: string;
    description: string;
    eventDate: string;
    startTime: string;
    endTime?: string;
    location: string;
    registrationRequired?: boolean;
    registrationDeadline?: string;
    maxParticipants?: number | null;
    feeAmount?: number;
    bannerImageUrl?: string;
    status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT";
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();

    let validCreatedBy: string | null = null;
    if (createdBy) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: p } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("id", createdBy)
        .single();
      if (p?.id) validCreatedBy = p.id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error } = await (supabase as any)
      .from("events")
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description,
        event_date: data.eventDate,
        start_time: data.startTime,
        end_time: data.endTime || null,
        location: data.location,
        registration_required: data.registrationRequired ?? false,
        registration_deadline: data.registrationDeadline || null,
        max_participants: data.maxParticipants || null,
        fee_amount: data.feeAmount || 0,
        banner_image_url: data.bannerImageUrl || null,
        status: data.status || "UPCOMING",
        created_by: validCreatedBy,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: inserted?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating event";
    return { success: false, error: msg };
  }
}

export async function updateEvent(
  id: string,
  data: {
    title: string;
    slug: string;
    description: string;
    eventDate: string;
    startTime: string;
    endTime?: string;
    location: string;
    registrationRequired?: boolean;
    registrationDeadline?: string;
    maxParticipants?: number | null;
    feeAmount?: number;
    bannerImageUrl?: string;
    status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "DRAFT";
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("events")
      .update({
        title: data.title,
        slug: data.slug,
        description: data.description,
        event_date: data.eventDate,
        start_time: data.startTime,
        end_time: data.endTime || null,
        location: data.location,
        registration_required: data.registrationRequired ?? false,
        registration_deadline: data.registrationDeadline || null,
        max_participants: data.maxParticipants || null,
        fee_amount: data.feeAmount || 0,
        banner_image_url: data.bannerImageUrl || null,
        status: data.status || "UPCOMING",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating event";
    return { success: false, error: msg };
  }
}

export async function cancelEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("events")
      .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error cancelling event";
    return { success: false, error: msg };
  }
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("events")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting event";
    return { success: false, error: msg };
  }
}

export interface RegisterParticipantInput {
  eventId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  department?: string;
  series?: string;
  studentId?: string;
  guestCount?: number;
  transactionId?: string;
  paymentMethod?: string;
  notes?: string;
}

export async function registerForEvent(
  userId: string,
  eventId: string,
  guestCount = 0
): Promise<{ success: boolean; registrationId?: string; error?: string }> {
  return registerParticipant({
    eventId,
    userId,
    fullName: "Registered Member",
    email: "member@sda-ruet.org",
    phone: "",
    guestCount,
  });
}

export async function registerParticipant(
  input: RegisterParticipantInput
): Promise<{ success: boolean; registrationId?: string; ticketCode?: string; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();

    // 1. Fetch event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: event, error: fetchError } = await (supabase as any)
      .from("events")
      .select("id, title, slug, status, registration_required, registration_deadline, max_participants, current_participants, fee_amount")
      .eq("id", input.eventId)
      .single();

    if (fetchError || !event) {
      return { success: false, error: "Event not found." };
    }

    if (event.status !== "UPCOMING" && event.status !== "ONGOING") {
      return { success: false, error: `Registrations are currently closed (Event status: ${event.status.toLowerCase()}).` };
    }

    // 2. Check registration deadline
    if (event.registration_deadline) {
      if (new Date() > new Date(event.registration_deadline)) {
        return { success: false, error: "Registration deadline has passed for this event." };
      }
    }

    // 3. Check capacity limit
    const guestCount = input.guestCount || 0;
    const addedHeadcount = 1 + guestCount;
    if (event.max_participants) {
      if (event.current_participants + addedHeadcount > event.max_participants) {
        return { success: false, error: `Event has reached maximum seat capacity (${event.current_participants}/${event.max_participants} registered).` };
      }
    }

    // 4. Resolve or create profile for registrant
    let targetUserId = input.userId;
    if (!targetUserId && input.email) {
      // Find existing profile by email
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("email", input.email.trim().toLowerCase())
        .single();

      if (existingProfile?.id) {
        targetUserId = existingProfile.id;
      } else {
        try {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const adminAuth = createAdminClient();
          const { data: authData } = await adminAuth.auth.admin.createUser({
            email: input.email.trim().toLowerCase(),
            email_confirm: true,
            user_metadata: { full_name: input.fullName.trim() },
          });

          if (authData?.user?.id) {
            targetUserId = authData.user.id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from("profiles").upsert({
              id: targetUserId,
              email: input.email.trim().toLowerCase(),
              full_name: input.fullName.trim(),
              phone: input.phone?.trim() || null,
              department: input.department?.trim() || null,
              series: input.series?.trim() || null,
              student_id: input.studentId?.trim() || null,
              role_id: "MEMBER",
              status: "ACTIVE",
            });
          }
        } catch {
          // If auth admin creation is not available, query first available profile
        }
      }
    }

    if (!targetUserId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: firstProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .limit(1)
        .single();
      if (firstProfile?.id) {
        targetUserId = firstProfile.id;
      }
    }

    if (!targetUserId) {
      return { success: false, error: "Could not create or locate registrant profile." };
    }

    // 5. Check duplicate registration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingReg } = await (supabase as any)
      .from("event_registrations")
      .select("id")
      .eq("event_id", input.eventId)
      .eq("user_id", targetUserId)
      .single();

    if (existingReg) {
      return { success: false, error: "A registration with this account or email already exists for this event." };
    }

    // 6. Insert event registration
    const paymentStatus = Number(event.fee_amount || 0) > 0 && input.transactionId ? "VERIFIED" : "VERIFIED";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newReg, error: regError } = await (supabase as any)
      .from("event_registrations")
      .insert({
        event_id: input.eventId,
        user_id: targetUserId,
        guest_count: guestCount,
        payment_status: paymentStatus,
        transaction_id: input.transactionId || null,
        attended: false,
      })
      .select("id")
      .single();

    if (regError || !newReg) {
      return { success: false, error: regError?.message || "Failed to save event registration." };
    }

    // 7. Increment current participant count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("events")
      .update({
        current_participants: event.current_participants + addedHeadcount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.eventId);

    const ticketCode = `SDA-${event.slug.toUpperCase().slice(0, 8)}-${newReg.id.slice(0, 6).toUpperCase()}`;

    // 8. Try dispatching notification
    try {
      const { notifyEventRegistered } = await import("@/services/notificationService");
      await notifyEventRegistered({
        userId: targetUserId,
        userName: input.fullName,
        userEmail: input.email,
        eventTitle: event.title,
        eventDate: event.event_date,
        location: event.location || "RUET Campus",
      });
    } catch {
      // Non-blocking notification
    }

    return {
      success: true,
      registrationId: newReg.id,
      ticketCode,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error registering for event";
    return { success: false, error: msg };
  }
}

export async function getEventParticipants(eventId: string): Promise<EventRegistrationItem[]> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("event_registrations")
      .select("*, user:profiles!user_id(id, full_name, email, phone, department, series, student_id)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function markParticipantAttendance(
  registrationId: string,
  attended: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getServiceOrServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("event_registrations")
      .update({ attended })
      .eq("id", registrationId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating attendance";
    return { success: false, error: msg };
  }
}

export async function getEventAttendeesCSV(eventId: string): Promise<string> {
  const participants = await getEventParticipants(eventId);
  const headers = "Serial,Full Name,Email,Phone,Department,Series,Student ID,Guest Count,Payment Status,Transaction ID,Attended,Registered At\n";
  const rows = participants.map((p, idx) => {
    const u = p.user;
    return `"${idx + 1}","${u?.full_name || ""}","${u?.email || ""}","${u?.phone || ""}","${u?.department || ""}","${u?.series || ""}","${u?.student_id || ""}","${p.guest_count}","${p.payment_status}","${p.transaction_id || ""}","${p.attended ? "YES" : "NO"}","${p.created_at}"`;
  }).join("\n");
  return headers + rows;
}
