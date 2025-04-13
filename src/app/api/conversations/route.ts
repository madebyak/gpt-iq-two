import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Ensure this route is always dynamic and not cached
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const archived = searchParams.get('archived') === 'true';
    
    console.log("Fetching conversations for user:", user.id);
    
    // Fetch conversations - try with flexible field names to handle schema differences
    // First try with the current schema field names
    try {
      const query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', archived)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      const { data, error } = await query;
        
      if (error) {
        throw error;
      }
      
      console.log(`Found ${data.length} conversations`);
      return NextResponse.json(data);
    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch conversations", details: error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations", details: error }, { status: 500 });
  }
}

// Create a new conversation
export async function POST(req: NextRequest) {
  const supabase = createClient();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    
    // Create conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: body.title,
        is_archived: false,
      })
      .select()
      .single();
      
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to create conversation", details: error }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Failed to create conversation", details: error }, { status: 500 });
  }
}
