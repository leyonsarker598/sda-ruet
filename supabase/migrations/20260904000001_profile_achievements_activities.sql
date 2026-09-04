-- Migration: Add achievements and activities JSONB columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb NOT NULL,
ADD COLUMN IF NOT EXISTS activities JSONB DEFAULT '[]'::jsonb NOT NULL;
