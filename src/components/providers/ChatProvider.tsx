"use client";

import { createContext, useContext, ReactNode } from "react";
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
}

export function ChatProvider({ children }: ChatProviderProps) {
  const chatState = useChat();

  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(conversationId?: string) {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  
  // If a conversation ID is provided and it doesn't match the current one,
  // load the conversation (this is handled by the useChat hook's useEffect)
  
  return context;
}
