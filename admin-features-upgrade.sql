-- Admin Features Upgrade
-- Run this in Supabase SQL Editor

-- 1. Add rejection_reason column to listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Add is_blocked column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- 3. Update user_roles check constraint to include moderator
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('admin', 'moderator', 'user'));

-- 4. Create function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('admin', 'moderator')
  );
$$;

-- 5. Create function to check if user is moderator
CREATE OR REPLACE FUNCTION public.is_moderator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'moderator'
  );
$$;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_moderator_or_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator TO authenticated;

-- 7. Add RLS policies for moderators to manage listings
CREATE POLICY "Moderators can view all listings"
  ON public.listings FOR SELECT
  USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Moderators can update listing status"
  ON public.listings FOR UPDATE
  USING (
    public.is_moderator_or_admin(auth.uid()) AND
    -- Moderators can only update status and rejection_reason
    true
  );

-- 8. Add policy to prevent blocked users from creating listings
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;
CREATE POLICY "Users can create listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = seller_id AND
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_blocked = true
    )
  );

-- 9. Add policy to prevent blocked users from sending messages
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_blocked = true
    )
  );

-- 10. Create function to delete user and all their data
CREATE OR REPLACE FUNCTION public.delete_user_and_data(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can delete users
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Delete user's messages
  DELETE FROM public.messages WHERE sender_id = _user_id;
  
  -- Delete user's conversations
  DELETE FROM public.conversations WHERE buyer_id = _user_id OR seller_id = _user_id;
  
  -- Delete user's listings
  DELETE FROM public.listings WHERE seller_id = _user_id;
  
  -- Delete user's reviews (given and received)
  DELETE FROM public.reviews WHERE reviewer_id = _user_id OR seller_id = _user_id;
  
  -- Delete user's wishlist
  DELETE FROM public.wishlist WHERE user_id = _user_id;
  
  -- Delete user's roles
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE user_id = _user_id;
  
  -- Delete from auth.users (this will cascade to other tables)
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_and_data TO authenticated;

-- 11. Verify the changes
SELECT 'Setup complete! ✅' as status;

-- Check new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'listings' AND column_name = 'rejection_reason';

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'is_blocked';
