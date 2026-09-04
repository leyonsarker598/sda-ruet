# Sirajganj District Association, RUET (SDA RUET)
## Official Full-Stack Web Application

**Motto:** *"Take a Stand & Hold a Hand"*  
**Organization:** Sirajganj District Association, Rajshahi University of Engineering & Technology (RUET), Bangladesh  
**Brand Colors:** Deep Maroon (`#7B2D26` / `#8B3A3A`), Academic Gold/Tan (`#C5A880`), Ivory Canvas (`#FBF9F5`), Slate Dark (`#0F172A`)

---

## 1. Project Overview
SDA RUET is a modern, production-grade full-stack role-based community platform connecting students, alumni, faculty members, and patrons of RUET hailing from Sirajganj District.

Key System Modules:
- **Canonical Authentication & Profile Hierarchy**: `auth.users` $\rightarrow$ `profiles` $\rightarrow$ (`member_details`, `alumni_profiles`, `teacher_profiles`).
- **Dynamic RBAC & Granular Delegation**: 4 primary roles (`ADMIN`, `MEMBER`, `ALUMNI`, `TEACHER`) with dynamic delegation (e.g. appointing a Member as a **Librarian** without altering their core role).
- **Digital Library System**: Atomic book circulation desk with row-level locks (`issue_book_transaction`, `return_book_transaction`), reservations, condition reconciliation, and book donations.
- **Alumni Verification & Privacy Directory**: Multi-stage admin review queue (`PENDING` $\rightarrow$ `APPROVED` / `REJECTED` / `CORRECTION_REQUESTED`) and 4-tier field privacy masking.
- **Executive Committee Manager**: Current term rosters with hierarchical ordering and historical term archives.
- **Activities, Events & Multi-Fund Donations**: Full markdown blogs, event registrations, and transparent manual donation workflow (bKash/Nagad/Rocket/Bank).
- **Forensic Audit Logging**: Tamper-evident mutation logs across all critical operations.

---

## 2. Technology Stack
- **Frontend**: Next.js 15+ (App Router, React 19, Server Actions), TypeScript, Tailwind CSS v4, Lucide React icons.
- **Backend & Database**: Supabase PostgreSQL 15+ with strict Row Level Security (RLS), stored procedures, and triggers.
- **Storage**: Supabase Storage with bucket segregation (`public-media` vs `private-documents`).
- **Validation**: Strict Zod schemas on client and server.

---

## 3. Getting Started

### 3.1 Prerequisites
- Node.js `v20.16.0` or higher
- npm `10.8.0` or higher
- Supabase Project or local Supabase CLI

### 3.2 Environment Configuration
Copy `.env.example` to `.env.local` and populate your Supabase project credentials:
```bash
cp .env.example .env.local
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3.3 Database Migrations Setup
Run the SQL migration scripts in your Supabase SQL Editor in sequence:
1. `supabase/migrations/20260828000001_initial_schema.sql` (25+ Tables, ENUMs, Constraints, Indexes)
2. `supabase/migrations/20260828000002_rbac_policies.sql` (Non-Recursive RLS Functions & Policies)
3. `supabase/migrations/20260828000003_storage_buckets.sql` (Public and Private Storage Buckets)
4. `supabase/migrations/20260828000004_stored_procedures.sql` (Atomic Circulation & Consistency Triggers)
5. `supabase/seed.sql` (Initial Demo Categories, Roles, Permissions, and Settings)

### 3.4 Initial Administrator Bootstrap
Administrative accounts cannot be created via public signups. To elevate the first user to Administrator:
```sql
UPDATE public.profiles
SET role_id = 'ADMIN', status = 'ACTIVE'
WHERE email = 'admin@sda-ruet.org';
```

### 3.5 Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Documentation Suite
Detailed technical documentation is available in `/docs`:
- [`/docs/PROJECT_ARCHITECTURE.md`](docs/PROJECT_ARCHITECTURE.md): System architecture, 10 pillars, and route map.
- [`/docs/DATABASE.md`](docs/DATABASE.md): Complete PostgreSQL schema, relational DDL, constraints, and atomic stored procedures.
- [`/docs/RBAC.md`](docs/RBAC.md): Granular permission matrix, delegation model, and RLS rules.
- [`/docs/SECURITY.md`](docs/SECURITY.md): Admin bootstrap, privacy matrix, and storage policies.
- [`/docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md): 16-phase implementation roadmap.
