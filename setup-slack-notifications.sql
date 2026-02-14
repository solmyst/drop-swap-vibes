-- Setup Slack Notifications for New Users and Listings
-- Run this in Supabase SQL Editor

-- First, you need to create a Slack Webhook URL:
-- 1. Go to https://api.slack.com/apps
-- 2. Create a new app or select existing
-- 3. Enable "Incoming Webhooks"
-- 4. Add webhook to your workspace
-- 5. Copy the webhook URL (looks like: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX)
-- 6. Add it as a secret in Supabase: Settings > Vault > New Secret
--    Name: SLACK_WEBHOOK_URL
--    Value: Your webhook URL

-- Enable the HTTP extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Function to send Slack notification
CREATE OR REPLACE FUNCTION notify_slack(
  webhook_url TEXT,
  message TEXT,
  username TEXT DEFAULT 'रीवस्त्र Bot',
  icon_emoji TEXT DEFAULT ':shopping_bags:'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Send POST request to Slack webhook
  SELECT extensions.http_post(
    webhook_url,
    json_build_object(
      'text', message,
      'username', username,
      'icon_emoji', icon_emoji
    )::text,
    'application/json'
  ) INTO request_id;
END;
$$;

-- Function to notify on new user signup
CREATE OR REPLACE FUNCTION notify_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT;
  message TEXT;
BEGIN
  -- Get webhook URL from Supabase Vault
  SELECT decrypted_secret INTO webhook_url
  FROM vault.decrypted_secrets
  WHERE name = 'SLACK_WEBHOOK_URL';

  -- Build message
  message := '🎉 *New User Signup!*' || E'\n' ||
             '👤 Username: ' || COALESCE(NEW.username, 'Not set') || E'\n' ||
             '📧 Email: ' || COALESCE(NEW.email, 'Not provided') || E'\n' ||
             '📅 Joined: ' || to_char(NEW.created_at, 'DD Mon YYYY HH24:MI') || E'\n' ||
             '🔗 Profile: https://revastra.me/profile?user=' || NEW.user_id;

  -- Send notification
  PERFORM notify_slack(webhook_url, message);

  RETURN NEW;
END;
$$;

-- Function to notify on new listing
CREATE OR REPLACE FUNCTION notify_new_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT;
  message TEXT;
  seller_name TEXT;
BEGIN
  -- Get webhook URL from Supabase Vault
  SELECT decrypted_secret INTO webhook_url
  FROM vault.decrypted_secrets
  WHERE name = 'SLACK_WEBHOOK_URL';

  -- Get seller username
  SELECT username INTO seller_name
  FROM profiles
  WHERE user_id = NEW.seller_id;

  -- Build message
  message := '🛍️ *New Listing Created!*' || E'\n' ||
             '📦 Title: ' || NEW.title || E'\n' ||
             '💰 Price: ₹' || NEW.price || E'\n' ||
             '👤 Seller: ' || COALESCE(seller_name, 'Unknown') || E'\n' ||
             '📂 Category: ' || NEW.category || E'\n' ||
             '🏷️ Condition: ' || NEW.condition || E'\n' ||
             '📏 Size: ' || NEW.size || E'\n' ||
             '📅 Listed: ' || to_char(NEW.created_at, 'DD Mon YYYY HH24:MI') || E'\n' ||
             '🔗 View: https://revastra.me/product/' || NEW.id;

  -- Send notification
  PERFORM notify_slack(webhook_url, message);

  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_new_user_signup ON profiles;
CREATE TRIGGER on_new_user_signup
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_user();

-- Create trigger for new listings
DROP TRIGGER IF EXISTS on_new_listing_created ON listings;
CREATE TRIGGER on_new_listing_created
  AFTER INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_listing();

-- Verify setup
SELECT 
  'Slack notifications configured!' as status,
  'Triggers created for new users and listings' as info;

-- Test the notification (optional - uncomment to test)
-- SELECT notify_slack(
--   (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SLACK_WEBHOOK_URL'),
--   '✅ Slack notifications are now active for रीवस्त्र!',
--   'रीवस्त्र Bot',
--   ':white_check_mark:'
-- );
