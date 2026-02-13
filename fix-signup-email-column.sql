-- Fix signup issue with email column
-- This ensures the email column doesn't block new user signups

-- Make sure email column allows NULL values (in case email isn't provided)
ALTER TABLE public.profiles 
ALTER COLUMN email DROP NOT NULL;

-- Update RLS policies to allow inserts with email
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure the trigger for new user creation handles email properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email, full_name, avatar_url, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it instead
    UPDATE public.profiles
    SET 
      email = NEW.email,
      username = COALESCE(NEW.raw_user_meta_data->>'username', username),
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', full_name),
      avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', avatar_url),
      location = COALESCE(NEW.raw_user_meta_data->>'location', location)
    WHERE user_id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- Verify the setup
SELECT 
  'Signup fix applied' as status,
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email
FROM public.profiles;
