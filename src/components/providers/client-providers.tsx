"use client";

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

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
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
