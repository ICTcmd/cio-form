-- FIX v4: Add remarks column + verify all columns exist
-- Run in Supabase Dashboard → SQL Editor

-- Add remarks if missing
ALTER TABLE requests ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS cloud_drive_link TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS graphic_design_link TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS graphic_design_instructions TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS press_release_link TEXT;

-- Recreate the anon INSERT policy to be absolutely permissive
DROP POLICY IF EXISTS "Allow public insert" ON requests;
CREATE POLICY "Allow public insert" ON requests
    FOR INSERT TO anon
    WITH CHECK (true);

-- Grant column-level permissions explicitly
GRANT INSERT (
    control_number, form_date, requesting_office, contact_person,
    contact_no, messenger_name, event_activity, event_date,
    event_time, event_venue, services, status,
    video_editing_due_date, social_media_dates,
    copy_about, copy_event, copy_date_taken,
    remarks, cloud_drive_link,
    graphic_design_link, graphic_design_instructions, press_release_link
) ON requests TO anon;

-- Verify columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'requests' AND table_schema = 'public'
ORDER BY ordinal_position;
