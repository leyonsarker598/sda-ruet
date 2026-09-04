-- ==============================================================================
-- SIRAJGANJ DISTRICT ASSOCIATION, RUET (SDA RUET)
-- Database Migration: 20260828000002_rbac_policies.sql
-- Description: Non-Recursive RBAC Functions & Row Level Security (RLS) Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURITY DEFINER PERMISSION EVALUATION HELPERS (Non-Recursive)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_user_id UUID,
    p_permission_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_role_id VARCHAR(50);
    v_explicit_grant BOOLEAN;
    v_has_role_permission BOOLEAN := FALSE;
BEGIN
    IF p_user_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Fetch user role directly (bypassing RLS internally)
    SELECT role_id INTO v_role_id
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_role_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- ADMIN always has all permissions
    IF v_role_id = 'ADMIN' THEN
        RETURN TRUE;
    END IF;

    -- Check explicit user-specific override
    SELECT is_granted INTO v_explicit_grant
    FROM public.user_permissions
    WHERE user_id = p_user_id AND permission_id = p_permission_id;

    IF v_explicit_grant IS NOT NULL THEN
        RETURN v_explicit_grant;
    END IF;

    -- Check role-inherited permission
    SELECT EXISTS (
        SELECT 1
        FROM public.role_permissions
        WHERE role_id = v_role_id AND permission_id = p_permission_id
    ) INTO v_has_role_permission;

    RETURN v_has_role_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_has_permission(p_permission_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.user_has_permission(auth.uid(), p_permission_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY ON ALL PUBLIC TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. PROFILES & ROLES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Active Profiles" ON public.profiles;
CREATE POLICY "Public Read Active Profiles"
    ON public.profiles FOR SELECT
    USING (status = 'ACTIVE' OR id = auth.uid() OR public.current_user_has_permission('users.view'));

DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
CREATE POLICY "Users Update Own Profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admin Manage All Profiles" ON public.profiles;
CREATE POLICY "Admin Manage All Profiles"
    ON public.profiles FOR ALL
    USING (public.current_user_has_permission('users.update'));

DROP POLICY IF EXISTS "Public Read Roles & Permissions" ON public.roles;
CREATE POLICY "Public Read Roles & Permissions"
    ON public.roles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public Read Permissions" ON public.permissions;
CREATE POLICY "Public Read Permissions"
    ON public.permissions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public Read Role Permissions" ON public.role_permissions;
CREATE POLICY "Public Read Role Permissions"
    ON public.role_permissions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Manage Permissions" ON public.user_permissions;
CREATE POLICY "Manage Permissions"
    ON public.user_permissions FOR ALL
    USING (public.current_user_has_permission('users.manage_roles'));

-- ------------------------------------------------------------------------------
-- 4. ALUMNI & VERIFICATION POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Verified Alumni Profiles" ON public.alumni_profiles;
CREATE POLICY "Public Read Verified Alumni Profiles"
    ON public.alumni_profiles FOR SELECT
    USING (verification_status = 'VERIFIED' OR profile_id = auth.uid() OR public.current_user_has_permission('alumni.manage'));

DROP POLICY IF EXISTS "Alumni Update Own Profile" ON public.alumni_profiles;
CREATE POLICY "Alumni Update Own Profile"
    ON public.alumni_profiles FOR UPDATE
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admin Manage Alumni Profiles" ON public.alumni_profiles;
CREATE POLICY "Admin Manage Alumni Profiles"
    ON public.alumni_profiles FOR ALL
    USING (public.current_user_has_permission('alumni.manage'));

DROP POLICY IF EXISTS "Applicant Read Own Applications" ON public.alumni_applications;
CREATE POLICY "Applicant Read Own Applications"
    ON public.alumni_applications FOR SELECT
    USING (profile_id = auth.uid() OR public.current_user_has_permission('alumni.verify'));

DROP POLICY IF EXISTS "Applicant Create Application" ON public.alumni_applications;
CREATE POLICY "Applicant Create Application"
    ON public.alumni_applications FOR INSERT
    WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admin Manage Applications" ON public.alumni_applications;
CREATE POLICY "Admin Manage Applications"
    ON public.alumni_applications FOR ALL
    USING (public.current_user_has_permission('alumni.verify'));

-- ------------------------------------------------------------------------------
-- 5. COMMITTEES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Committees" ON public.committees;
CREATE POLICY "Public Read Committees"
    ON public.committees FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin Manage Committees" ON public.committees;
CREATE POLICY "Admin Manage Committees"
    ON public.committees FOR ALL
    USING (public.current_user_has_permission('committee.manage'));

DROP POLICY IF EXISTS "Public Read Committee Positions" ON public.committee_positions;
CREATE POLICY "Public Read Committee Positions"
    ON public.committee_positions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public Read Committee Members" ON public.committee_members;
CREATE POLICY "Public Read Committee Members"
    ON public.committee_members FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin Manage Committee Members" ON public.committee_members;
CREATE POLICY "Admin Manage Committee Members"
    ON public.committee_members FOR ALL
    USING (public.current_user_has_permission('committee.manage'));

-- ------------------------------------------------------------------------------
-- 6. DIGITAL LIBRARY POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Book Categories" ON public.book_categories;
CREATE POLICY "Public Read Book Categories"
    ON public.book_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin Manage Book Categories" ON public.book_categories;
CREATE POLICY "Admin Manage Book Categories"
    ON public.book_categories FOR ALL
    USING (public.current_user_has_permission('library.manage_catalog'));

DROP POLICY IF EXISTS "Public Read Books" ON public.books;
CREATE POLICY "Public Read Books"
    ON public.books FOR SELECT
    USING (status != 'ARCHIVED' OR public.current_user_has_permission('library.manage_catalog'));

DROP POLICY IF EXISTS "Librarian Manage Books" ON public.books;
CREATE POLICY "Librarian Manage Books"
    ON public.books FOR ALL
    USING (public.current_user_has_permission('library.manage_catalog'));

DROP POLICY IF EXISTS "Public Read Book Copies" ON public.book_copies;
CREATE POLICY "Public Read Book Copies"
    ON public.book_copies FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Librarian Manage Book Copies" ON public.book_copies;
CREATE POLICY "Librarian Manage Book Copies"
    ON public.book_copies FOR ALL
    USING (public.current_user_has_permission('library.manage_catalog'));

DROP POLICY IF EXISTS "Borrower Read Own Loans" ON public.book_loans;
CREATE POLICY "Borrower Read Own Loans"
    ON public.book_loans FOR SELECT
    USING (borrower_id = auth.uid() OR public.current_user_has_permission('library.issue_book'));

DROP POLICY IF EXISTS "Librarian Manage Loans" ON public.book_loans;
CREATE POLICY "Librarian Manage Loans"
    ON public.book_loans FOR ALL
    USING (public.current_user_has_permission('library.issue_book'));

DROP POLICY IF EXISTS "User Manage Own Reservations" ON public.book_reservations;
CREATE POLICY "User Manage Own Reservations"
    ON public.book_reservations FOR ALL
    USING (user_id = auth.uid() OR public.current_user_has_permission('library.issue_book'));

DROP POLICY IF EXISTS "Public Submit Book Donation" ON public.book_donations;
CREATE POLICY "Public Submit Book Donation"
    ON public.book_donations FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Donor View Own Donations" ON public.book_donations;
CREATE POLICY "Donor View Own Donations"
    ON public.book_donations FOR SELECT
    USING (donor_id = auth.uid() OR is_public_donor = TRUE OR public.current_user_has_permission('library.manage_donations'));

DROP POLICY IF EXISTS "Librarian Manage Donations" ON public.book_donations;
CREATE POLICY "Librarian Manage Donations"
    ON public.book_donations FOR ALL
    USING (public.current_user_has_permission('library.manage_donations'));

DROP POLICY IF EXISTS "Public Read Library Settings" ON public.library_settings;
CREATE POLICY "Public Read Library Settings"
    ON public.library_settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin Manage Library Settings" ON public.library_settings;
CREATE POLICY "Admin Manage Library Settings"
    ON public.library_settings FOR ALL
    USING (public.current_user_has_permission('library.manage_settings'));

-- ------------------------------------------------------------------------------
-- 7. ACTIVITIES, EVENTS & DONATIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Activity Categories" ON public.activity_categories;
CREATE POLICY "Public Read Activity Categories"
    ON public.activity_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public Read Published Activities" ON public.activities;
CREATE POLICY "Public Read Published Activities"
    ON public.activities FOR SELECT
    USING (is_published = TRUE OR author_id = auth.uid() OR public.current_user_has_permission('activities.manage'));

DROP POLICY IF EXISTS "Author & Admin Manage Activities" ON public.activities;
CREATE POLICY "Author & Admin Manage Activities"
    ON public.activities FOR ALL
    USING (author_id = auth.uid() OR public.current_user_has_permission('activities.manage'));

DROP POLICY IF EXISTS "Public Read Activity Images" ON public.activity_images;
CREATE POLICY "Public Read Activity Images"
    ON public.activity_images FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin Manage Activity Images" ON public.activity_images;
CREATE POLICY "Admin Manage Activity Images"
    ON public.activity_images FOR ALL
    USING (public.current_user_has_permission('activities.manage'));

DROP POLICY IF EXISTS "Public Read Events" ON public.events;
CREATE POLICY "Public Read Events"
    ON public.events FOR SELECT
    USING (status != 'DRAFT' OR public.current_user_has_permission('events.manage'));

DROP POLICY IF EXISTS "Admin Manage Events" ON public.events;
CREATE POLICY "Admin Manage Events"
    ON public.events FOR ALL
    USING (public.current_user_has_permission('events.manage'));

DROP POLICY IF EXISTS "User Manage Own Event Registrations" ON public.event_registrations;
CREATE POLICY "User Manage Own Event Registrations"
    ON public.event_registrations FOR ALL
    USING (user_id = auth.uid() OR public.current_user_has_permission('events.manage'));

DROP POLICY IF EXISTS "Public Read Donation Funds" ON public.donation_funds;
CREATE POLICY "Public Read Donation Funds"
    ON public.donation_funds FOR SELECT
    USING (is_active = TRUE OR public.current_user_has_permission('donations.manage'));

DROP POLICY IF EXISTS "Public Create Donations" ON public.donations;
CREATE POLICY "Public Create Donations"
    ON public.donations FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Donor & Admin View Donations" ON public.donations;
CREATE POLICY "Donor & Admin View Donations"
    ON public.donations FOR SELECT
    USING (profile_id = auth.uid() OR (is_anonymous = FALSE AND status = 'VERIFIED') OR public.current_user_has_permission('donations.manage'));

DROP POLICY IF EXISTS "Admin Manage Donations" ON public.donations;
CREATE POLICY "Admin Manage Donations"
    ON public.donations FOR ALL
    USING (public.current_user_has_permission('donations.manage'));

-- ------------------------------------------------------------------------------
-- 8. COMMUNICATIONS, CMS & AUDIT POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Active Announcements" ON public.announcements;
CREATE POLICY "Public Read Active Announcements"
    ON public.announcements FOR SELECT
    USING (is_active = TRUE OR public.current_user_has_permission('announcements.manage'));

DROP POLICY IF EXISTS "Admin Manage Announcements" ON public.announcements;
CREATE POLICY "Admin Manage Announcements"
    ON public.announcements FOR ALL
    USING (public.current_user_has_permission('announcements.manage'));

DROP POLICY IF EXISTS "User Read Own Notifications" ON public.notifications;
CREATE POLICY "User Read Own Notifications"
    ON public.notifications FOR ALL
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Public Submit Contact Message" ON public.contact_messages;
CREATE POLICY "Public Submit Contact Message"
    ON public.contact_messages FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admin Manage Contact Messages" ON public.contact_messages;
CREATE POLICY "Admin Manage Contact Messages"
    ON public.contact_messages FOR ALL
    USING (public.current_user_has_permission('messages.manage'));

DROP POLICY IF EXISTS "Public Subscribe Newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public Subscribe Newsletter"
    ON public.newsletter_subscribers FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admin Manage Subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admin Manage Subscribers"
    ON public.newsletter_subscribers FOR ALL
    USING (public.current_user_has_permission('settings.manage'));

DROP POLICY IF EXISTS "Public Read Site Settings" ON public.site_settings;
CREATE POLICY "Public Read Site Settings"
    ON public.site_settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin Manage Site Settings" ON public.site_settings;
CREATE POLICY "Admin Manage Site Settings"
    ON public.site_settings FOR ALL
    USING (public.current_user_has_permission('settings.manage'));

DROP POLICY IF EXISTS "Public Read CMS Pages" ON public.cms_pages;
CREATE POLICY "Public Read CMS Pages"
    ON public.cms_pages FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin Manage CMS Pages" ON public.cms_pages;
CREATE POLICY "Admin Manage CMS Pages"
    ON public.cms_pages FOR ALL
    USING (public.current_user_has_permission('cms.manage'));

DROP POLICY IF EXISTS "Public Read Media Files" ON public.media_files;
CREATE POLICY "Public Read Media Files"
    ON public.media_files FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin Manage Media Files" ON public.media_files;
CREATE POLICY "Admin Manage Media Files"
    ON public.media_files FOR ALL
    USING (public.current_user_has_permission('media.manage'));

DROP POLICY IF EXISTS "Admin Read Audit Logs" ON public.audit_logs;
CREATE POLICY "Admin Read Audit Logs"
    ON public.audit_logs FOR SELECT
    USING (public.current_user_has_permission('audit.view'));
