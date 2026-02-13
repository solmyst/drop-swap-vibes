# Complete Uptime Monitoring Setup

## Overview
Two-layer monitoring system to catch any downtime immediately:
1. **UptimeRobot** - External monitoring (website availability)
2. **GitHub Actions** - Internal health checks (auth, database, API)

---

## Part 1: UptimeRobot Setup (5 minutes)

### Step 1: Create Account
1. Go to: https://uptimerobot.com/signUp
2. Sign up with your email (revastraaa@gmail.com)
3. Verify your email
4. **100% FREE** - No credit card needed

### Step 2: Add Website Monitor
1. Click "Add New Monitor"
2. Fill in:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** रीवस्त्र Main Site
   - **URL:** https://revastra.me
   - **Monitoring Interval:** 5 minutes (free tier)
3. Click "Create Monitor"

### Step 3: Add Auth Page Monitor
1. Click "Add New Monitor" again
2. Fill in:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** रीवस्त्र Auth Page
   - **URL:** https://revastra.me/auth
   - **Monitoring Interval:** 5 minutes
3. Click "Create Monitor"

### Step 4: Add Supabase Monitor
1. Click "Add New Monitor" again
2. Fill in:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Supabase API
   - **URL:** https://mmkngwurnttdxiawfqtb.supabase.co/rest/v1/
   - **Monitoring Interval:** 5 minutes
3. Click "Create Monitor"

### Step 5: Set Up Alerts
1. Go to "My Settings" → "Alert Contacts"
2. Add your email:
   - **Type:** Email
   - **Email:** revastraaa@gmail.com
   - **Friendly Name:** Admin Email
3. Verify the email
4. Enable alerts for all monitors

### Optional: Add More Alert Methods
**SMS Alerts (Limited Free):**
- Add phone number in Alert Contacts
- Get SMS when site goes down

**Telegram Alerts (Unlimited Free):**
1. Create Telegram bot: https://t.me/BotFather
2. Get bot token
3. Add as Alert Contact in UptimeRobot
4. Get instant notifications on phone

**Discord/Slack Alerts:**
1. Create webhook in Discord/Slack
2. Add as Alert Contact
3. Get notifications in your server/channel

---

## Part 2: GitHub Actions Health Check

### What It Monitors:
- ✅ Website availability (revastra.me)
- ✅ Auth page accessibility
- ✅ Supabase database connection
- ✅ Database query performance
- ✅ Storage bucket access
- ✅ API response times

### Runs Every: 15 minutes

### Setup Steps:

#### Step 1: Add GitHub Secrets
Go to: https://github.com/solmyst/drop-swap-vibes/settings/secrets/actions

Add these secrets (if not already added):

**1. ALERT_EMAIL**
- Value: `revastraaa@gmail.com`
- Used for: Receiving alert emails

**2. GMAIL_APP_PASSWORD** (Optional - for email alerts)
- Go to: https://myaccount.google.com/apppasswords
- Create app password for "Mail"
- Copy the 16-character password
- Add as secret

**Note:** If you don't want email alerts via Gmail, the workflow will still run and show failures in GitHub Actions.

#### Step 2: Push the Code
The health check files are already created:
- `.github/workflows/health-check.yml`
- `scripts/health-check.js`

Just push to deploy:
```bash
git add .
git commit -m "Add uptime monitoring and health checks"
git push origin main
```

#### Step 3: Test the Health Check
1. Go to: https://github.com/solmyst/drop-swap-vibes/actions
2. Click "Website Health Check" workflow
3. Click "Run workflow" button
4. Watch it run (takes ~30 seconds)
5. Should see all green checkmarks

---

## What You'll Get

### When Everything is Working:
**UptimeRobot:**
- Green status for all monitors
- 99.9%+ uptime percentage
- Response time graphs

**GitHub Actions:**
- ✅ All checks passed
- Detailed performance metrics
- Runs automatically every 15 minutes

### When Something Goes Down:

**UptimeRobot Alerts (Instant):**
```
🚨 Alert: रीवस्त्र Main Site is DOWN

URL: https://revastra.me
Status: Connection timeout
Time: 2026-02-13 10:30 AM
Duration: Just now

View details: [link]
```

**GitHub Actions Alerts:**
```
🚨 रीवस्त्र Health Check Failed

Failed checks:
- Website: Connection timeout (10000ms)
- Auth Page: Status 503 (5000ms)

Time: 2026-02-13 10:30 AM
Check details: [GitHub Actions link]
```

**You'll receive:**
- Email notification
- SMS (if configured)
- Telegram/Discord message (if configured)
- GitHub notification

---

## Monitoring Dashboard

### UptimeRobot Dashboard
- URL: https://uptimerobot.com/dashboard
- See all monitors at a glance
- Response time graphs
- Uptime percentage
- Incident history

### GitHub Actions Dashboard
- URL: https://github.com/solmyst/drop-swap-vibes/actions
- See all health check runs
- Detailed logs for each check
- Performance metrics
- Failure history

---

## Alert Types

### 1. Website Down
**Detected by:** UptimeRobot + GitHub Actions
**Alert:** Immediate email/SMS
**Action:** Check if GitHub Pages is down or DNS issue

### 2. Slow Response
**Detected by:** GitHub Actions
**Alert:** Email notification
**Action:** Check server load, optimize queries

### 3. Auth Page Error
**Detected by:** Both systems
**Alert:** Immediate notification
**Action:** Check Supabase auth service

### 4. Database Issues
**Detected by:** GitHub Actions
**Alert:** Email notification
**Action:** Check Supabase dashboard, RLS policies

### 5. Storage Issues
**Detected by:** GitHub Actions
**Alert:** Email notification
**Action:** Check Supabase storage bucket

---

## Testing the Alerts

### Test UptimeRobot:
1. Go to UptimeRobot dashboard
2. Click on a monitor
3. Click "Pause Monitoring"
4. Wait 5 minutes
5. Should receive "Monitor is paused" notification
6. Resume monitoring

### Test GitHub Actions:
1. Go to: https://github.com/solmyst/drop-swap-vibes/actions
2. Click "Website Health Check"
3. Click "Run workflow"
4. If all passes, you'll see green checkmarks
5. To test failure alerts, temporarily break something (not recommended)

---

## Monitoring Schedule

**UptimeRobot:**
- Checks every 5 minutes
- 288 checks per day
- Instant alerts on failure

**GitHub Actions:**
- Checks every 15 minutes
- 96 checks per day
- Detailed health metrics

**Combined:**
- Maximum 5-minute detection time
- Comprehensive coverage
- Multiple alert channels

---

## Cost Breakdown

**UptimeRobot Free Tier:**
- 50 monitors (using 3)
- 5-minute intervals
- Email alerts: Unlimited
- SMS alerts: Limited
- **Cost: $0/month**

**GitHub Actions:**
- 2,000 minutes/month free
- Using ~48 minutes/month
- **Cost: $0/month**

**Total Cost: $0/month** 🎉

---

## Upgrade Options (Optional)

### UptimeRobot Pro ($7/month):
- 1-minute intervals
- More monitors
- More alert channels
- Status page
- Advanced reporting

### Better Uptime ($10/month):
- 30-second intervals
- Incident management
- Status page
- Phone call alerts
- Team collaboration

**Recommendation:** Start with free tier, upgrade only if needed.

---

## Troubleshooting

### Not Receiving Alerts?

**UptimeRobot:**
1. Check email verification
2. Check spam folder
3. Verify alert contacts are enabled
4. Test with "Pause Monitor" feature

**GitHub Actions:**
1. Check if ALERT_EMAIL secret is set
2. Check if GMAIL_APP_PASSWORD is correct
3. Check GitHub Actions logs
4. Verify workflow is enabled

### False Positives?

**UptimeRobot:**
- Increase timeout duration
- Check from multiple locations
- Adjust sensitivity

**GitHub Actions:**
- Adjust timeout values in script
- Increase acceptable response times
- Check for temporary issues

---

## Maintenance

### Weekly:
- Check UptimeRobot dashboard
- Review uptime percentage
- Check for any incidents

### Monthly:
- Review GitHub Actions logs
- Check for performance trends
- Optimize slow queries if needed

### Quarterly:
- Review alert settings
- Update contact information
- Test all alert channels

---

## Quick Reference

**UptimeRobot Dashboard:**
https://uptimerobot.com/dashboard

**GitHub Actions:**
https://github.com/solmyst/drop-swap-vibes/actions

**Supabase Dashboard:**
https://supabase.com/dashboard/project/mmkngwurnttdxiawfqtb

**Website:**
https://revastra.me

---

## Support

If you need help:
1. Check UptimeRobot docs: https://uptimerobot.com/help
2. Check GitHub Actions logs
3. Check Supabase status: https://status.supabase.com
4. Check GitHub Pages status: https://www.githubstatus.com

---

**Setup Time:** 10-15 minutes
**Maintenance:** 5 minutes/week
**Cost:** $0/month
**Peace of Mind:** Priceless 😊
