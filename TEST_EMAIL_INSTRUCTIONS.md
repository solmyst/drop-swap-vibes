# Test Email Notification System

## Quick Test - Send Email Now!

### Method 1: GitHub Actions (Recommended)

1. **Go to GitHub Actions:**
   https://github.com/solmyst/drop-swap-vibes/actions

2. **Find "Test Email Notification" workflow** in the left sidebar

3. **Click "Run workflow" button** (top right)

4. **Enter email address** (or leave default: revastraaa@gmail.com)

5. **Click green "Run workflow" button**

6. **Wait 30 seconds** and refresh the page

7. **Click on the workflow run** to see logs

8. **Check your email inbox!** (and spam folder)

### Method 2: Local Test (If you have Node.js)

```bash
cd scripts
npm install
node test-email.js
```

## What to Expect

### In GitHub Actions Logs:
```
🧪 Starting email test...
📧 Test email will be sent to: revastraaa@gmail.com
👤 Recipient: [Your Name]
📬 Email: revastraaa@gmail.com
📤 Sending test email via Resend...
✅ Test email sent successfully!
📊 Email Details:
   ID: [email-id]
   To: revastraaa@gmail.com
   Status: Sent
```

### In Your Email Inbox:
- **Subject:** 🧪 Test Email from रीवस्त्र Notification System
- **From:** रीवस्त्र <notifications@revastra.me>
- **Content:** Beautiful HTML email confirming system is working

### Email Will Show:
- ✅ Success message
- 📧 Email details (to, from, time)
- ✅ System status checks
- 📝 How the notification system works
- 🎯 Next steps

## Troubleshooting

### Email Not Received?

**1. Check Spam Folder**
- Gmail: Check "Promotions" and "Spam" tabs
- Outlook: Check "Junk Email" folder

**2. Check Resend Dashboard**
- Go to: https://resend.com/emails
- Look for the test email
- Check delivery status
- View any error messages

**3. Check GitHub Actions Logs**
- Look for error messages
- Common issues:
  - `RESEND_API_KEY` not set
  - `SUPABASE_SERVICE_KEY` not set
  - Domain not verified

**4. Verify Secrets**
Go to: https://github.com/solmyst/drop-swap-vibes/settings/secrets/actions

Make sure these exist:
- ✅ `RESEND_API_KEY`
- ✅ `SUPABASE_SERVICE_KEY`
- ✅ `VITE_SUPABASE_URL`

### Common Errors

**"Failed to send test email"**
- Check if Resend API key is valid
- Verify Resend account is active
- Check if you've exceeded free tier (3,000 emails/month)

**"Domain not verified"**
- Either verify your domain in Resend
- Or change email "from" to use `onboarding@resend.dev`

**"Supabase error"**
- Check if service key is correct
- Verify database migration was run

## After Successful Test

Once you receive the test email:

1. ✅ **Mark as "Not Spam"** to ensure future emails arrive
2. ✅ **Add to contacts** for better deliverability
3. ✅ **Check Resend dashboard** to see email details
4. ✅ **System is ready!** Automatic notifications will now work

## Testing Real Notifications

To test the actual 12-hour reminder system:

### Option A: Wait for Real Messages
1. Have someone send you a message
2. Don't read it for 12 hours
3. You'll get the first reminder email
4. Wait 2 more hours (14 total)
5. You'll get the second reminder email

### Option B: Manually Trigger (Advanced)
1. Create a test message in database
2. Set `created_at` to 13 hours ago
3. Set `is_read` to false
4. Run the notification workflow
5. Should send email immediately

## Monitoring

### Check Email Delivery:
- Resend Dashboard: https://resend.com/emails
- See all sent emails
- Check delivery rates
- View bounce/spam reports

### Check Workflow Runs:
- GitHub Actions: https://github.com/solmyst/drop-swap-vibes/actions
- See all notification runs
- Check logs for errors
- Monitor success rate

### Check Database:
Run in Supabase SQL Editor:
```sql
-- See messages with reminders sent
SELECT 
  id,
  content,
  created_at,
  is_read,
  first_reminder_sent_at,
  second_reminder_sent_at
FROM messages
WHERE first_reminder_sent_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## Next Steps

After successful test:
1. ✅ Email system is working
2. ✅ Automatic hourly checks will run
3. ✅ Users will get reminders for unread messages
4. ✅ Monitor Resend dashboard for delivery stats

## Need Help?

If test fails:
1. Check GitHub Actions logs first
2. Check Resend dashboard
3. Verify all secrets are set
4. Check spam folder
5. Try running test again

---

**Quick Links:**
- Run Test: https://github.com/solmyst/drop-swap-vibes/actions/workflows/test-email.yml
- Resend Dashboard: https://resend.com/emails
- GitHub Secrets: https://github.com/solmyst/drop-swap-vibes/settings/secrets/actions
