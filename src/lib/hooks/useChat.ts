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
  tokens?: string;
  metadata?: string;
}

export interface ConversationMeta {
  id: string;
  title: string;
  last_message_preview?: string;
  created_at: string;
  updated_at: string;
}

export function useChat(initialConversationId?: string) {
  const { user, isLoading: isAuthLoading } = useAuth();
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
    if (!user) {
      setError("You must be signed in to view conversations");
      return;
    }
    
    try {
      // Clear previous state first
      setMessages([]);
      setIsLoading(true);
      setError(null);
      
      // Set the conversation ID immediately to prevent duplicate loading attempts
      setConversationId(id);
      
      console.log(`[useChat] Loading conversation: ${id}`);
      
      // Fetch conversation metadata
      const { data: conversation, error: convoError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (convoError) {
        console.error("[useChat] Error fetching conversation:", convoError);
        setError("Conversation not found or you don't have access");
        return;
      }
      
      if (conversation) {
        setTitle(conversation.title || "Conversation");
        
        // Fetch messages
        const { data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('created_at', { ascending: true });
          
        console.log(`[useChat] Database query for conversation ${id} messages:`, {
          query: {
            conversation_id: id,
            user_id: user.id
          },
          response: {
            data: messagesData,
            error: msgError,
            count: messagesData?.length || 0
          }
        });
        
        if (msgError) {
          console.error("[useChat] Error fetching messages:", msgError);
          setError("Failed to load messages");
          return;
        }
        
        if (messagesData && messagesData.length > 0) {
          // Check if we only have a welcome message (common issue with previous conversations)
          const onlyHasWelcomeMessage = messagesData.length === 1 && 
            messagesData[0].role === 'assistant' && 
            (messagesData[0].content.includes('This conversation appears to be empty') || 
             messagesData[0].content.includes('يبدو أن هذه المحادثة فارغة'));
          
          // If we only have a welcome message but this is a real conversation (has a title),
          // let's try to fetch messages via the API route instead as a fallback
          if (onlyHasWelcomeMessage && conversation.title && conversation.title !== 'New Conversation') {
            console.log(`[useChat] Only found welcome message for conversation ${id}, trying API route...`);
            
            try {
              // Try loading via the API route which might have different authentication/access patterns
              const response = await fetch(`/api/conversations/${id}/messages`);
              
              if (response.ok) {
                const apiMessages = await response.json();
                
                // Check if the API returned more than just the welcome message
                if (apiMessages && apiMessages.length > 1) {
                  console.log(`[useChat] Successfully loaded ${apiMessages.length} messages via API route`);
                  
                  // Convert API messages to our Message format
                  const loadedMessages: Message[] = apiMessages.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role as MessageRole,
                    content: msg.content,
                    timestamp: new Date(msg.created_at)
                  }));
                  
                  setMessages(loadedMessages);
                  return; // Exit early since we've loaded messages
                } else {
                  console.log(`[useChat] API route also returned empty or welcome-only results`);
                }
              } else {
                console.log(`[useChat] API route failed with status: ${response.status}`);
              }
            } catch (apiErr) {
              console.error(`[useChat] Error trying API route fallback:`, apiErr);
            }
          }
          
          // Convert database messages to our Message format
          const loadedMessages: Message[] = messagesData.map(msg => ({
            id: msg.id,
            role: msg.role as MessageRole,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }));
          
          console.log(`[useChat] Loaded ${loadedMessages.length} messages for conversation ${id}`);
          setMessages(loadedMessages);
        } else {
          console.log(`[useChat] No messages found for conversation ${id}`);
          // If conversation exists but no messages, just set messages to empty.
          // The UI (ChatContent) will handle displaying the appropriate empty state.
          // DO NOT create or save a default "Welcome" message here for existing conversations.
          setMessages([]);
        }
      } else {
        setError("Conversation not found");
        // Ensure messages are cleared if conversation isn't found
        setMessages([]);
      }
    } catch (err) {
      console.error("[useChat] Error loading conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);
  
  // Load existing conversation if conversationId is provided
  useEffect(() => {
    // Wait until authentication is resolved before deciding to load
    if (isAuthLoading) {
      console.log('[useChat] Waiting for auth state...');
      return; // Don't proceed if auth is still loading
    }

    console.log(`[useChat] Auth resolved. User: ${user ? user.id : 'null'}, initialConversationId: ${initialConversationId}`);

    if (initialConversationId && user) {
      console.log(`[useChat] Auth resolved and user exists, calling loadConversation(${initialConversationId})`);
      loadConversation(initialConversationId);
    } else {
      // Reset messages if no conversation ID or no user after auth resolves
      console.log('[useChat] Auth resolved but no user or no initialConversationId, resetting chat.');
      setMessages([]);
      setTitle("New Conversation");
      setConversationId(undefined);
      setError(null); // Clear any previous errors
      setIsLoading(false);
    }
    // Ensure loadConversation is stable if included
  }, [initialConversationId, user, isAuthLoading, loadConversation]);
  
  // Save conversation with debounce
  const saveConversation = useCallback(async () => {
    if (!user || messages.length === 0) return;
    
    let saveAttempts = 0;
    const maxAttempts = 3;
    
    const attemptSave = async () => {
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
            
          if (error) {
            console.error("Error creating conversation:", error);
            throw error;
          }
          
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
            
          if (error) {
            console.error("Error updating conversation:", error);
            throw error;
          }
        }
        
        // Only save messages if we have a conversation ID
        if (currentConversationId) {
          // Get existing messages for this conversation
          const { data: existingMessages, error: fetchError } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', currentConversationId);
            
          if (fetchError) {
            console.error("Error fetching existing messages:", fetchError);
            throw fetchError;
          }
            
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
              extension: 'none', // Add required extension field
              created_at: msg.timestamp.toISOString(),
              updated_at: new Date().toISOString(),
              inserted_at: new Date().toISOString()
            }));
            
            // Insert only new messages
            const { error: msgError } = await supabase
              .from('messages')
              .insert(messagesToInsert);
              
            if (msgError) {
              console.error("Error inserting messages:", msgError);
              throw msgError;
            }
          }
        }
        
        // Update title if it changed
        if (currentTitle !== title) {
          setTitle(currentTitle);
        }
        
        return true;
      } catch (err) {
        console.error(`Save attempt ${saveAttempts + 1}/${maxAttempts} failed:`, err);
        return false;
      } finally {
        setIsSaving(false);
      }
    };
    
    // First attempt
    let success = await attemptSave();
    saveAttempts++;
    
    // Retry up to maxAttempts times with exponential backoff
    while (!success && saveAttempts < maxAttempts) {
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, saveAttempts - 1)));
      success = await attemptSave();
      saveAttempts++;
    }
    
    if (!success) {
      // All attempts failed, but don't show error to user (just log it)
      console.error(`Failed to save conversation after ${maxAttempts} attempts`);
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
    
    console.log(`[useChat] Adding new ${role} message:`, {
      id: newMessage.id,
      contentPreview: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
      timestamp: newMessage.timestamp
    });
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Send a message to the chat API
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setError(null);
        setIsLoading(true); // Set loading state immediately
        
        // Add the user message
        const userMessage = addMessage("user", content);
        
        let currentConversationId = conversationId;
        
        // CRITICAL: First create a new conversation if needed
        if (!currentConversationId) {
          try {
            // Generate a title from the first message
            const newTitle = content.substring(0, 50) + (content.length > 50 ? "..." : "");
            
            console.log(`[DEBUG] Creating new conversation with title: "${newTitle}"`);
            
            // Create new conversation immediately
            const { data, error } = await supabase
              .from('conversations')
              .insert({
                user_id: user?.id,
                title: newTitle,
                last_message_preview: content.substring(0, 100),
                message_count: 1,
                is_archived: false,
                model: "gemini-2.0-flash"
              })
              .select()
              .single();
              
            if (error) {
              console.error("Error creating new conversation:", error);
              throw error;
            }
            
            // Set the conversation ID and title
            currentConversationId = data.id;
            setConversationId(data.id);
            setTitle(newTitle);
            
            // Update URL - but don't redirect during active chat
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              const pathSegments = url.pathname.split('/');
              const locale = pathSegments[1]; // Assuming first segment is locale
              window.history.replaceState({}, '', `/${locale}/chat/${data.id}`);
            }
          } catch (err) {
            console.error("Failed to create conversation:", err);
            // Continue anyway - chat will work in local state
          }
        }
        
        // Define message saving function with retry logic
        const saveMessageWithRetry = async (message: Message, maxRetries = 3) => {
          let retryCount = 0;
          let lastError = null;
          
          console.log(`[DEBUG] Attempting to save message to database:`, {
            id: message.id,
            conversation_id: currentConversationId,
            role: message.role
          });
          
          while (retryCount < maxRetries) {
            try {
              const messageData = {
                id: message.id,
                conversation_id: currentConversationId,
                role: message.role,
                content: message.content,
                created_at: message.timestamp.toISOString(),
                ...(message.tokens && { tokens: message.tokens }),
                ...(message.metadata && { metadata: message.metadata }),
              };
              
              console.log(`[DEBUG] Message data for insert:`, messageData);
              
              // CRITICAL CHANGE: Make this a fully-awaited operation instead of fire-and-forget
              const { data, error } = await supabase
                .from('messages')
                .insert(messageData)
                .select();
                  
              if (error) {
                // Enhanced error logging with specific error details
                const errorDetails = {
                  code: error.code,
                  message: error.message,
                  hint: error.hint,
                  details: error.details
                };
                console.error(`[DEBUG] Save attempt ${retryCount + 1} failed - FULL ERROR DETAILS:`, errorDetails);
                console.error(`[DEBUG] Message that failed to save:`, JSON.stringify(messageData, null, 2));
                lastError = error;
                retryCount++;
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
              } else {
                console.log(`[DEBUG] Message saved successfully on attempt ${retryCount + 1}`, {
                  message_id: message.id,
                  saved_data: data
                });
                return { data, error: null };
              }
            } catch (e) {
              console.error(`[DEBUG] Exception on save attempt ${retryCount + 1}:`, e);
              lastError = e;
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
            }
          }
            
          return { data: null, error: lastError };
        };
        
        // Start message saving in the background
        // CRITICAL CHANGE: We now fully await the message saving before proceeding
        if (currentConversationId && user) {
          console.log(`[DEBUG] Starting user message save for conversation ${currentConversationId}`);
          try {
            const saveResult = await saveMessageWithRetry(userMessage);
            console.log(`[useChat] User message save completed:`, {
              success: !saveResult.error,
              error: saveResult.error ? JSON.stringify(saveResult.error) : null,
              message_id: userMessage.id,
              conversation_id: currentConversationId
            });
            
            if (!saveResult.error) {
              await supabase
                .from('conversations')
                .update({
                  last_message_preview: content.substring(0, 100),
                  message_count: messages.length + 1,
                  updated_at: new Date().toISOString()
                })
                .eq('id', currentConversationId);
              console.log(`[DEBUG] Updated conversation with message preview`);
            }
          } catch (err) {
            console.error("[DEBUG] Critical error during user message save:", err);
          }
        }
        
        // Create a placeholder for the AI response before any saving operations
        const assistantMessage = addMessage("assistant", "");
        
        // Send the request to the API in parallel with saving
        const response = await fetch("/api/chat", {
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
            conversation_id: currentConversationId,
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
        
        // Save the final AI response immediately
        if (currentConversationId && user) {
          // Define AI message saving function with retry logic
          const saveAIMessageWithRetry = async (message: Message, messageContent: string, maxRetries = 3) => {
            let retryCount = 0;
            let lastError = null;
            
            console.log(`[DEBUG] Attempting to save AI message to database:`, {
              id: message.id,
              conversation_id: currentConversationId,
              role: message.role
            });
            
            while (retryCount < maxRetries) {
              try {
                const messageData = {
                  id: message.id,
                  conversation_id: currentConversationId,
                  role: 'assistant',
                  content: messageContent,
                  created_at: message.timestamp.toISOString(),
                  ...(message.tokens && { tokens: message.tokens }),
                  ...(message.metadata && { metadata: message.metadata }),
                };
                
                console.log(`[DEBUG] AI Message data for insert:`, messageData);
                console.log(`[DEBUG] Calling supabase.from('messages').insert for AI message`);
                
                const { data, error } = await supabase
                  .from('messages')
                  .insert(messageData)
                  .select();
                  
                console.log(`[DEBUG] Insert AI message result:`, { success: !error, data: !!data });
                
                if (error) {
                  // Enhanced error logging with specific error details
                  const errorDetails = {
                    code: error.code,
                    message: error.message,
                    hint: error.hint,
                    details: error.details
                  };
                  console.error(`[DEBUG] AI Save attempt ${retryCount + 1} failed - FULL ERROR DETAILS:`, errorDetails);
                  console.error(`[DEBUG] AI Message that failed to save:`, JSON.stringify(messageData, null, 2));
                  lastError = error;
                  retryCount++;
                  // Wait before retry with exponential backoff
                  await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
                } else {
                  console.log(`[DEBUG] AI Message saved successfully on attempt ${retryCount + 1}`, {
                    message_id: message.id,
                    saved_data: data
                  });
                  return { data, error: null };
                }
              } catch (e) {
                console.error(`[DEBUG] Exception on AI save attempt ${retryCount + 1}:`, e);
                lastError = e;
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
              }
            }
            
            return { data: null, error: lastError };
          };
          
          // Save the AI message with retry - CRITICAL CHANGE: fully await the operation
          try {
            console.log(`[DEBUG] Starting AI message save for conversation ${currentConversationId}`);
            const { error: aiMsgError } = await saveAIMessageWithRetry(assistantMessage, responseText);
            
            console.log(`[useChat] AI message save completed:`, {
              success: !aiMsgError,
              error: aiMsgError ? JSON.stringify(aiMsgError) : null,
              message_id: assistantMessage.id,
              conversation_id: currentConversationId
            });
            
            if (!aiMsgError) {
              // Final conversation update
              await supabase
                .from('conversations')
                .update({
                  last_message_preview: responseText.substring(0, 100),
                  message_count: messages.length + 2, // Include both user and AI message
                  updated_at: new Date().toISOString()
                })
                .eq('id', currentConversationId);
                
              console.log(`[DEBUG] Successfully updated conversation with AI message preview`);
            } else {
              console.error(`[DEBUG] Failed to save AI message after multiple retries:`, aiMsgError);
            }
          } catch (aiSaveErr) {
            console.error(`[DEBUG] Critical error during AI message save:`, aiSaveErr);
          }
        }
        
      } catch (err) {
        console.error("Error sending message:", err);
        const errorMessage = err instanceof Error 
          ? (err.message.includes('API error') ? "Unable to generate a response at this time. Please try again later." : err.message)
          : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, messages, conversationId, user, supabase]
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
