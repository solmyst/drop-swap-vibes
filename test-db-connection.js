import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmkngwurnttdxiawfqtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ta25nd3VybnR0ZHhpYXdmcXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzI0ODIsImV4cCI6MjA4MzU0ODQ4Mn0.i0RtfJBvCOqB5nTmNR47ouyQoo1ymoIGFPQkWUcQXeU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing database connection and schema...');
  
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test if all required tables exist
    const tables = ['profiles', 'listings', 'user_passes', 'conversations', 'messages', 'seller_reviews'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table '${table}' not found:`, error.message);
        return false;
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    }
    
    // Test if functions exist
    const { data: functionTest, error: functionError } = await supabase
      .rpc('get_user_chat_limit', { user_id: '00000000-0000-0000-0000-000000000000' });
    
    if (functionError && !functionError.message.includes('invalid input syntax')) {
      console.error('❌ Database functions not found:', functionError.message);
      return false;
    }
    
    console.log('✅ Database functions exist');
    console.log('🎉 Database schema is properly set up!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

testDatabase().then(success => {
  process.exit(success ? 0 : 1);
});