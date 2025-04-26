"use client";

import { ReactNode } from "react";
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
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
