-- CLEANUP v3 — Remove duplicate policies and keep only the clean ones
-- Run in Supabase Dashboard → SQL Editor

-- Drop the OLD duplicate policies (keep the "Allow *" ones we just created)
DROP POLICY IF EXISTS "Public can insert" ON requests;
DROP POLICY IF EXISTS "Public can select" ON requests;
DROP POLICY IF EXISTS "Admins can select" ON requests;
DROP POLICY IF EXISTS "Admins can update" ON requests;
DROP POLICY IF EXISTS "Superadmin can delete" ON requests;

-- Verify only clean policies remain
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'requests';
