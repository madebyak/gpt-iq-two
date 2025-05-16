"use client";

import NavbarClient from "@/components/layout/navbar-client";
import { ReactNode } from "react";
import { NextIntlClientProvider } from 'next-intl';
import { cn } from "@/lib/utils";

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
  const content = (
    <div className={cn("flex flex-col h-full w-full")}>
      <NavbarClient />
      <div className={cn("flex-grow h-0")}>
        {children}
      </div>
    </div>
  );

  if (locale && messages) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {content}
      </NextIntlClientProvider>
    );
  }
  
  return content;
}
