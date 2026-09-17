-- FINAL FIX — Run in Supabase Dashboard → SQL Editor
-- Grants table-level permissions to the anon role

-- Allow anon to insert and select from requests
GRANT ALL ON TABLE requests TO anon;
GRANT ALL ON TABLE requests TO authenticated;

-- Allow sequence usage (needed for any serial/auto-increment, just in case)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify grants
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'requests'
ORDER BY grantee, privilege_type;
