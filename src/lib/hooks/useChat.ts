import { useCallback, useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ConversationMeta {
  id: string;
  title: string;
  last_message_preview?: string;
  created_at: string;
  updated_at: string;
}

export function useChat(initialConversationId?: string) {
  const { user } = useAuth();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [title, setTitle] = useState<string>("New Conversation");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load conversation from database
  const loadConversation = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch conversation metadata
      const { data: conversation, error: convoError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (convoError) throw convoError;
      
      if (conversation) {
        setTitle(conversation.title);
        
        // Fetch messages
        const { data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });
          
        if (msgError) throw msgError;
        
        if (messagesData && messagesData.length > 0) {
          // Convert database messages to our Message format
          const loadedMessages: Message[] = messagesData.map(msg => ({
            id: msg.id,
            role: msg.role as MessageRole,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }));
          
          setMessages(loadedMessages);
        } else {
          // New conversation or no messages
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error loading conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);
  
  // Load existing conversation if conversationId is provided
  useEffect(() => {
    if (initialConversationId && user) {
      setConversationId(initialConversationId);
      loadConversation(initialConversationId);
    } else {
      // Reset messages if no conversation ID
      setMessages([]);
      setTitle("New Conversation");
      setConversationId(undefined);
    }
  }, [initialConversationId, user, loadConversation]);
  
  // Save conversation with debounce
  const saveConversation = useCallback(async () => {
    if (!user || messages.length === 0) return;
    
    try {
      setIsSaving(true);
      
      // Generate title from first user message if needed
      let currentTitle = title;
      if (currentTitle === "New Conversation" && messages.length > 0) {
        const firstUserMsg = messages.find(m => m.role === "user");
        if (firstUserMsg) {
          currentTitle = firstUserMsg.content.substring(0, 50) + (firstUserMsg.content.length > 50 ? "..." : "");
        }
      }
      
      let currentConversationId = conversationId;
      
      // Create or update conversation
      if (!currentConversationId) {
        // Create new conversation
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: currentTitle,
            last_message_preview: messages[messages.length - 1].content.substring(0, 100),
            message_count: messages.length,
            is_archived: false,
            model: "gemini-2.0-flash"
          })
          .select()
          .single();
          
        if (error) throw error;
        
        currentConversationId = data.id;
        setConversationId(data.id);
        
        // Update URL without navigation (if in browser)
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const pathSegments = url.pathname.split('/');
          const locale = pathSegments[1]; // Assuming first segment is locale
          window.history.replaceState({}, '', `/${locale}/chat/${data.id}`);
        }
      } else {
        // Update existing conversation
        const { error } = await supabase
          .from('conversations')
          .update({
            title: currentTitle,
            last_message_preview: messages[messages.length - 1].content.substring(0, 100),
            message_count: messages.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversationId);
          
        if (error) throw error;
      }
      
      // Only save messages if we have a conversation ID
      if (currentConversationId) {
        // Get existing messages for this conversation
        const { data: existingMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', currentConversationId);
          
        const existingIds = new Set((existingMessages || []).map(m => m.id));
        
        // Filter to only new messages that need to be saved
        const newMessages = messages.filter(msg => !existingIds.has(msg.id));
        
        if (newMessages.length > 0) {
          // Format messages for insertion
          const messagesToInsert = newMessages.map(msg => ({
            id: msg.id,
            conversation_id: currentConversationId,
            role: msg.role,
            content: msg.content,
            topic: 'default', // Default topic
            extension: '.txt', // Default extension
            created_at: msg.timestamp.toISOString(),
            updated_at: new Date().toISOString(),
            inserted_at: new Date().toISOString()
          }));
          
          // Insert only new messages
          const { error: msgError } = await supabase
            .from('messages')
            .insert(messagesToInsert);
            
          if (msgError) throw msgError;
        }
      }
      
      // Update title if it changed
      if (currentTitle !== title) {
        setTitle(currentTitle);
      }
      
    } catch (err) {
      console.error("Error saving conversation:", err);
      // Don't show error to user, just log it
    } finally {
      setIsSaving(false);
    }
  }, [messages, user, conversationId, title, supabase]);
  
  // Debounced save with useEffect
  useEffect(() => {
    // Only save if there are messages and user is logged in
    if (messages.length > 0 && user) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set a new timeout to save after delay
      saveTimeoutRef.current = setTimeout(() => {
        saveConversation();
      }, 2000); // 2 second delay
    }
    
    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, user, saveConversation]);
  
  // Add a new message to the chat
  const addMessage = useCallback((role: MessageRole, content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Send a message to the chat API
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setError(null);
        setIsLoading(true);
        
        // Add the user message
        const userMessage = addMessage("user", content);
        
        // Create a placeholder for the AI response
        const assistantMessage = addMessage("assistant", "");
        
        // Send the request to the API
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages
              .concat(userMessage)
              .map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        // Process the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = "";

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Decode and append the chunk to the response text
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          // Update the assistant message with the current response text
          setMessages((currentMessages) =>
            currentMessages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: responseText }
                : msg
            )
          );
        }
        
        // Conversation will be saved by the debounced saveConversation effect
        
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, messages]
  );

  // Clear all messages and start a new conversation
  const clearMessages = useCallback(() => {
    setMessages([]);
    setTitle("New Conversation");
    setConversationId(undefined);
    
    // Update URL if in browser
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const pathSegments = url.pathname.split('/');
      const locale = pathSegments[1]; // Assuming first segment is locale
      window.history.replaceState({}, '', `/${locale}/chat`);
    }
  }, []);

  return {
    messages,
    isLoading,
    isSaving,
    error,
    title,
    conversationId,
    sendMessage,
    clearMessages,
    loadConversation,
  };
}
