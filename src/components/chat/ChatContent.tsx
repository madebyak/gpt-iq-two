"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HeadlineEN } from "@/components/chat/HeadlineEN";
import { HeadlineAR } from "@/components/chat/HeadlineAR";

interface ChatContentProps {
  locale: string;
  children?: React.ReactNode;
}

export function ChatContent({ locale, children }: ChatContentProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [showHeadline, setShowHeadline] = useState(true);
  const isRtl = locale === 'ar';
  
  // In a real implementation, this would come from your chat state or API
  useEffect(() => {
    // Only show headline if there are no messages
    if (messages.length > 0) {
      setShowHeadline(false);
    }
  }, [messages]);

  return (
    <div 
      className={`h-full p-4 ${isRtl ? "text-right" : "text-left"}`} 
      dir={isRtl ? "rtl" : "ltr"}
    >
      {showHeadline ? (
        <div className="h-full flex items-center justify-center">
          {isRtl ? <HeadlineAR /> : <HeadlineEN />}
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className="flex flex-col">
              {/* Message content would go here */}
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
          {messages.length === 0 && children}
        </div>
      )}
    </div>
  );
}
