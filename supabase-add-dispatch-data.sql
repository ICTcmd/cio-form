-- Add dispatch_data column to requests table
-- This stores the dispatch form data as JSON

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS dispatch_data JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.requests.dispatch_data IS 'Stores dispatch form data including dispatch number, assigned team, transportation, etc.';

-- No RLS changes needed - dispatch_data follows the same permissions as the parent request row
