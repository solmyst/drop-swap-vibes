# Health Check Email Alerts Setup (Optional)

## Current Status
✅ Health checks are running every 15 minutes
✅ Results visible in GitHub Actions
❌ Email notifications are disabled (to avoid errors)

## Why Email Notifications Are Disabled
The email notification step was causing workflow failures because:
1. Gmail App Password secret might not be set
2. Email configuration can be complex
3. GitHub Actions provides good visibility anyway

## How to Check Health Status Without Emails

### Option 1: GitHub Actions Dashboard (Recommended)
1. Go to: https://github.com/solmyst/drop-swap-vibes/actions
2. Look for "Website Health Check" workflow
3. Green checkmark = All healthy ✅
4. Red X = Something failed ❌
5. Click on any run to see detailed logs

### Option 2: Enable GitHub Notifications
1. Go to: https://github.com/solmyst/drop-swap-vibes/settings/notifications
2. Enable "Actions" notifications
3. You'll get GitHub notifications when workflows fail

### Option 3: Watch the Repository
1. Click "Watch" at the top of the repo
2. Select "Custom" → Check "Actions"
3. Get notified of all workflow runs

## How to Enable Email Alerts (Advanced)

If you really want email alerts, follow these steps:

### Step 1: Create Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with revastraaa@gmail.com
3. Create a new app password named "GitHub Health Check"
4. Copy the 16-character password

### Step 2: Add GitHub Secret
1. Go to: https://github.com/solmyst/drop-swap-vibes/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GMAIL_APP_PASSWORD`
4. Value: Paste the app password from Step 1
5. Click "Add secret"

### Step 3: Uncomment Email Notification
Edit `.github/workflows/health-check.yml`:

```yaml
# Remove the # from these lines:
- name: Notify on failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: revastraaa@gmail.com
    password: ${{ secrets.GMAIL_APP_PASSWORD }}
    subject: '🚨 रीवस्त्र Health Check Failed'
    to: revastraaa@gmail.com
    from: रीवस्त्र Monitoring <revastraaa@gmail.com>
    body: |
      Health check failed for revastra.me
      
      Time: ${{ github.event.repository.updated_at }}
      Workflow: ${{ github.workflow }}
      Run: ${{ github.run_number }}
      
      Check details: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}
      
      Please investigate immediately!
```

### Step 4: Test
1. Commit and push the changes
2. Manually trigger the workflow
3. Check if you receive the test email

## What Gets Checked

The health check monitors:
1. ✅ Website availability (revastra.me)
2. ✅ Browse page loads correctly
3. ✅ Supabase connection
4. ✅ Database query performance
5. ✅ Storage bucket access
6. ✅ API response times

## Frequency
- Runs every 15 minutes
- Can be manually triggered anytime
- Results stored for 90 days

## Recommended Approach

**For now:** Just check GitHub Actions occasionally
- Quick: https://github.com/solmyst/drop-swap-vibes/actions
- No setup needed
- No email spam
- Still get notified of issues

**Later:** Set up email alerts if you want instant notifications
- Follow the steps above
- Only get emails when something fails
- More proactive monitoring
