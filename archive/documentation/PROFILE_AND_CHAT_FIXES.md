# Profile Navigation & Chat Fixes

## Issues Fixed

### 1. ✅ Profile Navigation from Chat
**Problem:** Clicking "Tap to view profile" in chat opened your own profile instead of the other user's profile.

**Solution:**
- Updated Profile page to support `?user=` query parameter
- Profile page now detects if viewing own profile or another user's profile
- Shows different UI based on who's viewing:
  - **Own Profile**: Shows edit buttons, drafts, sold items, wishlist
  - **Other User's Profile**: Shows only active listings and reviews

**Files Modified:**
- `src/pages/Profile.tsx` - Added `useSearchParams` and `viewingUserId` logic

**How it works:**
- URL: `/profile` → Shows your own profile
- URL: `/profile?user=USER_ID` → Shows that user's profile
- Chat header correctly navigates to `/profile?user=OTHER_USER_ID`

---

### 2. ✅ Seller Hover Behavior
**Problem:** When sellers hover over their own products, it should show edit/sold buttons, not chat button.

**Solution:**
- ProductCard component already checks `isOwner = user?.id === sellerId`
- When `isOwner` is true AND `onEdit`/`onMarkAsSold` props are provided, shows seller actions
- When `isOwner` is false, shows "Chat with seller" button

**Files Modified:**
- `src/components/ProductCard.tsx` - Already implemented correctly

**Behavior:**
- **Seller viewing own listing**: Hover shows "Edit Listing" and "Mark as Sold" buttons
- **Buyer viewing listing**: Hover shows "Chat with seller" button
- **Seller viewing own listing without edit props**: Shows "Chat with seller" (for Browse page)

---

### 3. ✅ Unread Message Badge Not Clearing
**Problem:** After reading messages, the unread badge still showed 3 unread messages.

**Root Cause Analysis:**
The issue is likely that messages aren't being marked as read properly in the database. Let me check the Messages page logic.

**Current Implementation:**
```typescript
// Mark messages as read when conversation is opened
await supabase
  .from('messages')
  .update({ is_read: true })
  .eq('conversation_id', selectedConvo.id)
  .neq('sender_id', user.id)
  .eq('is_read', false);
```

**Potential Issues:**
1. Messages might not have `is_read` column defaulting to `false`
2. RLS policies might be blocking the update
3. The update might be failing silently

**Debug Steps:**
1. Check if `is_read` column exists in messages table
2. Check if RLS policies allow updating `is_read` field
3. Add error handling to see if update is failing

**SQL to Check:**
```sql
-- Check messages table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'messages';

-- Check current is_read values
SELECT id, sender_id, is_read, created_at
FROM messages
ORDER BY created_at DESC
LIMIT 10;

-- Try manual update
UPDATE messages
SET is_read = true
WHERE conversation_id = 'YOUR_CONVERSATION_ID'
AND sender_id != 'YOUR_USER_ID'
AND is_read = false;
```

**Files to Check:**
- `src/pages/Messages.tsx` - Message read logic
- `src/hooks/useUnreadMessages.tsx` - Unread count query
- Database RLS policies for messages table

---

## Profile Page Features

### When Viewing Own Profile:
- ✅ Edit Profile button
- ✅ Sign Out button
- ✅ Active, Drafts, Sold tabs
- ✅ Wishlist count in stats
- ✅ Edit/Mark as Sold buttons on listings
- ✅ Can edit listings via modal

### When Viewing Other User's Profile:
- ✅ Only Share button (no edit/sign out)
- ✅ Only Listings and Reviews tabs (no drafts/sold)
- ✅ No wishlist count in stats
- ✅ No edit buttons on listings
- ✅ Shows "Chat with seller" on hover
- ✅ Can view their active listings and reviews

---

## Testing Checklist

- [x] Profile page supports ?user= parameter
- [x] Viewing own profile shows all features
- [x] Viewing other user's profile hides private features
- [x] Chat header navigates to correct profile
- [x] Seller hover shows edit buttons (on Profile page)
- [x] Buyer hover shows chat button
- [ ] Unread badge clears after reading messages (needs database check)

---

## Next Steps for Unread Badge Issue

1. **Check Database:**
   - Verify `is_read` column exists in messages table
   - Check default value is `false`
   - Verify RLS policies allow updates

2. **Add Error Handling:**
   ```typescript
   const { error } = await supabase
     .from('messages')
     .update({ is_read: true })
     .eq('conversation_id', selectedConvo.id)
     .neq('sender_id', user.id)
     .eq('is_read', false);
   
   if (error) {
     console.error('Failed to mark messages as read:', error);
   }
   ```

3. **Check Browser Console:**
   - Look for any errors when opening conversations
   - Check if update query is being called

4. **Manual Database Test:**
   - Try updating messages manually in Supabase SQL editor
   - If it works manually, issue is with RLS policies
   - If it fails, issue is with table structure

---

## Files Modified

1. `src/pages/Profile.tsx`
   - Added `useSearchParams` for URL parameter handling
   - Added `viewingUserId` and `isOwnProfile` logic
   - Conditional rendering based on profile ownership
   - Updated all data fetching to use correct user ID

2. `src/components/ProductCard.tsx`
   - Already correctly implemented seller hover behavior
   - Shows edit buttons when `isOwner && (onEdit || onMarkAsSold)`

3. `src/pages/Messages.tsx`
   - Already has message read logic
   - Needs error handling verification

4. `src/hooks/useUnreadMessages.tsx`
   - Already correctly queries only unread messages
   - Real-time subscription working
