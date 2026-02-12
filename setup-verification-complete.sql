-- COMPLETE VERIFICATION SYSTEM SETUP
-- Run this entire file in Supabase SQL Editor
-- This will set up email column, verification_requests table, and admin RLS policies

-- ============================================
-- STEP 1: Add email column to profiles
-- ============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Migrate existing emails from auth.users to profiles
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email
    FROM auth.users au
    JOIN public.profiles p ON au.id = p.user_id
    WHERE p.email IS NULL
  LOOP
    UPDATE public.profiles
    SET email = user_record.email
    WHERE user_id = user_record.id;
  END LOOP;
END $$;

-- ============================================
-- STEP 2: Create verification_requests table
-- ============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can create verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON public.verification_requests;

-- Create table
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

-- Drop and recreate unique constraint
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

-- Only one pending request per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_requests_user_pending 
ON public.verification_requests(user_id) 
WHERE status = 'pending';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);

-- ============================================
-- STEP 3: Enable RLS and create policies
-- ============================================

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

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
  OR auth.uid() = user_id
);

-- Admins can update verification requests
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- ============================================
-- STEP 4: Grant permissions
-- ============================================

GRANT SELECT, INSERT ON public.verification_requests TO authenticated;
GRANT UPDATE ON public.verification_requests TO authenticated;

-- ============================================
-- STEP 5: Verify setup
-- ============================================

-- Check profiles with email
SELECT 
  'Profiles' as table_name,
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(*) - COUNT(email) as profiles_without_email
FROM public.profiles;

-- Check verification_requests table
SELECT 
  'Verification Requests' as table_name,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_requests,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_requests
FROM public.verification_requests;

-- Check RLS policies
SELECT 
  'RLS Policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'verification_requests'
ORDER BY policyname;
