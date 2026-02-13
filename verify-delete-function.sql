-- Verify delete_user_and_data function exists
-- Run this in Supabase SQL Editor to check if the function is set up

SELECT 
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  pg_get_functiondef(p.oid) as function_definition,
  CASE 
    WHEN p.proname = 'delete_user_and_data' THEN '✅ Function exists and is ready to use'
    ELSE '❌ Function not found'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'delete_user_and_data';

-- If you see no results, the function doesn't exist
-- Run fix-user-deletion-updated.sql to create it

-- Also check if is_admin function exists (required for delete function)
SELECT 
  p.proname as function_name,
  CASE 
    WHEN p.proname = 'is_admin' THEN '✅ is_admin function exists'
    ELSE '❌ is_admin function not found'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'is_admin';
