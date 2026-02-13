# Password Reset Setup Guide

## How Password Reset Works

1. User clicks "Forgot password?" on login page
2. User enters email and clicks "Send Reset Email"
3. Supabase sends email with reset link
4. User clicks link → redirected to your site with recovery token
5. User enters new password → password updated in database

## Supabase Configuration Required

### Step 1: Configure Redirect URL in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your site URL to **Redirect URLs**:
   - For production: `https://revastra.me/auth`
   - For development: `http://localhost:8080/auth`
5. Click **Save**

### Step 2: Test Password Reset Flow

1. Go to your site and click "Forgot password?"
2. Enter your email address
3. Check your email inbox (and spam folder)
4. Click the "Reset Password" link in the email
5. You should be redirected to `/auth` with the reset password form
6. Enter your new password and confirm
7. Click "Reset Password"
8. You'll be redirected to login with success message

## Troubleshooting

### Issue: Email not received
**Solution:**
- Check spam/junk folder
- Verify email address is correct
- Check Supabase email settings (Authentication → Email Templates)
- Consider setting up custom SMTP for reliable delivery

### Issue: Link redirects to login instead of reset form
**Solution:**
- Make sure redirect URL is configured in Supabase (see Step 1)
- Clear browser cache and try again
- Check browser console for errors (F12 → Console)
- The URL should contain `#type=recovery&access_token=...`

### Issue: "Failed to reset password" error
**Solution:**
- The reset link may have expired (valid for 1 hour)
- Request a new reset link
- Make sure you're using the latest link from your email

### Issue: Password doesn't meet requirements
**Solution:**
Password must have:
- At least 8 characters
- One uppercase letter (A-Z)
- One lowercase letter (a-z)
- One number (0-9)
- One special character (!@#$%^&*(),.?":{}|<>)

## Email Template Customization (Optional)

You can customize the password reset email in Supabase:

1. Go to **Authentication** → **Email Templates**
2. Select "Reset Password" template
3. Customize the HTML/text
4. Use `{{ .ConfirmationURL }}` for the reset link
5. Click **Save**

## Security Notes

- Reset links expire after 1 hour
- Each link can only be used once
- Old password is invalidated after reset
- User must sign in with new password

## Current Configuration

The code is configured to:
- ✅ Detect recovery token from URL hash (`#type=recovery`)
- ✅ Show reset password form automatically
- ✅ Validate password strength
- ✅ Update password in Supabase auth database
- ✅ Redirect to login after successful reset
- ✅ Handle expired/invalid tokens gracefully

## Testing Locally

To test password reset on localhost:

1. Make sure `http://localhost:8080/auth` is in Supabase Redirect URLs
2. Run your dev server: `npm run dev`
3. Go to `http://localhost:8080/auth`
4. Click "Forgot password?"
5. Enter your email
6. Check email and click reset link
7. Should redirect to `http://localhost:8080/auth#type=recovery&access_token=...`
8. Reset password form should appear automatically

## Production Deployment

Once deployed to `https://revastra.me`:

1. Add `https://revastra.me/auth` to Supabase Redirect URLs
2. Test the full flow on production
3. Monitor for any errors in browser console
4. Check that emails are being delivered

---

**Need Help?**
- Check browser console (F12) for error messages
- Verify Supabase configuration
- Test with a fresh incognito window
- Make sure you're using the latest deployment
