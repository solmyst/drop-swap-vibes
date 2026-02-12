-- Add email notification tracking to messages table

-- Add columns to track email notifications
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS first_reminder_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS second_reminder_sent_at TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_unread_notifications 
ON public.messages(is_read, created_at, first_reminder_sent_at, second_reminder_sent_at)
WHERE is_read = false;

-- Create a view for messages needing first reminder (12 hours)
CREATE OR REPLACE VIEW messages_needing_first_reminder AS
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

-- Create a view for messages needing second reminder (14 hours total)
CREATE OR REPLACE VIEW messages_needing_second_reminder AS
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
  AND m.created_at < NOW() - INTERVAL '14 hours';

-- Grant access to authenticated users (for the API)
GRANT SELECT ON messages_needing_first_reminder TO authenticated;
GRANT SELECT ON messages_needing_second_reminder TO authenticated;

-- Function to mark reminder as sent
CREATE OR REPLACE FUNCTION mark_reminder_sent(
  message_id UUID,
  reminder_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF reminder_type = 'first' THEN
    UPDATE messages 
    SET first_reminder_sent_at = NOW()
    WHERE id = message_id;
  ELSIF reminder_type = 'second' THEN
    UPDATE messages 
    SET second_reminder_sent_at = NOW()
    WHERE id = message_id;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_reminder_sent TO authenticated;

-- Verify setup
SELECT 
  'Email notification system installed' as status,
  COUNT(*) FILTER (WHERE first_reminder_sent_at IS NULL AND is_read = false) as messages_needing_first_reminder,
  COUNT(*) FILTER (WHERE first_reminder_sent_at IS NOT NULL AND second_reminder_sent_at IS NULL AND is_read = false) as messages_needing_second_reminder
FROM messages;
