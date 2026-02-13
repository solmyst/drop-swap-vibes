-- Fix Unread Messages RLS Policy
-- This allows users to mark messages as read when they receive them

-- First, check current RLS policies on messages table
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'messages';

-- Drop existing UPDATE policy if it exists (optional - only if you want to recreate it)
-- DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
-- DROP POLICY IF EXISTS "Users can update messages" ON messages;

-- Create or replace UPDATE policy that allows users to mark received messages as read
CREATE POLICY "Users can mark received messages as read"
ON messages
FOR UPDATE
TO authenticated
USING (
  -- User can update messages in conversations they're part of
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
)
WITH CHECK (
  -- User can update messages in conversations they're part of
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- Verify the policy was created
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'messages' AND cmd = 'UPDATE';

-- Test: Try to mark a message as read (replace with actual IDs)
-- This should work now
/*
UPDATE messages
SET is_read = true
WHERE id = 'YOUR_MESSAGE_ID'
AND conversation_id IN (
  SELECT id FROM conversations
  WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
);
*/

-- Alternative: If you want a simpler policy that allows updating only is_read field
-- (This is more restrictive and secure)
/*
CREATE POLICY "Users can mark messages as read"
ON messages
FOR UPDATE
TO authenticated
USING (
  -- User is part of the conversation AND is not the sender
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
  AND sender_id != auth.uid()
)
WITH CHECK (
  -- Only allow updating is_read field
  -- Note: This check is conceptual - PostgreSQL RLS doesn't support field-level checks
  -- You might need to handle this in your application logic
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);
*/

-- IMPORTANT: After running this, test in your app:
-- 1. Open a conversation with unread messages
-- 2. Check browser console for "✅ Messages marked as read successfully"
-- 3. Check if unread badge clears
-- 4. Refresh page and verify messages stay marked as read
