"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Message } from "@/lib/hooks/useChat";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";
import { logger } from "@/lib/utils/logger";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: Message;
  locale: string;
}

export function ChatMessage({ message, locale }: ChatMessageProps) {
  const { theme } = useTheme();
  const { profile, getProfileImageUrl } = useAuth();
  const t = useTranslations("Chat");
  const isUser = message.role === "user";
  const isRtl = locale === "ar";
  const [avatarSrc, setAvatarSrc] = useState("/dark-chat-avatar.png");
  const [canShare, setCanShare] = useState(false);
  
  // Get user profile picture
  const userProfilePic = profile ? getProfileImageUrl(profile.photoUrl) : "/profile-default.jpg";
  
  // Reference for cursor animation at the end of streamed text
  const cursorRef = useRef<HTMLSpanElement>(null);
  
  // Debug message content
  useEffect(() => {
    console.log(`ChatMessage: Rendering message [${message.id.substring(0, 8)}...]`, {
      role: message.role,
      content_length: message.content?.length || 0,
      content_preview: message.content?.substring(0, 30) + (message.content?.length > 30 ? '...' : '') || 'No content',
      isRtl: isRtl
    });
  }, [message.id, message.role, message.content, isRtl]);

  // Set the correct avatar based on theme
  useEffect(() => {
    setAvatarSrc(theme === "dark" ? "/dark-chat-avatar.png" : "/light-chat-avatar.png");
  }, [theme]);

  // Animate cursor blinking at the end of text while streaming
  useEffect(() => {
    if (!message.content && !isUser && cursorRef.current) {
      const interval = setInterval(() => {
        if (cursorRef.current) {
          cursorRef.current.style.opacity = cursorRef.current.style.opacity === "0" ? "1" : "0";
        }
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [message.content, isUser]);
  
  // Detect if message content contains Arabic text to apply appropriate text direction
  const hasArabicContent = message.content && /[\u0600-\u06FF]/.test(message.content);
  const messageTextDirection = hasArabicContent || isRtl ? "rtl" : "ltr";

  // --- BEGIN LOGGING ---
  if (!message.content && !isUser) {
    try {
      const thinkingText = t("thinking");
      logger.debug('[ChatMessage] Attempting to render thinking indicator.', { 
        locale, 
        messageId: message.id.substring(0, 8),
        translationResult: thinkingText,
        translationAvailable: true
      });
    } catch (error) {
      logger.error('[ChatMessage] Error retrieving "thinking" translation JUST before render.', { 
        locale, 
        messageId: message.id.substring(0, 8),
        errorMessage: error instanceof Error ? error.message : String(error),
        translationAvailable: false 
      });
       // Optionally log the entire t object's keys if helpful, but might be large
       // logger.debug('[ChatMessage] Keys available in t:', { keys: Object.keys(t) }); 
    }
  }
  // --- END LOGGING ---

  // Check for Share API support on mount (client-side only)
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  // Handler for copying text
  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success(isRtl ? "تم النسخ إلى الحافظة" : "Copied to clipboard");
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error(isRtl ? "فشل نسخ النص" : "Failed to copy text");
    }
  };

  // Handler for sharing text
  const handleShare = async () => {
    if (!message.content || !navigator.share) return;
    try {
      await navigator.share({
        text: message.content,
        title: isRtl ? "مشاركة من GPT IQ" : "Shared from GPT IQ", // Optional title
      });
    } catch (err) {
      // Handle errors (e.g., user cancellation) - often silent is fine
      console.error('Failed to share text: ', err);
      // Optional: Show toast only for specific errors, not cancellation
      // if (err.name !== 'AbortError') {
      //   toast.error(isRtl ? "فشل مشاركة النص" : "Failed to share text");
      // }
    }
  };

  // --- Custom Code Renderer with dynamic theme and customStyle ---
  const CodeRenderer = useMemo(() => ({
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : null;

      const inlineStyle = {
        background: 'hsl(var(--muted) / 0.2)',
        padding: '0.1em 0.3em',
        borderRadius: 'var(--radius, 0.3rem)',
        fontFamily: 'var(--font-mono, monospace)'
      };

      if (!inline && language) {
        const syntaxTheme = theme === 'dark' ? vscDarkPlus : vs;
        const codeString = String(children).replace(/\n$/, '');

        // Specific copy handler for this code block
        const handleCodeCopy = async () => {
          try {
            await navigator.clipboard.writeText(codeString);
            toast.success(isRtl ? "تم نسخ الكود" : "Code copied");
          } catch (err) {
            console.error('Failed to copy code: ', err);
            toast.error(isRtl ? "فشل نسخ الكود" : "Failed to copy code");
          }
        };

        // Style for the language name header div
        const langHeaderStyle: React.CSSProperties = {
          fontSize: '0.8rem',
          color: 'hsl(var(--muted-foreground))',
          padding: '0.5rem 1.25rem 0.5rem 0.75rem', 
          fontFamily: 'var(--font-ibm-plex-sans)',
          borderBottom: '1px solid hsl(var(--muted-foreground))',
          display: 'flex',
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: isRtl ? 'row-reverse' : 'row', 
        };

        // Styles for the outer wrapper div
        const wrapperStyle: React.CSSProperties = {
          backgroundColor: 'hsl(var(--muted))', // Back to solid muted
          borderRadius: 'var(--radius, 0.5rem)',
          margin: '0.5rem 0', 
          overflow: 'hidden',
          border: 'none',
        };

        // Custom style for the SyntaxHighlighter
        const highlighterStyle: React.CSSProperties = {
          background: 'transparent',
          padding: '1rem 1.25rem', // Use this for code padding
          margin: 0, 
          // overflowX: 'auto', // Remove this to prioritize wrapping
          whiteSpace: 'pre-wrap',    // Allow wrapping while preserving whitespace
          wordWrap: 'break-word',    // Allow breaking long words if necessary (maps to overflow-wrap)
          border: 'none',           // Ensure no border here
        };

        return (
          <div style={wrapperStyle}>
            {/* Header: Items visually reversed via flexDirection in RTL */}
            <div style={langHeaderStyle}>
              {/* Span will inherit text-align from parent */}
              <span>{language}</span> 
              <Button 
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-70 hover:opacity-100" 
                onClick={handleCodeCopy}
                aria-label={isRtl ? "نسخ الكود" : "Copy code"}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            {/* Highlighter */}
            <SyntaxHighlighter
              style={syntaxTheme} 
              customStyle={highlighterStyle}
              language={language}
              PreTag="div"
              {...props}
            >
              {codeString} 
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code 
          className={className} 
          style={inline ? inlineStyle : { fontFamily: 'var(--font-mono, monospace)' }}
          {...props}
        >
          {children}
        </code>
      );
    }
  }), [theme]); // Depend on the app theme
  // --- End Custom Code Renderer ---

  // Apply link cleanup regex before rendering
  // Looks for: Punctuation -> Optional Space -> Slash -> Optional Space -> URL
  // Replaces with: Punctuation -> Single Space -> URL
  const linkCleanupRegex = /([:,.!?;])\s*\/\s*(https?:\/\/[^\s<>]+)/g;
  const cleanedContent = message.content ? message.content.replace(linkCleanupRegex, '$1 $2') : '';

  return (
    <div
      className={cn(
        "flex w-full items-start gap-x-4 py-4", 
        isRtl ? "text-right" : "text-left" 
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <Image
              src={userProfilePic}
              alt="User"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
            <Image
              src={avatarSrc}
              alt="AI Assistant"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
      
      <div className={cn(
          "flex-1 flex flex-col min-w-0",
          "items-start" // Always align items (bubble) to the start (left)
        )}
      >
        <div className={cn(
          "block rounded-lg px-4 py-2 max-w-prose max-w-full",
          isUser ? "bg-primary/80 text-primary-foreground" : "bg-card text-foreground"
        )}>
          {message.content ? (
            <div 
              style={{ direction: messageTextDirection }}
              className="markdown-content"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                components={CodeRenderer}
              >
                {cleanedContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div className={cn(
              "flex items-center space-x-2", 
              isRtl && "flex-row-reverse space-x-reverse"
            )}>
              <div className="h-2 w-2 relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/30"></div>
                <div className="absolute inset-0.5 rounded-full bg-primary/60"></div>
              </div>
              <span className="animate-gradient text-sm">
                {t("thinking")}
              </span>
            </div>
          )}
        </div>
        
        {!isUser && message.content && (
          <div 
            className={cn(
              "mt-1 flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity",
              "justify-start"
            )}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={handleCopy}
              aria-label={isRtl ? "نسخ النص" : "Copy text"}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {canShare && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={handleShare}
                aria-label={isRtl ? "مشاركة النص" : "Share text"}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
