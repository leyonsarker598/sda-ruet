# SDA RUET - Incremental Development & Implementation Roadmap
**Document Version:** 2.0.0  
**Methodology:** Incremental Phased Delivery with Automated Gate Verifications

---

## 1. 16-Phase Execution Roadmap

```
+-----------------------------------------------------------------------------------------+
|                                16-PHASE EXECUTION ROADMAP                               |
+-----------------------------------------------------------------------------------------+
| [Phase 1] Architecture Review, Database DDL & Security Specifications (COMPLETE)        |
| [Phase 2] Project Setup, Design System Tokens & Base Layout Shell                       |
| [Phase 3] Supabase Migrations, RBAC Model, Stored Procedures & Demo Seed Data           |
| [Phase 4] Supabase Authentication, Session Lifecycle & Auth Guards                      |
| [Phase 5] Core Public Website Pages (Hero, About, Dynamic CMS, Contact)                 |
| [Phase 6] Member & Faculty Profiles (Avatars, Privacy Controls, Account Settings)       |
| [Phase 7] Alumni System (Registration, Multi-stage Admin Review, Privacy Directory)     |
| [Phase 8] Executive Committee System (Current Term, Historical Archives, Ordering)      |
| [Phase 9] Digital Library System (Catalog, Copies, Atomic Issue/Return, Donations)      |
| [Phase 10] Activities, Blog & Rich Event Management (Galleries, Attendee Rosters)       |
| [Phase 11] Multi-Fund Financial Donations (Manual Transaction Verifications, Receipts)  |
| [Phase 12] Admin Control Center & Dynamic Website CMS (Content Blocks, Media Library)   |
| [Phase 13] Communications Engine (Announcements, Notifications & Audit Trail)           |
| [Phase 14] Full-Text Search, Advanced Multi-Filters & Privacy-Aware CSV Data Export     |
| [Phase 15] Automated Test Suite (Unit, Server Actions, RLS Policies, Integration)      |
| [Phase 16] Browser QA, Responsive Viewport Audits (320px to 1440px), Production Audit  |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Phase-by-Phase Detailed Specification

### Phase 1: Architecture Review & Planning (Complete)
- **Deliverables**: `/docs/PROJECT_ARCHITECTURE.md`, `/docs/DATABASE.md`, `/docs/RBAC.md`, `/docs/DEVELOPMENT_PLAN.md`, `/docs/SECURITY.md`.
- **Gate Criteria**: Fully normalized schema, transaction-safe stored procedures, canonical auth mapping, field-level privacy strategy, and explicit storage policies.

### Phase 2: Project Setup & Design System Foundation
- **Deliverables**:
  - Initialize Next.js 15+ with TypeScript strict mode, Tailwind CSS v4, and shadcn/ui.
  - Setup color tokens: Primary Maroon (`#7B2D26` / `#8B3A3A`), Accent Gold (`#C5A880`), Surface Ivory (`#FBF9F5`), Slate (`#0F172A`).
  - Configure assets in `public/assets/` (`Sda-PNG.png`, `ruet_logo.png`).
  - Base layout primitives: `PublicNavbar`, `PublicFooter`, `MobileNav`, `StatCard`, `EmptyState`, `Toast`.
- **Verification**: Zero build errors, responsive shell rendering from 320px to 1440px+.

### Phase 3: Supabase Database Migrations & RBAC
- **Deliverables**:
  - `supabase/migrations/20260828000001_initial_schema.sql` (All 25+ core tables).
  - `supabase/migrations/20260828000002_rbac_policies.sql` (RLS policies + permission functions).
  - `supabase/migrations/20260828000003_storage_buckets.sql` (`public-media` vs `private-documents`).
  - `supabase/migrations/20260828000004_stored_procedures.sql` (`issue_book_transaction`, `return_book_transaction`, `approve_alumni_application`).
  - `supabase/seed.sql` (Sanitized DEMO data with mock records).
- **Verification**: Migrations execute cleanly; RLS blocks unprivileged operations.

### Phase 4: Supabase Auth & Session Management
- **Deliverables**:
  - Supabase client helpers (`client.ts`, `server.ts`, `middleware.ts`).
  - Pages: `/login`, `/register`, `/register/alumni`, `/forgot-password`, `/reset-password`, `/verify-email`.
  - Next.js Auth Middleware protecting `/dashboard/*` and `/admin/*`.
  - Secure First-Admin Bootstrap script.
- **Verification**: Valid credentials sign in; protected routes redirect unauthenticated callers.

### Phase 5: Core Public Web Pages & Dynamic CMS
- **Deliverables**:
  - `/` (Hero with association motto, live stats counter, upcoming events, committee teaser, library preview).
  - `/about` (Who We Are, Mission & Vision, History, Objectives).
  - `/contact` (Contact details, RUET location map, working contact form).
  - `/privacy` & `/terms`.
- **Verification**: Lighthouse performance $\ge 90$, dynamic stats querying database.

### Phase 6: Member & Teacher Profile Systems
- **Deliverables**:
  - `/dashboard/profile` (Avatar upload to Supabase Storage, personal details, academic details).
  - Privacy Settings Switcher (Public, Members-Only, Private, Admin-Only).
  - `/members` (Member directory respecting field privacy).
- **Verification**: Updating privacy settings instantly masks restricted fields from unauthorized viewers.

### Phase 7: Alumni Registration, Verification & Directory
- **Deliverables**:
  - `/register/alumni` with graduation year, department, profession, and document upload to `private-documents`.
  - `/admin/alumni/applications` (Admin queue to Approve, Reject, or Request Correction).
  - `/alumni` (Multi-criteria search: department, series, year, location, company).
  - `/alumni/[id]` (Verified profile page).
- **Verification**: Unapproved alumni never show in `/alumni`; approval transitions account to active.

### Phase 8: Executive Committee Management
- **Deliverables**:
  - `/committee` (Current Executive Committee with hierarchy ordering).
  - `/committee/[year]` (Previous committees archive).
  - `/admin/committees` (Term management, member reordering, photo upload).
- **Verification**: Hierarchy order properly renders President, VP, GS, and executive members.

### Phase 9: Digital Library Management System
- **Deliverables**:
  - `/library` (Search, category filter, availability badges).
  - `/library/[id]` (Book details, available copies, reservation trigger).
  - `/library/donate` (Community book donation form).
  - `/admin/library/loans` (Circulation desk calling `issue_book_transaction` & `return_book_transaction`).
  - `/admin/library/donations` (Review and catalog donated books).
  - `/admin/library/settings` (Loan limits, fine per day).
- **Verification**: Double loans prevented; copy counts decrement/increment transactionally.

### Phase 10: Activities, Blog & Event Management
- **Deliverables**:
  - `/activities` & `/activities/[slug]` (Full markdown/rich text content, photo galleries, tags).
  - `/events` (Upcoming/completed events, registration deadlines, seats remaining).
  - `/admin/activities` & `/admin/events` (Post creation, gallery upload, attendee roster export).
- **Verification**: Event registration blocks when max participants reached.

### Phase 11: Multi-Fund Financial Donation System
- **Deliverables**:
  - `/donate` (General Fund, Library Fund, Emergency Relief, Student Welfare).
  - Manual payment guides (bKash Merchant/Personal, Nagad, Rocket, Bank Transfer).
  - Proof of payment & transaction ID submission.
  - `/admin/donations` (Transaction verification desk, donation reports).
- **Verification**: Approved donations dynamically update raised fund totals.

### Phase 12: Admin Control Center & Dynamic CMS
- **Deliverables**:
  - `/admin` (Metrics summary, growth charts, active loans, pending verifications).
  - `/admin/cms` (Edit homepage hero text, about page content, contact info).
  - `/admin/media` (Media asset browser, folder manager, direct CDN URLs).
  - `/admin/settings` (Association metadata, social links).
- **Verification**: Content edits in CMS immediately reflect across public pages.

### Phase 13: Communications Engine & Tamper-Evident Audit Logs
- **Deliverables**:
  - `/admin/announcements` (Broadcast alerts targeting ALL, MEMBERS, or ALUMNI).
  - In-app notification center (`/dashboard/notifications`).
  - `/admin/audit-logs` (Filterable audit trail with JSON state diffs).
- **Verification**: Critical mutations log actor ID, timestamp, and payload.

### Phase 14: Search, Filtering & Data Export
- **Deliverables**:
  - Full-text search on books, activities, and alumni.
  - Privacy-aware CSV export (`/api/export/csv`) for alumni, books, and donation ledgers.
- **Verification**: Exported CSV excludes private fields for unauthorized callers.

### Phase 15: Automated Testing Suite
- **Deliverables**:
  - Unit tests (Zod validation schemas, fine calculations, privacy maskers).
  - Integration tests (Server actions, atomic procedures, RBAC permission guards).
  - Database RLS policy tests.
- **Verification**: `npm test` runs with 100% pass rate on critical paths.

### Phase 16: Browser QA, Responsive Audits & Final Hardening
- **Deliverables**:
  - Viewport verification at 320px, 375px, 390px, 768px, 1024px, 1440px+.
  - Zero broken links, zero console errors, zero placeholder text.
  - Production build verification (`npm run build`).
- **Verification**: Full user journey completed cleanly on simulated browser.

---

## 3. Seed Data & Production Migration Protocol

### 3.1 Demo Seed Strategy (`supabase/seed.sql`)
The development `seed.sql` contains **strictly synthetic mock data**:
- `admin@sda-ruet.org` (Mock Administrator)
- `demo.member1@sda-ruet.org` (Mock Student Member)
- `demo.alumni1@sda-ruet.org` (Mock Verified Alumnus)
- `demo.teacher1@sda-ruet.org` (Mock RUET Faculty)
- 10 sample books across Engineering, Mathematics, and Literature categories.
- 3 sample activities (SDAR Cup, BBQ Night, Freshers Reception).
- 2 sample committee terms (2025-2026, 2024-2025).

### 3.2 Real SDA RUET Data Migration Protocol
When onboarding real organizational data:
1. Real committee member rosters and photos will be ingested via `/admin/committees` or a secured administrative batch script.
2. Real book inventories will be cataloged with their unique physical barcodes through `/admin/library/books`.
3. Alumni records will be invited via secure email verification links.
