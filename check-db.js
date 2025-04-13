// Simple script to check database state
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (get these from your .env.local file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Checking Supabase database state...');
  
  try {
    // Get conversations count
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, title, user_id, created_at');
      
    if (convError) {
      console.error('Error fetching conversations:', convError);
      return;
    }
    
    console.log(`Found ${conversations.length} conversations in database`);
    
    // Check each conversation for messages
    for (const conv of conversations) {
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('id, role, content')
        .eq('conversation_id', conv.id);
        
      if (msgError) {
        console.error(`Error fetching messages for conversation ${conv.id}:`, msgError);
        continue;
      }
      
      console.log(`Conversation: "${conv.title || 'Untitled'}" (${conv.id.substring(0,8)}...) has ${messages.length} messages`);
    }
    
  } catch (err) {
    console.error('General error checking database:', err);
  }
}

checkDatabase();
