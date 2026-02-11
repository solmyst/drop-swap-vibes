# Real-Time Chat Debug Guide

## Step-by-Step Debugging Process

### Step 1: Check Supabase Realtime is Enabled

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Check if **Realtime** is enabled for these tables:
   - `messages`
   - `conversations`

**How to enable:**
- Find the table in the list
- Toggle the switch to enable Realtime
- Click "Save"

---

### Step 2: Check Browser Console Logs

1. Open your website: `https://revastra.me`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Navigate to Messages page
5. Open a conversation

**Look for these logs:**
```
📨 Fetched X messages for conversation [ID]
📖 Marking X messages as read
✅ Messages marked as read successfully
```

**If you see errors:**
- `❌ Error fetching messages:` - Database query issue
- `❌ Error marking messages as read:` - RLS policy issue
- Any subscription errors - Realtime not working

**Share with me:**
- Screenshot of console logs
- Any error messages you see

---

### Step 3: Test Real-Time Subscription

1. Open Messages page in **two different browsers** (or one normal + one incognito)
2. Login as **User A** in Browser 1
3. Login as **User B** in Browser 2
4. Start a conversation between them
5. Send a message from User A
6. **Check Browser 2** - Does the message appear without refresh?

**Expected behavior:**
- Message appears instantly in Browser 2
- No page refresh needed
- Read receipts update (✓ → ✓✓)

**If not working:**
- Messages only appear after refresh → Realtime subscription issue
- Check console for subscription errors

---

### Step 4: Check Supabase Realtime Logs

1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Realtime**
3. Look for connection and subscription events

**What to check:**
- Are there any connection errors?
- Are subscriptions being created?
- Any authentication errors?

**Share with me:**
- Screenshot of Realtime logs
- Any error messages

---

### Step 5: Verify Database Structure

Run this SQL in Supabase SQL Editor:

```sql
-- Check messages table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
```

**Required columns:**
- `id` (uuid)
- `conversation_id` (uuid)
- `sender_id` (uuid)
- `content` (text)
- `image_url` (text, nullable)
- `is_read` (boolean, default false)
- `created_at` (timestamp)

**Share with me:**
- Results of this query
- Note any missing columns

---

### Step 6: Check RLS Policies

Run this SQL:

```sql
-- Check RLS policies on messages table
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages';
```

**Required policies:**
- SELECT policy (users can read messages in their conversations)
- INSERT policy (users can send messages)
- UPDATE policy (users can mark messages as read)

**Share with me:**
- Results of this query
- List of policy names

---

### Step 7: Test Message Insert

Run this SQL (replace with actual IDs):

```sql
-- Test inserting a message
INSERT INTO messages (conversation_id, sender_id, content)
VALUES (
  'YOUR_CONVERSATION_ID',
  'YOUR_USER_ID',
  'Test message'
)
RETURNING *;
```

**If this fails:**
- RLS policy blocking insert
- Missing required fields
- Invalid foreign keys

**Share with me:**
- Success or error message
- Full error text if it fails

---

### Step 8: Test Realtime Subscription Manually

1. Open browser console on Messages page
2. Paste this code:

```javascript
// Test realtime subscription
const channel = supabase
  .channel('test-messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      console.log('🎉 NEW MESSAGE RECEIVED:', payload);
    }
  )
  .subscribe((status) => {
    console.log('📡 Subscription status:', status);
  });

// After 5 seconds, send a test message from another browser
// You should see the log above
```

**Expected output:**
```
📡 Subscription status: SUBSCRIBED
🎉 NEW MESSAGE RECEIVED: { new: {...}, old: null, ... }
```

**Share with me:**
- Console output
- Subscription status
- Whether you received the event

---

### Step 9: Check Network Tab

1. Open Developer Tools → **Network** tab
2. Filter by **WS** (WebSocket)
3. Look for Supabase Realtime connection

**What to check:**
- Is there a WebSocket connection?
- Status: 101 Switching Protocols (good) or error?
- Messages being sent/received?

**Share with me:**
- Screenshot of Network tab with WS filter
- Connection status

---

### Step 10: Verify Environment Variables

Check if Supabase URL is correct:

1. Open browser console
2. Run:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
```

**Expected:**
- URL should be your Supabase project URL
- Key should start with `eyJ...`

**Share with me:**
- The URL (first part only, like `https://xxxxx.supabase.co`)
- Confirm key exists (don't share the full key)

---

## Common Issues & Solutions

### Issue 1: Realtime Not Enabled
**Symptoms:** Messages don't appear without refresh
**Solution:** Enable Realtime in Supabase Dashboard → Database → Replication

### Issue 2: RLS Policy Blocking
**Symptoms:** Console shows "❌ Error marking messages as read"
**Solution:** Run the SQL from `fix-unread-messages-rls.sql`

### Issue 3: Subscription Not Created
**Symptoms:** No subscription logs in console
**Solution:** Check if `supabase` client is initialized correctly

### Issue 4: WebSocket Connection Failed
**Symptoms:** Network tab shows failed WS connection
**Solution:** Check Supabase project status, verify URL

### Issue 5: Messages Table Missing Columns
**Symptoms:** Errors about missing fields
**Solution:** Run database migration to add missing columns

---

## What to Share With Me

After going through these steps, please share:

1. **Console Logs:**
   - Screenshot of console when opening a conversation
   - Any error messages

2. **SQL Query Results:**
   - Messages table structure (Step 5)
   - RLS policies list (Step 6)

3. **Realtime Test:**
   - Result of Step 8 (manual subscription test)
   - Subscription status

4. **Network Tab:**
   - Screenshot showing WebSocket connection (Step 9)

5. **Specific Behavior:**
   - What happens when you send a message?
   - Does it appear in your own chat immediately?
   - Does it appear in the other user's chat without refresh?
   - Do you see any console logs?

---

## Quick Test Checklist

- [ ] Realtime enabled for messages table
- [ ] Realtime enabled for conversations table
- [ ] Console shows "📨 Fetched X messages"
- [ ] Console shows "✅ Messages marked as read successfully"
- [ ] WebSocket connection in Network tab
- [ ] No errors in console
- [ ] Messages appear without refresh (test with 2 browsers)
- [ ] Read receipts update in real-time

---

## Next Steps

Once you've completed these steps and shared the results, I can:
1. Identify the exact issue
2. Provide the specific fix
3. Update the code if needed
4. Help you test the solution

Let's debug this together! 🔍
