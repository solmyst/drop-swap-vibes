# Fix Admin Pages - Email Column Missing

## Problem
- Admin Users page showing "N/A" for emails
- Admin Verification page not loading
- Profiles table doesn't have email column

## Solution

### Step 1: Add Email Column to Profiles Table
Run this SQL in Supabase SQL Editor:

```sql
-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update existing profiles with emails from auth.users
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
```

### Step 2: Verify
After running the SQL:
1. Check the query result - should show all profiles have emails
2. Refresh admin pages
3. Emails should now display correctly

## What This Does
1. Adds `email` column to profiles table
2. Copies emails from `auth.users` to `profiles.email` for all existing users
3. Creates an index for faster lookups
4. Shows verification count

## Future Users
New users will automatically get their email saved in profiles table when they sign up (already handled in useAuth hook).

## Files Involved
- `add-email-to-profiles.sql` - Migration script
- `src/hooks/useAuth.tsx` - Already saves email on profile creation
- `src/pages/admin/AdminUsers.tsx` - Reads from profiles.email
- `src/pages/admin/AdminVerification.tsx` - Reads from profiles.email
