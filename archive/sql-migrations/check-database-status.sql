-- Check Database Status for रीवस्त्र Marketplace
-- Run this first to see what's already set up

-- Check if main tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'listings', 'user_passes', 'conversations', 
    'messages', 'seller_reviews', 'user_roles', 'upi_transactions'
  )
ORDER BY tablename;

-- Check if pass_type enum exists
SELECT 
  typname,
  typtype
FROM pg_type 
WHERE typname IN ('pass_type', 'app_role');

-- Check if functions exist
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname IN ('get_user_chat_limit', 'get_user_listing_limit', 'is_admin');

-- Check storage buckets
SELECT 
  id,
  name,
  public
FROM storage.buckets
WHERE id IN ('listings', 'chat-images', 'review-images');

-- Check if you have any admin users
SELECT 
  ur.role,
  au.email,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin';