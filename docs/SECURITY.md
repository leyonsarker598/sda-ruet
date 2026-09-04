# SDA RUET - Comprehensive Security, Privacy & Compliance Architecture
**Document Version:** 2.0.0  
**Security Posture:** Defense-in-Depth (Client Validation + Server-Side Authorization + Database RLS + Storage Policies)

---

## 1. Initial Administrator Bootstrap & Access Security

### 1.1 Prevention of Public Admin Signups
Under no circumstances is an administrative account creatable via public registration forms (`/register` or `/register/alumni`). All public signups default strictly to `MEMBER` or `ALUMNI` roles with standard unprivileged permissions.

### 1.2 Secure Bootstrap Procedures
To establish the initial Super Administrator during environment setup, choose one of the following two secure methods:

#### Method A: Supabase SQL Console Bootstrap (Recommended for Initial Setup)
```sql
-- 1. Create User in Supabase Auth (or sign up once through the UI)
-- 2. Execute SQL in Supabase Dashboard SQL Editor:
UPDATE public.profiles
SET role_id = 'ADMIN',
    status = 'ACTIVE'
WHERE email = 'admin@sda-ruet.org';

-- Verify effective permissions
SELECT auth.user_has_permission(
    (SELECT id FROM public.profiles WHERE email = 'admin@sda-ruet.org'),
    'users.manage_roles'
); -- Returns TRUE
```

#### Method B: Secured Node.js Bootstrap CLI Script
A dedicated bootstrap script (`scripts/bootstrap-admin.ts`) executable only with server-side `SUPABASE_SERVICE_ROLE_KEY`:
```bash
# Execute securely from server environment
npx tsx scripts/bootstrap-admin.ts --email "admin@sda-ruet.org" --name "Executive Administrator"
```

---

## 2. Field-Level Privacy Matrix

Users maintain fine-grained visibility control over their profile fields.

### 2.1 Privacy Tiers
1. `PUBLIC`: Visible to all internet visitors (including unauthenticated guests).
2. `MEMBERS_ONLY`: Visible only to logged-in, active members, alumni, and teachers.
3. `PRIVATE`: Visible strictly to the profile owner and system administrators.
4. `ADMIN_ONLY`: Strictly restricted to system administrators (e.g. Student ID, verification docs, internal notes).

### 2.2 Profile Field Privacy Mapping

| Profile Field | Default Level | User Configurable? | Visibility Rule |
| :--- | :--- | :--- | :--- |
| Full Name | `PUBLIC` | No | Always public for verified profiles. |
| Profile Avatar | `PUBLIC` | Yes (`PUBLIC` / `MEMBERS_ONLY`) | Displayed on directory and committee. |
| Department & Series | `PUBLIC` | No | Core academic identity. |
| Session & Batch | `PUBLIC` | No | Core academic identity. |
| Email Address | `MEMBERS_ONLY`| Yes (`PUBLIC` / `MEMBERS_ONLY` / `PRIVATE`) | Default protected from public scraping. |
| Phone Number | `PRIVATE` | Yes (`MEMBERS_ONLY` / `PRIVATE`) | Sensitive contact; hidden by default. |
| Blood Group | `PRIVATE` | Yes (`MEMBERS_ONLY` / `PRIVATE`) | Private by default; opt-in for emergency blood donor lists. |
| Student ID | `ADMIN_ONLY` | No | Internal RUET verification credential. |
| Present Address | `PRIVATE` | Yes (`MEMBERS_ONLY` / `PRIVATE`) | Sensitive location data. |
| Permanent Address | `ADMIN_ONLY` | No | Kept internal for association records. |
| Profession / Company | `PUBLIC` | Yes (`PUBLIC` / `MEMBERS_ONLY`) | Career networking info. |
| LinkedIn / Socials | `PUBLIC` | Yes (`PUBLIC` / `MEMBERS_ONLY` / `PRIVATE`) | Public links. |
| Bio & Achievements | `PUBLIC` | Yes (`PUBLIC` / `MEMBERS_ONLY`) | Public summary. |

### 2.3 Unapproved Alumni Protection
Unapproved alumni applicants (`verification_status != 'VERIFIED'`) are **strictly excluded** from:
- Public Alumni Directory (`/alumni`)
- Global Search APIs
- CSV Directory Exports
- Any public-facing UI components

---

## 3. Supabase Storage Security & Bucket Policies

Storage is split into two distinct buckets with tailored Row Level Security:

### 3.1 Public Media Bucket (`public-media`)
- **Use Cases**: Public book covers, activity photos, committee member images, public avatars.
- **Read Access**: Unrestricted public access via CDN.
- **Write Access**:
  - Authenticated users can upload their own profile avatar (`/avatars/{user_id}/*`).
  - Users with `media.manage` or `activities.manage` can upload to `/activities/*`, `/books/*`, and `/committee/*`.

```sql
-- Storage RLS: Public Read
CREATE POLICY "Public Read Media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'public-media');

-- Storage RLS: Authenticated User Avatar Upload
CREATE POLICY "User Avatar Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'public-media' 
        AND (storage.foldername(name))[1] = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[2]
    );

-- Storage RLS: Admin / Media Manager Upload
CREATE POLICY "Admin Media Upload"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'public-media'
        AND auth.current_user_has_permission('media.manage')
    );
```

### 3.2 Private Documents Bucket (`private-documents`)
- **Use Cases**: Alumni verification certificates, student ID scans, financial transaction proofs.
- **Read Access**: Strictly restricted to the uploading user and system administrators.
- **Write Access**: Authenticated applicant uploading verification documents.

```sql
-- Storage RLS: Private Document Read (Owner or Admin)
CREATE POLICY "Private Document Read"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'private-documents'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR auth.current_user_has_permission('alumni.verify')
        )
    );

-- Storage RLS: Private Document Upload
CREATE POLICY "Private Document Upload"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'private-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

---

## 4. Threat Mitigations & Data Integrity

### 4.1 Injection & XSS Protection
- **SQL Injection**: Prevented by parameterized queries in Supabase client and PostgreSQL PL/pgSQL stored procedures.
- **Cross-Site Scripting (XSS)**: All rich text rendered from activity/announcement content is sanitized using `DOMPurify` / `sanitize-html` with a strict allowed-tag whitelist.

### 4.2 File Upload Validation
Server actions validate all uploads before storage ingestion:
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- **Max File Size**: 5MB for images, 10MB for documents.
- **Sanitized Filenames**: Random UUIDs assigned to prevent path traversal attacks.

### 4.3 Rate Limiting & Anti-Abuse
Public forms (`/contact`, `/donate`, `/library/donate`, `/newsletter`) implement IP-based and token-based rate limiting to prevent spam floods.

---

## 5. Tamper-Evident Audit Logging

All sensitive administrative and data mutation events automatically record an immutable audit entry in `public.audit_logs`:

### Logged Operations:
- User role modification & granular permission grants/revocations
- Alumni application approvals, rejections, and correction requests
- Library book issuances, returns, renewals, and catalog deletions
- Financial transaction status changes (Pending $\rightarrow$ Verified)
- Committee structure modifications and member reordering
- System settings and dynamic CMS content changes
- Account suspension and reactivation

### Audit Log Schema Structure:
```sql
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
Audit logs cannot be updated or deleted by regular users or administrators, preserving forensic integrity.
