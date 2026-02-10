-- Admin Setup for रीवस्त्र Marketplace
-- Run this in Supabase SQL Editor to set up admin access

-- First, find your user ID by signing up/logging in, then check:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from the query above
-- Example: INSERT INTO public.user_roles (user_id, role) VALUES ('07ce59f1-8f0e-45b8-816e-4c755b853100', 'admin');

-- STEP 1: Add your user as admin (replace the UUID with your user ID)
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'admin');

-- STEP 2: Verify admin access
-- SELECT ur.*, au.email 
-- FROM public.user_roles ur 
-- JOIN auth.users au ON ur.user_id = au.id 
-- WHERE ur.role = 'admin';

-- STEP 3: Test admin functions
-- SELECT public.is_admin('YOUR_USER_ID_HERE');

-- If you need to find your user ID, run this after logging in:
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- for putting the roles
INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'admin');
