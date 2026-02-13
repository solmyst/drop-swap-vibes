# Debug Guide: Missing Listing Issue

## Problem
Database shows 3 listings, but website only displays 2.

## Debug Steps

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and look for these console logs:
- `Fetched listings: X` - Shows how many listings were fetched from database
- `Products with profiles: X` - Shows how many products have profile data

### 2. Check Database Status
Run this SQL query in Supabase SQL Editor:

```sql
-- Check all listings and their status
SELECT 
  id,
  title,
  seller_id,
  status,
  category,
  condition,
  size,
  price,
  created_at
FROM listings
ORDER BY created_at DESC;
```

**What to check:**
- Are all 3 listings showing `status = 'active'`?
- Do all 3 have valid `seller_id`?
- Are there any NULL values in important fields?

### 3. Check Seller Profiles
Run this SQL query:

```sql
-- Check if all sellers have profiles
SELECT 
  l.id as listing_id,
  l.title,
  l.seller_id,
  p.username,
  p.user_id
FROM listings l
LEFT JOIN profiles p ON l.seller_id = p.user_id
WHERE l.status = 'active'
ORDER BY l.created_at DESC;
```

**What to check:**
- Do all 3 listings have matching profiles?
- Are there any NULL usernames?

### 4. Common Issues

#### Issue A: Listing Status
If one listing has `status != 'active'` (e.g., 'pending', 'sold', 'inactive'), it won't show.

**Fix:** Update the status:
```sql
UPDATE listings 
SET status = 'active' 
WHERE id = 'YOUR_LISTING_ID';
```

#### Issue B: Missing Profile
If a seller doesn't have a profile, the listing might not display properly.

**Fix:** Check if profile exists:
```sql
SELECT * FROM profiles WHERE user_id = 'SELLER_ID';
```

#### Issue C: Browser Cache
Old data might be cached in your browser.

**Fix:** 
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Open in incognito/private window

#### Issue D: Image Loading
If images array is empty or invalid, it might cause rendering issues.

**Check:**
```sql
SELECT id, title, images FROM listings WHERE status = 'active';
```

### 5. Enhanced Debug Version

I've added console logs to the Browse page. Check the console for:
- Total listings fetched
- Total products with profiles
- Any error messages

### 6. Next Steps

After checking the console and database:

1. **If console shows 3 listings fetched but 2 displayed:**
   - Check if one listing is being filtered out by default filters
   - Check if there's a JavaScript error preventing rendering

2. **If console shows only 2 listings fetched:**
   - One listing has `status != 'active'`
   - Check the database status query above

3. **If console shows 3 fetched, 3 with profiles, but 2 displayed:**
   - Check browser console for JavaScript errors
   - Check if one product has invalid data causing render failure

## Report Back

Please share:
1. Console log output (the numbers from "Fetched listings" and "Products with profiles")
2. Results from the SQL queries above
3. Any error messages in console

This will help identify the exact issue!
