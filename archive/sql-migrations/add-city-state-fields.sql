-- Add city and state fields to profiles table
-- Run this in Supabase SQL Editor

-- Add city column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add state column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS state TEXT;

-- Update existing profiles that have location in "City, State" format
-- This will parse the existing location field and split it
UPDATE public.profiles
SET 
  city = SPLIT_PART(location, ', ', 1),
  state = SPLIT_PART(location, ', ', 2)
WHERE location IS NOT NULL 
  AND location LIKE '%,%'
  AND city IS NULL;

-- Create index for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- Update the handle_new_user function to include city and state
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username, full_name, avatar_url, location, city, state)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'location', ''),
        COALESCE(SPLIT_PART(NEW.raw_user_meta_data->>'location', ', ', 1), ''),
        COALESCE(SPLIT_PART(NEW.raw_user_meta_data->>'location', ', ', 2), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('city', 'state', 'location')
ORDER BY column_name;
