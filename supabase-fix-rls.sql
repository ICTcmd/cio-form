-- Fix RLS submission error
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Add missing columns (safe to run even if already exists)
ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS cloud_drive_link TEXT,
    ADD COLUMN IF NOT EXISTS graphic_design_link TEXT,
    ADD COLUMN IF NOT EXISTS graphic_design_instructions TEXT,
    ADD COLUMN IF NOT EXISTS press_release_link TEXT,
    ADD COLUMN IF NOT EXISTS attachment_name TEXT,
    ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Step 2: Drop and recreate the INSERT policy cleanly
DROP POLICY IF EXISTS "Allow public insert" ON requests;

CREATE POLICY "Allow public insert" ON requests
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Step 3: Make sure SELECT policy exists for anon
DROP POLICY IF EXISTS "Allow public select own" ON requests;

CREATE POLICY "Allow public select own" ON requests
    FOR SELECT
    TO anon
    USING (true);

-- Step 4: Confirm RLS is enabled
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'requests';
