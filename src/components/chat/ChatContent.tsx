"use client";

import { useEffect, useRef } from "react";
import { HeadlineEN } from "@/components/chat/HeadlineEN";
import { HeadlineAR } from "@/components/chat/HeadlineAR";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { useChatContext } from "@/components/providers/ChatProvider";
import { Message } from "@/lib/hooks/useChat";
import { cn } from "@/lib/utils";

interface ChatContentProps {
  locale: string;
  conversationId?: string;
  children?: React.ReactNode;
}

export function ChatContent({ locale, conversationId, children }: ChatContentProps) {
  const { messages, isLoading } = useChatContext(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === 'ar';
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div 
      className={cn(
        "h-full flex flex-col",
        isRtl ? "text-right" : "text-left"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          {isRtl ? <HeadlineAR /> : <HeadlineEN />}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pt-10 pb-4">
          <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            {messages.map((message: Message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                locale={locale} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
