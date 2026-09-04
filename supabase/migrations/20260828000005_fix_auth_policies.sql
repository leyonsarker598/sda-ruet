-- ==============================================================================
-- SIRAJGANJ DISTRICT ASSOCIATION, RUET (SDA RUET)
-- Database Migration: 20260828000005_fix_auth_policies.sql
-- Description: Self-Healing Profile Trigger & Public Registration RLS Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SELF-HEALING USER REGISTRATION TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role VARCHAR(50);
    v_name VARCHAR(255);
    v_dept VARCHAR(100);
    v_series VARCHAR(10);
    v_session VARCHAR(20);
    v_student_id VARCHAR(50);
    v_phone VARCHAR(30);
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role_id', 'MEMBER');
    v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
    v_dept := NEW.raw_user_meta_data->>'department';
    v_series := NEW.raw_user_meta_data->>'series';
    v_session := NEW.raw_user_meta_data->>'session';
    v_student_id := NEW.raw_user_meta_data->>'student_id';
    v_phone := NEW.raw_user_meta_data->>'phone';

    -- Upsert profile record automatically when user signs up
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        role_id,
        status,
        department,
        series,
        session,
        student_id,
        privacy_settings
    ) VALUES (
        NEW.id,
        NEW.email,
        v_name,
        v_phone,
        v_role::user_role_type,
        'ACTIVE',
        v_dept,
        v_series,
        v_session,
        v_student_id,
        '{
            "phone": "PRIVATE",
            "email": "MEMBERS_ONLY",
            "blood_group": "PRIVATE",
            "student_id": "ADMIN_ONLY",
            "present_address": "PRIVATE",
            "permanent_address": "ADMIN_ONLY",
            "bio": "PUBLIC",
            "social_links": "PUBLIC"
        }'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        role_id = COALESCE(EXCLUDED.role_id, public.profiles.role_id),
        department = COALESCE(EXCLUDED.department, public.profiles.department),
        series = COALESCE(EXCLUDED.series, public.profiles.series),
        session = COALESCE(EXCLUDED.session, public.profiles.session),
        student_id = COALESCE(EXCLUDED.student_id, public.profiles.student_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. INSERT RLS POLICIES FOR USER SELF-PROVISIONING
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users Insert Own Profile" ON public.profiles;
CREATE POLICY "Users Insert Own Profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users Insert Own Member Details" ON public.member_details;
CREATE POLICY "Users Insert Own Member Details"
    ON public.member_details FOR INSERT
    WITH CHECK (profile_id = auth.uid() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users Insert Own Alumni Profile" ON public.alumni_profiles;
CREATE POLICY "Users Insert Own Alumni Profile"
    ON public.alumni_profiles FOR INSERT
    WITH CHECK (profile_id = auth.uid() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users Insert Own Alumni Application" ON public.alumni_applications;
CREATE POLICY "Users Insert Own Alumni Application"
    ON public.alumni_applications FOR INSERT
    WITH CHECK (profile_id = auth.uid() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Public Insert Donations" ON public.donations;
CREATE POLICY "Public Insert Donations"
    ON public.donations FOR INSERT
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public Insert Contact Messages" ON public.contact_messages;
CREATE POLICY "Public Insert Contact Messages"
    ON public.contact_messages FOR INSERT
    WITH CHECK (TRUE);
