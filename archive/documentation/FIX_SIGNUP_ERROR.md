# Fix Signup Error - "Database error saving new user"

## Problem
After adding the `email` column to profiles table, new user signups are failing with:
```
{code: "unexpected_failure", message: "Database error saving new user"}
```

## Cause
The email column or RLS policies are blocking the profile creation during signup.

## Solution

### Run This SQL in Supabase:

1. Go to: https://supabase.com/dashboard/project/mmkngwurnttdxiawfqtb/sql/new
2. Copy the entire contents of `fix-signup-email-column.sql`
3. Paste and click "Run"

### What This Does:

1. **Makes email column nullable** - Allows signups even if email isn't provided
2. **Updates RLS policies** - Ensures users can insert their own profile
3. **Fixes the trigger** - Handles email properly during signup
4. **Adds error handling** - Prevents signup failures from blocking user creation

### After Running SQL:

1. Try creating a new account
2. Should work without errors
3. Email will be automatically populated from auth.users

## Test Signup

1. Go to https://revastra.me/auth
2. Click "Sign Up"
3. Enter:
   - Email: test@example.com
   - Password: Test123!
   - Username: testuser
4. Click "Sign Up"
5. Should succeed without errors

## Verify Fix

Run this in Supabase SQL Editor to check:

```sql
-- Check if new profiles are being created with emails
SELECT 
  user_id,
  username,
  email,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
```

## If Still Having Issues

### Check Supabase Logs:
1. Go to: https://supabase.com/dashboard/project/mmkngwurnttdxiawfqtb/logs/postgres-logs
2. Look for errors during signup
3. Check for constraint violations or permission errors

### Check Auth Logs:
1. Go to: https://supabase.com/dashboard/project/mmkngwurnttdxiawfqtb/auth/users
2. See if user is created in auth.users
3. Check if profile is created in profiles table

### Manual Fix:
If a user is created in auth.users but not in profiles:

```sql
-- Find users without profiles
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- Create missing profile manually
INSERT INTO profiles (user_id, username, email, full_name)
VALUES (
  '[user-id-from-above]',
  '[username]',
  '[email]',
  '[full-name]'
);
```

## Prevention

The trigger `handle_new_user()` now includes error handling to prevent signup failures. Even if profile creation fails, the user account will still be created in auth.users.

## Related Files

- `fix-signup-email-column.sql` - SQL fix to run
- `src/hooks/useAuth.tsx` - Already includes email in profile creation
- `setup-verification-complete.sql` - Original email column addition

---

**Quick Fix:** Just run `fix-signup-email-column.sql` in Supabase SQL Editor and signups will work again!
