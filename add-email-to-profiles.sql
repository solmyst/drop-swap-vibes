-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update existing profiles with emails from auth.users
-- Note: This requires running as a database admin
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

-- Verify the update
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(*) - COUNT(email) as profiles_without_email
FROM public.profiles;
