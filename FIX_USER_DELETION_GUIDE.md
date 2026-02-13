# Fix User Deletion Function - Setup Guide

## Issue
The delete user function in the admin dashboard was not working because the function wasn't properly calling the database RPC.

## What Was Fixed

### 1. Frontend Code (AdminUsers.tsx)
- Updated `handleDeleteUser` to actually call the `delete_user_and_data` RPC function
- Added proper error handling and success messages
- Refreshes user list after successful deletion

### 2. TypeScript Types (types.ts)
- Added `delete_user_and_data` function definition to Supabase types
- This allows TypeScript to recognize the RPC call

### 3. Updated SQL Function
Created `fix-user-deletion-updated.sql` with improvements:
- Handles `seller_reviews` table (correct table name)
- Handles `verification_requests` table
- Better error handling
- Proper SECURITY DEFINER to allow deletion from auth.users

## Setup Instructions

### Step 1: Run the SQL in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `mmkngwurnttdxiawfqtb`
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `fix-user-deletion-updated.sql`
6. Click **Run** or press `Ctrl+Enter`

### Step 2: Verify Function Creation

You should see output like:
```
function_name         | is_security_definer | status
delete_user_and_data  | true                | Function created successfully ✅
```

### Step 3: Test the Function

The delete user button in the admin dashboard should now work properly.

## What Gets Deleted

When you delete a user, the function removes:
1. ✅ Wishlist items
2. ✅ Seller reviews (given and received)
3. ✅ Verification requests
4. ✅ Messages sent by the user
5. ✅ Conversations involving the user
6. ✅ All listings created by the user
7. ✅ User passes (if table exists)
8. ✅ User usage records (if table exists)
9. ✅ User roles
10. ✅ User profile
11. ✅ Auth user account

## Security

- Only users with the `admin` role can delete users
- The function uses `SECURITY DEFINER` to allow deletion from auth.users
- RLS policies are respected for all operations

## Testing

To test the delete function:
1. Log in as admin (revastraaa@gmail.com)
2. Go to Admin Dashboard → Users
3. Click the trash icon next to a test user
4. Confirm deletion
5. User and all associated data should be deleted

## Troubleshooting

### Error: "Only admins can delete users"
- Make sure you're logged in as an admin
- Check that your user has the 'admin' role in the user_roles table

### Error: "Function does not exist"
- Run the SQL script in Supabase SQL Editor
- Verify the function was created using the verification query

### Error: "Permission denied"
- The function uses SECURITY DEFINER which should bypass RLS
- Make sure the function was created successfully
- Check Supabase logs for detailed error messages

## Files Modified

1. `src/pages/admin/AdminUsers.tsx` - Updated delete handler
2. `src/integrations/supabase/types.ts` - Added function type
3. `fix-user-deletion-updated.sql` - New SQL script (run this one)

## Previous Files (Archived)

- `archive/sql-migrations/fix-user-deletion.sql` - Old version (don't use)
