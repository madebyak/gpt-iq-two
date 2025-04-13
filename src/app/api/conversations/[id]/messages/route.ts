import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const conversationId = params.id;
    
    // Verify that the conversation belongs to the current user
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();
      
    if (conversationError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    
    // Fetch messages
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
        
    console.log(`[API] DETAILED MESSAGE QUERY for conversation [${conversationId}]:`, {
      query: {
        table: 'messages',
        conversation_id: conversationId,
        user_id: user.id
      },
      results: {
        count: data?.length || 0,
        has_error: !!error,
        error: error ? JSON.stringify(error) : null,
        message_ids: data && data.length > 0 ? data.map(m => m.id).slice(0, 5) : [],
        first_message: data && data.length > 0 ? {
          id: data[0].id,
          role: data[0].role,
          content_preview: data[0].content.substring(0, 30),
          created_at: data[0].created_at
        } : null
      }
    });
    
    console.log(`API: Fetching messages for conversation [${conversationId}]`, {
      conversation_id: conversationId,
      user_id: user.id,
      conversation_details: {
        title: conversation.title,
        created_at: conversation.created_at
      },
      results: {
        message_count: data?.length || 0,
        has_error: !!error
      }
    });
    
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
    
    // Create dummy message if none exist
    if (!data || data.length === 0) {
      console.log(`API: No messages found for conversation [${conversationId}], creating dummy welcome message`);
      
      // Create a dummy welcome message for display purposes
      const welcomeMessage = {
        id: 'welcome-' + Date.now(),
        conversation_id: conversationId,
        role: 'assistant',
        content: conversation.title && conversation.title.match(/[\u0600-\u06FF]/) 
          ? `مرحبًا بك في المحادثة "${conversation.title}". يمكنك البدء في الدردشة الآن!`
          : `Welcome to "${conversation.title || 'Chat'}". You can start chatting now!`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        extension: 'none'
      };
      
      // Try to persist this welcome message to avoid future empty conversations
      try {
        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            id: welcomeMessage.id,
            conversation_id: conversationId,
            role: welcomeMessage.role,
            content: welcomeMessage.content,
            created_at: welcomeMessage.created_at,
            updated_at: welcomeMessage.updated_at,
            topic: 'default',
            extension: 'none',
          });
          
        if (insertError) {
          console.error("Error persisting welcome message:", insertError);
          // Continue anyway - return the welcome message even if saving fails
        } else {
          // Update conversation with the welcome message preview
          await supabase
            .from('conversations')
            .update({
              last_message_preview: welcomeMessage.content.substring(0, 100),
              message_count: 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', conversationId);
        }
      } catch (e) {
        console.error("Exception while saving welcome message:", e);
        // Continue anyway
      }
      
      return NextResponse.json([welcomeMessage]);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// Save messages to a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const conversationId = params.id;
    
    // Verify that the conversation belongs to the current user
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();
      
    if (conversationError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }
    
    // Format messages for insertion
    const messagesToInsert = body.messages.map((msg: any) => ({
      conversation_id: conversationId,
      id: msg.id || `api-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: msg.role,
      content: msg.content,
      topic: msg.topic || 'default',
      extension: 'none',
      created_at: msg.timestamp || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inserted_at: new Date().toISOString()
    }));
    
    // Log the incoming messages for debugging
    console.log(`API: Saving ${messagesToInsert.length} messages for conversation [${conversationId}]`);
    
    // Insert messages with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    let insertError = null;
    let insertedData = null;
    
    while (retryCount < maxRetries) {
      try {
        // Insert messages
        const { data, error } = await supabase
          .from('messages')
          .insert(messagesToInsert)
          .select();
          
        if (error) {
          console.error(`Database error on attempt ${retryCount + 1}:`, error);
          insertError = error;
          retryCount++;
          
          // Wait before retrying with exponential backoff
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
          }
        } else {
          insertedData = data;
          insertError = null;
          break; // Success, exit the retry loop
        }
      } catch (e) {
        console.error(`Exception on attempt ${retryCount + 1}:`, e);
        insertError = e;
        retryCount++;
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
        }
      }
    }
    
    if (insertError) {
      console.error("Failed to save messages after multiple attempts:", insertError);
      return NextResponse.json({ error: "Failed to save messages after multiple attempts", details: insertError }, { status: 500 });
    }
    
    // Update the conversation's last_message info
    if (messagesToInsert.length > 0) {
      const lastMessage = messagesToInsert[messagesToInsert.length - 1];
      
      await supabase
        .from('conversations')
        .update({
          updated_at: new Date().toISOString(),
          last_message_preview: lastMessage.content.substring(0, 100),
          message_count: body.total_count || messagesToInsert.length
        })
        .eq('id', conversationId);
    }
    
    return NextResponse.json(insertedData || []);
  } catch (error) {
    console.error("Error saving messages:", error);
    return NextResponse.json({ error: "Failed to save messages", details: error }, { status: 500 });
  }
}
