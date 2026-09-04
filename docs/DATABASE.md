# SDA RUET - Database Architecture & Schema Specification
**Document Version:** 2.0.0  
**Database Engine:** PostgreSQL 15+ (Hosted on Supabase)  
**Schema Conventions:** Snake_case identifiers, UUID Primary Keys (default `gen_random_uuid()`), Explicit Foreign Keys, Restrictive Deletion Constraints, Row Level Security (RLS) enabled on all public tables.

---

## 1. Identity & Profile Schema

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1.1 Custom ENUM Types
CREATE TYPE user_role_type AS ENUM ('ADMIN', 'MEMBER', 'ALUMNI', 'TEACHER');
CREATE TYPE account_status_type AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
CREATE TYPE verification_status_type AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'CORRECTION_REQUESTED');
CREATE TYPE visibility_type AS ENUM ('PUBLIC', 'MEMBERS_ONLY', 'PRIVATE', 'ADMIN_ONLY');

-- 1.2 Core Profiles Table (1:1 with auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    avatar_url TEXT,
    role_id VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    status account_status_type DEFAULT 'ACTIVE' NOT NULL,
    department VARCHAR(100),
    series VARCHAR(10),       -- e.g. '18', '19', '20', '21', '22', '23', '24'
    session VARCHAR(20),      -- e.g. '2019-2020'
    student_id VARCHAR(30),
    blood_group VARCHAR(10),
    present_address TEXT,
    bio TEXT,
    social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
    privacy_settings JSONB DEFAULT '{
        "phone": "PRIVATE",
        "email": "MEMBERS_ONLY",
        "blood_group": "PRIVATE",
        "student_id": "ADMIN_ONLY",
        "present_address": "PRIVATE",
        "bio": "PUBLIC",
        "social_links": "PUBLIC"
    }'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 1.3 Automatic Profile Creation Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role_id', 'MEMBER')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1.4 Student Member Details Specialization
CREATE TABLE public.member_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    hall VARCHAR(100),
    permanent_address TEXT,
    current_semester VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 1.5 Alumni Profile Specialization
CREATE TABLE public.alumni_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    graduation_year INTEGER NOT NULL,
    degree VARCHAR(100) DEFAULT 'B.Sc. in Engineering' NOT NULL,
    current_designation VARCHAR(150),
    organization VARCHAR(200),
    industry VARCHAR(100),
    current_city VARCHAR(100),
    current_country VARCHAR(100) DEFAULT 'Bangladesh' NOT NULL,
    linkedin_url TEXT,
    portfolio_url TEXT,
    achievements TEXT,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    verification_status verification_status_type DEFAULT 'PENDING' NOT NULL,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 1.6 Alumni Application & Verification Queue
CREATE TABLE public.alumni_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submitted_data JSONB NOT NULL,
    document_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    status verification_status_type DEFAULT 'PENDING' NOT NULL,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 1.7 Teacher Profile Specialization
CREATE TABLE public.teacher_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    designation VARCHAR(100) NOT NULL, -- 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'
    department VARCHAR(100) NOT NULL,
    office_location VARCHAR(200),
    research_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
```

---

## 2. RBAC & Permissions Schema

```sql
CREATE TABLE public.roles (
    id VARCHAR(50) PRIMARY KEY, -- 'ADMIN', 'MEMBER', 'ALUMNI', 'TEACHER'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.permissions (
    id VARCHAR(100) PRIMARY KEY, -- e.g. 'library.issue_book', 'alumni.verify'
    module VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.role_permissions (
    role_id VARCHAR(50) REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.user_permissions (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES public.permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN DEFAULT TRUE NOT NULL, -- TRUE: explicit grant, FALSE: explicit denial
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    PRIMARY KEY (user_id, permission_id)
);

-- Foreign key link from profiles to roles
ALTER TABLE public.profiles 
    ADD CONSTRAINT fk_profiles_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;
```

---

## 3. Executive Committee Schema

```sql
CREATE TABLE public.committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_name VARCHAR(100) NOT NULL UNIQUE, -- e.g. '2025-2026', '2024-2025'
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE NOT NULL,
    banner_image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.committee_positions (
    id VARCHAR(50) PRIMARY KEY, -- 'president', 'general_secretary', 'treasurer', etc.
    title VARCHAR(100) NOT NULL,
    hierarchy_order INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE public.committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    position_id VARCHAR(50) NOT NULL REFERENCES public.committee_positions(id) ON DELETE RESTRICT,
    custom_position_title VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    series VARCHAR(10),
    session VARCHAR(20),
    photo_url TEXT,
    bio TEXT,
    social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
```

---

## 4. Digital Library Schema & Atomic Transactions

```sql
CREATE TYPE book_status_type AS ENUM ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ARCHIVED');
CREATE TYPE copy_condition_type AS ENUM ('NEW', 'GOOD', 'FAIR', 'DAMAGED', 'LOST');
CREATE TYPE loan_status_type AS ENUM ('ISSUED', 'RETURNED', 'OVERDUE', 'LOST', 'CANCELLED');
CREATE TYPE donation_status_type AS ENUM ('PENDING', 'RECEIVED', 'ACCEPTED', 'REJECTED', 'CATALOGUED');

CREATE TABLE public.book_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    author VARCHAR(255) NOT NULL,
    co_authors TEXT[] DEFAULT ARRAY[]::TEXT[],
    publisher VARCHAR(150),
    publication_year INTEGER,
    edition VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English' NOT NULL,
    category_id UUID NOT NULL REFERENCES public.book_categories(id) ON DELETE RESTRICT,
    description TEXT,
    cover_image_url TEXT,
    shelf_location VARCHAR(100),
    total_copies INTEGER DEFAULT 1 NOT NULL CHECK (total_copies >= 0),
    available_copies INTEGER DEFAULT 1 NOT NULL CHECK (available_copies <= total_copies AND available_copies >= 0),
    status book_status_type DEFAULT 'AVAILABLE' NOT NULL,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.book_copies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    copy_code VARCHAR(50) NOT NULL UNIQUE, -- Barcode / Unique code e.g. 'SDAR-CS-001-A'
    condition copy_condition_type DEFAULT 'GOOD' NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    acquisition_type VARCHAR(50) DEFAULT 'PURCHASE' NOT NULL,
    donor_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.book_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    book_copy_id UUID NOT NULL REFERENCES public.book_copies(id) ON DELETE RESTRICT,
    borrower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    renewal_count INTEGER DEFAULT 0 NOT NULL,
    status loan_status_type DEFAULT 'ISSUED' NOT NULL,
    fine_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (fine_amount >= 0),
    fine_paid BOOLEAN DEFAULT FALSE NOT NULL,
    issued_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    returned_to UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.book_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.book_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donor_name VARCHAR(150) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(30),
    book_title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50),
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    category_id UUID REFERENCES public.book_categories(id) ON DELETE SET NULL,
    condition copy_condition_type DEFAULT 'GOOD' NOT NULL,
    photo_url TEXT,
    message TEXT,
    status donation_status_type DEFAULT 'PENDING' NOT NULL,
    is_public_donor BOOLEAN DEFAULT TRUE NOT NULL,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.library_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    max_books_per_member INTEGER DEFAULT 2 NOT NULL,
    max_books_per_alumni INTEGER DEFAULT 1 NOT NULL,
    default_loan_days INTEGER DEFAULT 14 NOT NULL,
    max_renewals INTEGER DEFAULT 1 NOT NULL,
    fine_per_day NUMERIC(10,2) DEFAULT 2.00 NOT NULL,
    max_overdue_days INTEGER DEFAULT 30 NOT NULL,
    reservation_valid_hours INTEGER DEFAULT 48 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
```

### 4.1 Atomic Library Stored Procedures
```sql
-- Atomic Book Issue Procedure (Prevents Double Issuing & Negative Inventory)
CREATE OR REPLACE FUNCTION public.issue_book_transaction(
    p_borrower_id UUID,
    p_copy_id UUID,
    p_issued_by UUID,
    p_loan_days INTEGER DEFAULT 14
)
RETURNS UUID AS $$
DECLARE
    v_book_id UUID;
    v_is_available BOOLEAN;
    v_active_loans INTEGER;
    v_max_loans INTEGER := 2;
    v_loan_id UUID;
BEGIN
    -- 1. Row Lock on Book Copy
    SELECT book_id, is_available INTO v_book_id, v_is_available
    FROM public.book_copies
    WHERE id = p_copy_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Book copy not found.';
    END IF;

    IF NOT v_is_available THEN
        RAISE EXCEPTION 'Book copy is currently unavailable or already issued.';
    END IF;

    -- 2. Check Borrower Active Loan Count
    SELECT COUNT(*) INTO v_active_loans
    FROM public.book_loans
    WHERE borrower_id = p_borrower_id AND status = 'ISSUED';

    IF v_active_loans >= v_max_loans THEN
        RAISE EXCEPTION 'Borrower has reached the maximum active loan limit (%)', v_max_loans;
    END IF;

    -- 3. Lock and Decrement Available Book Count
    UPDATE public.books
    SET available_copies = available_copies - 1,
        status = CASE WHEN available_copies - 1 <= 0 THEN 'OUT_OF_STOCK'::book_status_type ELSE 'AVAILABLE'::book_status_type END
    WHERE id = v_book_id AND available_copies > 0;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No available copies left in book inventory.';
    END IF;

    -- 4. Mark Copy as Unavailable
    UPDATE public.book_copies
    SET is_available = FALSE
    WHERE id = p_copy_id;

    -- 5. Insert Loan Record
    INSERT INTO public.book_loans (
        book_id,
        book_copy_id,
        borrower_id,
        issue_date,
        due_date,
        status,
        issued_by
    ) VALUES (
        v_book_id,
        p_copy_id,
        p_borrower_id,
        CURRENT_DATE,
        CURRENT_DATE + p_loan_days,
        'ISSUED',
        p_issued_by
    ) RETURNING id INTO v_loan_id;

    -- 6. Record Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, new_data)
    VALUES (p_issued_by, 'BOOK_ISSUED', 'book_loans', v_loan_id::text, jsonb_build_object(
        'borrower_id', p_borrower_id,
        'copy_id', p_copy_id,
        'book_id', v_book_id,
        'due_date', CURRENT_DATE + p_loan_days
    ));

    RETURN v_loan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic Book Return Procedure
CREATE OR REPLACE FUNCTION public.return_book_transaction(
    p_loan_id UUID,
    p_returned_to UUID,
    p_condition copy_condition_type DEFAULT 'GOOD',
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_loan RECORD;
BEGIN
    -- 1. Lock Loan Record
    SELECT * INTO v_loan
    FROM public.book_loans
    WHERE id = p_loan_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Loan record not found.';
    END IF;

    IF v_loan.status = 'RETURNED' THEN
        RAISE EXCEPTION 'This loan has already been processed and returned.';
    END IF;

    -- 2. Mark Loan as Returned
    UPDATE public.book_loans
    SET return_date = CURRENT_DATE,
        status = 'RETURNED',
        returned_to = p_returned_to,
        notes = COALESCE(p_notes, notes)
    WHERE id = p_loan_id;

    -- 3. Mark Copy as Available & Update Condition
    UPDATE public.book_copies
    SET is_available = TRUE,
        condition = p_condition
    WHERE id = v_loan.book_copy_id;

    -- 4. Increment Available Copies
    UPDATE public.books
    SET available_copies = available_copies + 1,
        status = 'AVAILABLE'
    WHERE id = v_loan.book_id;

    -- 5. Record Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, new_data)
    VALUES (p_returned_to, 'BOOK_RETURNED', 'book_loans', p_loan_id::text, jsonb_build_object(
        'returned_to', p_returned_to,
        'condition', p_condition,
        'return_date', CURRENT_DATE
    ));

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Activities, Events & Donations Schema

```sql
CREATE TYPE payment_status_type AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'FAILED', 'REFUNDED', 'CANCELLED');
CREATE TYPE event_status_type AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

CREATE TABLE public.activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id UUID NOT NULL REFERENCES public.activity_categories(id) ON DELETE RESTRICT,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    cover_image_url TEXT,
    short_description TEXT NOT NULL,
    content TEXT NOT NULL,
    activity_date DATE NOT NULL,
    location VARCHAR(200),
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    published_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.activity_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    banner_image_url TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location VARCHAR(255) NOT NULL,
    registration_required BOOLEAN DEFAULT FALSE NOT NULL,
    registration_deadline TIMESTAMPTZ,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0 NOT NULL,
    fee_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (fee_amount >= 0),
    status event_status_type DEFAULT 'UPCOMING' NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_count INTEGER DEFAULT 0 NOT NULL CHECK (guest_count >= 0),
    payment_status payment_status_type DEFAULT 'VERIFIED' NOT NULL,
    transaction_id VARCHAR(100),
    attended BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(event_id, user_id)
);

CREATE TABLE public.donation_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, -- 'General Fund', 'Library Fund', 'Emergency Relief', 'Student Welfare'
    description TEXT,
    target_amount NUMERIC(12,2) CHECK (target_amount >= 0),
    raised_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (raised_amount >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID NOT NULL REFERENCES public.donation_funds(id) ON DELETE RESTRICT,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donor_name VARCHAR(150) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(30),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'BDT' NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'BKASH', 'NAGAD', 'ROCKET', 'BANK_TRANSFER', 'MANUAL_CASH'
    transaction_id VARCHAR(100),
    payment_reference TEXT,
    proof_image_url TEXT,
    status payment_status_type DEFAULT 'PENDING' NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
    message TEXT,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
```

---

## 6. Communications, Media & Tamper-Evident Audit Logs

```sql
CREATE TYPE announcement_priority_type AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority announcement_priority_type DEFAULT 'NORMAL' NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'ALL' NOT NULL,
    publish_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    expiry_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    replied_at TIMESTAMPTZ,
    reply_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    bucket VARCHAR(50) DEFAULT 'public-media' NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    folder VARCHAR(50) DEFAULT 'general' NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
```

---

## 7. Indexes, Constraints & Deletion Rules Matrix

| Table | Foreign Key | Target Table | On Delete Action | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `id` | `auth.users(id)` | `CASCADE` | User account deletion removes associated core profile. |
| `member_details` | `profile_id` | `profiles(id)` | `CASCADE` | Direct 1:1 specialization clean up. |
| `alumni_profiles` | `profile_id` | `profiles(id)` | `CASCADE` | Direct 1:1 specialization clean up. |
| `book_loans` | `book_id` | `books(id)` | `RESTRICT` | Prevent deletion of books with historical loans. |
| `book_loans` | `book_copy_id` | `book_copies(id)` | `RESTRICT` | Prevent deletion of physical copy records with loan logs. |
| `book_loans` | `borrower_id` | `profiles(id)` | `RESTRICT` | Maintain loan audit trail even if user requests closure. |
| `donations` | `fund_id` | `donation_funds(id)` | `RESTRICT` | Financial funds with recorded contributions cannot be purged. |
| `donations` | `profile_id` | `profiles(id)` | `SET NULL` | Preserves financial ledger integrity if account is removed. |
| `audit_logs` | `user_id` | `profiles(id)` | `SET NULL` | Audit logs are immutable and never cascadingly deleted. |
