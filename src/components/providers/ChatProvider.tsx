"use client";

import { createContext, useContext, useEffect, ReactNode, useState, useRef } from "react";
import { Message, useChat } from "@/lib/hooks/useChat";

interface ChatContextProps {
  messages: Message[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  title: string;
  conversationId?: string;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  loadConversation: (id: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  conversationId?: string;
}

export function ChatProvider({ children, conversationId }: ChatProviderProps) {
  const chatState = useChat(conversationId);

  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(conversationId?: string) {
  const context = useContext(ChatContext);
  const loadingRef = useRef(false);
  const previousIdRef = useRef<string | undefined>(undefined);
  
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  
  useEffect(() => {
    // Skip if no conversationId provided
    if (!conversationId) {
      previousIdRef.current = undefined;
      return;
    }
    
    // Prevent multiple simultaneous loading attempts
    if (loadingRef.current) {
      console.log(`Skipping redundant load attempt for ${conversationId}`);
      return;
    }
    
    // Check if this is a new conversation or a repeated request
    if (conversationId !== previousIdRef.current) {
      console.log(`Loading new conversation: ${conversationId}`);
      
      // Mark as loading to prevent redundant requests
      loadingRef.current = true;
      previousIdRef.current = conversationId;
      
      // Safely load the conversation
      context.loadConversation(conversationId)
        .catch(error => {
          console.error(`Failed to load conversation ${conversationId}:`, error);
        })
        .finally(() => {
          // Allow future loading attempts once this is complete
          loadingRef.current = false;
        });
    }
  }, [conversationId, context]);
  
  return context;
}
