# Clear Cache and Redeploy - User Deletion Fix

## Issue
You're seeing the old error message "Delete function not set up" even after running the SQL and pushing the code. This is a caching issue.

## Solution Steps

### Step 1: Verify Function Exists in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run the contents of `verify-delete-function.sql`

**Expected Output:**
```
function_name         | is_security_definer | status
delete_user_and_data  | true                | ✅ Function exists and is ready to use
```

**If you see no results:**
- The function doesn't exist
- Run `fix-user-deletion-updated.sql` again
- Make sure there are no errors in the SQL output

### Step 2: Clear Browser Cache

The old JavaScript is cached in your browser.

**Option A: Hard Refresh (Recommended)**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Option B: Clear Cache Manually**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Incognito/Private Window**
- Open your site in an incognito/private window
- This bypasses all cache

### Step 3: Wait for Deployment

The code has been pushed to GitHub. Wait for:
1. GitHub Actions to build (check: https://github.com/solmyst/drop-swap-vibes/actions)
2. Deployment to complete (usually 2-3 minutes)
3. Then do a hard refresh

### Step 4: Verify the Fix

1. Log in as admin (revastraaa@gmail.com)
2. Go to Admin Dashboard → Users
3. Open browser DevTools (F12) → Console tab
4. Click delete on a test user
5. Check the console for any errors

**What you should see:**
- No error about "Delete function not set up"
- Either success message or a specific error from Supabase

## Common Errors After Fix

### Error: "Only admins can delete users"
**Solution:** Make sure you're logged in as admin
```sql
-- Check your role in Supabase SQL Editor
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

### Error: "function public.delete_user_and_data does not exist"
**Solution:** Run `fix-user-deletion-updated.sql` in Supabase SQL Editor

### Error: "permission denied for function is_admin"
**Solution:** The is_admin function needs to exist. Run this:
```sql
-- Check if is_admin exists
SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- If it doesn't exist, you need to run the admin setup SQL
```

## Files to Check

1. ✅ `src/pages/admin/AdminUsers.tsx` - Updated (pushed to GitHub)
2. ✅ `src/integrations/supabase/types.ts` - Updated (pushed to GitHub)
3. ⚠️ `fix-user-deletion-updated.sql` - Must be run in Supabase manually

## Testing Checklist

- [ ] Ran `verify-delete-function.sql` in Supabase
- [ ] Function exists and shows ✅
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Waited for GitHub Actions deployment to complete
- [ ] Opened site in incognito window to test
- [ ] Checked browser console for errors
- [ ] Verified logged in as admin

## Still Not Working?

If you still see the old error after all steps:

1. **Check the deployed version:**
   - Open DevTools → Network tab
   - Refresh the page
   - Look for `AdminUsers.tsx` or main JS bundle
   - Check the file size/timestamp to confirm it's new

2. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for any errors when clicking delete

3. **Manual test in SQL Editor:**
   ```sql
   -- Replace with a test user ID
   SELECT delete_user_and_data('TEST_USER_ID_HERE');
   ```

4. **Share the exact error message** from browser console
