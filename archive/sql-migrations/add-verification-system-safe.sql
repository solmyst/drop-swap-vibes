-- Safe version - drops existing policies first

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can create verification requests" ON public.verification_requests;

-- Create verification_requests table (if not exists)
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop the unique constraint if it exists and recreate it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'verification_requests_user_id_status_key'
  ) THEN
    ALTER TABLE public.verification_requests 
    DROP CONSTRAINT verification_requests_user_id_status_key;
  END IF;
END $$;

-- Add unique constraint: only one pending request per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_requests_user_pending 
ON public.verification_requests(user_id) 
WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own verification requests"
ON public.verification_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create verification requests"
ON public.verification_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);

-- Grant permissions
GRANT SELECT, INSERT ON public.verification_requests TO authenticated;

-- Verify the setup
SELECT 
  'Table exists' as status,
  COUNT(*) as request_count
FROM public.verification_requests;
