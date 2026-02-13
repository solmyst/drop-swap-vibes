# Uptime Monitoring - How It Works

## Understanding SPA 404s vs Real Errors

Your site is a Single Page Application (SPA) on GitHub Pages. This means:

### Normal Behavior (Not an Error)
When you visit `/auth`, `/browse`, or `/store`:
1. GitHub Pages returns HTTP 404 (file doesn't exist)
2. But serves your custom `404.html` with redirect script
3. The script redirects to `/?/auth` (query parameter)
4. Your React app loads and shows the correct page

**This 404 is intentional and working correctly!** ✅

### Real Error (Actual Problem)
If the site is truly broken:
1. HTTP 404 without the redirect script
2. Or the page doesn't contain "रीवस्त्र" or "revastra"
3. Or Supabase connection fails
4. Or response time is too slow

## What We Monitor (7 Checks)

### 1. Website Availability
- Checks: `https://revastra.me`
- Pass: HTTP 200 with content
- Fail: Timeout, 500 error, or no response

### 2. Browse Page
- Checks: `https://revastra.me/browse`
- Pass: Either HTTP 200 OR 404 with SPA redirect script
- Fail: 404 without redirect, or no app content
- **Why:** Verifies SPA routing works

### 3. Supabase Connection
- Checks: Database query to profiles table
- Pass: Query succeeds
- Fail: Connection error or timeout
- **Why:** Verifies backend is accessible

### 4. Database Performance
- Checks: Query 10 active listings
- Pass: Response < 3 seconds
- Fail: Slow query or error
- **Why:** Detects database slowdowns

### 5. Storage Access
- Checks: List files in listings bucket
- Pass: Bucket accessible
- Fail: Permission error or timeout
- **Why:** Verifies image uploads work

### 6. Auth Page
- Checks: `https://revastra.me/auth`
- Pass: Either HTTP 200 OR 404 with SPA redirect
- Fail: 404 without redirect, or no app content
- **Why:** Verifies login/signup page loads

### 7. Response Time
- Checks: `https://revastra.me/store`
- Pass: Response < 5 seconds with valid content
- Fail: Too slow or error
- **Why:** Detects performance issues

## How It Detects Real Problems

The health check is smart about SPA routing:

```javascript
// ✅ PASS: 404 with our redirect script
Status: 404
Content: "Single Page Apps for GitHub Pages"
Result: PASS (SPA routing working)

// ✅ PASS: Direct 200 response
Status: 200
Content: "रीवस्त्र"
Result: PASS (Page loaded directly)

// ❌ FAIL: 404 without redirect
Status: 404
Content: "Page not found" (generic)
Result: FAIL (Real error)

// ❌ FAIL: No app content
Status: 200
Content: Empty or wrong content
Result: FAIL (App not loading)
```

## UptimeRobot Configuration

For UptimeRobot (external monitoring), you have two options:

### Option 1: Monitor Root Only (Recommended)
- URL: `https://revastra.me`
- Expected: HTTP 200
- Why: Root always returns 200, no false alarms

### Option 2: Accept 404 as Success
- URL: `https://revastra.me/auth`
- Expected: HTTP 200 OR 404
- Why: Both mean the site is up (SPA routing)

### Option 3: Keyword Monitoring
- URL: `https://revastra.me/auth`
- Keyword: "रीवस्त्र" or "Redirecting"
- Why: Verifies the page actually loads

## Recommended Setup

### GitHub Actions (Internal - Every 15 min)
✅ Already configured
- Checks all 7 health points
- Smart about SPA routing
- Logs visible in GitHub Actions

### UptimeRobot (External - Every 5 min)
Configure like this:
1. **Monitor Type:** HTTP(s)
2. **URL:** `https://revastra.me`
3. **Monitoring Interval:** 5 minutes
4. **Alert Contacts:** Your email

For auth page specifically:
1. **Monitor Type:** Keyword
2. **URL:** `https://revastra.me/auth`
3. **Keyword:** `रीवस्त्र`
4. **Keyword Type:** Exists
5. **Alert if:** Keyword not found

## What Each Tool Monitors

| Check | GitHub Actions | UptimeRobot |
|-------|---------------|-------------|
| Website up | ✅ | ✅ |
| SPA routing | ✅ | ⚠️ (needs keyword) |
| Supabase | ✅ | ❌ |
| Database | ✅ | ❌ |
| Storage | ✅ | ❌ |
| Auth page | ✅ | ✅ (with keyword) |
| Performance | ✅ | ⚠️ (basic) |

## When You'll Get Alerted

### Real Problems (Will Alert)
- ❌ Website completely down
- ❌ Supabase connection fails
- ❌ Database queries failing
- ❌ Storage bucket inaccessible
- ❌ Pages not loading (no redirect script)
- ❌ Response time > 5 seconds

### Not Problems (Won't Alert)
- ✅ 404 with SPA redirect script
- ✅ Fast response times
- ✅ All pages accessible via routing

## Testing the Monitoring

To verify it's working:

1. **Check GitHub Actions:**
   - Go to: https://github.com/solmyst/drop-swap-vibes/actions
   - Look for "Website Health Check"
   - Should show green checkmarks

2. **Check UptimeRobot:**
   - Log into UptimeRobot dashboard
   - All monitors should show "Up"
   - Check response times

3. **Simulate Failure:**
   - Temporarily break something (e.g., wrong Supabase URL)
   - Wait for next check (15 min for GitHub, 5 min for UptimeRobot)
   - Verify you get alerted
   - Fix it immediately

## Summary

Your monitoring is now smart enough to:
- ✅ Understand SPA routing (404s are OK)
- ✅ Detect real errors (missing content, timeouts)
- ✅ Monitor backend (Supabase, database, storage)
- ✅ Check performance (response times)
- ✅ Verify auth page works

The 404s you see in UptimeRobot for `/auth` are **normal and expected** for SPAs. The health check verifies the redirect script exists and the app loads correctly.
