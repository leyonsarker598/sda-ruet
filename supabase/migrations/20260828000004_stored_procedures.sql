-- ==============================================================================
-- SIRAJGANJ DISTRICT ASSOCIATION, RUET (SDA RUET)
-- Database Migration: 20260828000004_stored_procedures.sql
-- Description: Atomic Stored Procedures, Inventory Locks & Consistency Triggers
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ATOMIC BOOK ISSUE PROCEDURE (Row-Level Locking FOR UPDATE)
-- ------------------------------------------------------------------------------
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
    v_has_conflicting_res BOOLEAN;
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

    -- 2. Check active reservations by other users
    SELECT EXISTS (
        SELECT 1
        FROM public.book_reservations
        WHERE book_id = v_book_id 
          AND user_id != p_borrower_id 
          AND status = 'ACTIVE' 
          AND expires_at > NOW()
    ) INTO v_has_conflicting_res;

    -- 3. Check Borrower Active Loan Count
    SELECT COUNT(*) INTO v_active_loans
    FROM public.book_loans
    WHERE borrower_id = p_borrower_id AND status = 'ISSUED';

    IF v_active_loans >= v_max_loans THEN
        RAISE EXCEPTION 'Borrower has reached the maximum active loan limit of % books.', v_max_loans;
    END IF;

    -- 4. Lock and Decrement Available Book Count
    UPDATE public.books
    SET available_copies = available_copies - 1,
        status = CASE WHEN available_copies - 1 <= 0 THEN 'OUT_OF_STOCK'::book_status_type ELSE 'AVAILABLE'::book_status_type END
    WHERE id = v_book_id AND available_copies > 0;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No available copies left in book inventory.';
    END IF;

    -- 5. Mark Copy as Unavailable
    UPDATE public.book_copies
    SET is_available = FALSE
    WHERE id = p_copy_id;

    -- 6. Fulfill borrower reservation if one existed
    UPDATE public.book_reservations
    SET status = 'FULFILLED'
    WHERE book_id = v_book_id AND user_id = p_borrower_id AND status = 'ACTIVE';

    -- 7. Insert Loan Record
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

    -- 8. Record Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, new_data)
    VALUES (p_issued_by, 'BOOK_ISSUED', 'book_loans', v_loan_id::text, jsonb_build_object(
        'borrower_id', p_borrower_id,
        'copy_id', p_copy_id,
        'book_id', v_book_id,
        'due_date', CURRENT_DATE + p_loan_days
    ));

    RETURN v_loan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 2. ATOMIC BOOK RETURN PROCEDURE
-- ------------------------------------------------------------------------------
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
        RAISE EXCEPTION 'This loan has already been returned.';
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
    SET is_available = CASE WHEN p_condition IN ('LOST', 'DAMAGED') THEN FALSE ELSE TRUE END,
        condition = p_condition
    WHERE id = v_loan.book_copy_id;

    -- 4. Increment Available Copies if return is in good/usable condition
    IF p_condition NOT IN ('LOST', 'DAMAGED') THEN
        UPDATE public.books
        SET available_copies = available_copies + 1,
            status = 'AVAILABLE'
        WHERE id = v_loan.book_id;
    END IF;

    -- 5. Record Audit Log
    INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, new_data)
    VALUES (p_returned_to, 'BOOK_RETURNED', 'book_loans', p_loan_id::text, jsonb_build_object(
        'returned_to', p_returned_to,
        'condition', p_condition,
        'return_date', CURRENT_DATE
    ));

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 3. ATOMIC ALUMNI APPLICATION APPROVAL & REJECTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_alumni_application(
    p_application_id UUID,
    p_admin_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_app RECORD;
BEGIN
    SELECT * INTO v_app
    FROM public.alumni_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Alumni application not found.';
    END IF;

    -- Update Application Record
    UPDATE public.alumni_applications
    SET status = 'VERIFIED',
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        reviewed_by = p_admin_id,
        reviewed_at = TIMEZONE('utc', NOW())
    WHERE id = p_application_id;

    -- Update Alumni Profile Record
    UPDATE public.alumni_profiles
    SET verification_status = 'VERIFIED',
        verified_at = TIMEZONE('utc', NOW()),
        verified_by = p_admin_id
    WHERE profile_id = v_app.profile_id;

    -- Update Core Profile Status
    UPDATE public.profiles
    SET status = 'ACTIVE'
    WHERE id = v_app.profile_id;

    -- Send in-app notification
    INSERT INTO public.notifications (user_id, title, message, type, link_url)
    VALUES (
        v_app.profile_id,
        'Alumni Application Approved',
        'Congratulations! Your SDA RUET alumni membership has been verified.',
        'ALUMNI_VERIFIED',
        '/dashboard/profile'
    );

    -- Log Audit Trail
    INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, new_data)
    VALUES (p_admin_id, 'ALUMNI_VERIFIED', 'alumni_applications', p_application_id::text, jsonb_build_object(
        'applicant_profile_id', v_app.profile_id,
        'admin_notes', p_admin_notes
    ));

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 4. DONATION FUND AUTOMATED RECONCILIATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_donation_fund_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.donation_funds
    SET raised_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.donations
        WHERE fund_id = COALESCE(NEW.fund_id, OLD.fund_id) AND status = 'VERIFIED'
    )
    WHERE id = COALESCE(NEW.fund_id, OLD.fund_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_donation_amount_changed ON public.donations;
CREATE TRIGGER on_donation_amount_changed
    AFTER INSERT OR UPDATE OR DELETE ON public.donations
    FOR EACH ROW EXECUTE FUNCTION public.sync_donation_fund_totals();

-- ------------------------------------------------------------------------------
-- 5. AUTOMATED UPDATED_AT TIMESTAMP TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_books_updated_at ON public.books;
CREATE TRIGGER trg_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_alumni_profiles_updated_at ON public.alumni_profiles;
CREATE TRIGGER trg_alumni_profiles_updated_at BEFORE UPDATE ON public.alumni_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON public.activities;
CREATE TRIGGER trg_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_committees_updated_at ON public.committees;
CREATE TRIGGER trg_committees_updated_at BEFORE UPDATE ON public.committees FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
