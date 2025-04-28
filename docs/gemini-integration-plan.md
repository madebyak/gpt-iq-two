# Gemini 2.0 Flash API Integration Plan

## Overview

This document outlines the implementation plan for integrating Google Gemini 2.0 Flash API into our existing Next.js chat interface. The integration will maintain current UI/UX elements while enhancing the chatbot functionality with Gemini's advanced language capabilities.

## Requirements

1. **Interface Requirements**:
   - Maintain existing animated headlines (HeadlineEN/HeadlineAR) as default empty state
   - Headline disappears when user sends first message
   - User messages: mid-grey background with white text
   - AI responses: dark-grey background with white text
   - User profile picture beside user messages
   - Gemini avatar image beside AI responses:
     - Dark theme: `/public/dark-chat-avatar.png`
     - Light theme: `/public/light-chat-avatar.png`

2. **API Requirements**:
   - Use Gemini 2.0 Flash model
   - Implement context preservation between messages
   - Fast API response and text rendering priority
   - Streaming responses for better UX

3. **Loading States**:
   - Use provided icon animation (`/public/icon-loading.json`)
   - Gradient animated effect on loading text

4. **Language Support**:
   - Full RTL support for Arabic
   - Maintain Iraqi dialect as specified in system instructions

## Technical Implementation

### 1. Server-Side API Integration

Create a server-side API route to handle Gemini API requests using Server Actions:

```typescript
// src/app/api/gemini/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse, Message as AIMessage } from "ai";

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

// Generate stream handler for Gemini API
export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    // Map AI messages format to Gemini format
    const geminiMessages = messages.map((message: AIMessage) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    }));

    // Initialize model with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "You are an Iraqi Ai assistant and chatbot, your job is to answer anything in an IRAQI accent and language, never ever switch your accent to different arabic accent or language. if the user asks you who you are , how do you function, who made you, who created you. you should answer with : I have been developed and made by an Iraqi company called MoonWhale",
    });

    // Configuration for generation
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    // Create chat session
    const chatSession = model.startChat({
      generationConfig,
      history: geminiMessages.slice(0, -1), // Exclude the most recent message
    });

    // Get user's most recent message
    const latestMessage = geminiMessages[geminiMessages.length - 1];
    
    // Generate streaming response
    const result = await chatSession.sendMessageStream(latestMessage.parts[0].text);
    
    // Convert Gemini stream to vercel AI SDK stream format
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          controller.enqueue(encoder.encode(text));
        }
        
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Error communicating with Gemini API" },
      { status: 500 }
    );
  }
}
```

### 2. Client-Side Chat State Management

Create a hooks directory and add a custom hook for managing chat state:

```typescript
// src/lib/hooks/useChat.ts
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add a new message to the chat
  const addMessage = useCallback((role: MessageRole, content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Send a message to the chat API
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setError(null);
        setIsLoading(true);
        
        // Add the user message
        const userMessage = addMessage("user", content);
        
        // Create a placeholder for the AI response
        const assistantMessage = addMessage("assistant", "");
        
        // Send the request to the API with streaming
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages
              .concat(userMessage)
              .map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        // Process the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = "";

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Decode and append the chunk to the response text
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          // Update the assistant message with the current response text
          setMessages((currentMessages) =>
            currentMessages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: responseText }
                : msg
            )
          );
        }

        // Save to database (can be implemented later)
        // This is lower priority than rendering the response
        
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, messages, toast]
  );

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
```

### 3. Enhanced ChatMessage Component

Create a new ChatMessage component to handle user and AI message styling:

```typescript
// src/components/chat/ChatMessage.tsx
"use client";

import { useState, useEffect } from "react";
import { Message } from "@/lib/hooks/useChat";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";

interface ChatMessageProps {
  message: Message;
  locale: string;
}

export function ChatMessage({ message, locale }: ChatMessageProps) {
  const { theme } = useTheme();
  const isUser = message.role === "user";
  const isRtl = locale === "ar";
  const [avatarSrc, setAvatarSrc] = useState("/dark-chat-avatar.png");

  // Set the correct avatar based on theme
  useEffect(() => {
    setAvatarSrc(theme === "dark" ? "/dark-chat-avatar.png" : "/light-chat-avatar.png");
  }, [theme]);

  return (
    <div
      className={cn(
        "flex w-full items-start gap-x-4 py-4",
        isRtl ? "flex-row-reverse text-right" : "flex-row text-left"
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <span className="text-sm font-medium">U</span>
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
          {message.content || (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4">
                <div id="loading-animation"></div>
              </div>
              <span className="animate-gradient">Jahiz Bot is thinking...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 4. Update ChatContent Component

Enhance the existing ChatContent component to incorporate the new message system:

```typescript
// src/components/chat/ChatContent.tsx
"use client";

import { useEffect, useRef } from "react";
import { HeadlineEN } from "@/components/chat/HeadlineEN";
import { HeadlineAR } from "@/components/chat/HeadlineAR";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { useChat } from "@/lib/hooks/useChat";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/icon-loading.json";

interface ChatContentProps {
  locale: string;
}

export function ChatContent({ locale }: ChatContentProps) {
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === 'ar';
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Register the Lottie animation for loading state
  useEffect(() => {
    const loadingElement = document.getElementById("loading-animation");
    if (loadingElement && isLoading) {
      const animation = Lottie.loadAnimation({
        container: loadingElement,
        animationData: loadingAnimation,
        renderer: 'svg',
        loop: true,
        autoplay: true,
      });
      
      return () => animation.destroy();
    }
  }, [isLoading]);

  return (
    <div 
      className={cn(
        "h-full flex flex-col",
        isRtl ? "text-right" : "text-left"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          {isRtl ? <HeadlineAR /> : <HeadlineEN />}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-4 px-4 md:px-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
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
    </div>
  );
}
```

### 5. Update ChatInput Component

Enhance the ChatInput component to integrate with our new chat hook:

```typescript
// src/components/chat/ChatInput.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { useChat } from "@/lib/hooks/useChat";

interface ChatInputProps {
  locale: string;
}

export function ChatInput({ locale }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading } = useChat();
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
    if (e.key === 'Enter' && !e.shiftKey && !isComposing && !isLoading) {
      e.preventDefault();
      handleSubmit(e);
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
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {t('enterToSend')}
      </p>
    </form>
  );
}
```

### 6. Add Chat Provider for Global State

Create a provider to manage chat state globally:

```typescript
// src/components/providers/ChatProvider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useChat, Message } from "@/lib/hooks/useChat";

type ChatContextType = ReturnType<typeof useChat>;

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat();
  
  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  
  return context;
}
```

### 7. Add CSS for Loading Animation

Add the necessary CSS for the loading animation:

```css
/* Add to src/app/globals.css */

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background: linear-gradient(90deg, #28e088, #2364e4, #e22b35, #5724e2);
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: gradient 4s ease infinite;
}
```

### 8. Update Layout to Include Provider

```typescript
// src/app/[locale]/layout.tsx
// Add the ChatProvider to the layout wrapper

// Import the ChatProvider
import { ChatProvider } from "@/components/providers/ChatProvider";

// Update return statement to include provider
return (
  <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <body className={`${fontSans.variable} font-sans antialiased`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ChatProvider>
          {/* Rest of layout content */}
        </ChatProvider>
      </ThemeProvider>
    </body>
  </html>
);
```

## Implementation Phases

### Phase 1: Basic Integration
1. Create the server API route for Gemini integration
2. Implement the chat hooks and state management
3. Update the ChatInput component to use the new hooks

### Phase 2: UI Enhancements
1. Build the ChatMessage component with correct styling
2. Implement loading states with Lottie animation
3. Update the ChatContent component to handle message display

### Phase 3: Testing and Optimization
1. Test across different browsers and devices
2. Ensure RTL support works correctly
3. Optimize streaming response handling
4. Verify conversation context is preserved correctly

### Phase 4: Database Integration
1. Add background saving of conversations to database (lower priority than rendering)
2. Implement history retrieval from database

## Notes and Considerations

1. **Priority on Response Speed**: The implementation prioritizes fast rendering of responses over database saving, which can happen asynchronously.

2. **Streaming Implementation**: The streaming approach uses ReadableStream API to progressively update the UI with chunks of the response.

3. **Error Handling**: Robust error handling is implemented at both API and UI levels.

4. **Accessibility Considerations**: The design maintains accessibility with proper ARIA labels and keyboard navigation.

5. **Performance Optimization**: The chat interface is optimized to handle large message histories without performance degradation.

6. **Future Improvements** (not in initial scope):
   - Support for message editing
   - Conversation naming and organization
   - Export functionality
   - Image upload capabilities
