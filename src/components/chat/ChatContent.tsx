"use client";

import { useEffect, useRef } from "react";
import { HeadlineEN } from "@/components/chat/HeadlineEN";
import { HeadlineAR } from "@/components/chat/HeadlineAR";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { useChatContext } from "@/components/providers/ChatProvider";
import { Message } from "@/lib/hooks/useChat";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-context";

interface ChatContentProps {
  locale: string;
  conversationId?: string;
  children?: React.ReactNode;
}

export function ChatContent({ locale, conversationId, children }: ChatContentProps) {
  const { messages, isLoading, error, clearMessages } = useChatContext(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === 'ar';
  const router = useRouter();
  const { user } = useAuth();
  
  // Effect to clear messages when navigating to a new chat (conversationId is undefined)
  useEffect(() => {
    if (conversationId === undefined) {
      console.log("ChatContent: conversationId is undefined, calling clearMessages.");
      clearMessages();
    }
  }, [conversationId, clearMessages]);
  
  // Debug the current state with more details
  useEffect(() => {
    console.log(`ChatContent: conversationId=${conversationId}, isLoading=${isLoading}, messagesCount=${messages.length}, hasError=${!!error}`);
    if (messages.length > 0) {
      console.log("First message:", {
        id: messages[0].id,
        role: messages[0].role,
        contentPreview: messages[0].content.substring(0, 50) + (messages[0].content.length > 50 ? '...' : '')
      });
    }
  }, [conversationId, isLoading, messages, error]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      console.log("Scrolling to bottom of messages");
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const renderContent = () => {
    // --- Personalized Greeting Logic ---
    if (user && messages.length === 0 && !isLoading && !error) {
      // Attempt to get first name, provide fallbacks
      const firstName = user.user_metadata?.name?.split(' ')[0] 
                       || user.email?.split('@')[0] 
                       || (isRtl ? 'مرحباً' : 'Hello'); // Generic fallback

      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-4">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-2 headline-gradient py-1">
            {isRtl ? `مرحباً ${firstName}` : `Hello, ${firstName}!`}
          </h2>
          <p className="text-muted-foreground">
            {isRtl ? 'كيف يمكنني مساعدتك اليوم؟' : 'How can I help you today?'}
          </p>
        </div>
      );
    }
    // --- End Personalized Greeting ---
    
    // Default Headline for logged-out users or when there are messages
    if (messages.length === 0 && !isLoading && !error) {
      return (
        <div className="h-full flex items-center justify-center">
          {isRtl ? <HeadlineAR /> : <HeadlineEN />}
        </div>
      );
    }
    
    // For error states, show error message
    if (error) {
      return (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 p-4">
          <div className={cn(
            "bg-card p-6 rounded-lg shadow-lg max-w-md text-center",
            isRtl ? "text-right" : "text-left"
          )}>
            <h3 className="text-lg font-medium mb-2 text-destructive">
              {isRtl ? 'حدث خطأ' : 'Error'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isRtl 
                ? 'حدث خطأ أثناء توليد الاستجابة. يرجى المحاولة مرة أخرى.'
                : 'An error occurred while generating the response. Please try again.'
              }
            </p>
            <button 
              onClick={() => window.location.href = `/${locale}` }
              className={cn(
                "bg-primary text-primary-foreground px-4 py-2 rounded text-sm",
                "flex items-center mx-auto"
              )}
            >
              {isRtl ? (
                <>
                  العودة للمحادثات
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transform scale-x-[-1]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Conversations
                </>
              )}
            </button>
          </div>
        </div>
      );
    }
    
    // For conversations with messages (including loading state)
    return (
      <div className="flex-1 overflow-y-auto pt-10 pb-4 relative">
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
        
        {/* Initial loading state - only show when no messages are available yet */}
        {isLoading && messages.length === 0 && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <p className="text-sm text-muted-foreground">
                {isRtl ? 'جاري التحميل...' : 'Loading conversation...'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "h-full flex flex-col",
        isRtl ? "text-right" : "text-left"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {renderContent()}
      {children}
    </div>
  );
}
