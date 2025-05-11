"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { useChatContext } from "@/components/providers/ChatProvider";

interface ChatInputProps {
  locale: string;
  isMobile: boolean;
}

export function ChatInput({ locale, isMobile }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading } = useChatContext();
  const t = useTranslations('Chat');
  const isRtl = locale === 'ar';

  // Adjust textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to measure actual content height
      textarea.style.height = 'auto';
      
      // Check if content exceeds max height
      const contentHeight = textarea.scrollHeight;
      const maxHeight = 200;
      
      // Set if overflowing to control overflow CSS
      setIsOverflowing(contentHeight > maxHeight);
      
      // Set height (either auto-expanded or capped at max)
      const newHeight = Math.min(contentHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      sendMessage(message.trim());
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isComposing && !isLoading) {
      if (isMobile) {
        // On mobile, if Shift is pressed, allow newline (default behavior).
        // If only Enter is pressed, also allow newline (don't prevent default, don't submit).
        // The user must use the send button to submit on mobile.
        if (e.shiftKey) {
          return; // Allow default Shift+Enter behavior (newline)
        }
        // For Enter alone on mobile, we also want a newline, so we don't preventDefault.
        // No special action needed here; it will insert a newline by default.
        return;
      } else {
        // Desktop: Enter without Shift submits the form.
        if (!e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
        }
        // Desktop: Shift+Enter will naturally create a newline if not prevented.
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="relative rounded-2xl border border-input bg-background shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={t('chatPlaceholder')}
          disabled={isLoading}
          className={cn(
            "min-h-[60px] w-full resize-none",
            isOverflowing ? "overflow-y-auto" : "overflow-hidden",
            "overflow-x-hidden border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-4",
            isRtl ? "text-right pr-4 pl-14" : "text-left pl-4 pr-14",
            "rounded-2xl text-base placeholder:text-muted-foreground/60",
            isLoading && "opacity-70"
          )}
          dir={isRtl ? "rtl" : "ltr"}
        />
        <button
          type="submit"
          className={cn(
            "absolute top-1/2 -translate-y-1/2", 
            isRtl ? "left-3.5" : "right-3.5",
            "text-muted-foreground/70 hover:text-primary",
            "transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
            "p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full",
            "bg-transparent"
          )}
          disabled={!message.trim() || isLoading}
          aria-label={t('sendMessage')}
        >
          <Send 
            className={cn(
              "h-5 w-5",
              isRtl ? "transform scale-x-[-1]" : "",
              isLoading && "opacity-60"
            )} 
          />
        </button>
      </div>
      {!isMobile && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {t('enterToSend')}
        </p>
      )}
      {isMobile && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {t('sendMessageHintMobile', { defaultValue: 'Tap the send button to send.' })}
        </p>
      )}
    </form>
  );
}
