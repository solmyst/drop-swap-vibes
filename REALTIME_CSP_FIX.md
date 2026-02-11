# Real-Time Chat CSP Fix

## Issue Found
The WebSocket connection for Supabase Realtime was being blocked by Content Security Policy (CSP).

**Error:**
```
Connecting to 'wss://mmkngwurnttdxiawfqtb.supabase.co/realtime/v1/websocket...' 
violates the following Content Security Policy directive: 
"connect-src 'self' https://mmkngwurnttdxiawfqtb.supabase.co ..."
```

## Root Cause
- CSP only allowed `https://` connections to Supabase
- WebSocket requires `wss://` (WebSocket Secure) protocol
- Browser blocked all WebSocket connections

## Fixes Applied

### 1. Added Realtime Configuration to Supabase Client
**File:** `src/integrations/supabase/client.ts`

Added Realtime options:
```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
  },
});
```

### 2. Updated Content Security Policy
**File:** `index.html`

Added `wss://` WebSocket URL to `connect-src`:
```html
connect-src 'self' 
  https://mmkngwurnttdxiawfqtb.supabase.co 
  wss://mmkngwurnttdxiawfqtb.supabase.co 
  https://api.dicebear.com 
  https://checkout.razorpay.com;
```

## Testing Instructions

1. **Clear Browser Cache:**
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Select "Cached images and files"
   - Click "Clear data"

2. **Hard Refresh:**
   - Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

3. **Test Real-Time Chat:**
   - Open Messages page in two different browsers
   - Login as different users
   - Send a message from User A
   - Message should appear instantly in User B's chat (no refresh needed)

4. **Check Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Should see: `📨 Fetched X messages` and `✅ Messages marked as read successfully`
   - Should NOT see CSP violation errors

5. **Check Network Tab:**
   - Open Developer Tools → Network tab
   - Filter by "WS" (WebSocket)
   - Should see WebSocket connection with status "101 Switching Protocols"

## Expected Behavior After Fix

✅ WebSocket connection establishes successfully
✅ Messages appear in real-time without page refresh
✅ Read receipts update instantly (✓ → ✓✓)
✅ Unread message count updates in real-time
✅ No CSP violation errors in console

## Deployment

Changes pushed to GitHub. Build and deploy:
```bash
npm run build
```

The GitHub Actions workflow will automatically deploy to revastra.me.

## Files Changed
- `src/integrations/supabase/client.ts` - Added Realtime configuration
- `index.html` - Updated CSP to allow WebSocket connections

---

**Status:** ✅ Fixed and ready for deployment
**Date:** February 12, 2026
