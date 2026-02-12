# Verification System Setup Instructions

## Current Status
✅ TypeScript types updated (verification_requests table + email column)
✅ AdminVerification page code fixed
✅ AdminUsers page code fixed (removed is_blocked references)
✅ Verification tab added to admin sidebar
✅ Route configured in App.tsx
⚠️ **DATABASE SETUP REQUIRED** - You need to run SQL in Supabase

## What You Need To Do

### Step 1: Run SQL Setup (REQUIRED)
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/mmkngwurnttdxiawfqtb
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `setup-verification-complete.sql` file
5. Paste it into the SQL editor
6. Click "Run" button

This SQL file will:
- Add `email` column to profiles table
- Migrate existing emails from auth.users
- Create `verification_requests` table
- Set up RLS policies for users and admins
- Grant necessary permissions

### Step 2: Verify Setup
After running the SQL, you should see output showing:
- Number of profiles with emails
- Verification requests count
- RLS policies created

### Step 3: Test the Feature
1. Log in as a regular user (not admin)
2. Go to your profile page
3. Click "Request Verification" button
4. Fill in the reason and submit
5. Log out and log in as admin (revastraaa@gmail.com)
6. Go to `/admin/verification`
7. You should see the verification request
8. Approve or reject it

## What Was Fixed

### TypeScript Types (`src/integrations/supabase/types.ts`)
- Added `verification_requests` table definition
- Added `email` column to `profiles` table

### Admin Verification Page (`src/pages/admin/AdminVerification.tsx`)
- Fixed TypeScript errors
- Now properly typed with database schema
- Shows user email, username, avatar
- Displays verification reason
- Approve/Reject functionality

### Admin Users Page (`src/pages/admin/AdminUsers.tsx`)
- Fixed TypeScript errors
- Removed `is_blocked` column references (column doesn't exist in database)
- Removed block/unblock functionality (requires database migration)
- Email column now displays correctly
- Role management working
- Delete user function disabled (requires fix-user-deletion.sql)

### Admin Dashboard (`src/pages/admin/AdminDashboard.tsx`)
- Added "Verification" tab with BadgeCheck icon
- Links to `/admin/verification`

### App Routes (`src/App.tsx`)
- Route already configured: `/admin/verification`

## Admin Users Page Features

### Working Features:
- ✅ View all users with pagination
- ✅ Search users by username/name
- ✅ View user details (avatar, name, email, join date)
- ✅ Change user roles (user/moderator/admin)
- ✅ Toggle verification status
- ✅ Email column displays correctly

### Disabled Features (require database setup):
- ❌ Block/Unblock users (requires `is_blocked` column in profiles table)
- ❌ Delete users (requires `delete_user_and_data` function)

## Troubleshooting

### "Failed to load verification requests"
- Make sure you ran `setup-verification-complete.sql`
- Check that you're logged in as admin
- Verify admin role in user_roles table

### "Email showing as 'Unknown'" or "N/A"
- Run the SQL migration to copy emails from auth.users
- Check that profiles.email column exists
- The SQL file handles this automatically

### "Can't see Verification tab"
- Make sure you're logged in as admin
- Check browser console for errors
- Hard refresh the page (Ctrl+Shift+R)

### "Delete function not set up"
- This is expected - the delete function requires running `fix-user-deletion.sql`
- For now, users cannot be deleted from the admin panel

## Files Modified
- `src/integrations/supabase/types.ts` - Added types
- `src/pages/admin/AdminVerification.tsx` - Fixed TypeScript errors
- `src/pages/admin/AdminUsers.tsx` - Fixed TypeScript errors, removed is_blocked
- `setup-verification-complete.sql` - Complete database setup

## Next Steps After Setup
Once the SQL is run and working:
1. Test user verification request flow
2. Test admin approval/rejection
3. Verify that approved users get the verified badge
4. Check that verification status shows on profile and product cards
5. Test email display in admin users page
