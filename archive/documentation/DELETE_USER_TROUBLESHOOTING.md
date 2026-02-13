# Delete User Troubleshooting Guide

## Issue
Admin cannot delete users - getting "Failed to delete user" error.

## Root Cause
The `delete_user_and_data` function either:
1. Doesn't exist in the database
2. Has permission issues
3. Cannot delete from `auth.users` table

## Solution Steps

### Step 1: Check if Function Exists
Run this in Supabase SQL Editor:
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'delete_user_and_data';
```

**If it returns no results**, the function doesn't exist. Go to Step 2.
**If it returns results**, the function exists. Go to Step 3.

### Step 2: Create the Function
Run the entire `fix-user-deletion.sql` file in Supabase SQL Editor.

This will create the function that:
- Deletes user's wishlist
- Deletes user's reviews
- Deletes user's messages
- Deletes user's conversations
- Deletes user's listings
- Deletes user's passes
- Deletes user's usage records
- Deletes user's roles
- Deletes user's profile
- Attempts to delete from auth.users

### Step 3: Test the Function
After creating the function, test it with a test user:

1. Create a test user account
2. Get the test user's ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
```

3. Try to delete the test user from admin panel
4. Check the browser console (F12) for error messages

### Step 4: Check Console Errors
When you try to delete a user, open the browser console (F12) and look for:

**Error: "function delete_user_and_data does not exist"**
- Solution: Run `fix-user-deletion.sql`

**Error: "permission denied"**
- Solution: Make sure you're logged in as an admin
- Check if you have admin role:
```sql
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID' AND role = 'admin';
```

**Error: "Could not delete from auth.users"**
- This is expected - the function will clean up everything except auth.users
- You need to manually delete from Supabase Dashboard:
  1. Go to Supabase Dashboard
  2. Click **Authentication** → **Users**
  3. Find the user
  4. Click the three dots → **Delete user**

### Step 5: Alternative - Manual Deletion
If the function still doesn't work, you can delete users manually:

1. Get the user ID you want to delete
2. Run these queries one by one:

```sql
-- Replace USER_ID_HERE with actual user ID

DELETE FROM public.wishlist WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.reviews WHERE reviewer_id = 'USER_ID_HERE' OR seller_id = 'USER_ID_HERE';
DELETE FROM public.messages WHERE sender_id = 'USER_ID_HERE';
DELETE FROM public.conversations WHERE buyer_id = 'USER_ID_HERE' OR seller_id = 'USER_ID_HERE';
DELETE FROM public.listings WHERE seller_id = 'USER_ID_HERE';
DELETE FROM public.user_passes WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.user_usage WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.user_roles WHERE user_id = 'USER_ID_HERE';
DELETE FROM public.profiles WHERE user_id = 'USER_ID_HERE';
```

3. Then delete from auth.users in Supabase Dashboard

## Quick Checklist

- [ ] Ran `fix-user-deletion.sql` in Supabase SQL Editor
- [ ] Verified function exists with the SELECT query
- [ ] Confirmed I'm logged in as admin
- [ ] Checked browser console for specific error message
- [ ] Tried deleting a test user first
- [ ] If all else fails, used manual deletion method

## What to Share for Help

If it still doesn't work, share:
1. The exact error message from browser console
2. Result of: `SELECT proname FROM pg_proc WHERE proname = 'delete_user_and_data';`
3. Result of: `SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';`
4. Screenshot of the error toast message

---

**Note:** The function cannot delete from `auth.users` due to RLS restrictions. This is normal. You'll need to delete from Supabase Dashboard → Authentication → Users after running the function.
