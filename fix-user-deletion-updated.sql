-- Fix User Deletion Function (Updated)
-- Run this in Supabase SQL Editor

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.delete_user_and_data(UUID);

-- Create the delete function that works with RLS
CREATE OR REPLACE FUNCTION public.delete_user_and_data(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can delete users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Delete in order to avoid foreign key constraints
  
  -- Delete user's wishlist
  DELETE FROM public.wishlist WHERE user_id = _user_id;
  
  -- Delete seller reviews (both given and received)
  DELETE FROM public.seller_reviews WHERE reviewer_id = _user_id OR seller_id = _user_id;
  
  -- Delete verification requests
  DELETE FROM public.verification_requests WHERE user_id = _user_id;
  
  -- Delete messages sent by user
  DELETE FROM public.messages WHERE sender_id = _user_id;
  
  -- Delete conversations where user is involved
  DELETE FROM public.conversations WHERE buyer_id = _user_id OR seller_id = _user_id;
  
  -- Delete user's listings
  DELETE FROM public.listings WHERE seller_id = _user_id;
  
  -- Delete user's passes (if table exists)
  BEGIN
    DELETE FROM public.user_passes WHERE user_id = _user_id;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'User passes table does not exist, skipping';
  END;
  
  -- Delete user's usage records (if table exists)
  BEGIN
    DELETE FROM public.user_usage WHERE user_id = _user_id;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'User usage table does not exist, skipping';
  END;
  
  -- Delete user's roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE user_id = _user_id;
  
  -- Finally, delete from auth.users
  -- This requires SECURITY DEFINER to work
  DELETE FROM auth.users WHERE id = _user_id;
  
  RAISE NOTICE 'User % and all associated data deleted successfully', _user_id;
  
END;
$$;

-- Grant execute permission to authenticated users (RLS will check if they're admin)
GRANT EXECUTE ON FUNCTION public.delete_user_and_data TO authenticated;

-- Verify the function was created
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  'Function created successfully ✅' as status
FROM pg_proc 
WHERE proname = 'delete_user_and_data';
