# 🚨 Supabase Recovery Guide

## Current Issue
Your Supabase project `mmkngwurnttdxiawfqtb.supabase.co` is not resolving (DNS lookup fails).

## Diagnosis Results
- ❌ Project URL not accessible: `mmkngwurnttdxiawfqtb.supabase.co`
- ✅ Main Supabase service is operational
- ✅ Recent Supabase incidents were resolved (Jan 28)

## Possible Causes
1. **Project Paused**: Free tier projects pause after inactivity
2. **Project Deleted**: Accidentally deleted or expired
3. **Region Issues**: Project in affected region during recent incident

## Recovery Steps

### Step 1: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Look for project: `mmkngwurnttdxiawfqtb`
4. Check project status

### Step 2A: If Project is Paused
1. Click "Resume Project" or "Restore Project"
2. Wait 2-5 minutes for project to spin up
3. Test connection again

### Step 2B: If Project is Missing/Deleted
1. Create new Supabase project
2. Copy new project credentials
3. Update `.env` file with new credentials
4. Run database setup script

## New Project Setup (If Needed)

### 1. Create New Project
```bash
# Go to https://supabase.com/dashboard
# Click "New Project"
# Choose organization and region
# Set project name: "drop-swap-vibes"
# Set database password (save it!)
```

### 2. Get New Credentials
After project creation, get these values:
- Project URL: `https://[PROJECT_ID].supabase.co`
- Anon Key: `eyJ...` (from Settings > API)
- Service Role Key: `eyJ...` (from Settings > API)

### 3. Update Environment Variables
Update `.env` file:
```env
VITE_SUPABASE_PROJECT_ID="[NEW_PROJECT_ID]"
VITE_SUPABASE_PUBLISHABLE_KEY="[NEW_ANON_KEY]"
VITE_SUPABASE_URL="https://[NEW_PROJECT_ID].supabase.co"
```

### 4. Setup Database
1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste entire `database_setup.sql` content
3. Run the script
4. Verify all tables are created

### 5. Test Connection
```bash
npm run dev
# Try to sign up/login to test auth
# Try to browse listings to test database
```

## Files to Update (If New Project)
- `.env` - Update all VITE_SUPABASE_* variables
- No code changes needed (all references use env variables)

## Backup Considerations
- User data will be lost if creating new project
- Listings and messages will need to be recreated
- Consider this a fresh start for the platform

## Next Steps
1. Check dashboard first (Step 1)
2. If project exists but paused, resume it (Step 2A)
3. If project missing, create new one (Step 2B)
4. Test the application after recovery
5. Consider setting up regular backups for future

## Contact Support
If issues persist:
- Supabase Support: https://supabase.com/support
- Check status: https://status.supabase.com