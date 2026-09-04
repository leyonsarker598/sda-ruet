# SDA RUET - Role-Based Access Control (RBAC) & Permission Architecture
**Document Version:** 2.0.0  
**Model:** Dynamic Hybrid RBAC (Primary Role Inherited Permissions + User Granular Grants/Denials)

---

## 1. Core Principles & Role Hierarchy

SDA RUET implements a **strict 4-role hierarchy** coupled with **granular permissions**. Users hold one primary role, but administrators can delegate module capabilities (e.g., appointing a Member as a **Librarian**) through individual permission grants without mutating their identity role.

```
+------------------------------------------------------------------------------------+
|                                    PRIMARY ROLES                                   |
|                                                                                    |
|  [ADMIN]    : Full unrestricted access across all system entities & settings.      |
|  [MEMBER]   : Verified current RUET students from Sirajganj District.             |
|  [ALUMNI]   : Verified RUET graduates from Sirajganj District.                    |
|  [TEACHER]  : Faculty members of RUET from Sirajganj District.                     |
+------------------------------------------------------------------------------------+
```

---

## 2. Granular Permission Catalog

```
+----------------------+-----------------------------+--------------------------------------------------------+
| MODULE               | PERMISSION IDENTIFIER       | DESCRIPTION                                            |
+----------------------+-----------------------------+--------------------------------------------------------+
| Users & RBAC         | users.view                  | View complete user accounts list                       |
|                      | users.create                | Create and invite new accounts                         |
|                      | users.update                | Modify user profiles & account statuses                |
|                      | users.delete                | Deactivate/delete user accounts                        |
|                      | users.manage_roles          | Assign roles & grant/revoke granular permissions       |
+----------------------+-----------------------------+--------------------------------------------------------+
| Alumni Network       | alumni.view_public          | View approved public alumni profiles                   |
|                      | alumni.view_directory       | Search complete directory (respecting privacy fields)  |
|                      | alumni.verify               | Approve, reject, or request correction on applications |
|                      | alumni.manage               | Edit, feature, or manage alumni records                |
+----------------------+-----------------------------+--------------------------------------------------------+
| Committee            | committee.view              | View current and historical executive committees       |
|                      | committee.manage            | Create terms, assign positions, upload member photos   |
+----------------------+-----------------------------+--------------------------------------------------------+
| Digital Library      | library.view                | Browse catalog and check book availability             |
|                      | library.reserve             | Place book reservation request                         |
|                      | library.manage_catalog      | Add, edit, archive books and categories                |
|                      | library.issue_book          | Issue physical book copies to members                  |
|                      | library.return_book         | Process returned copies, condition checks, fines       |
|                      | library.manage_donations    | Review, accept, and catalog donated books              |
|                      | library.manage_settings     | Configure loan limits, durations, and fine rates       |
+----------------------+-----------------------------+--------------------------------------------------------+
| Activities & Blog    | activities.view             | Read published articles and event highlights           |
|                      | activities.manage           | Create, edit, draft, publish, and delete posts         |
+----------------------+-----------------------------+--------------------------------------------------------+
| Events & Attendance  | events.view                 | View public upcoming and completed events              |
|                      | events.register             | Register personal attendance for an event              |
|                      | events.manage               | Create events, manage rosters, verify attendance       |
+----------------------+-----------------------------+--------------------------------------------------------+
| Donations & Funds    | donations.create            | Submit public/member financial contributions           |
|                      | donations.view_all          | View complete financial transaction ledger             |
|                      | donations.manage            | Verify transactions, manage fund allocations, reports  |
+----------------------+-----------------------------+--------------------------------------------------------+
| Communications       | announcements.view          | View targeted announcements                            |
|                      | announcements.manage        | Draft, publish, and target announcements               |
|                      | messages.manage             | Read, reply, and archive contact inbox submissions     |
+----------------------+-----------------------------+--------------------------------------------------------+
| CMS, Media & Logs    | cms.manage                  | Edit static page content, hero texts, footer links     |
|                      | media.manage                | Upload, organize, and delete storage files             |
|                      | settings.manage             | Update global site configuration & social media links  |
|                      | audit.view                  | Inspect system audit logs & security mutation history  |
+----------------------+-----------------------------+--------------------------------------------------------+
```

---

## 3. Effective Permissions Evaluation

### 3.1 Mathematical Definition
$$\text{Effective Permissions}(u) = \Big( \text{RolePermissions}(\text{role}(u)) \cup \text{UserGrants}(u) \Big) \setminus \text{UserDenials}(u)$$

### 3.2 SQL Evaluation Helper Functions
```sql
-- Evaluates whether a specific user holds a required permission
CREATE OR REPLACE FUNCTION auth.user_has_permission(
    p_user_id UUID,
    p_permission_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_role_id VARCHAR(50);
    v_has_role_permission BOOLEAN := FALSE;
    v_explicit_grant BOOLEAN;
BEGIN
    -- 1. Fetch user role
    SELECT role_id INTO v_role_id
    FROM public.profiles
    WHERE id = p_user_id;

    -- ADMIN always has all permissions
    IF v_role_id = 'ADMIN' THEN
        RETURN TRUE;
    END IF;

    -- 2. Check explicit user-specific override
    SELECT is_granted INTO v_explicit_grant
    FROM public.user_permissions
    WHERE user_id = p_user_id AND permission_id = p_permission_id;

    IF v_explicit_grant IS NOT NULL THEN
        RETURN v_explicit_grant; -- Explicit grant (TRUE) or denial (FALSE) takes precedence
    END IF;

    -- 3. Check role-inherited permission
    SELECT EXISTS (
        SELECT 1
        FROM public.role_permissions
        WHERE role_id = v_role_id AND permission_id = p_permission_id
    ) INTO v_has_role_permission;

    RETURN v_has_role_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Current authenticated caller evaluation
CREATE OR REPLACE FUNCTION auth.current_user_has_permission(p_permission_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.user_has_permission(auth.uid(), p_permission_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Role vs Permission Mapping Matrix

| Permission Key | Public (Guest) | MEMBER | ALUMNI | TEACHER | ADMIN | Appointed Librarian (`MEMBER` + Grants) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `users.view` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `users.manage_roles` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `alumni.view_public` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `alumni.view_directory` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `alumni.verify` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `alumni.manage` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `committee.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `committee.manage` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `library.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `library.reserve` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `library.manage_catalog`| ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Grant) |
| `library.issue_book` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Grant) |
| `library.return_book` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Grant) |
| `library.manage_donations`| ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (Grant) |
| `library.manage_settings` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `activities.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `activities.manage` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `events.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `events.register` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `events.manage` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `donations.create` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `donations.manage` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `cms.manage` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `audit.view` | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 5. Supabase Row Level Security (RLS) Integration

```sql
-- Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 Books Table Policies
CREATE POLICY "Public Read Books"
    ON public.books FOR SELECT
    USING (status != 'ARCHIVED' OR auth.current_user_has_permission('library.manage_catalog'));

CREATE POLICY "Manage Books"
    ON public.books FOR ALL
    USING (auth.current_user_has_permission('library.manage_catalog'));

-- 5.2 Book Loans Table Policies
CREATE POLICY "Borrower Read Own Loans"
    ON public.book_loans FOR SELECT
    USING (borrower_id = auth.uid() OR auth.current_user_has_permission('library.issue_book'));

CREATE POLICY "Circulation Desk Manage Loans"
    ON public.book_loans FOR ALL
    USING (auth.current_user_has_permission('library.issue_book'));

-- 5.3 Alumni Profiles Table Policies
CREATE POLICY "Public View Verified Alumni"
    ON public.alumni_profiles FOR SELECT
    USING (verification_status = 'VERIFIED' OR profile_id = auth.uid() OR auth.current_user_has_permission('alumni.manage'));

CREATE POLICY "Alumni Edit Own Profile"
    ON public.alumni_profiles FOR UPDATE
    USING (profile_id = auth.uid());

-- 5.4 Alumni Applications Table Policies
CREATE POLICY "Applicant View Own Application"
    ON public.alumni_applications FOR SELECT
    USING (profile_id = auth.uid() OR auth.current_user_has_permission('alumni.verify'));

CREATE POLICY "Admin Manage Applications"
    ON public.alumni_applications FOR ALL
    USING (auth.current_user_has_permission('alumni.verify'));
```

---

## 6. Server-Side TypeScript Authorization Guard

```typescript
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requirePermission(permissionId: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: hasPermission, error } = await supabase.rpc(
    "auth_current_user_has_permission",
    { p_permission_id: permissionId }
  );

  if (error || !hasPermission) {
    throw new Error(`Unauthorized: Missing required permission [${permissionId}]`);
  }

  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "ACTIVE" || !allowedRoles.includes(profile.role_id)) {
    redirect("/dashboard");
  }

  return { user, profile };
}
```
