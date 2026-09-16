-- Migration: Add missing columns to requests table
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS cloud_drive_link TEXT,
    ADD COLUMN IF NOT EXISTS graphic_design_link TEXT,
    ADD COLUMN IF NOT EXISTS graphic_design_instructions TEXT,
    ADD COLUMN IF NOT EXISTS press_release_link TEXT,
    ADD COLUMN IF NOT EXISTS attachment_name TEXT,
    ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'requests'
ORDER BY ordinal_position;
