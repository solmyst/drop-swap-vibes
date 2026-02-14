-- Setup Discord Notifications for New Users and Listings
-- Run this in Supabase SQL Editor

-- First, you need to create a Discord Webhook URL:
-- 1. Go to your Discord server
-- 2. Right-click on the channel where you want notifications
-- 3. Click "Edit Channel" → "Integrations" → "Webhooks"
-- 4. Click "New Webhook"
-- 5. Name it "रीवस्त्र Bot"
-- 6. Copy the webhook URL (looks like: https://discord.com/api/webhooks/...)
-- 7. Add it as a secret in Supabase: Settings > Vault > New Secret
--    Name: DISCORD_WEBHOOK_URL
--    Value: Your webhook URL

-- Enable the HTTP extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Function to send Discord notification
CREATE OR REPLACE FUNCTION notify_discord(
  webhook_url TEXT,
  message TEXT,
  username TEXT DEFAULT 'रीवस्त्र Bot',
  avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/shapes/svg?seed=revastra'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Send POST request to Discord webhook
  SELECT extensions.http_post(
    webhook_url,
    json_build_object(
      'content', message,
      'username', username,
      'avatar_url', avatar_url
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
  WHERE name = 'DISCORD_WEBHOOK_URL';

  -- Build message with Discord formatting
  message := '🎉 **New User Signup!**' || E'\n' ||
             '👤 **Username:** ' || COALESCE(NEW.username, 'Not set') || E'\n' ||
             '📧 **Email:** ' || COALESCE(NEW.email, 'Not provided') || E'\n' ||
             '📅 **Joined:** ' || to_char(NEW.created_at, 'DD Mon YYYY HH24:MI') || E'\n' ||
             '🔗 **Profile:** https://revastra.me/profile?user=' || NEW.user_id;

  -- Send notification
  PERFORM notify_discord(webhook_url, message);

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
  WHERE name = 'DISCORD_WEBHOOK_URL';

  -- Get seller username
  SELECT username INTO seller_name
  FROM profiles
  WHERE user_id = NEW.seller_id;

  -- Build message with Discord formatting
  message := '🛍️ **New Listing Created!**' || E'\n' ||
             '📦 **Title:** ' || NEW.title || E'\n' ||
             '💰 **Price:** ₹' || NEW.price || E'\n' ||
             '👤 **Seller:** ' || COALESCE(seller_name, 'Unknown') || E'\n' ||
             '📂 **Category:** ' || NEW.category || E'\n' ||
             '🏷️ **Condition:** ' || NEW.condition || E'\n' ||
             '📏 **Size:** ' || NEW.size || E'\n' ||
             '📅 **Listed:** ' || to_char(NEW.created_at, 'DD Mon YYYY HH24:MI') || E'\n' ||
             '🔗 **View:** https://revastra.me/product/' || NEW.id;

  -- Send notification
  PERFORM notify_discord(webhook_url, message);

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
  'Discord notifications configured!' as status,
  'Triggers created for new users and listings' as info;

-- Test the notification (optional - uncomment to test)
-- SELECT notify_discord(
--   (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'DISCORD_WEBHOOK_URL'),
--   '✅ **Discord notifications are now active for रीवस्त्र!**',
--   'रीवस्त्र Bot'
-- );
