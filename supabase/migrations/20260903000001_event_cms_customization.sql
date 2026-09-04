-- Migration: 20260903000001_event_cms_customization.sql
-- Adds customizable fields for Event CMS, Guidelines, Contacts, Payment Instructions, and Registration Form Customizer

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS guidelines TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS payment_instructions TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS allow_guests BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 3;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ask_tshirt BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ask_dietary BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ask_student_id BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ask_dept_series BOOLEAN DEFAULT TRUE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS require_transaction_id BOOLEAN DEFAULT FALSE;
