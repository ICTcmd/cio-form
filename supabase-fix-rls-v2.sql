-- URGENT FIX v2 — Run in Supabase Dashboard → SQL Editor
-- This resolves the 403 RLS error on form submission

-- Step 1: Add ALL missing columns safely
ALTER TABLE requests ADD COLUMN IF NOT EXISTS cloud_drive_link TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS graphic_design_link TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS graphic_design_instructions TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS press_release_link TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS attachment_name TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Step 2: Drop ALL existing policies on requests and recreate cleanly
DROP POLICY IF EXISTS "Allow public insert" ON requests;
DROP POLICY IF EXISTS "Allow public select own" ON requests;
DROP POLICY IF EXISTS "Allow authenticated select all" ON requests;
DROP POLICY IF EXISTS "Allow authenticated update all" ON requests;

-- Step 3: Recreate all policies
CREATE POLICY "Allow public insert" ON requests
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public select" ON requests
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow authenticated select" ON requests
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update" ON requests
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON requests
    FOR DELETE TO authenticated USING (true);

-- Step 4: Make sure RLS is on
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant insert permission to anon role explicitly
GRANT INSERT ON requests TO anon;
GRANT SELECT ON requests TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Verify
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'requests';
