"use client";

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import AppProviders from '@/components/AppProviders';

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
  return <AppProviders messages={messages} locale={locale}>{children}</AppProviders>;
}
