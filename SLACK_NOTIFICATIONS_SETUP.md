# Slack Notifications Setup Guide

Get instant Slack notifications when:
- 🎉 New user signs up
- 🛍️ New listing is created

## Step 1: Create Slack Webhook

### 1.1 Create Slack App
1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. App Name: `रीवस्त्र Notifications`
5. Pick your workspace
6. Click **"Create App"**

### 1.2 Enable Incoming Webhooks
1. In your app settings, click **"Incoming Webhooks"** in the left sidebar
2. Toggle **"Activate Incoming Webhooks"** to ON
3. Scroll down and click **"Add New Webhook to Workspace"**
4. Select the channel where you want notifications (e.g., `#revastra-alerts`)
5. Click **"Allow"**

### 1.3 Copy Webhook URL
You'll see a webhook URL like:
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```
**Copy this URL** - you'll need it in the next step.

---

## Step 2: Add Webhook to Supabase

### 2.1 Store Webhook Securely
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `mmkngwurnttdxiawfqtb`
3. Go to **Settings** (gear icon) → **Vault**
4. Click **"New Secret"**
5. Fill in:
   - **Name:** `SLACK_WEBHOOK_URL`
   - **Secret:** Paste your webhook URL from Step 1.3
6. Click **"Create Secret"**

---

## Step 3: Run SQL Setup

### 3.1 Execute SQL Script
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `setup-slack-notifications.sql`
4. Paste into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`

### 3.2 Verify Setup
You should see:
```
status                              | info
Slack notifications configured!     | Triggers created for new users and listings
```

---

## Step 4: Test Notifications

### 4.1 Test with SQL
In Supabase SQL Editor, run:

```sql
-- Test notification
SELECT notify_slack(
  (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SLACK_WEBHOOK_URL'),
  '✅ Slack notifications are now active for रीवस्त्र!',
  'रीवस्त्र Bot',
  ':white_check_mark:'
);
```

You should receive a test message in your Slack channel!

### 4.2 Test with Real Actions
1. **Test User Signup:**
   - Create a new test account on your site
   - Check Slack for the notification

2. **Test New Listing:**
   - Create a new listing
   - Check Slack for the notification

---

## What You'll Receive

### New User Notification
```
🎉 New User Signup!
👤 Username: john_doe
📧 Email: john@example.com
📅 Joined: 13 Feb 2026 23:45
🔗 Profile: https://revastra.me/profile?user=abc123
```

### New Listing Notification
```
🛍️ New Listing Created!
📦 Title: Vintage Denim Jacket
💰 Price: ₹1,200
👤 Seller: john_doe
📂 Category: Jackets
🏷️ Condition: Good
📏 Size: M
📅 Listed: 13 Feb 2026 23:50
🔗 View: https://revastra.me/product/xyz789
```

---

## Customization Options

### Change Notification Channel
1. Go to https://api.slack.com/apps
2. Select your app
3. Go to **Incoming Webhooks**
4. Click **"Add New Webhook to Workspace"**
5. Select different channel
6. Update the webhook URL in Supabase Vault

### Customize Messages
Edit the SQL functions in `setup-slack-notifications.sql`:

```sql
-- Example: Add more details to user notification
message := '🎉 *New User Signup!*' || E'\n' ||
           '👤 Username: ' || COALESCE(NEW.username, 'Not set') || E'\n' ||
           '📧 Email: ' || COALESCE(NEW.email, 'Not provided') || E'\n' ||
           '📍 Location: ' || COALESCE(NEW.location, 'Not set') || E'\n' ||  -- Added
           '📅 Joined: ' || to_char(NEW.created_at, 'DD Mon YYYY HH24:MI');
```

### Add More Notifications
You can add notifications for:
- New messages
- New reviews
- Verification requests
- Purchases/sales

Example for new messages:
```sql
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT;
  message TEXT;
BEGIN
  SELECT decrypted_secret INTO webhook_url
  FROM vault.decrypted_secrets
  WHERE name = 'SLACK_WEBHOOK_URL';

  message := '💬 *New Message*' || E'\n' ||
             '📝 ' || LEFT(NEW.content, 100) || '...';

  PERFORM notify_slack(webhook_url, message);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();
```

---

## Troubleshooting

### Not Receiving Notifications

**Check 1: Verify Webhook URL**
```sql
-- Run in Supabase SQL Editor
SELECT name, created_at 
FROM vault.decrypted_secrets 
WHERE name = 'SLACK_WEBHOOK_URL';
```
Should return one row. If not, add the secret again.

**Check 2: Test Webhook Directly**
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test from curl"}'
```
Should post to Slack. If not, webhook URL is wrong.

**Check 3: Check Triggers**
```sql
-- Verify triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('on_new_user_signup', 'on_new_listing_created');
```
Should return 2 rows.

**Check 4: Check Logs**
Go to Supabase Dashboard → Logs → Postgres Logs
Look for any errors related to the triggers.

### Notifications Too Noisy

**Option 1: Filter by Status**
Only notify for approved listings:
```sql
-- Modify the trigger
CREATE TRIGGER on_new_listing_created
  AFTER INSERT ON listings
  FOR EACH ROW
  WHEN (NEW.is_approved = true)  -- Add this condition
  EXECUTE FUNCTION notify_new_listing();
```

**Option 2: Batch Notifications**
Instead of instant notifications, send a daily summary using GitHub Actions.

**Option 3: Separate Channels**
- Create different webhooks for different notification types
- Store multiple webhook URLs in Vault
- Route notifications to appropriate channels

---

## Cost

✅ **Completely Free!**
- Slack: Free tier includes 10,000 messages/month
- Supabase: Webhooks are free
- No additional services needed

---

## Security Notes

- ✅ Webhook URL stored securely in Supabase Vault
- ✅ Functions use SECURITY DEFINER (needed to access Vault)
- ✅ No sensitive user data exposed (emails are optional)
- ✅ Notifications only go to your private Slack channel

---

## Next Steps

After setup:
1. ✅ Monitor your Slack channel for new signups
2. ✅ Engage with new users quickly
3. ✅ Review new listings as they're posted
4. ✅ Track growth and activity in real-time

You can also:
- Add more notification types
- Create a dashboard in Slack
- Set up automated responses
- Track metrics over time
