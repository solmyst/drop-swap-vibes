# Admin Dashboard Setup Guide

## Problem
The admin dashboard at `/admin` is not working because you haven't been set as an admin in the database.

## Quick Fix (3 Steps)

### Step 1: Get Your User ID
1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Run this query (replace with your email):
```sql
SELECT 
  id as user_id,
  email
FROM auth.users
WHERE email = 'revastraaa@gmail.com';
```
4. Copy the `user_id` from the result

### Step 2: Make Yourself Admin
Run this query (replace `YOUR_USER_ID_HERE` with the ID from Step 1):
```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 3: Verify It Works
Run this query:
```sql
SELECT public.is_admin('YOUR_USER_ID_HERE');
```
Should return: `true`

## Test Admin Access

1. Go to https://revastra.me
2. Make sure you're logged in with the email you used above
3. Navigate to https://revastra.me/admin
4. You should see the admin dashboard

## If It Still Doesn't Work

### Option 1: Run the Full Setup Script
1. Go to Supabase SQL Editor
2. Open the file `verify-and-fix-admin.sql`
3. Copy and paste the entire content
4. Run it step by step (read the comments)

### Option 2: Check Console Errors
1. Open https://revastra.me/admin
2. Press F12 → Console tab
3. Look for errors related to `is_admin`
4. Share the error message with me

### Option 3: Verify Function Exists
Run this query:
```sql
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'is_admin';
```

If it returns no results, the function doesn't exist. Run:
```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'admin'
  );
$$;
```

## What the Admin Dashboard Shows

Once working, you'll see:
- **Total Users** - Count of all registered users
- **Total Listings** - All listings (active, sold, draft)
- **Active Listings** - Only active listings
- **Total Messages** - All messages sent

Navigation:
- Overview - Dashboard stats
- Listings - Manage all listings
- Users - View all users

## Common Issues

### Issue 1: "Not authorized" or redirects to home
**Solution:** You're not set as admin. Follow Steps 1-2 above.

### Issue 2: "Function is_admin does not exist"
**Solution:** Run the CREATE FUNCTION query from Option 3 above.

### Issue 3: "Table user_roles does not exist"
**Solution:** Run this:
```sql
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### Issue 4: Page loads but shows no data
**Solution:** Check RLS policies. Run:
```sql
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
```

## Security Note

The admin dashboard is protected by:
1. Authentication check (must be logged in)
2. Admin role check (must have 'admin' role in user_roles table)
3. RLS policies on all tables

Only users with the 'admin' role can access the dashboard.

---

**Quick Summary:**
1. Get your user ID from auth.users
2. Insert into user_roles with role='admin'
3. Verify with is_admin function
4. Access /admin

**Support Email:** revastraaa@gmail.com
