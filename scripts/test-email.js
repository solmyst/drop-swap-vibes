import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Test email template
function getTestEmail(recipientName, recipientEmail) {
  return {
    subject: `🧪 Test Email from रीवस्त्र Notification System`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .info-box { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            .emoji { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>रीवस्त्र</h1>
              <p>Email Notification System Test</p>
            </div>
            <div class="content">
              <div class="emoji">✅</div>
              <h2 style="text-align: center; color: #28a745;">Test Successful!</h2>
              
              <div class="success-box">
                <strong>🎉 Congratulations!</strong> Your email notification system is working perfectly.
              </div>

              <p>Hi ${recipientName},</p>
              
              <p>This is a test email to verify that your रीवस्त्र notification system is configured correctly.</p>

              <div class="info-box">
                <strong>📧 Email Details:</strong><br>
                <strong>To:</strong> ${recipientEmail}<br>
                <strong>From:</strong> रीवस्त्र Notifications<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                <strong>Status:</strong> ✅ Delivered
              </div>

              <h3>What This Means:</h3>
              <ul>
                <li>✅ Resend API is working</li>
                <li>✅ Email templates are rendering correctly</li>
                <li>✅ Your domain/email configuration is valid</li>
                <li>✅ The notification system is ready to use</li>
              </ul>

              <h3>Next Steps:</h3>
              <ol>
                <li>Check your spam folder if you don't see this email in inbox</li>
                <li>Mark this email as "Not Spam" to ensure future notifications arrive</li>
                <li>The system will now automatically send reminders for unread messages</li>
              </ol>

              <p><strong>How it works:</strong></p>
              <ul>
                <li>First reminder: 12 hours after message is sent (if unread)</li>
                <li>Second reminder: 14 hours after message is sent (if still unread)</li>
                <li>Runs automatically every hour via GitHub Actions</li>
              </ul>

              <p>Best regards,<br>The रीवस्त्र Team</p>
            </div>
            <div class="footer">
              <p>This is a test email from your notification system.</p>
              <p>© 2026 रीवस्त्र. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

async function sendTestEmail() {
  console.log('🧪 Starting email test...\n');

  // Get your admin email from environment or use a default
  const testEmail = process.env.TEST_EMAIL || 'revastraaa@gmail.com';
  
  console.log(`📧 Test email will be sent to: ${testEmail}\n`);

  try {
    // Get admin profile to personalize the email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name, email')
      .eq('email', testEmail)
      .maybeSingle();

    const recipientName = profile?.full_name || profile?.username || 'Admin';
    
    console.log(`👤 Recipient: ${recipientName}`);
    console.log(`📬 Email: ${testEmail}\n`);

    const emailContent = getTestEmail(recipientName, testEmail);

    console.log('📤 Sending test email via Resend...\n');

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'रीवस्त्र <notifications@revastra.me>',
      to: testEmail,
      ...emailContent
    });

    if (error) {
      console.error('❌ Failed to send test email:', error);
      console.error('\n🔍 Troubleshooting:');
      console.error('1. Check if RESEND_API_KEY is set correctly');
      console.error('2. Verify your Resend account is active');
      console.error('3. Check if domain is verified (or use resend.dev domain)');
      process.exit(1);
    }

    console.log('✅ Test email sent successfully!\n');
    console.log('📊 Email Details:');
    console.log(`   ID: ${data.id}`);
    console.log(`   To: ${testEmail}`);
    console.log(`   Status: Sent\n`);
    
    console.log('📬 Next Steps:');
    console.log('1. Check your inbox for the test email');
    console.log('2. Check spam folder if not in inbox');
    console.log('3. View email in Resend dashboard: https://resend.com/emails');
    console.log('4. If successful, the notification system is ready!\n');

    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the test
sendTestEmail();
