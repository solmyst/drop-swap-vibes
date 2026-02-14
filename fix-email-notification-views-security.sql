-- Fix Security Issue: Remove SECURITY DEFINER from Email Notification Views
-- Run this in Supabase SQL Editor

-- Drop existing views
DROP VIEW IF EXISTS public.messages_needing_first_reminder;
DROP VIEW IF EXISTS public.messages_needing_second_reminder;

-- Recreate views WITHOUT security definer (they will use invoker's permissions)
-- This means the GitHub Actions service role will access them, which is correct

-- View for messages needing first reminder (12 hours)
CREATE OR REPLACE VIEW public.messages_needing_first_reminder 
WITH (security_invoker = true)
AS
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.content,
  m.created_at,
  c.buyer_id,
  c.seller_id,
  -- Determine recipient (not the sender)
  CASE 
    WHEN m.sender_id = c.buyer_id THEN c.seller_id
    ELSE c.buyer_id
  END as recipient_id
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE 
  m.is_read = false
  AND m.first_reminder_sent_at IS NULL
  AND m.created_at < NOW() - INTERVAL '12 hours';

-- View for messages needing second reminder (14 hours total)
CREATE OR REPLACE VIEW public.messages_needing_second_reminder
WITH (security_invoker = true)
AS
SELECT 
  m.id,
  m.conversation_id,
  m.sender_id,
  m.content,
  m.created_at,
  m.first_reminder_sent_at,
  c.buyer_id,
  c.seller_id,
  -- Determine recipient (not the sender)
  CASE 
    WHEN m.sender_id = c.buyer_id THEN c.seller_id
    ELSE c.buyer_id
  END as recipient_id
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE 
  m.is_read = false
  AND m.first_reminder_sent_at IS NOT NULL
  AND m.second_reminder_sent_at IS NULL
  AND m.created_at < NOW() - INTERVAL '24 hours';

-- Grant access to service_role (for GitHub Actions)
-- Note: These views should NOT be accessible to regular authenticated users
-- Only the service role (used by GitHub Actions) should access them
GRANT SELECT ON public.messages_needing_first_reminder TO service_role;
GRANT SELECT ON public.messages_needing_second_reminder TO service_role;

-- Revoke access from authenticated users (security improvement)
REVOKE SELECT ON public.messages_needing_first_reminder FROM authenticated;
REVOKE SELECT ON public.messages_needing_second_reminder FROM authenticated;

-- Verify the fix
SELECT 
  schemaname,
  viewname,
  viewowner,
  'Security fixed - views now use security_invoker' as status
FROM pg_views 
WHERE viewname IN ('messages_needing_first_reminder', 'messages_needing_second_reminder');

-- Test that service_role can still access the views
-- (This will only work if you're running as service_role)
SELECT 
  COUNT(*) as first_reminder_count
FROM public.messages_needing_first_reminder;

SELECT 
  COUNT(*) as second_reminder_count
FROM public.messages_needing_second_reminder;
