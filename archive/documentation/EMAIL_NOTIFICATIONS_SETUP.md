# Email Notifications Setup Guide

## What This Does
Automatically sends email reminders to users who haven't read their messages:
- **First reminder:** After 12 hours
- **Second reminder:** After 14 hours (2 hours after first)

## Cost: 100% FREE
- ✅ GitHub Actions: 2,000 minutes/month free
- ✅ Resend: 3,000 emails/month free (no credit card)
- ✅ Supabase: Free tier

## Setup Steps

### 1. Create Resend Account (Free, No Credit Card)

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email
4. Go to API Keys: https://resend.com/api-keys
5. Click "Create API Key"
6. Name it "revastra-notifications"
7. Copy the API key (starts with `re_`)

### 2. Add Domain to Resend (Optional but Recommended)

**Option A: Use revastra.me domain**
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter: `revastra.me`
4. Add the DNS records they provide to your domain registrar
5. Wait for verification (usually 5-10 minutes)

**Option B: Use Resend's shared domain (easier)**
- Skip domain setup
- Emails will come from `onboarding@resend.dev`
- Still works perfectly, just less branded

### 3. Get Supabase Service Key

1. Go to https://supabase.com/dashboard/project/mmkngwurnttdxiawfqtb/settings/api
2. Find "Service Role" key (NOT the anon key)
3. Click "Reveal" and copy it
4. ⚠️ Keep this secret! It has admin access

### 4. Add Secrets to GitHub

1. Go to https://github.com/solmyst/drop-swap-vibes/settings/secrets/actions
2. Click "New repository secret"
3. Add these three secrets:

**Secret 1:**
- Name: `RESEND_API_KEY`
- Value: Your Resend API key (from step 1)

**Secret 2:**
- Name: `SUPABASE_SERVICE_KEY`
- Value: Your Supabase service role key (from step 3)

**Secret 3:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://mmkngwurnttdxiawfqtb.supabase.co`

### 5. Run Database Migration

1. Go to https://supabase.com/dashboard/project/mmkngwurnttdxiawfqtb/sql/new
2. Copy the entire contents of `supabase/migrations/add_email_notifications.sql`
3. Paste and click "Run"
4. Should see success message

### 6. Deploy the Code

```bash
git add .
git commit -m "Add email notification system"
git push origin main
```

### 7. Test the Workflow

**Manual Test:**
1. Go to https://github.com/solmyst/drop-swap-vibes/actions
2. Click "Send Email Notifications" workflow
3. Click "Run workflow" button
4. Select "main" branch
5. Click "Run workflow"
6. Watch it run (should complete in ~30 seconds)

**Automatic Schedule:**
- Runs every hour automatically
- No action needed after setup

## How It Works

### Database Changes
- Adds `first_reminder_sent_at` and `second_reminder_sent_at` columns to messages
- Creates views to find messages needing reminders
- Tracks which reminders were sent

### GitHub Actions Workflow
- Runs every hour (on the hour)
- Checks for unread messages
- Sends emails via Resend
- Updates database to track sent emails

### Email Flow
1. User A sends message to User B
2. After 12 hours (if unread):
   - User B gets first reminder email
   - Database marks `first_reminder_sent_at`
3. After 14 hours total (if still unread):
   - User B gets second reminder email
   - Database marks `second_reminder_sent_at`
4. No more reminders after that

## Monitoring

### Check if it's working:
1. Go to https://github.com/solmyst/drop-swap-vibes/actions
2. Look for "Send Email Notifications" runs
3. Click on a run to see logs
4. Should see: "✅ First reminder sent to..." or "Found 0 messages"

### Check Resend dashboard:
1. Go to https://resend.com/emails
2. See all sent emails
3. Check delivery status
4. View email content

## Troubleshooting

### "No emails being sent"
- Check if there are unread messages older than 12 hours
- Verify GitHub secrets are set correctly
- Check workflow logs for errors

### "Emails going to spam"
- Add domain verification in Resend
- Add SPF/DKIM records to your domain
- Or use Resend's shared domain

### "Workflow failing"
- Check GitHub Actions logs
- Verify Supabase service key is correct
- Verify Resend API key is valid

### "Database error"
- Make sure you ran the migration SQL
- Check Supabase logs

## Customization

### Change timing:
Edit `supabase/migrations/add_email_notifications.sql`:
- Change `INTERVAL '12 hours'` to your preferred time
- Change `INTERVAL '14 hours'` for second reminder

### Change email content:
Edit `scripts/send-email-notifications.js`:
- Modify `getFirstReminderEmail()` function
- Modify `getSecondReminderEmail()` function

### Change schedule:
Edit `.github/workflows/email-notifications.yml`:
- Change `cron: '0 * * * *'` (currently every hour)
- Examples:
  - Every 2 hours: `0 */2 * * *`
  - Every 6 hours: `0 */6 * * *`
  - Twice a day: `0 0,12 * * *`

## Cost Monitoring

### Free tier limits:
- **Resend:** 3,000 emails/month
- **GitHub Actions:** 2,000 minutes/month
- **This workflow uses:** ~1 minute per run = 720 minutes/month

### If you exceed limits:
- Resend: Emails stop sending (no charges)
- GitHub Actions: Workflow stops (no charges)
- Both notify you before limits

## Email Preview

### First Reminder (12 hours):
```
Subject: 💬 You have an unread message from [Sender] on रीवस्त्र

Hi [Name],

[Sender] sent you a message 12 hours ago that you haven't read yet:

"[Message preview...]"

Don't keep them waiting! Reply now to continue the conversation.

[View Message Button]
```

### Second Reminder (14 hours):
```
Subject: ⏰ Final reminder: Message from [Sender] on रीवस्त्र

Hi [Name],

⚠️ This is your final reminder!

[Sender] is still waiting for your response. Their message from 14 hours ago:

"[Message preview...]"

Quick responses help build trust in our community.

[Reply Now Button]
```

## Next Steps

After setup:
1. Wait for first scheduled run (top of next hour)
2. Check GitHub Actions logs
3. Check Resend dashboard
4. Test by sending a message and waiting 12 hours (or manually trigger workflow)

## Support

If you need help:
1. Check GitHub Actions logs first
2. Check Resend dashboard for delivery issues
3. Check Supabase logs for database errors
4. Verify all secrets are set correctly
