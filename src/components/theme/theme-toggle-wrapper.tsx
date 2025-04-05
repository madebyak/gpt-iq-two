"use client";

import { NextIntlClientProvider } from 'next-intl';
import { ThemeToggle } from './theme-toggle';

interface ThemeToggleWrapperProps {
  locale: string;
  messages: Record<string, any>;
  className?: string;
}

export function ThemeToggleWrapper({ 
  locale, 
  messages, 
  className 
}: ThemeToggleWrapperProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeToggle className={className} />
    </NextIntlClientProvider>
  );
}
