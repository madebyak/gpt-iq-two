"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  locale: string;
}

export function ChatInput({ locale }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const t = useTranslations('Chat');
  const isRtl = locale === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Here you would handle sending the message
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-lg border border-input bg-background shadow-sm">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chatPlaceholder')}
          className={`min-h-[60px] max-h-[200px] w-full resize-none ${isRtl ? "text-right pr-4 pl-14" : "text-left pl-4 pr-14"} 
            border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-4 h-12`}
          dir={isRtl ? "rtl" : "ltr"}
        />
        <Button
          type="submit"
          size="icon"
          className={`absolute bottom-2.5 ${isRtl ? "left-2.5" : "right-2.5"} h-8 w-8`}
          disabled={!message.trim()}
          aria-label={t('sendMessage')}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {t('enterToSend')}
      </p>
    </form>
  );
}
