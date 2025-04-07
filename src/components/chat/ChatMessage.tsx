"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/hooks/useChat";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/auth-context";

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
  
  // Get user profile picture
  const userProfilePic = profile ? getProfileImageUrl(profile.photoUrl) : "/profile-default.jpg";
  
  // Reference for cursor animation at the end of streamed text
  const cursorRef = useRef<HTMLSpanElement>(null);

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

  return (
    <div
      className={cn(
        "flex w-full items-start gap-x-4 py-4",
        isRtl ? "flex-row-reverse text-right" : "flex-row text-left"
      )}
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
      
      <div className="flex-1 space-y-2">
        <div className={cn(
          "inline-block rounded-lg px-4 py-2 max-w-prose",
          isUser ? "bg-primary/80 text-primary-foreground" : "bg-card text-foreground"
        )}>
          {message.content ? (
            <div className="whitespace-pre-wrap">
              {message.content}
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
      </div>
    </div>
  );
}
