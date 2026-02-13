-- Verify and Fix Admin Dashboard Access
-- Run this in Supabase SQL Editor

-- STEP 1: Check if is_admin function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'is_admin';

-- If the function doesn't exist, create it:
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

-- STEP 2: Check if user_roles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
) as user_roles_exists;

-- If it doesn't exist, create it:
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- STEP 3: Add RLS policies for user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- STEP 4: Find your user ID (you need to be logged in)
-- Replace 'YOUR_EMAIL@example.com' with your actual email
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'revastraaa@gmail.com';  -- Change this to your admin email

-- STEP 5: Make yourself admin (replace USER_ID with the ID from step 4)
-- Example: INSERT INTO public.user_roles (user_id, role) VALUES ('abc123...', 'admin');
-- 
-- IMPORTANT: Copy the user_id from the result above and run:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- STEP 6: Verify admin status
-- Replace USER_ID with your actual user ID
-- SELECT public.is_admin('YOUR_USER_ID_HERE');
-- Should return: true

-- STEP 7: Check all admins
SELECT 
  ur.id,
  ur.user_id,
  ur.role,
  au.email,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';

-- STEP 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

-- STEP 9: Test the function with your user ID
-- SELECT public.is_admin(auth.uid());
-- Should return true if you're logged in as admin
