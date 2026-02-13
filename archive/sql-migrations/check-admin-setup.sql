-- Quick Admin Setup Check
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if is_admin function exists
SELECT 
  'Function exists: ' || CASE WHEN COUNT(*) > 0 THEN 'YES ✅' ELSE 'NO ❌' END as status
FROM pg_proc 
WHERE proname = 'is_admin';

-- 2. Check if user_roles table exists
SELECT 
  'Table exists: ' || CASE WHEN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN 'YES ✅' ELSE 'NO ❌' END as status;

-- 3. Find your user ID (replace email)
SELECT 
  id as user_id,
  email,
  'Copy this user_id ⬆️' as note
FROM auth.users
WHERE email = 'revastraaa@gmail.com';

-- 4. Check if you're in user_roles table (replace USER_ID)
-- SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID_HERE';

-- 5. Test is_admin function (replace USER_ID)
-- SELECT public.is_admin('YOUR_USER_ID_HERE') as is_admin;

-- ============================================
-- IF FUNCTION DOESN'T EXIST, RUN THIS:
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'admin'
  );
$$;

-- ============================================
-- IF TABLE DOESN'T EXIST, RUN THIS:
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TO MAKE YOURSELF ADMIN:
-- ============================================
-- 1. Get your user_id from step 3 above
-- 2. Run this (replace YOUR_USER_ID_HERE):

-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- VERIFY IT WORKED:
-- ============================================
-- SELECT public.is_admin('YOUR_USER_ID_HERE');
-- Should return: true
