"use client";

import Navbar from "@/components/layout/navbar";
import { ReactNode } from "react";
import { NextIntlClientProvider } from 'next-intl';

interface HomeClientProps {
  children: ReactNode;
  locale?: string;
  messages?: Record<string, any>;
}

export default function HomeClient({ 
  children,
  locale,
  messages 
}: HomeClientProps) {
  // We need to have a single context for the entire component tree
  // to ensure everything using i18n features (including Link component) works properly
  if (locale && messages) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Navbar />
        {children}
      </NextIntlClientProvider>
    );
  }
  
  // Fallback rendering without i18n context - simple content only
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
