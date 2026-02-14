# Discord Notifications Setup Guide

Get instant Discord notifications when:
- 🎉 New user signs up
- 🛍️ New listing is created

## Step 1: Create Discord Webhook (2 minutes)

### 1.1 Open Your Discord Server
1. Open Discord and go to your server
2. Right-click on the channel where you want notifications (e.g., `#revastra-alerts`)
3. Click **"Edit Channel"**

### 1.2 Create Webhook
1. Go to **"Integrations"** tab
2. Click **"Webhooks"** → **"New Webhook"**
3. Name it: `रीवस्त्र Bot`
4. (Optional) Upload a custom avatar
5. Click **"Copy Webhook URL"**

Your webhook URL will look like:
```
https://discord.com/api/webhooks/1234567890/XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Keep this URL safe!** Anyone with it can post to your channel.

---

## Step 2: Add Webhook to Supabase (1 minute)

### 2.1 Store Webhook Securely
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `mmkngwurnttdxiawfqtb`
3. Go to **Settings** (gear icon) → **Vault**
4. Click **"New Secret"**
5. Fill in:
   - **Name:** `DISCORD_WEBHOOK_URL`
   - **Secret:** Paste your webhook URL from Step 1.2
6. Click **"Create Secret"**

---

## Step 3: Run SQL Setup (1 minute)

### 3.1 Execute SQL Script
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `setup-discord-notifications.sql`
4. Paste into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`

### 3.2 Verify Setup
You should see:
```
status                              | info
Discord notifications configured!   | Triggers created for new users and listings
```

---

## Step 4: Test Notifications (1 minute)

### 4.1 Test with SQL
In Supabase SQL Editor, run:

```sql
-- Test notification
SELECT notify_discord(
  (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'DISCORD_WEBHOOK_URL'),
  '✅ **Discord notifications are now active for रीवस्त्र!**',
  'रीवस्त्र Bot'
);
```

You should receive a test message in your Discord channel!

### 4.2 Test with Real Actions
1. **Test User Signup:**
   - Create a new test account on your site
   - Check Discord for the notification

2. **Test New Listing:**
   - Create a new listing
   - Check Discord for the notification

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
1. Create a new webhook in a different channel
2. Update the webhook URL in Supabase Vault

### Customize Bot Name & Avatar
Edit the SQL function:
```sql
CREATE OR REPLACE FUNCTION notify_discord(
  webhook_url TEXT,
  message TEXT,
  username TEXT DEFAULT 'Your Custom Name',  -- Change this
  avatar_url TEXT DEFAULT 'https://your-image-url.com/avatar.png'  -- Change this
)
```

### Add Rich Embeds (Fancy Notifications)
Discord supports rich embeds with colors, images, and fields:

```sql
CREATE OR REPLACE FUNCTION notify_discord_embed(
  webhook_url TEXT,
  title TEXT,
  description TEXT,
  color INTEGER DEFAULT 5814783,  -- Hex color as integer
  thumbnail_url TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
  embed_json JSON;
BEGIN
  embed_json := json_build_object(
    'title', title,
    'description', description,
    'color', color,
    'thumbnail', json_build_object('url', thumbnail_url),
    'timestamp', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );

  SELECT extensions.http_post(
    webhook_url,
    json_build_object(
      'embeds', json_build_array(embed_json)
    )::text,
    'application/json'
  ) INTO request_id;
END;
$$;
```

### Add More Notifications
You can add notifications for:
- New messages
- New reviews
- Verification requests
- Purchases/sales
- User milestones (10th listing, etc.)

Example for new reviews:
```sql
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url TEXT;
  message TEXT;
  seller_name TEXT;
  reviewer_name TEXT;
BEGIN
  SELECT decrypted_secret INTO webhook_url
  FROM vault.decrypted_secrets
  WHERE name = 'DISCORD_WEBHOOK_URL';

  SELECT username INTO seller_name FROM profiles WHERE user_id = NEW.seller_id;
  SELECT username INTO reviewer_name FROM profiles WHERE user_id = NEW.reviewer_id;

  message := '⭐ **New Review!**' || E'\n' ||
             '👤 **Seller:** ' || seller_name || E'\n' ||
             '✍️ **Reviewer:** ' || reviewer_name || E'\n' ||
             '⭐ **Rating:** ' || NEW.rating || '/5' || E'\n' ||
             '💬 **Comment:** ' || LEFT(NEW.comment, 100);

  PERFORM notify_discord(webhook_url, message);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_review
  AFTER INSERT ON seller_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_review();
```

---

## Troubleshooting

### Not Receiving Notifications

**Check 1: Verify Webhook URL**
```sql
-- Run in Supabase SQL Editor
SELECT name, created_at 
FROM vault.decrypted_secrets 
WHERE name = 'DISCORD_WEBHOOK_URL';
```
Should return one row. If not, add the secret again.

**Check 2: Test Webhook Directly**
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"content":"Test from curl"}'
```
Should post to Discord. If not, webhook URL is wrong.

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

### Webhook Deleted or Expired
If someone deletes the webhook in Discord:
1. Create a new webhook (Step 1)
2. Update the URL in Supabase Vault (Step 2)
3. No need to re-run SQL

### Notifications Too Noisy

**Option 1: Filter by Status**
Only notify for approved listings:
```sql
CREATE TRIGGER on_new_listing_created
  AFTER INSERT ON listings
  FOR EACH ROW
  WHEN (NEW.is_approved = true)  -- Add this condition
  EXECUTE FUNCTION notify_new_listing();
```

**Option 2: Separate Channels**
- Create different webhooks for different notification types
- Store multiple webhook URLs in Vault
- Route notifications to appropriate channels

**Option 3: Mute Channel**
Right-click the Discord channel → Mute Channel → Choose duration

---

## Discord vs Other Platforms

### Why Discord?
✅ Super easy setup (3 steps, 5 minutes)
✅ No app creation needed
✅ Rich formatting support
✅ Free forever
✅ Mobile notifications
✅ Can add images and embeds
✅ Thread support for organization

### Comparison

| Feature | Discord | Slack | Email |
|---------|---------|-------|-------|
| Setup Time | 5 min | 10 min | 15 min |
| Free Tier | Unlimited | 10k/month | 3k/month |
| Rich Formatting | ✅ | ✅ | ❌ |
| Mobile App | ✅ | ✅ | ✅ |
| Embeds/Images | ✅ | ✅ | ⚠️ |
| Threads | ✅ | ✅ | ❌ |

---

## Cost

✅ **Completely Free!**
- Discord: Free forever, unlimited webhooks
- Supabase: Webhooks are free
- No additional services needed
- No rate limits for reasonable use

---

## Security Notes

- ✅ Webhook URL stored securely in Supabase Vault
- ✅ Functions use SECURITY DEFINER (needed to access Vault)
- ✅ No sensitive user data exposed (emails are optional)
- ✅ Notifications only go to your private Discord channel
- ⚠️ Don't share webhook URL publicly (anyone can post with it)

---

## Advanced: Mention Users

To mention yourself or a role when important events happen:

```sql
-- Mention a user (get user ID from Discord: Settings > Advanced > Developer Mode > Right-click user > Copy ID)
message := '<@YOUR_USER_ID> 🎉 **New User Signup!**' || ...

-- Mention a role
message := '<@&ROLE_ID> 🛍️ **New Listing Created!**' || ...

-- Mention @everyone (use sparingly!)
message := '@everyone 🚨 **Important Event!**' || ...
```

---

## Next Steps

After setup:
1. ✅ Monitor your Discord channel for new signups
2. ✅ Engage with new users quickly
3. ✅ Review new listings as they're posted
4. ✅ Track growth and activity in real-time

You can also:
- Add more notification types
- Create a dedicated notifications channel
- Set up automated responses with Discord bots
- Track metrics over time
- Add rich embeds with images and colors

---

## Example: Full Setup in 5 Minutes

1. **Discord** (2 min): Right-click channel → Edit → Integrations → Webhooks → New → Copy URL
2. **Supabase** (1 min): Settings → Vault → New Secret → Name: `DISCORD_WEBHOOK_URL` → Paste URL
3. **SQL** (1 min): SQL Editor → Paste `setup-discord-notifications.sql` → Run
4. **Test** (1 min): Create test user or listing → Check Discord

Done! 🎉
