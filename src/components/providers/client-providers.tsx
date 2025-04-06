"use client";

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ChatProvider } from '@/components/providers/ChatProvider';

interface ClientProvidersProps {
  messages: Record<string, Record<string, string>>;
  children: ReactNode;
  locale: string;
}

export default function ClientProviders({ 
  messages, 
  children,
  locale 
}: ClientProvidersProps) {
  // Debug: Log the messages to see what's available
  console.log('ClientProviders messages:', JSON.stringify(messages, null, 2));
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
