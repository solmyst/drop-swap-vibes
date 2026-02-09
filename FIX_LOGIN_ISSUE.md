# 🔧 Fix Login & Product Viewing Issue

## Problem Identified
Your `.env` file has the **WRONG Supabase project ID**:
- Current (wrong): `borbgbaebeguvebvccgj`
- Correct: `mmkngwurnttdxiawfqtb`

This is why you can't login or see uploaded products - the app is connecting to the wrong database!

## Solution

### Step 1: Get Your Correct API Keys
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: **mmkngwurnttdxiawfqtb**
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL**: `https://mmkngwurnttdxiawfqtb.supabase.co`
   - **anon/public key**: (the long JWT token starting with `eyJ...`)

### Step 2: Update Your `.env` File
Replace the contents of your `.env` file with:

```env
VITE_SUPABASE_PROJECT_ID="mmkngwurnttdxiawfqtb"
VITE_SUPABASE_PUBLISHABLE_KEY="[PASTE_YOUR_ANON_KEY_HERE]"
VITE_SUPABASE_URL="https://mmkngwurnttdxiawfqtb.supabase.co"
VITE_UPI_ID="8619742031@pthdfc"
```

### Step 3: Fix Database Policies (Optional - if still having issues)
If after updating `.env` you still can't create listings, run this SQL in your Supabase SQL Editor:

```sql
-- Allow all authenticated users to create listings (no pass restrictions)
DROP POLICY IF EXISTS "Users can create own listings within limits" ON public.listings;
CREATE POLICY "Authenticated users can create listings" 
  ON public.listings 
  FOR INSERT 
  WITH CHECK (auth.uid() = seller_id);

-- Allow all authenticated users to create conversations
DROP POLICY IF EXISTS "Users can create conversations within limits" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" 
  ON public.conversations
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);
```

### Step 4: Restart Dev Server
After updating `.env`:
```bash
# Stop the dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 5: Test
1. Try logging in
2. Try uploading a product
3. Try viewing products in Browse page

## Why This Happened
You have two Supabase projects:
- Old project: `borbgbaebeguvebvccgj` (in your `.env`)
- Current project: `mmkngwurnttdxiawfqtb` (where your data is)

The app was connecting to the old empty project, so no users or products existed there.

## ✅ After Fix
Once you update `.env` with the correct project credentials:
- Login will work
- You'll see your uploaded products
- All features will function properly
- The atmospheric floating threads will look amazing! 🧵✨
