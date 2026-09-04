-- ==============================================================================
-- SIRAJGANJ DISTRICT ASSOCIATION, RUET (SDA RUET)
-- Database Migration: 20260828000003_storage_buckets.sql
-- Description: Supabase Storage Buckets & Storage Row Level Security
-- ==============================================================================

-- 1. Create Public Media & Private Documents Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('public-media', 'public-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('private-documents', 'private-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS: Public Media Bucket
DROP POLICY IF EXISTS "Public Read Media" ON storage.objects;
CREATE POLICY "Public Read Media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'public-media');

DROP POLICY IF EXISTS "User Avatar Upload" ON storage.objects;
CREATE POLICY "User Avatar Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'public-media' 
        AND (storage.foldername(name))[1] = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[2]
    );

DROP POLICY IF EXISTS "Admin & Media Manager Upload" ON storage.objects;
CREATE POLICY "Admin & Media Manager Upload"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'public-media'
        AND public.current_user_has_permission('media.manage')
    );

-- 3. Storage RLS: Private Documents Bucket
DROP POLICY IF EXISTS "Private Document Read" ON storage.objects;
CREATE POLICY "Private Document Read"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'private-documents'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR public.current_user_has_permission('alumni.verify')
        )
    );

DROP POLICY IF EXISTS "Private Document Upload" ON storage.objects;
CREATE POLICY "Private Document Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'private-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
