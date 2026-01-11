# UPI Payment Setup Instructions for रीवस्त्र

## Quick Setup

1. **Update your UPI ID** in `.env` file:
   ```
   VITE_UPI_ID="yourname@paytm"
   ```
   Replace `yourname@paytm` with your actual UPI ID (e.g., `john@phonepe`, `jane@gpay`, etc.)

2. **Run the database migration** (optional, for transaction tracking):
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the UPI transactions migration from `database_setup.sql` (the section at the bottom)

## How It Works

### For Users:
1. User clicks "Pay via UPI" on any paid pass
2. A modal opens with your UPI ID and payment amount
3. User clicks "Pay Now" which opens their UPI app with pre-filled details
4. After payment, user enters their 12-digit UPI transaction ID
5. Pass is activated immediately upon verification

### For You (Admin):
1. View all UPI transactions in `/admin/transactions`
2. See transaction IDs and user details
3. Manual verification system (can be automated later)

## UPI ID Examples

- **PhonePe**: `yourname@ybl`
- **Google Pay**: `yourname@okaxis` or `yourname@okhdfcbank`
- **Paytm**: `yourname@paytm`
- **BHIM**: `yourname@upi`

## Benefits

✅ **No Razorpay account needed**  
✅ **Instant activation** (no waiting for webhooks)  
✅ **Works with any UPI app**  
✅ **Simple transaction tracking**  
✅ **No monthly fees or setup costs**  

## Security Notes

- Transaction IDs are stored for record keeping
- Users cannot activate passes without valid transaction IDs
- Admin can view all transactions for verification
- No sensitive payment data is stored

## Next Steps

1. Replace the UPI ID in `.env` with your actual UPI ID
2. Test the payment flow with a small amount
3. Optionally run the database migration for better transaction tracking
4. Start accepting payments! 🎉

---

**Need help?** The UPI payment system is ready to use immediately after updating your UPI ID in the environment file.