-- ==============================================================================
-- SIRAJGANJ DISTRICT ASSOCIATION, RUET (SDA RUET)
-- Database Migration: 20260828000001_initial_schema.sql
-- Description: Core Schema, Enums, Tables, Foreign Keys, Indexes & Constraints
-- ==============================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('ADMIN', 'MEMBER', 'ALUMNI', 'TEACHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE account_status_type AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status_type AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'CORRECTION_REQUESTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE visibility_type AS ENUM ('PUBLIC', 'MEMBERS_ONLY', 'PRIVATE', 'ADMIN_ONLY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE book_status_type AS ENUM ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE copy_condition_type AS ENUM ('NEW', 'GOOD', 'FAIR', 'DAMAGED', 'LOST');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE loan_status_type AS ENUM ('ISSUED', 'RETURNED', 'OVERDUE', 'LOST', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE donation_status_type AS ENUM ('PENDING', 'RECEIVED', 'ACCEPTED', 'REJECTED', 'CATALOGUED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'FAILED', 'REFUNDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE event_status_type AS ENUM ('DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE announcement_priority_type AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 2. RBAC & PERMISSION CATALOG TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id VARCHAR(100) PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id VARCHAR(50) REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ------------------------------------------------------------------------------
-- 3. PROFILES & USER EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    avatar_url TEXT,
    role_id VARCHAR(50) NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT DEFAULT 'MEMBER',
    status account_status_type DEFAULT 'ACTIVE' NOT NULL,
    department VARCHAR(100),
    series VARCHAR(10),       -- e.g. '18', '19', '20', '21', '22', '23', '24'
    session VARCHAR(20),      -- e.g. '2019-2020'
    student_id VARCHAR(30),
    blood_group VARCHAR(10),
    present_address TEXT,
    permanent_address TEXT,
    bio TEXT,
    social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
    privacy_settings JSONB DEFAULT '{
        "phone": "PRIVATE",
        "email": "MEMBERS_ONLY",
        "blood_group": "PRIVATE",
        "student_id": "ADMIN_ONLY",
        "present_address": "PRIVATE",
        "permanent_address": "ADMIN_ONLY",
        "bio": "PUBLIC",
        "social_links": "PUBLIC"
    }'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES public.permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN DEFAULT TRUE NOT NULL,
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    PRIMARY KEY (user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.member_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    hall VARCHAR(100),
    current_semester VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.alumni_profiles (
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

CREATE TABLE IF NOT EXISTS public.alumni_applications (
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

CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    office_location VARCHAR(200),
    research_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. EXECUTIVE COMMITTEES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_name VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE NOT NULL,
    banner_image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.committee_positions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    hierarchy_order INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS public.committee_members (
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

-- ------------------------------------------------------------------------------
-- 5. DIGITAL LIBRARY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.book_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.books (
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
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.book_donations (
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

CREATE TABLE IF NOT EXISTS public.book_copies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    copy_code VARCHAR(50) NOT NULL UNIQUE,
    condition copy_condition_type DEFAULT 'GOOD' NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    acquisition_type VARCHAR(50) DEFAULT 'PURCHASE' NOT NULL,
    donation_id UUID REFERENCES public.book_donations(id) ON DELETE SET NULL,
    donor_name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.book_loans (
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

CREATE TABLE IF NOT EXISTS public.book_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.library_settings (
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

-- ------------------------------------------------------------------------------
-- 6. ACTIVITIES, BLOG & EVENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.activities (
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
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.activity_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.events (
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

CREATE TABLE IF NOT EXISTS public.event_registrations (
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

-- ------------------------------------------------------------------------------
-- 7. FINANCIAL DONATIONS & FUNDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donation_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    target_amount NUMERIC(12,2) CHECK (target_amount >= 0),
    raised_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (raised_amount >= 0),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID NOT NULL REFERENCES public.donation_funds(id) ON DELETE RESTRICT,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donor_name VARCHAR(150) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(30),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'BDT' NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
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

-- ------------------------------------------------------------------------------
-- 8. COMMUNICATIONS, CMS, MEDIA & FORENSIC AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
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

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
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

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.media_files (
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

CREATE TABLE IF NOT EXISTS public.audit_logs (
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

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES & CONSTRAINTS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role_id, status);
CREATE INDEX IF NOT EXISTS idx_alumni_search ON public.alumni_profiles(graduation_year, current_city, verification_status);
CREATE INDEX IF NOT EXISTS idx_book_loans_active ON public.book_loans(borrower_id, status) WHERE status IN ('ISSUED', 'OVERDUE');
CREATE INDEX IF NOT EXISTS idx_events_timeline ON public.events(event_date, status);
CREATE INDEX IF NOT EXISTS idx_donations_ledger ON public.donations(fund_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_audit_timeline ON public.audit_logs(created_at DESC);
