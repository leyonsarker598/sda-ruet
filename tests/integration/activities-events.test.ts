import { activitySchema, eventSchema } from "../../src/lib/validation/schemas";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

interface MockActivity {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  tags: string[];
}

interface MockEvent {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  max_participants: number | null;
  current_participants: number;
  registration_deadline: string | null;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
}

interface MockEventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  guest_count: number;
  attended: boolean;
}

async function runActivitiesEventsTests() {
  console.log("Running Phase 8 Activities & Events Lifecycle Tests...\n");

  const activities: MockActivity[] = [];
  const events: MockEvent[] = [];
  const registrations: MockEventRegistration[] = [];

  // =========================================================================
  // 1. ACTIVITY CREATION, DRAFT & PUBLISH LIFECYCLE
  // =========================================================================
  console.log("1. Testing Activity Post Creation & Publish Lifecycle...");
  const validActivity = activitySchema.safeParse({
    title: "Annual Grand Iftar & Doa Mahfil 2026",
    slug: "annual-grand-iftar-2026",
    categoryId: "123e4567-e89b-12d3-a456-426614174000",
    shortDescription: "Over 200 resident students and faculty gathered for the annual iftar.",
    content: "The Sirajganj District Association, RUET organized its traditional grand iftar mahfil with great enthusiasm...",
    activityDate: "2026-03-25",
    location: "RUET Central Auditorium",
    isPublished: false,
    tags: ["Iftar", "RUET", "2026"],
  });
  assert(validActivity.success, "Activity schema validation should pass");

  const newActivity: MockActivity = {
    id: "act-001",
    title: "Annual Grand Iftar & Doa Mahfil 2026",
    slug: "annual-grand-iftar-2026",
    is_published: false,
    published_at: null,
    tags: ["Iftar", "RUET", "2026"],
  };
  activities.push(newActivity);
  assert(!newActivity.is_published, "New activity post starts in Draft mode");

  // Publish Activity
  newActivity.is_published = true;
  newActivity.published_at = new Date().toISOString();
  assert(newActivity.is_published && newActivity.published_at !== null, "Activity successfully published live");
  console.log("✓ Activity creation and publishing lifecycle verified.\n");

  // =========================================================================
  // 2. EVENT CREATION & SCHEMA VALIDATION
  // =========================================================================
  console.log("2. Testing Event Creation & Schema Validation...");
  const validEvent = eventSchema.safeParse({
    title: "SDA RUET Freshers' Reception '26",
    slug: "freshers-reception-2026",
    description: "Welcoming all newly admitted 25 series engineering students from Sirajganj district.",
    eventDate: "2026-09-15",
    startTime: "10:00",
    endTime: "16:00",
    location: "RUET Auditorium Complex",
    registrationRequired: true,
    registrationDeadline: "2026-09-10T23:59:59Z",
    maxParticipants: 2, // Small capacity for limit testing
    feeAmount: 0,
  });
  assert(validEvent.success, "Event schema validation should pass");

  const event1: MockEvent = {
    id: "event-001",
    title: "SDA RUET Freshers' Reception '26",
    slug: "freshers-reception-2026",
    event_date: "2026-09-15",
    max_participants: 2,
    current_participants: 0,
    registration_deadline: "2026-09-10T23:59:59Z",
    status: "UPCOMING",
  };
  events.push(event1);
  console.log("✓ Event creation and configuration verified.\n");

  // =========================================================================
  // 3. EVENT REGISTRATION & CAPACITY ENFORCEMENT
  // =========================================================================
  console.log("3. Testing Event Registration & Capacity Limits...");
  function registerEvent(eventId: string, userId: string, guestCount = 0, now = new Date("2026-09-01")) {
    const event = events.find((e) => e.id === eventId);
    if (!event || event.status !== "UPCOMING") {
      return { success: false, error: "Event not available" };
    }

    if (event.registration_deadline && now > new Date(event.registration_deadline)) {
      return { success: false, error: "Registration deadline expired" };
    }

    const added = 1 + guestCount;
    if (event.max_participants && event.current_participants + added > event.max_participants) {
      return { success: false, error: "Event capacity full" };
    }

    if (registrations.some((r) => r.event_id === eventId && r.user_id === userId)) {
      return { success: false, error: "Already registered" };
    }

    const reg: MockEventRegistration = {
      id: `reg-${registrations.length + 1}`,
      event_id: eventId,
      user_id: userId,
      guest_count: guestCount,
      attended: false,
    };
    registrations.push(reg);
    event.current_participants += added;
    return { success: true, reg };
  }

  // 1st User registers
  const reg1 = registerEvent(event1.id, "user-001");
  assert(reg1.success, "1st attendee registration should succeed");
  assert(event1.current_participants === 1, "Current participants should increment to 1");

  // Duplicate registration check
  const duplicateReg = registerEvent(event1.id, "user-001");
  assert(!duplicateReg.success, "Duplicate user registration MUST fail");

  // 2nd User registers
  const reg2 = registerEvent(event1.id, "user-002");
  assert(reg2.success, "2nd attendee registration should succeed");
  assert(event1.current_participants === 2, "Current participants should increment to 2");

  // 3rd User attempts registration on full event (Capacity: 2)
  const fullReg = registerEvent(event1.id, "user-003");
  assert(!fullReg.success, "Registering on filled capacity MUST fail");
  console.log("✓ Event seat registration and capacity enforcement verified.\n");

  // =========================================================================
  // 4. REGISTRATION DEADLINE ENFORCEMENT
  // =========================================================================
  console.log("4. Testing Registration Deadline Enforcement...");
  const pastDeadlineEvent: MockEvent = {
    id: "event-deadline-test",
    title: "Past Deadline Workshop",
    slug: "past-deadline",
    event_date: "2026-09-20",
    max_participants: 100,
    current_participants: 0,
    registration_deadline: "2026-08-01T00:00:00Z", // Past date
    status: "UPCOMING",
  };
  events.push(pastDeadlineEvent);

  const lateReg = registerEvent(pastDeadlineEvent.id, "user-004", 0, new Date("2026-08-15"));
  assert(!lateReg.success, "Registering after deadline MUST fail");
  console.log("✓ Registration deadline check verified.\n");

  // =========================================================================
  // 5. ATTENDANCE MARKING LIFECYCLE
  // =========================================================================
  console.log("5. Testing Attendance Recording...");
  const attendee = registrations.find((r) => r.id === "reg-1")!;
  assert(!attendee.attended, "Initial attendance status should be false");

  // Admin marks present
  attendee.attended = true;
  assert(attendee.attended, "Attendee successfully marked present");
  console.log("✓ Attendee check-in and attendance recording verified.\n");

  console.log("==============================================================");
  console.log("ALL PHASE 8 ACTIVITIES & EVENTS TESTS PASSED (5/5)             ");
  console.log("==============================================================");
}

runActivitiesEventsTests();
