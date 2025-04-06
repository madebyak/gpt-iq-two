"use client";

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

// This provides translations to client components in the auth route
export default function AuthProviders({ 
  children, 
  messages, 
  locale 
}: { 
  children: ReactNode;
  messages: any;
  locale: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
