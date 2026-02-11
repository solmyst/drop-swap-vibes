-- Fix User Deletion Function
-- Run this in Supabase SQL Editor

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.delete_user_and_data(UUID);

-- Create a simpler version that works with RLS
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
  
  -- Delete user's reviews (both given and received)
  DELETE FROM public.reviews WHERE reviewer_id = _user_id OR seller_id = _user_id;
  
  -- Delete messages sent by user
  DELETE FROM public.messages WHERE sender_id = _user_id;
  
  -- Delete conversations where user is involved
  DELETE FROM public.conversations WHERE buyer_id = _user_id OR seller_id = _user_id;
  
  -- Delete user's listings
  DELETE FROM public.listings WHERE seller_id = _user_id;
  
  -- Delete user's passes
  DELETE FROM public.user_passes WHERE user_id = _user_id;
  
  -- Delete user's usage records
  DELETE FROM public.user_usage WHERE user_id = _user_id;
  
  -- Delete user's roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE user_id = _user_id;
  
  -- Finally, delete from auth.users (requires service_role or special permissions)
  -- This might fail if you don't have the right permissions
  -- In that case, you'll need to delete from auth.users manually in Supabase Dashboard
  BEGIN
    DELETE FROM auth.users WHERE id = _user_id;
  EXCEPTION
    WHEN OTHERS THEN
      -- If we can't delete from auth.users, at least we cleaned up everything else
      RAISE NOTICE 'Could not delete from auth.users. Please delete manually from Supabase Dashboard.';
  END;
  
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.delete_user_and_data TO authenticated;

-- Test the function (replace with a test user ID)
-- SELECT public.delete_user_and_data('TEST_USER_ID_HERE');

-- Verify it was created
SELECT 
  proname as function_name,
  'Function created successfully ✅' as status
FROM pg_proc 
WHERE proname = 'delete_user_and_data';
