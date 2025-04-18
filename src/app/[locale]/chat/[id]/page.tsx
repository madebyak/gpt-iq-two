import { ChatLayout } from "@/components/layout/ChatLayout";
import Navbar from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getMessages } from 'next-intl/server';

// Check if the conversation exists before rendering
export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      return { title: "Conversation" };
    }
    
    if (!user) {
      return { title: "Conversation" };
    }
    
    // Verify conversation exists in the database
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching conversation metadata:", error);
        return { title: "Conversation" };
      }
      
      if (!conversation) {
        // This will trigger not-found.tsx
        return notFound();
      }
      
      return { title: conversation.title || "Conversation" };
    } catch (dbError) {
      console.error("Database error in metadata:", dbError);
      return { title: "Conversation" };
    }
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return { title: "Conversation" };
  }
}

export default async function ConversationPage({ 
  params 
}: { 
  params: { locale: string; id: string } 
}) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
    }
    
    if (user) {
      try {
        // Verify conversation exists in the database
        const { data: conversation, error } = await supabase
          .from('conversations')
          .select('id')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching conversation:", error);
        }
        
        if (!conversation) {
          // This will trigger not-found.tsx
          return notFound();
        }
      } catch (dbError) {
        console.error("Database error in page:", dbError);
      }
    }
    
    // Fetch all messages for the locale
    const messages = await getMessages();
    
    return (
      <>
        <Navbar />
        <ChatLayout 
          locale={params.locale}
          conversationId={params.id}
          messages={messages}
        />
      </>
    );
  } catch (error) {
    console.error("Error in ConversationPage:", error);
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md text-center">
            <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Conversation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was a problem loading this conversation. Please try again later.
            </p>
          </div>
        </div>
      </>
    );
  }
}
