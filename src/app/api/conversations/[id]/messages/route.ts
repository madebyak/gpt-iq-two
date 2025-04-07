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
      
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
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
      role: msg.role,
      content: msg.content,
      topic: msg.topic || 'default',
      extension: msg.extension || '.txt',
      created_at: msg.timestamp || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inserted_at: new Date().toISOString()
    }));
    
    // Insert messages
    const { data, error } = await supabase
      .from('messages')
      .insert(messagesToInsert)
      .select();
      
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to save messages" }, { status: 500 });
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
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error saving messages:", error);
    return NextResponse.json({ error: "Failed to save messages" }, { status: 500 });
  }
}
