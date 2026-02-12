import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Email template for first reminder (12 hours)
function getFirstReminderEmail(recipientName, senderName, messagePreview) {
  return {
    subject: `💬 You have an unread message from ${senderName} on रीवस्त्र`,
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
            .message-preview { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>रीवस्त्र</h1>
              <p>You have a new message!</p>
            </div>
            <div class="content">
              <p>Hi ${recipientName},</p>
              <p><strong>${senderName}</strong> sent you a message 12 hours ago that you haven't read yet:</p>
              <div class="message-preview">
                <p><em>"${messagePreview}"</em></p>
              </div>
              <p>Don't keep them waiting! Reply now to continue the conversation.</p>
              <a href="https://revastra.me/messages" class="button">View Message</a>
              <p>Best regards,<br>The रीवस्त्र Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this because you have unread messages on रीवस्त्र.</p>
              <p>© 2026 रीवस्त्र. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

// Email template for second reminder (14 hours)
function getSecondReminderEmail(recipientName, senderName, messagePreview) {
  return {
    subject: `⏰ Final reminder: Message from ${senderName} on रीवस्त्र`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-preview { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 5px; }
            .urgent { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>रीवस्त्र</h1>
              <p>⏰ Final Reminder</p>
            </div>
            <div class="content">
              <p>Hi ${recipientName},</p>
              <div class="urgent">
                <strong>⚠️ This is your final reminder!</strong>
              </div>
              <p><strong>${senderName}</strong> is still waiting for your response. Their message from 14 hours ago:</p>
              <div class="message-preview">
                <p><em>"${messagePreview}"</em></p>
              </div>
              <p>Quick responses help build trust in our community. Please take a moment to reply!</p>
              <a href="https://revastra.me/messages" class="button">Reply Now</a>
              <p>Best regards,<br>The रीवस्त्र Team</p>
            </div>
            <div class="footer">
              <p>This is the last reminder for this message.</p>
              <p>© 2026 रीवस्त्र. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

async function sendNotifications() {
  console.log('🚀 Starting email notification job...');
  
  try {
    // Get messages needing first reminder (12 hours)
    console.log('📧 Checking for messages needing first reminder...');
    const { data: firstReminderMessages, error: firstError } = await supabase
      .from('messages_needing_first_reminder')
      .select('*');

    if (firstError) {
      console.error('❌ Error fetching first reminder messages:', firstError);
    } else {
      console.log(`📬 Found ${firstReminderMessages?.length || 0} messages needing first reminder`);
      
      for (const message of firstReminderMessages || []) {
        try {
          // Get recipient profile
          const { data: recipient } = await supabase
            .from('profiles')
            .select('username, full_name, email')
            .eq('user_id', message.recipient_id)
            .single();

          // Get sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('user_id', message.sender_id)
            .single();

          if (!recipient?.email) {
            console.log(`⚠️ No email for recipient ${message.recipient_id}`);
            continue;
          }

          const recipientName = recipient.full_name || recipient.username || 'there';
          const senderName = sender?.full_name || sender?.username || 'Someone';
          const messagePreview = message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '');

          const emailContent = getFirstReminderEmail(recipientName, senderName, messagePreview);

          // Send email via Resend
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'रीवस्त्र <notifications@revastra.me>',
            to: recipient.email,
            ...emailContent
          });

          if (emailError) {
            console.error(`❌ Failed to send email to ${recipient.email}:`, emailError);
          } else {
            console.log(`✅ First reminder sent to ${recipient.email}`);
            
            // Mark as sent in database
            await supabase.rpc('mark_reminder_sent', {
              message_id: message.id,
              reminder_type: 'first'
            });
          }
        } catch (err) {
          console.error('❌ Error processing message:', err);
        }
      }
    }

    // Get messages needing second reminder (14 hours)
    console.log('📧 Checking for messages needing second reminder...');
    const { data: secondReminderMessages, error: secondError } = await supabase
      .from('messages_needing_second_reminder')
      .select('*');

    if (secondError) {
      console.error('❌ Error fetching second reminder messages:', secondError);
    } else {
      console.log(`📬 Found ${secondReminderMessages?.length || 0} messages needing second reminder`);
      
      for (const message of secondReminderMessages || []) {
        try {
          // Get recipient profile
          const { data: recipient } = await supabase
            .from('profiles')
            .select('username, full_name, email')
            .eq('user_id', message.recipient_id)
            .single();

          // Get sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('user_id', message.sender_id)
            .single();

          if (!recipient?.email) {
            console.log(`⚠️ No email for recipient ${message.recipient_id}`);
            continue;
          }

          const recipientName = recipient.full_name || recipient.username || 'there';
          const senderName = sender?.full_name || sender?.username || 'Someone';
          const messagePreview = message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '');

          const emailContent = getSecondReminderEmail(recipientName, senderName, messagePreview);

          // Send email via Resend
          const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'रीवस्त्र <notifications@revastra.me>',
            to: recipient.email,
            ...emailContent
          });

          if (emailError) {
            console.error(`❌ Failed to send email to ${recipient.email}:`, emailError);
          } else {
            console.log(`✅ Second reminder sent to ${recipient.email}`);
            
            // Mark as sent in database
            await supabase.rpc('mark_reminder_sent', {
              message_id: message.id,
              reminder_type: 'second'
            });
          }
        } catch (err) {
          console.error('❌ Error processing message:', err);
        }
      }
    }

    console.log('✨ Email notification job completed!');
  } catch (error) {
    console.error('❌ Fatal error in notification job:', error);
    process.exit(1);
  }
}

// Run the job
sendNotifications();
