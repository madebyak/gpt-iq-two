"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

  const handleTextareaFocus = () => {
    if (isMobile && textareaRef.current) {
      // Delay to allow Safari's scroll, keyboard animation, and ChatLayout height transition (200ms) to settle
      setTimeout(() => {
        if (textareaRef.current) {
          // Scroll the bottom of the textarea to be aligned with the bottom of its scroll container
          textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          console.log('[ChatInput] Attempted textarea.scrollIntoView({ block: \'end\' }) on focus (mobile) after delay');
        }
      }, 250); // Delay should be a bit longer than the layout's height transition (200ms)
    }
  };

  const handleTextareaBlur = () => {
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo(0, 0);
        console.log('[ChatInput] Attempted window.scrollTo(0,0) on blur (mobile)');
      }, 100); 
    }
  };

  const adjustTextareaHeight = useCallback(() => {
    console.log('[ChatInput] adjustTextareaHeight called');
    const textarea = textareaRef.current;
    if (textarea) {
      console.log('[ChatInput] Textarea ref found');

      requestAnimationFrame(() => {
        console.log('[ChatInput] requestAnimationFrame callback');
        setTimeout(() => {
          console.log('[ChatInput] setTimeout callback (after rAF)');
          if (textareaRef.current) {
            // Set to auto, then measure scrollHeight, then set to new pixel height.
            // This is a standard pattern for auto-sizing textareas.
            textareaRef.current.style.height = 'auto'; 
            const currentScrollHeight = textareaRef.current.scrollHeight;
            console.log(`[ChatInput] scrollHeight after auto: ${currentScrollHeight}`);

            let currentMaxHeight = 200;
            // let viewportHeightDebug = "N/A"; // No longer displaying debug info
            if (isMobile) {
              const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
              // viewportHeightDebug = viewportHeight.toFixed(2);
              currentMaxHeight = Math.max(50, Math.min(viewportHeight * 0.35, 180));
            }
            
            setIsOverflowing(currentScrollHeight > currentMaxHeight);
            const newHeight = Math.min(currentScrollHeight, currentMaxHeight);
            console.log(`[ChatInput] Calculated newHeight: ${newHeight}`);
            
            // Only update height if it has actually changed by more than a tiny fraction
            if (Math.abs(textareaRef.current.offsetHeight - newHeight) > 0.5) {
              textareaRef.current.style.height = `${newHeight}px`;
              console.log(`[ChatInput] Textarea height SET to: ${textareaRef.current.style.height}`);
            } else {
              console.log(`[ChatInput] Textarea height ALREADY approx ${newHeight}px, not setting.`);
            }
          }
        }, 0); 
      });
    }
  }, [isMobile, setIsOverflowing]); // Removed message from dependency, as useEffect for message handles calling this.

  // Adjust textarea height based on content
  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Adjust textarea height on viewport resize for mobile
  useEffect(() => {
    if (!isMobile) {
      return;
    }
    console.log('[ChatInput] Setting up mobile resize listener');

    const handleResize = () => {
      console.log('[ChatInput] Mobile resize event triggered!');
      if (window.visualViewport) {
        console.log(`[ChatInput] visualViewport height: ${window.visualViewport.height}, width: ${window.visualViewport.width}, offsetTop: ${window.visualViewport.offsetTop}`);
      } else {
        console.log(`[ChatInput] window.innerHeight: ${window.innerHeight}`);
      }
      adjustTextareaHeight();
    };

    // Call once initially to set height based on current viewport
    console.log('[ChatInput] Initial mobile resize call');
    handleResize(); 

    if (window.visualViewport) {
      console.log('[ChatInput] Attaching to visualViewport.resize');
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        console.log('[ChatInput] Detaching from visualViewport.resize');
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleResize);
        }
      };
    } else {
      console.log('[ChatInput] Attaching to window.resize (fallback)');
      window.addEventListener('resize', handleResize);
      return () => {
        console.log('[ChatInput] Detaching from window.resize (fallback)');
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isMobile, adjustTextareaHeight]);

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
          onFocus={handleTextareaFocus}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onBlur={handleTextareaBlur}
          placeholder={t('chatPlaceholder')}
          disabled={isLoading}
          rows={1}
          style={{ fieldSizing: 'content', WebkitFieldSizing: 'content' } as React.CSSProperties}
          className={cn(
            "w-full resize-none",
            "min-h-[48px] md:min-h-[56px]",
            isOverflowing ? "overflow-y-auto" : "overflow-hidden",
            "overflow-x-hidden border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "py-2 md:py-3",
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
