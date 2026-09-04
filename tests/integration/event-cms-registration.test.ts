import * as fs from "node:fs";
import * as path from "node:path";

// Load .env.local for standalone test runner
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

import { describe, it } from "node:test";
import assert from "node:assert";
import { eventSchema, eventRegistrationSchema } from "../../src/lib/validation/schemas";
import {
  createEvent,
  updateEvent,
  registerParticipant,
  getEventParticipants,
  getEventAttendeesCSV,
  markParticipantAttendance,
  getEventBySlug,
} from "../../src/services/adminEventService";

describe("Event CMS & Registration Lifecycle Tests", () => {
  const testSlug = `tech-gala-${Date.now()}`;
  let createdEventId = "";
  let registrationId = "";

  it("1. Validates event schema and registration schema correctly", () => {
    const validEvent = eventSchema.safeParse({
      title: "SDA RUET Tech Gala & Reunion 2026",
      slug: testSlug,
      description: "A grand evening celebrating engineering achievements and networking with seniors.",
      eventDate: "2026-10-20",
      startTime: "16:00",
      endTime: "21:00",
      location: "RUET Auditorium",
      registrationRequired: true,
      maxParticipants: 100,
      feeAmount: 150,
      bannerImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      status: "UPCOMING",
    });

    assert.strictEqual(validEvent.success, true, "Valid event should pass schema validation");

    const validReg = eventRegistrationSchema.safeParse({
      eventId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      fullName: "Test Member",
      email: "member@sda-ruet.org",
      phone: "01700000000",
      department: "CSE",
      series: "20",
      studentId: "2003001",
      guestCount: 1,
      tshirtSize: "L",
      transactionId: "TX12345678",
    });

    assert.strictEqual(validReg.success, true, "Valid registration should pass schema validation");
  });

  it("2. Creates a new event with full CMS details in database", async () => {
    const res = await createEvent("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", {
      title: "SDA RUET Tech Gala & Reunion 2026",
      slug: testSlug,
      description: "A grand evening celebrating engineering achievements and networking with seniors.",
      eventDate: "2026-10-20",
      startTime: "16:00",
      endTime: "21:00",
      location: "RUET Central Auditorium",
      registrationRequired: true,
      maxParticipants: 50,
      feeAmount: 150,
      bannerImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      status: "UPCOMING",
    });

    assert.strictEqual(res.success, true, `Event creation should succeed: ${res.error}`);
    assert(res.id, "Event ID should be returned");
    createdEventId = res.id!;

    const event = await getEventBySlug(testSlug);
    assert(event, "Event should be retrievable by slug");
    assert.strictEqual(event?.title, "SDA RUET Tech Gala & Reunion 2026");
    assert.strictEqual(Number(event?.fee_amount), 150);
    assert.strictEqual(Number(event?.max_participants), 50);
  });

  it("3. Updates event CMS details", async () => {
    const res = await updateEvent(createdEventId, {
      title: "SDA RUET Grand Tech Gala & Reunion 2026 (Updated)",
      slug: testSlug,
      description: "Updated description with special guest keynote announcements and agenda.",
      eventDate: "2026-10-20",
      startTime: "16:30",
      endTime: "22:00",
      location: "RUET Central Auditorium, Kazla",
      registrationRequired: true,
      maxParticipants: 60,
      feeAmount: 200,
      bannerImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      status: "UPCOMING",
    });

    assert.strictEqual(res.success, true, `Event update should succeed: ${res.error}`);
    const updated = await getEventBySlug(testSlug);
    assert.strictEqual(updated?.title, "SDA RUET Grand Tech Gala & Reunion 2026 (Updated)");
    assert.strictEqual(Number(updated?.fee_amount), 200);
    assert.strictEqual(Number(updated?.max_participants), 60);
  });

  it("4. Registers a participant and generates an admission pass code", async () => {
    const regRes = await registerParticipant({
      eventId: createdEventId,
      fullName: "Engr. Yeasir Arafat",
      email: `test-${Date.now()}@sda-ruet.org`,
      phone: "01712345678",
      department: "CSE",
      series: "18",
      studentId: "1803001",
      guestCount: 1,
      transactionId: "BKASH987654",
    });

    assert.strictEqual(regRes.success, true, `Participant registration should succeed: ${regRes.error}`);
    assert(regRes.registrationId, "Registration ID should exist");
    assert(regRes.ticketCode, "Ticket code should exist");
    assert(regRes.ticketCode?.startsWith("SDA-"), "Ticket code should have prefix SDA-");

    registrationId = regRes.registrationId!;

    const event = await getEventBySlug(testSlug);
    // Headcount should be 1 + 1 guest = 2
    assert.strictEqual(event?.current_participants, 2, "Current participants should increment by 2");
  });

  it("5. Verifies attendee roster, attendance check-in, and CSV export", async () => {
    const attendees = await getEventParticipants(createdEventId);
    assert.strictEqual(attendees.length, 1, "Roster should have 1 registration");
    assert.strictEqual(attendees[0].guest_count, 1);
    assert.strictEqual(attendees[0].attended, false);

    // Mark attendance
    const checkinRes = await markParticipantAttendance(registrationId, true);
    assert.strictEqual(checkinRes.success, true, "Checkin should succeed");

    const updatedAttendees = await getEventParticipants(createdEventId);
    assert.strictEqual(updatedAttendees[0].attended, true, "Attendee should be marked attended");

    // CSV export
    const csv = await getEventAttendeesCSV(createdEventId);
    assert(csv.includes("Serial,Full Name,Email"), "CSV should have standard headers");
    assert(csv.includes("Engr. Yeasir Arafat"), "CSV should contain attendee name");
    assert(csv.includes("BKASH987654"), "CSV should contain transaction ID");
  });
});
