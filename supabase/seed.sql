-- ==============================================================================
-- SIRAJGANJ DISTRICT ASSOCIATION, RUET (SDA RUET)
-- Seed Data: supabase/seed.sql
-- Description: Sanitized Development Demo Seed Data
-- ==============================================================================

-- 1. SEED ROLES
INSERT INTO public.roles (id, name, description)
VALUES
    ('ADMIN', 'Administrator', 'Full unrestricted administrative access across all systems and settings'),
    ('MEMBER', 'Student Member', 'Current RUET undergraduate or graduate student from Sirajganj District'),
    ('ALUMNI', 'Alumnus / Alumna', 'RUET graduate from Sirajganj District'),
    ('TEACHER', 'Faculty Member', 'Faculty member of RUET from Sirajganj District'),
    ('LIBRARIAN', 'Librarian', 'Full operational authority over digital library catalog, circulation desk, loan returns, and book donations')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. SEED GRANULAR PERMISSIONS CATALOG
INSERT INTO public.permissions (id, module, description)
VALUES
    -- Users & Auth
    ('users.view', 'users', 'View complete user accounts and profiles'),
    ('users.create', 'users', 'Create and invite new user accounts'),
    ('users.update', 'users', 'Update user profiles and account statuses'),
    ('users.delete', 'users', 'Suspend or delete user accounts'),
    ('users.manage_roles', 'users', 'Assign roles and delegate granular permissions'),
    -- Alumni
    ('alumni.view_public', 'alumni', 'View public verified alumni profiles'),
    ('alumni.view_directory', 'alumni', 'Search complete alumni directory with member visibility'),
    ('alumni.verify', 'alumni', 'Approve, reject, or request corrections on alumni applications'),
    ('alumni.manage', 'alumni', 'Edit and manage alumni profile directory listings'),
    -- Committee
    ('committee.view', 'committee', 'View current and historical executive committees'),
    ('committee.manage', 'committee', 'Manage committee terms, positions, and rosters'),
    -- Digital Library
    ('library.view', 'library', 'Browse digital catalog and availability'),
    ('library.reserve', 'library', 'Reserve available books'),
    ('library.manage_catalog', 'library', 'Add, edit, archive books and categories'),
    ('library.issue_book', 'library', 'Issue book copies to members (Circulation Desk)'),
    ('library.return_book', 'library', 'Process returned copies, conditions, and fines'),
    ('library.manage_donations', 'library', 'Review, accept, and catalog donated books'),
    ('library.manage_settings', 'library', 'Configure loan duration and overdue fine rates'),
    -- Activities & Blog
    ('activities.view', 'activities', 'View published activities and blog posts'),
    ('activities.manage', 'activities', 'Create, edit, draft, publish, and delete activities'),
    -- Events
    ('events.view', 'events', 'View upcoming and completed events'),
    ('events.register', 'events', 'Register personal attendance for events'),
    ('events.manage', 'events', 'Create events and manage attendee rosters'),
    -- Donations
    ('donations.create', 'donations', 'Submit financial contributions'),
    ('donations.view_all', 'donations', 'View complete financial donation ledger'),
    ('donations.manage', 'donations', 'Verify transactions and manage fund campaigns'),
    -- Communications & CMS
    ('announcements.view', 'announcements', 'View announcements'),
    ('announcements.manage', 'announcements', 'Publish and broadcast targeted announcements'),
    ('messages.manage', 'messages', 'Manage contact inbox messages and replies'),
    ('cms.manage', 'cms', 'Edit dynamic website copy and pages'),
    ('media.manage', 'media', 'Upload, organize, and delete storage files'),
    ('settings.manage', 'settings', 'Manage global association settings and social links'),
    ('audit.view', 'audit', 'View forensic audit logs and security trail')
ON CONFLICT (id) DO UPDATE SET module = EXCLUDED.module, description = EXCLUDED.description;

-- 3. SEED ROLE-PERMISSION MAPPINGS
-- Admin has all permissions (handled via short-circuit in auth.user_has_permission)
-- Member Default Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('MEMBER', 'alumni.view_public'),
    ('MEMBER', 'alumni.view_directory'),
    ('MEMBER', 'committee.view'),
    ('MEMBER', 'library.view'),
    ('MEMBER', 'library.reserve'),
    ('MEMBER', 'activities.view'),
    ('MEMBER', 'events.view'),
    ('MEMBER', 'events.register'),
    ('MEMBER', 'donations.create'),
    ('MEMBER', 'announcements.view')
ON CONFLICT DO NOTHING;

-- Alumni Default Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('ALUMNI', 'alumni.view_public'),
    ('ALUMNI', 'alumni.view_directory'),
    ('ALUMNI', 'committee.view'),
    ('ALUMNI', 'library.view'),
    ('ALUMNI', 'library.reserve'),
    ('ALUMNI', 'activities.view'),
    ('ALUMNI', 'events.view'),
    ('ALUMNI', 'events.register'),
    ('ALUMNI', 'donations.create'),
    ('ALUMNI', 'announcements.view')
ON CONFLICT DO NOTHING;

-- Teacher Default Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('TEACHER', 'alumni.view_public'),
    ('TEACHER', 'alumni.view_directory'),
    ('TEACHER', 'committee.view'),
    ('TEACHER', 'library.view'),
    ('TEACHER', 'activities.view'),
    ('TEACHER', 'events.view'),
    ('TEACHER', 'donations.create'),
    ('TEACHER', 'announcements.view')
ON CONFLICT DO NOTHING;

-- Librarian Default Permissions
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    ('LIBRARIAN', 'library.view'),
    ('LIBRARIAN', 'library.reserve'),
    ('LIBRARIAN', 'library.manage_catalog'),
    ('LIBRARIAN', 'library.issue_book'),
    ('LIBRARIAN', 'library.return_book'),
    ('LIBRARIAN', 'library.manage_donations'),
    ('LIBRARIAN', 'library.manage_settings'),
    ('LIBRARIAN', 'announcements.view'),
    ('LIBRARIAN', 'committee.view'),
    ('LIBRARIAN', 'activities.view'),
    ('LIBRARIAN', 'events.view')
ON CONFLICT DO NOTHING;

-- 4. SEED COMMITTEE POSITIONS HIERARCHY
INSERT INTO public.committee_positions (id, title, hierarchy_order)
VALUES
    ('president', 'President', 1),
    ('vice_president', 'Vice President', 2),
    ('general_secretary', 'General Secretary', 3),
    ('joint_secretary', 'Joint Secretary', 4),
    ('treasurer', 'Treasurer', 5),
    ('organizing_secretary', 'Organizing Secretary', 6),
    ('office_secretary', 'Office Secretary', 7),
    ('publicity_secretary', 'Publicity Secretary', 8),
    ('it_media_secretary', 'IT & Media Secretary', 9),
    ('cultural_secretary', 'Cultural Secretary', 10),
    ('sports_secretary', 'Sports Secretary', 11),
    ('library_secretary', 'Library Secretary', 12),
    ('executive_member', 'Executive Member', 13)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, hierarchy_order = EXCLUDED.hierarchy_order;

-- 5. SEED BOOK CATEGORIES
INSERT INTO public.book_categories (name, slug, description, display_order)
VALUES
    ('Computer Science & Engineering', 'cse', 'Programming, Algorithms, Data Structures, AI, and Software Architecture', 1),
    ('Electrical & Electronic Engineering', 'eee', 'Circuits, Power Systems, Telecommunications, and Electronics', 2),
    ('Civil Engineering', 'ce', 'Structural Analysis, Transportation, Geotechnical, and Fluid Mechanics', 3),
    ('Mechanical Engineering', 'me', 'Thermodynamics, Fluid Dynamics, Mechanics, and Robotics', 4),
    ('Mathematics & Physics', 'math-physics', 'Calculus, Linear Algebra, Differential Equations, and Modern Physics', 5),
    ('Literature & History', 'literature-history', 'Bengali Literature, World Classics, History of Bangladesh, and Heritage', 6),
    ('Career & Higher Studies', 'career', 'GRE, IELTS, BCS, Job Preparation, and Research Mentorship', 7)
ON CONFLICT (slug) DO NOTHING;

-- 6. SEED DONATION FUNDS
INSERT INTO public.donation_funds (name, description, target_amount, is_active)
VALUES
    ('General Welfare Fund', 'General fund supporting association operations, freshers reception, and farewell programs.', 100000.00, true),
    ('Digital Library Development', 'Fund dedicated to purchasing academic textbooks, reference materials, and digital library tools.', 50000.00, true),
    ('Student Emergency Relief', 'Emergency humanitarian support for students facing medical emergencies or severe distress.', 150000.00, true),
    ('Annual Picnic & Reunion', 'Sponsorship fund for organizing the annual Sirajganj District picnic and alumni reunion.', 80000.00, true)
ON CONFLICT (name) DO NOTHING;

-- 7. SEED ACTIVITY CATEGORIES
INSERT INTO public.activity_categories (name, slug, description)
VALUES
    ('Academic & Freshers', 'academic-freshers', 'Fresher receptions, orientation, and academic seminars'),
    ('Sports & Tournaments', 'sports', 'Football tournaments (SDAR Cup), cricket matches, and indoor games'),
    ('Cultural & Social', 'cultural', 'National day observances (14 Dec, 16 Dec, 21 Feb), BBQ nights, and picnics'),
    ('Voluntary & Humanitarian', 'voluntary', 'Blood donation camps, winter relief distribution, and community service'),
    ('Alumni & Reunions', 'alumni-reunions', 'Annual general meetings (AGM), networking, and farewell programs')
ON CONFLICT (slug) DO NOTHING;

-- 8. SEED DEFAULT SITE SETTINGS
INSERT INTO public.site_settings (key, value, description)
VALUES
    ('general', '{
        "site_name": "Sirajganj District Association, RUET",
        "short_name": "SDA RUET",
        "tagline": "Connecting Sirajganj, Empowering RUET",
        "motto": "Take a Stand & Hold a Hand",
        "email": "sda.ruet@gmail.com",
        "phone": "+880 1700-000000",
        "address": "Rajshahi University of Engineering & Technology (RUET), Kazla, Rajshahi-6204, Bangladesh",
        "social_links": {
            "facebook": "https://facebook.com/sdaruet",
            "linkedin": "https://linkedin.com/company/sdaruet",
            "youtube": "https://youtube.com/@sdaruet"
        }
    }'::jsonb, 'Global Organization Configuration'),
    ('library', '{
        "max_books_per_member": 2,
        "max_books_per_alumni": 1,
        "default_loan_days": 14,
        "max_renewals": 1,
        "fine_per_day": 2.00,
        "reservation_valid_hours": 48
    }'::jsonb, 'Circulation & Loan Rules Configuration')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 9. SEED DEFAULT CMS PAGES
INSERT INTO public.cms_pages (slug, title, content)
VALUES
    ('about', 'About Sirajganj District Association, RUET', '{
        "mission": "To foster unity, leadership, mentorship, and brotherhood among the students, alumni, and faculty of RUET hailing from Sirajganj District.",
        "vision": "A vibrant, empowered, and mutually supportive academic and professional network driving excellence in engineering, leadership, and social development.",
        "history": "Sirajganj District Association, RUET has been serving the student community for decades, organizing annual receptions, sports tournaments, study sessions, and voluntary humanitarian drives."
    }'::jsonb),
    ('terms', 'Terms of Service & Library Code of Conduct', '{
        "library_rules": "Borrowers must return books by the due date in good physical condition. Fines apply for overdue or damaged items.",
        "membership_terms": "Members agree to respect the values of camaraderie, integrity, and mutual respect."
    }'::jsonb)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
