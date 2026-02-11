-- Debug Script: Unread Messages Issue
-- Run these queries in Supabase SQL Editor to diagnose why unread badge isn't clearing

-- 1. Check messages table structure
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 2. Check current messages and their read status
SELECT 
  id,
  conversation_id,
  sender_id,
  content,
  is_read,
  created_at
FROM messages
ORDER BY created_at DESC
LIMIT 20;

-- 3. Count unread messages per conversation
SELECT 
  conversation_id,
  sender_id,
  COUNT(*) as unread_count
FROM messages
WHERE is_read = false
GROUP BY conversation_id, sender_id
ORDER BY unread_count DESC;

-- 4. Check if is_read column exists and has correct type
SELECT 
  EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name = 'is_read'
  ) as is_read_column_exists;

-- 5. Check RLS policies on messages table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages';

-- 6. Try to manually mark messages as read (replace with your IDs)
-- IMPORTANT: Replace 'YOUR_CONVERSATION_ID' and 'YOUR_USER_ID' with actual values
/*
UPDATE messages
SET is_read = true
WHERE conversation_id = 'YOUR_CONVERSATION_ID'
AND sender_id != 'YOUR_USER_ID'
AND is_read = false
RETURNING id, is_read;
*/

-- 7. Check if there are any messages without is_read value (NULL)
SELECT 
  COUNT(*) as messages_with_null_is_read
FROM messages
WHERE is_read IS NULL;

-- 8. If is_read column doesn't exist, add it
-- ONLY RUN THIS IF COLUMN DOESN'T EXIST
/*
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false NOT NULL;

-- Update existing messages to be unread
UPDATE messages
SET is_read = false
WHERE is_read IS NULL;
*/

-- 9. Check if RLS is enabled on messages table
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'messages';

-- 10. Test query that useUnreadMessages hook uses
-- Replace 'YOUR_USER_ID' with your actual user ID
/*
SELECT COUNT(*) as unread_count
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE (c.buyer_id = 'YOUR_USER_ID' OR c.seller_id = 'YOUR_USER_ID')
AND m.sender_id != 'YOUR_USER_ID'
AND m.is_read = false;
*/

-- RESULTS INTERPRETATION:
-- 
-- If is_read column doesn't exist:
--   → Run query #8 to add the column
--
-- If RLS policies are blocking updates:
--   → Check query #5 results and update policies
--   → Ensure UPDATE policy allows users to update is_read on messages they receive
--
-- If messages have NULL is_read values:
--   → Run query #8 to set default values
--
-- If manual update (query #6) fails:
--   → RLS policy issue - need to update policies
--
-- If manual update works but app doesn't:
--   → Check browser console for errors
--   → Add error handling in Messages.tsx
