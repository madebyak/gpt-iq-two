"use client";

import { ReactNode, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { AuthProvider } from "@/lib/auth/auth-context";

interface AppProvidersProps {
  messages: Record<string, any>;
  children: ReactNode;
  locale: string;
}

export default function AppProviders({
  messages,
  children,
  locale,
}: AppProvidersProps) {

  useEffect(() => {
    console.log("[AppProviders] Received messages:", JSON.stringify(messages, null, 2));
  }, [messages]);

  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      timeZone="Asia/Baghdad"
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
