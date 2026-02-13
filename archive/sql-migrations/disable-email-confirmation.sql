-- Disable Email Confirmation in Supabase
-- This allows users to sign up and login immediately without email verification

-- NOTE: This is configured in Supabase Dashboard, not via SQL
-- Go to: Authentication > Settings > Email Auth

-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to Authentication > Settings
-- 4. Scroll to "Email Auth" section
-- 5. DISABLE "Enable email confirmations"
-- 6. Click "Save"

-- This will allow users to:
-- ✅ Sign up and login immediately
-- ✅ No email verification required
-- ✅ Instant access to the platform

-- Security Note:
-- Disabling email confirmation means users can sign up with any email address
-- without proving they own it. This is fine for a marketplace where:
-- - Users need to be verified through other means (phone, ID, etc.)
-- - Email is just for notifications and password reset
-- - The platform has other fraud prevention measures

-- Alternative: Keep email confirmation enabled but improve the flow
-- If you want to keep email confirmation:
-- 1. Set up a custom SMTP server for reliable email delivery
-- 2. Customize the confirmation email template
-- 3. Add a "Resend confirmation email" button
-- 4. Show clear instructions after signup

-- Current Configuration (No SQL needed):
-- The code has been updated to:
-- ✅ Remove "check your email" message after signup
-- ✅ Redirect to homepage immediately after signup
-- ✅ Remove "email not confirmed" error handling
-- ✅ Provide instant access to all features
