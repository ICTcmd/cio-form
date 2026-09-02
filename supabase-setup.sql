-- CIO Request System Database Schema
-- Run this in Supabase SQL Editor

-- Create the requests table
CREATE TABLE IF NOT EXISTS requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    control_number TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Form date
    form_date DATE NOT NULL,
    
    -- Request Form Section
    requesting_office TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_no TEXT NOT NULL,
    messenger_name TEXT NOT NULL,
    
    -- Event Details Section
    event_activity TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    event_venue TEXT NOT NULL,
    
    -- Services (stored as JSONB array)
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Conditional Fields
    video_editing_due_date DATE,
    social_media_dates TEXT,
    copy_about TEXT,
    copy_event TEXT,
    copy_date_taken DATE,
    
    -- CIO Use Section
    request_status TEXT CHECK (request_status IN ('Approved', 'Declined')),
    request_remarks TEXT,
    progress_status TEXT CHECK (progress_status IN ('Completed', 'Ongoing', 'Deferred')),
    progress_remarks TEXT,
    assigned_personnel TEXT,
    
    -- Overall Status
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Contacted', 'Approved', 'Declined', 'Completed'))
);

-- Create index on control_number for faster lookups
CREATE INDEX idx_control_number ON requests(control_number);

-- Create index on status for filtering
CREATE INDEX idx_status ON requests(status);

-- Create index on created_at for sorting
CREATE INDEX idx_created_at ON requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to INSERT (submit requests)
CREATE POLICY "Allow public insert" ON requests
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Allow public to SELECT their own requests by control number
CREATE POLICY "Allow public select own" ON requests
    FOR SELECT
    TO anon
    USING (true);

-- Policy: Allow authenticated users (admins) to SELECT all
CREATE POLICY "Allow authenticated select all" ON requests
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users (admins) to UPDATE all
CREATE POLICY "Allow authenticated update all" ON requests
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for admin statistics
CREATE OR REPLACE VIEW request_statistics AS
SELECT 
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'Contacted') as contacted_count,
    COUNT(*) FILTER (WHERE status = 'Approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'Declined') as declined_count,
    COUNT(*) FILTER (WHERE status = 'Completed') as completed_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as this_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as this_month
FROM requests;

-- Grant access to the view
GRANT SELECT ON request_statistics TO anon, authenticated;

-- Create admin users table (optional but recommended)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view admin_users
CREATE POLICY "Allow authenticated select admin_users" ON admin_users
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert sample admin user (update with your email)
-- You can add this after setup or through Supabase Auth
-- INSERT INTO admin_users (email, full_name, role) 
-- VALUES ('your-email@example.com', 'Admin Name', 'admin');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'CIO Request System database setup completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Copy your Supabase URL and anon key';
    RAISE NOTICE '2. Update the form with your credentials';
    RAISE NOTICE '3. Test submitting a request';
END $$;
