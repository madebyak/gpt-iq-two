"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { useChatContext } from "@/components/providers/ChatProvider";

// Add proper type definition for the ChatInputProps interface
interface ChatInputProps {
  locale: string;
  isMobile: boolean;
  onInputFocus?: () => void;
}

// Create a safe wrapper for requestIdleCallback
const safeRequestIdleCallback = (callback: () => void) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback);
  } else {
    // Fallback to setTimeout for browsers without requestIdleCallback
    return setTimeout(callback, 1);
  }
};

// Create a safe wrapper for cancelIdleCallback
const safeCancelIdleCallback = (id: number) => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

// Create a simple memoized input component
const MemoTextarea = memo(Textarea);

export function ChatInput({ locale, isMobile, onInputFocus }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [inputPosition, setInputPosition] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputContainerRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading } = useChatContext();
  const t = useTranslations('Chat');
  const isRtl = locale === 'ar';
  
  // Use a local ref to track input value to avoid unnecessary re-renders
  const inputValueRef = useRef(message);
  const heightUpdatePending = useRef(false);

  // Adjust textarea height with requestAnimationFrame for better performance
  const adjustTextareaHeight = useCallback(() => {
    if (heightUpdatePending.current) return;
    
    heightUpdatePending.current = true;
    
    // Use requestAnimationFrame for smoother visual updates
    requestAnimationFrame(() => {
      if (!textareaRef.current) {
        heightUpdatePending.current = false;
        return;
      }
      
      // Reset height to auto first
      textareaRef.current.style.height = 'auto';
      
      const currentScrollHeight = textareaRef.current.scrollHeight;
      let maxHeight = isMobile ? 180 : 200;
      
      const newHeight = Math.min(currentScrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Use our safe wrapper for non-critical state updates
      safeRequestIdleCallback(() => {
        setIsOverflowing(currentScrollHeight > maxHeight);
        heightUpdatePending.current = false;
      });
    });
  }, [isMobile]);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Update the local ref immediately for instant access
    inputValueRef.current = newValue;
    
    // Apply the new value to the DOM directly for immediate feedback
    if (textareaRef.current) {
      textareaRef.current.value = newValue;
    }
    
    // Now handle UI updates with requestAnimationFrame
    requestAnimationFrame(() => {
      // Update the React state, which will cause a re-render
      setMessage(newValue);
      
      // Schedule height adjustment for the next idle period
      adjustTextareaHeight();
    });
  }, [adjustTextareaHeight]);

  // Adjust height when message changes
  useEffect(() => {
    if (message !== inputValueRef.current) {
      inputValueRef.current = message;
      adjustTextareaHeight();
    }
  }, [message, adjustTextareaHeight]);

  // Mobile keyboard handling
  useEffect(() => {
    if (!isMobile || typeof window === 'undefined' || !window.visualViewport) return;
    
    const handleViewportResize = () => {
      if (!window.visualViewport) return;
      
      const windowHeight = window.innerHeight;
      const viewportHeight = window.visualViewport.height;
      const keyboardHeight = Math.max(0, windowHeight - viewportHeight);
      const isKeyboardShown = keyboardHeight > 20;
      
      if (isKeyboardShown !== isKeyboardVisible) {
        setIsKeyboardVisible(isKeyboardShown);
        setInputPosition(isKeyboardShown ? viewportHeight : windowHeight);
      }
    };
    
    const visualViewport = window.visualViewport;
    visualViewport.addEventListener('resize', handleViewportResize, { passive: true });
    visualViewport.addEventListener('scroll', handleViewportResize, { passive: true });
    
    // Initial check
    handleViewportResize();
    
    return () => {
      visualViewport.removeEventListener('resize', handleViewportResize);
      visualViewport.removeEventListener('scroll', handleViewportResize);
    };
  }, [isMobile, isKeyboardVisible]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValueRef.current.trim() && !isLoading) {
      sendMessage(inputValueRef.current.trim());
      setMessage("");
      inputValueRef.current = "";
      
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [isLoading, sendMessage]);

  // Handle key presses
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isComposing && !isLoading) {
      if (isMobile) {
        if (e.shiftKey) return;
        return;
      } else {
        if (!e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
        }
      }
    }
  }, [handleSubmit, isComposing, isLoading, isMobile]);

  // Handle focusing on the input
  const handleFocus = useCallback((e: React.FocusEvent) => {
    if (onInputFocus) {
      onInputFocus();
    }
  }, [onInputFocus]);

  // Handle composition state (for IME input methods)
  const handleCompositionStart = useCallback(() => setIsComposing(true), []);
  const handleCompositionEnd = useCallback(() => setIsComposing(false), []);

  // Create className for textarea
  const textareaClassName = cn(
    "w-full resize-none",
    "min-h-[48px] md:min-h-[56px]",
    isOverflowing ? "overflow-y-auto" : "overflow-hidden",
    "overflow-x-hidden border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
    "py-2 md:py-3",
    isRtl ? "text-right pr-4 pl-14" : "text-left pl-4 pr-14",
    "rounded-2xl text-base placeholder:text-muted-foreground/60",
    isLoading && "opacity-70"
  );

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8",
        isMobile && "transform-gpu" // Use GPU acceleration
      )}
      style={isMobile ? {
        position: isKeyboardVisible ? 'fixed' : 'relative',
        bottom: isKeyboardVisible ? 0 : 'auto',
        left: 0,
        right: 0,
        zIndex: 50,
        paddingBottom: isKeyboardVisible ? '8px' : '0',
        transform: 'translateZ(0)' // Force hardware acceleration
      } : {}}
      ref={inputContainerRef}
    >
      <div className="relative rounded-2xl border border-input bg-background shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
        <MemoTextarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={t('chatPlaceholder')}
          disabled={isLoading}
          rows={1}
          className={textareaClassName}
          dir={isRtl ? "rtl" : "ltr"}
          autoCorrect="off"
          spellCheck={false}
          autoCapitalize="off"
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
      {isMobile && !isKeyboardVisible && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {t('sendMessageHintMobile', { defaultValue: 'Tap the send button to send.' })}
        </p>
      )}
    </form>
  );
}
