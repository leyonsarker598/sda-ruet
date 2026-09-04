-- Migration: 20260904000002_profile_positions.sql
-- Adds positions JSONB column to profiles table for current and previous professional/leadership positions

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS positions JSONB DEFAULT '[]'::jsonb NOT NULL;
